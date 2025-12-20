import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { useAppStore, type Model } from '$lib/stores';
import i18n from '$lib/i18n';

interface MessageInputProps {
        history?: any;
        taskIds?: any;
        selectedModels?: string[];
        files?: any[];
        prompt?: string;
        autoScroll?: boolean;
        selectedToolIds?: string[];
        selectedFilterIds?: string[];
        imageGenerationEnabled?: boolean;
        codeInterpreterEnabled?: boolean;
        webSearchEnabled?: boolean;
        atSelectedModel?: Model;
        showCommands?: boolean;
        toolServers?: any[];
        generating?: boolean;
        placeholder?: string;
        stopResponse?: () => void;
        createMessagePair?: (prompt: string) => void;
        onChange?: (data: any) => void;
        onUpload?: (e: { type: string; data: any }) => void;
        onSubmit?: (prompt: string) => void;
        onFilesChange?: (files: any[]) => void;
        onPromptChange?: (prompt: string) => void;
}

export interface MessageInputRef {
        setText: (text: string, callback?: () => void) => void;
}

const MessageInput = React.forwardRef<MessageInputRef, MessageInputProps>(({
        history,
        selectedModels = [''],
        files: externalFiles,
        prompt: externalPrompt,
        autoScroll = false,
        generating = false,
        placeholder = '',
        stopResponse,
        createMessagePair,
        onChange,
        onUpload,
        onSubmit,
        onFilesChange,
        onPromptChange
}, ref) => {
        const { mobile, settings, user } = useAppStore();
        
        const [prompt, setPrompt] = useState(externalPrompt || '');
        const [files, setFiles] = useState<any[]>(externalFiles || []);
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        // Sync external prompt changes
        useEffect(() => {
                if (externalPrompt !== undefined) {
                        setPrompt(externalPrompt);
                }
        }, [externalPrompt]);

        // Sync external files changes
        useEffect(() => {
                if (externalFiles !== undefined) {
                        setFiles(externalFiles);
                }
        }, [externalFiles]);

        // Expose setText method via ref
        React.useImperativeHandle(ref, () => ({
                setText: (text: string, callback?: () => void) => {
                        setPrompt(text);
                        onPromptChange?.(text);
                        if (callback) {
                                setTimeout(callback, 0);
                        }
                }
        }));

        const handleSubmit = useCallback(() => {
                if (prompt.trim() === '' && files.length === 0) return;
                if (generating) {
                        stopResponse?.();
                        return;
                }
                onSubmit?.(prompt);
                setPrompt('');
                onPromptChange?.('');
        }, [prompt, files, generating, stopResponse, onSubmit, onPromptChange]);

        const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                const ctrlEnterToSend = settings?.ctrlEnterToSend ?? false;
                
                if (e.key === 'Enter') {
                        if (ctrlEnterToSend) {
                                if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                }
                        } else {
                                if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                }
                        }
                }
        }, [settings, handleSubmit]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const value = e.target.value;
                setPrompt(value);
                onPromptChange?.(value);
                onChange?.({ prompt: value, files });
        }, [files, onChange, onPromptChange]);

        // Auto-resize textarea
        useEffect(() => {
                if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
                }
        }, [prompt]);

        return (
                <div className="w-full relative">
                        <div className="flex w-full rounded-xl md:rounded-3xl px-1.5 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 focus-within:outline-hidden">
                                <div className="flex items-end w-full">
                                        <div className="flex-1 flex flex-col">
                                                <textarea
                                                        ref={textareaRef}
                                                        id="chat-input"
                                                        className="scrollbar-hidden bg-transparent dark:text-gray-100 outline-hidden w-full py-3 px-3 rounded-xl resize-none h-[48px] max-h-[200px]"
                                                        placeholder={placeholder || i18n.t('Send a message')}
                                                        value={prompt}
                                                        onChange={handleChange}
                                                        onKeyDown={handleKeyDown}
                                                        rows={1}
                                                        style={{ minHeight: '48px' }}
                                                />
                                        </div>

                                        <div className="flex items-center pb-2 pr-2">
                                                <button
                                                        className={`flex items-center justify-center rounded-full p-1.5 transition-all ${
                                                                generating 
                                                                        ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' 
                                                                        : prompt.trim() || files.length > 0
                                                                                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                        }`}
                                                        onClick={handleSubmit}
                                                        disabled={!generating && !prompt.trim() && files.length === 0}
                                                        aria-label={generating ? i18n.t('Stop') : i18n.t('Send')}
                                                >
                                                        {generating ? (
                                                                <Square className="size-5" fill="currentColor" />
                                                        ) : (
                                                                <ArrowUp className="size-5" strokeWidth={2.5} />
                                                        )}
                                                </button>
                                        </div>
                                </div>
                        </div>
                </div>
        );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
