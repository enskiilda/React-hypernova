import { v4 as uuidv4 } from 'uuid';
import { WEBUI_BASE_URL } from '$lib/constants';

import { TTS_RESPONSE_SPLIT } from '$lib/types';

import { marked } from 'marked';
import markedExtension from '$lib/utils/marked/extension';

//////////////////////////
// Helper functions
//////////////////////////

function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const replaceTokens = (content, char, user) => {
        const tokens = [
                { regex: /{{char}}/gi, replacement: char },
                { regex: /{{user}}/gi, replacement: user },
                {
                        regex: /{{VIDEO_FILE_ID_([a-f0-9-]+)}}/gi,
                        replacement: (_, fileId) =>
                                `<video src="${WEBUI_BASE_URL}/api/v1/files/${fileId}/content" controls></video>`
                },
                {
                        regex: /{{HTML_FILE_ID_([a-f0-9-]+)}}/gi,
                        replacement: (_, fileId) => `<file type="html" id="${fileId}" />`
                }
        ];

        // Replace tokens outside code blocks only
        const processOutsideCodeBlocks = (text, replacementFn) => {
                return text
                        .split(/(```[\s\S]*?```|`[\s\S]*?`)/)
                        .map((segment) => {
                                return segment.startsWith('```') || segment.startsWith('`')
                                        ? segment
                                        : replacementFn(segment);
                        })
                        .join('');
        };

        // Apply replacements
        content = processOutsideCodeBlocks(content, (segment) => {
                tokens.forEach(({ regex, replacement }) => {
                        if (replacement !== undefined && replacement !== null) {
                                segment = segment.replace(regex, replacement);
                        }
                });

                return segment;
        });

        return content;
};

export const sanitizeResponseContent = (content: string) => {
        return content
                .replace(/<\|[a-z]*$/, '')
                .replace(/<\|[a-z]+\|$/, '')
                .replace(/<$/, '')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll(/<\|[a-z]+\|>/g, ' ')
                .trim();
};

export const processResponseContent = (content: string) => {
        content = processChineseContent(content);
        return content.trim();
};

function isChineseChar(char: string): boolean {
        return /\p{Script=Han}/u.test(char);
}

// Tackle "Model output issue not following the standard Markdown/LaTeX format" in Chinese.
function processChineseContent(content: string): string {
        // This function is used to process the response content before the response content is rendered.
        const lines = content.split('\n');
        const processedLines = lines.map((line) => {
                if (/[\u4e00-\u9fa5]/.test(line)) {
                        // Problems caused by Chinese parentheses
                        /* Discription:
                         *   When `*` has Chinese delimiters on the inside, markdown parser ignore bold or italic style.
                         *   - e.g. `**中文名（English）**中文内容` will be parsed directly,
                         *          instead of `<strong>中文名（English）</strong>中文内容`.
                         * Solution:
                         *   Adding a `space` before and after the bold/italic part can solve the problem.
                         *   - e.g. `**中文名（English）**中文内容` -> ` **中文名（English）** 中文内容`
                         * Note:
                         *   Similar problem was found with English parentheses and other full delimiters,
                         *   but they are not handled here because they are less likely to appear in LLM output.
                         *   Change the behavior in future if needed.
                         */
                        if (line.includes('*')) {
                                // Handle **bold** and *italic*
                                // 1. With Chinese parentheses
                                if (/（|）/.test(line)) {
                                        line = processChineseDelimiters(line, '**', '（', '）');
                                        line = processChineseDelimiters(line, '*', '（', '）');
                                }
                                // 2. With Chinese quotations
                                if (/“|”/.test(line)) {
                                        line = processChineseDelimiters(line, '**', '“', '”');
                                        line = processChineseDelimiters(line, '*', '“', '”');
                                }
                        }
                }
                return line;
        });
        content = processedLines.join('\n');

        return content;
}

// Helper function for `processChineseContent`
function processChineseDelimiters(
        line: string,
        symbol: string,
        leftSymbol: string,
        rightSymbol: string
): string {
        // NOTE: If needed, with a little modification, this function can be applied to more cases.
        const escapedSymbol = escapeRegExp(symbol);
        const regex = new RegExp(
                `(.?)(?<!${escapedSymbol})(${escapedSymbol})([^${escapedSymbol}]+)(${escapedSymbol})(?!${escapedSymbol})(.)`,
                'g'
        );
        return line.replace(regex, (match, l, left, content, right, r) => {
                const result =
                        (content.startsWith(leftSymbol) && l && l.length > 0 && isChineseChar(l[l.length - 1])) ||
                        (content.endsWith(rightSymbol) && r && r.length > 0 && isChineseChar(r[0]));

                if (result) {
                        return `${l} ${left}${content}${right} ${r}`;
                } else {
                        return match;
                }
        });
}

export function unescapeHtml(html: string) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.documentElement.textContent;
}

export const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
};

export const splitStream = (splitOn) => {
        let buffer = '';
        return new TransformStream({
                transform(chunk, controller) {
                        buffer += chunk;
                        const parts = buffer.split(splitOn);
                        parts.slice(0, -1).forEach((part) => controller.enqueue(part));
                        buffer = parts[parts.length - 1];
                },
                flush(controller) {
                        if (buffer) controller.enqueue(buffer);
                }
        });
};

export const convertMessagesToHistory = (messages) => {
        const history = {
                messages: {},
                currentId: null
        };

        let parentMessageId = null;
        let messageId = null;

        for (const message of messages) {
                messageId = uuidv4();

                if (parentMessageId !== null) {
                        history.messages[parentMessageId].childrenIds = [
                                ...history.messages[parentMessageId].childrenIds,
                                messageId
                        ];
                }

                history.messages[messageId] = {
                        ...message,
                        id: messageId,
                        parentId: parentMessageId,
                        childrenIds: []
                };

                parentMessageId = messageId;
        }

        history.currentId = messageId;
        return history;
};

export const compressImage = async (imageUrl, maxWidth, maxHeight) => {
        return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Maintain aspect ratio while resizing

                        if (maxWidth && maxHeight) {
                                // Resize with both dimensions defined (preserves aspect ratio)

                                if (width <= maxWidth && height <= maxHeight) {
                                        resolve(imageUrl);
                                        return;
                                }

                                if (width / height > maxWidth / maxHeight) {
                                        height = Math.round((maxWidth * height) / width);
                                        width = maxWidth;
                                } else {
                                        width = Math.round((maxHeight * width) / height);
                                        height = maxHeight;
                                }
                        } else if (maxWidth) {
                                // Only maxWidth defined

                                if (width <= maxWidth) {
                                        resolve(imageUrl);
                                        return;
                                }

                                height = Math.round((maxWidth * height) / width);
                                width = maxWidth;
                        } else if (maxHeight) {
                                // Only maxHeight defined

                                if (height <= maxHeight) {
                                        resolve(imageUrl);
                                        return;
                                }

                                width = Math.round((maxHeight * width) / height);
                                height = maxHeight;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const context = canvas.getContext('2d');
                        context.drawImage(img, 0, 0, width, height);

                        // Get compressed image URL
                        const mimeType = imageUrl.match(/^data:([^;]+);/)?.[1];
                        const compressedUrl = canvas.toDataURL(mimeType);
                        resolve(compressedUrl);
                };
                img.onerror = (error) => reject(error);
                img.src = imageUrl;
        });
};


export const copyToClipboard = async (text, html = null, formatted = false) => {
        if (formatted) {
                let styledHtml = '';
                if (!html) {
                        const options = {
                                throwOnError: false
                        };
                        marked.use(markedExtension(options));

                        const htmlContent = marked.parse(text);

                        styledHtml = `
                        <div>
                                <style>
                                        pre {
                                                background-color: #f6f8fa;
                                                border-radius: 6px;
                                                padding: 16px;
                                                overflow: auto;
                                        }
                                        code {
                                                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                                                font-size: 14px;
                                        }
                                        blockquote {
                                                border-left: 4px solid #dfe2e5;
                                                padding-left: 16px;
                                                color: #6a737d;
                                                margin-left: 0;
                                                margin-right: 0;
                                        }
                                        table {
                                                border-collapse: collapse;
                                                width: 100%;
                                                margin-bottom: 16px;
                                        }
                                        table, th, td {
                                                border: 1px solid #dfe2e5;
                                        }
                                        th, td {
                                                padding: 8px 12px;
                                        }
                                        th {
                                                background-color: #f6f8fa;
                                        }
                                </style>
                                ${htmlContent}
                        </div>
                `;
                } else {
                        // If HTML is provided, use it directly
                        styledHtml = html;
                }

                // Create a blob with HTML content
                const blob = new Blob([styledHtml], { type: 'text/html' });

                try {
                        // Create a ClipboardItem with HTML content
                        const data = new ClipboardItem({
                                'text/html': blob,
                                'text/plain': new Blob([text], { type: 'text/plain' })
                        });

                        // Write to clipboard
                        await navigator.clipboard.write([data]);
                        return true;
                } catch (err) {
                        console.error('Error copying formatted content:', err);
                        // Fallback to plain text
                        return await copyToClipboard(text);
                }
        } else {
                let result = false;
                if (!navigator.clipboard) {
                        const textArea = document.createElement('textarea');
                        textArea.value = text;

                        // Avoid scrolling to bottom
                        textArea.style.top = '0';
                        textArea.style.left = '0';
                        textArea.style.position = 'fixed';

                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();

                        try {
                                const successful = document.execCommand('copy');
                                result = true;
                        } catch (err) {
                                console.error('Fallback: Oops, unable to copy', err);
                        }

                        document.body.removeChild(textArea);
                        return result;
                }

                result = await navigator.clipboard
                        .writeText(text)
                        .then(() => {
                                return true;
                        })
                        .catch((error) => {
                                console.error('Async: Could not copy text: ', error);
                                return false;
                        });

                return result;
        }
};

export const extractCurlyBraceWords = (text) => {
        const regex = /\{\{([^}]+)\}\}/g;
        const matches = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
                matches.push({
                        word: match[1].trim(),
                        startIndex: match.index,
                        endIndex: regex.lastIndex - 1
                });
        }

        return matches;
};


export const getUserPosition = async (raw = false) => {
        // Get the user's location using the Geolocation API
        const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
        }).catch((error) => {
                console.error('Error getting user location:', error);
                throw error;
        });

        if (!position) {
                return 'Location not available';
        }

        // Extract the latitude and longitude from the position
        const { latitude, longitude } = position.coords;

        if (raw) {
                return { latitude, longitude };
        } else {
                return `${latitude.toFixed(3)}, ${longitude.toFixed(3)} (lat, long)`;
        }
};

export const removeDetails = (content, types) => {
        for (const type of types) {
                content = content.replace(
                        new RegExp(`<details\\s+type="${type}"[^>]*>.*?<\\/details>`, 'gis'),
                        ''
                );
        }

        return content;
};

export const removeAllDetails = (content) => {
        content = content.replace(/<details[^>]*>.*?<\/details>/gis, '');
        return content;
};

export const processDetails = (content) => {
        content = removeDetails(content, ['reasoning', 'code_interpreter']);

        // This regex matches <details> tags with type="tool_calls" and captures their attributes to convert them to a string
        const detailsRegex = /<details\s+type="tool_calls"([^>]*)>([\s\S]*?)<\/details>/gis;
        const matches = content.match(detailsRegex);
        if (matches) {
                for (const match of matches) {
                        const attributesRegex = /(\w+)="([^"]*)"/g;
                        const attributes = {};
                        let attributeMatch;
                        while ((attributeMatch = attributesRegex.exec(match)) !== null) {
                                attributes[attributeMatch[1]] = attributeMatch[2];
                        }

                        content = content.replace(match, `"${attributes.result}"`);
                }
        }

        return content;
};

export const getMessageContentParts = (content: string, splitOn: string = 'punctuation') => {
        const text = content.replace(/<[^>]*>/g, '').trim();
        if (!text) return [];
        
        switch (splitOn) {
                case TTS_RESPONSE_SPLIT.PARAGRAPHS:
                        return text.split(/\n\n+/).filter(p => p.trim());
                case TTS_RESPONSE_SPLIT.NONE:
                        return [text];
                default:
                case TTS_RESPONSE_SPLIT.PUNCTUATION:
                        return text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
        }
};


export const getPromptVariables = (user_name, user_location) => {
        return {
                '{{USER_NAME}}': user_name,
                '{{USER_LOCATION}}': user_location || 'Unknown',
                '{{CURRENT_DATETIME}}': getCurrentDateTime(),
                '{{CURRENT_DATE}}': getFormattedDate(),
                '{{CURRENT_TIME}}': getFormattedTime(),
                '{{CURRENT_WEEKDAY}}': getWeekday(),
                '{{CURRENT_TIMEZONE}}': getUserTimezone(),
                '{{USER_LANGUAGE}}': 'pl-PL'
        };
};

export const approximateToHumanReadable = (nanoseconds: number) => {
        const seconds = Math.floor((nanoseconds / 1e9) % 60);
        const minutes = Math.floor((nanoseconds / 6e10) % 60);
        const hours = Math.floor((nanoseconds / 3.6e12) % 24);

        const results: string[] = [];

        if (seconds >= 0) {
                results.push(`${seconds}s`);
        }

        if (minutes > 0) {
                results.push(`${minutes}m`);
        }

        if (hours > 0) {
                results.push(`${hours}h`);
        }

        return results.reverse().join(' ');
};

// Get the date in the format YYYY-MM-DD
export const getFormattedDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
};

// Get the time in the format HH:MM:SS
export const getFormattedTime = () => {
        const date = new Date();
        return date.toTimeString().split(' ')[0];
};

// Get the current date and time in the format YYYY-MM-DD HH:MM:SS
export const getCurrentDateTime = () => {
        return `${getFormattedDate()} ${getFormattedTime()}`;
};

// Get the user's timezone
export const getUserTimezone = () => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Get the weekday
export const getWeekday = () => {
        const date = new Date();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekdays[date.getDay()];
};

export const createMessagesList = (history, messageId) => {
        if (messageId === null) {
                return [];
        }

        const message = history.messages[messageId];
        if (message === undefined) {
                return [];
        }
        if (message?.parentId) {
                return [...createMessagesList(history, message.parentId), message];
        } else {
                return [message];
        }
};

export const formatFileSize = (size) => {
        if (size == null) return 'Unknown size';
        if (typeof size !== 'number' || size < 0) return 'Invalid size';
        if (size === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const getLineCount = (text) => {
        return text ? text.split('\n').length : 0;
};

export const extractInputVariables = (text: string): Record<string, any> => {
        const regex = /{{\s*([^|}\s]+)\s*\|\s*([^}]+)\s*}}/g;
        const regularRegex = /{{\s*([^|}\s]+)\s*}}/g;
        const variables: Record<string, any> = {};
        let match;
        // Use exec() loop instead of matchAll() for better compatibility
        while ((match = regex.exec(text)) !== null) {
                const varName = match[1].trim();
                const definition = match[2].trim();
                variables[varName] = parseVariableDefinition(definition);
        }
        // Then, extract regular variables (without pipe) - only if not already processed
        while ((match = regularRegex.exec(text)) !== null) {
                const varName = match[1].trim();
                // Only add if not already processed as custom variable
                if (!variables.hasOwnProperty(varName)) {
                        variables[varName] = { type: 'text' }; // Default type for regular variables
                }
        }
        return variables;
};

export const splitProperties = (str: string, delimiter: string): string[] => {
        const result: string[] = [];
        let current = '';
        let depth = 0;
        let inString = false;
        let escapeNext = false;

        for (let i = 0; i < str.length; i++) {
                const char = str[i];

                if (escapeNext) {
                        current += char;
                        escapeNext = false;
                        continue;
                }

                if (char === '\\') {
                        current += char;
                        escapeNext = true;
                        continue;
                }

                if (char === '"' && !escapeNext) {
                        inString = !inString;
                        current += char;
                        continue;
                }

                if (!inString) {
                        if (char === '{' || char === '[') {
                                depth++;
                        } else if (char === '}' || char === ']') {
                                depth--;
                        }

                        if (char === delimiter && depth === 0) {
                                result.push(current.trim());
                                current = '';
                                continue;
                        }
                }

                current += char;
        }

        if (current.trim()) {
                result.push(current.trim());
        }

        return result;
};

export const parseVariableDefinition = (definition: string): Record<string, any> => {
        // Use splitProperties for the main colon delimiter to handle quoted strings
        const parts = splitProperties(definition, ':');
        const [firstPart, ...propertyParts] = parts;

        // Parse type (explicit or implied)
        const type = firstPart.startsWith('type=') ? firstPart.slice(5) : firstPart;

        // Parse properties; support both key=value and bare flags (e.g., ":required")
        const properties = propertyParts.reduce(
                (props, part) => {
                        const trimmed = part.trim();
                        if (!trimmed) return props;

                        // Use splitProperties for the equals sign as well, in case there are nested quotes
                        const equalsParts = splitProperties(trimmed, '=');

                        if (equalsParts.length === 1) {
                                // It's a flag with no value, e.g. "required" -> true
                                const flagName = equalsParts[0].trim();
                                if (flagName.length > 0) {
                                        return { ...props, [flagName]: true };
                                }
                                return props;
                        }

                        const [propertyName, ...valueParts] = equalsParts;
                        const propertyValueRaw = valueParts.join('='); // Handle values with extra '='

                        if (!propertyName || propertyValueRaw == null) return props;

                        return {
                                ...props,
                                [propertyName.trim()]: parseJsonValue(propertyValueRaw.trim())
                        };
                },
                {} as Record<string, any>
        );

        return { type, ...properties };
};
export const parseJsonValue = (value: string): any => {
        // Remove surrounding quotes if present (for string values)
        if (value.startsWith('"') && value.endsWith('"')) {
                return value.slice(1, -1);
        }

        // Check if it starts with square or curly brackets (JSON)
        if (/^[\[{]/.test(value)) {
                try {
                        return JSON.parse(value);
                } catch {
                        return value; // Return as string if JSON parsing fails
                }
        }

        return value;
};

export const extractContentFromFile = async (file: File) => {
        const textExtensions = ['.txt', '.md', '.csv', '.json', '.js', '.ts', '.css', '.html', '.xml', '.yaml', '.yml', '.rtf'];

        function getExtension(filename: string) {
                const dot = filename.lastIndexOf('.');
                return dot === -1 ? '' : filename.substr(dot).toLowerCase();
        }

        function readAsText(file: File) {
                return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsText(file);
                });
        }

        const type = file.type || '';
        const ext = getExtension(file.name);

        if (type.startsWith('text/') || textExtensions.includes(ext)) {
                return await readAsText(file);
        }

        try {
                return await readAsText(file);
        } catch (err) {
                throw new Error('Unsupported or non-text file type: ' + (file.name || type));
        }
};

export const getAge = (birthDate) => {
        const today = new Date();
        const bDate = new Date(birthDate);
        let age = today.getFullYear() - bDate.getFullYear();
        const m = today.getMonth() - bDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
                age--;
        }
        return age.toString();
};

export const convertHeicToJpeg = async (file: File) => {
        const { default: heic2any } = await import('heic2any');
        try {
                return await heic2any({ blob: file, toType: 'image/jpeg' });
        } catch (err: any) {
                if (err?.message?.includes('already browser readable')) {
                        return file;
                }
                throw err;
        }
};

export const decodeString = (str: string) => {
        try {
                return decodeURIComponent(str);
        } catch (e) {
                return str;
        }
};

export const getCodeBlockContents = (content: string): object => {
        const codeBlockContents = content.match(/```[\s\S]*?```/g);

        const codeBlocks = [];

        let htmlContent = '';
        let cssContent = '';
        let jsContent = '';

        if (codeBlockContents) {
                codeBlockContents.forEach((block) => {
                        const lang = block.split('\n')[0].replace('```', '').trim().toLowerCase();
                        const code = block.replace(/```[\s\S]*?\n/, '').replace(/```$/, '');
                        codeBlocks.push({ lang, code });
                });

                codeBlocks.forEach((block) => {
                        const { lang, code } = block;

                        if (lang === 'html') {
                                htmlContent += code + '\n';
                        } else if (lang === 'css') {
                                cssContent += code + '\n';
                        } else if (lang === 'javascript' || lang === 'js') {
                                jsContent += code + '\n';
                        }
                });
        } else {
                const inlineHtml = content.match(/<html>[\s\S]*?<\/html>/gi);
                const inlineCss = content.match(/<style>[\s\S]*?<\/style>/gi);
                const inlineJs = content.match(/<script>[\s\S]*?<\/script>/gi);

                if (inlineHtml) {
                        inlineHtml.forEach((block) => {
                                const content = block.replace(/<\/?html>/gi, ''); // Remove <html> tags
                                htmlContent += content + '\n';
                        });
                }
                if (inlineCss) {
                        inlineCss.forEach((block) => {
                                const content = block.replace(/<\/?style>/gi, ''); // Remove <style> tags
                                cssContent += content + '\n';
                        });
                }
                if (inlineJs) {
                        inlineJs.forEach((block) => {
                                const content = block.replace(/<\/?script>/gi, ''); // Remove <script> tags
                                jsContent += content + '\n';
                        });
                }
        }

        return {
                codeBlocks: codeBlocks,
                html: htmlContent.trim(),
                css: cssContent.trim(),
                js: jsContent.trim()
        };
};
