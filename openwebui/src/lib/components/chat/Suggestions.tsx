import React, { useMemo, useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { useAppStore } from '$lib/stores';
import i18n from '$lib/i18n';
import { WEBUI_VERSION } from '$lib/constants';

interface SuggestionPrompt {
        id?: string;
        content: string;
        title?: [string, string];
}

interface SuggestionsProps {
        suggestionPrompts?: SuggestionPrompt[];
        className?: string;
        inputValue?: string;
        onSelect?: (e: { type: string; data: string }) => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({
        suggestionPrompts = [],
        className = '',
        inputValue = '',
        onSelect = () => {}
}) => {
        const { settings, WEBUI_NAME } = useAppStore();
        
        const [sortedPrompts, setSortedPrompts] = useState<SuggestionPrompt[]>([]);

        useEffect(() => {
                setSortedPrompts([...suggestionPrompts].sort(() => Math.random() - 0.5));
        }, [suggestionPrompts]);

        const fuse = useMemo(() => {
                return new Fuse(sortedPrompts, {
                        keys: ['content', 'title'],
                        threshold: 0.5
                });
        }, [sortedPrompts]);

        const filteredPrompts = useMemo(() => {
                if (inputValue.length > 500) {
                        return [];
                }
                if (inputValue.trim() && fuse) {
                        return fuse.search(inputValue.trim()).map((result) => result.item);
                }
                return sortedPrompts;
        }, [inputValue, fuse, sortedPrompts]);

        return (
                <>
                        <div className="mb-1 flex gap-1 text-xs font-medium items-center text-gray-600 dark:text-gray-400">
                                {filteredPrompts.length > 0 ? (
                                        i18n.t('Suggested')
                                ) : (
                                        <div
                                                className={`flex w-full ${settings?.landingPageMode === 'chat' ? ' -mt-1' : 'text-center items-center justify-center'} self-start text-gray-600 dark:text-gray-400`}
                                        >
                                                {WEBUI_NAME} ‧ v{WEBUI_VERSION}
                                        </div>
                                )}
                        </div>

                        <div className="h-40 w-full">
                                {filteredPrompts.length > 0 && (
                                        <div role="list" className={`max-h-40 overflow-auto scrollbar-none items-start ${className}`}>
                                                {filteredPrompts.map((prompt, idx) => (
                                                        <button
                                                                key={prompt.id || `${prompt.content}-${idx}`}
                                                                role="listitem"
                                                                className="waterfall flex flex-col flex-1 shrink-0 w-full justify-between px-3 py-2 rounded-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition group"
                                                                style={{ animationDelay: `${idx * 60}ms` }}
                                                                onClick={() => onSelect({ type: 'prompt', data: prompt.content })}
                                                        >
                                                                <div className="flex flex-col text-left">
                                                                        {prompt.title && prompt.title[0] !== '' ? (
                                                                                <>
                                                                                        <div className="font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1">
                                                                                                {prompt.title[0]}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-normal line-clamp-1">
                                                                                                {prompt.title[1]}
                                                                                        </div>
                                                                                </>
                                                                        ) : (
                                                                                <>
                                                                                        <div className="font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1">
                                                                                                {prompt.content}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-normal line-clamp-1">
                                                                                                {i18n.t('Prompt')}
                                                                                        </div>
                                                                                </>
                                                                        )}
                                                                </div>
                                                        </button>
                                                ))}
                                        </div>
                                )}
                        </div>

                        <style>{`
                                @keyframes fadeInUp {
                                        0% {
                                                opacity: 0;
                                                transform: translateY(20px);
                                        }
                                        100% {
                                                opacity: 1;
                                                transform: translateY(0);
                                        }
                                }

                                .waterfall {
                                        opacity: 0;
                                        animation-name: fadeInUp;
                                        animation-duration: 200ms;
                                        animation-fill-mode: forwards;
                                        animation-timing-function: ease;
                                }
                        `}</style>
                </>
        );
};

export default Suggestions;
