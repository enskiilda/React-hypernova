<script lang="ts">
        import { onMount, tick, getContext, createEventDispatcher } from 'svelte';

        const i18n = getContext('i18n');
        const dispatch = createEventDispatcher();

        export let oncompositionstart = (e) => {};
        export let oncompositionend = (e) => {};
        export let onChange = (e) => {};

        export let id = '';
        export let value = '';
        export let placeholder = $i18n.t('Type here...');
        export let className = 'input-prose';

        let textareaElement: HTMLTextAreaElement;

        onMount(() => {
                if (textareaElement) {
                        adjustHeight();
                }
        });

        function adjustHeight() {
                if (textareaElement) {
                        textareaElement.style.height = 'auto';
                        textareaElement.style.height = textareaElement.scrollHeight + 'px';
                }
        }

        function handleInput(e) {
                value = e.target.value;
                adjustHeight();
                onChange({ md: value, text: value });
        }

        function handleKeydown(e) {
                dispatch('keydown', { event: e });
        }

        export function focus() {
                textareaElement?.focus();
        }

        export function blur() {
                textareaElement?.blur();
        }

        export function setText(text: string) {
                value = text;
                if (textareaElement) {
                        textareaElement.value = text;
                        adjustHeight();
                }
                onChange({ md: value, text: value });
        }

        export function getText() {
                return value;
        }

        export function getMarkdown() {
                return value;
        }

        export function insertContent(text: string) {
                if (!textareaElement) return;
                
                const start = textareaElement.selectionStart;
                const end = textareaElement.selectionEnd;
                const before = value.substring(0, start);
                const after = value.substring(end);
                
                value = before + text + after;
                textareaElement.value = value;
                
                tick().then(() => {
                        textareaElement.selectionStart = textareaElement.selectionEnd = start + text.length;
                        adjustHeight();
                });
                
                onChange({ md: value, text: value });
        }

        export function replaceVariables(variables: Record<string, string>) {
                let newValue = value;
                for (const [key, val] of Object.entries(variables)) {
                        newValue = newValue.replace(new RegExp(`{{${key}}}`, 'g'), val);
                }
                setText(newValue);
        }

        export function getWordAtDocPos() {
                if (!textareaElement) return '';
                
                const pos = textareaElement.selectionStart;
                const text = value;
                
                let start = pos;
                let end = pos;
                
                while (start > 0 && !/\s/.test(text[start - 1])) {
                        start--;
                }
                while (end < text.length && !/\s/.test(text[end])) {
                        end++;
                }
                
                return text.substring(start, end);
        }

        export function replaceCommandWithText(text: string) {
                if (!textareaElement) return;
                
                const pos = textareaElement.selectionStart;
                const currentText = value;
                
                let start = pos;
                while (start > 0 && currentText[start - 1] !== '/') {
                        start--;
                }
                if (start > 0) start--;
                
                const before = currentText.substring(0, start);
                const after = currentText.substring(pos);
                
                value = before + text + after;
                textareaElement.value = value;
                
                tick().then(() => {
                        textareaElement.selectionStart = textareaElement.selectionEnd = start + text.length;
                        adjustHeight();
                });
                
                onChange({ md: value, text: value });
        }

        export function clear() {
                setText('');
        }
</script>

<div class="flex items-center min-h-14">
        <textarea
                bind:this={textareaElement}
                {id}
                class="w-full bg-transparent border-none outline-none resize-none overflow-hidden text-xl leading-normal !text-black dark:!text-white {className}"
                {placeholder}
                rows="1"
                bind:value
                on:input={handleInput}
                on:keydown={handleKeydown}
                on:compositionstart={oncompositionstart}
                on:compositionend={oncompositionend}
                on:focus
                on:blur
        ></textarea>
</div>
