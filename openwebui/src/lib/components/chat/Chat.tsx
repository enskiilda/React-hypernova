import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore, type Model } from '$lib/stores';
import i18n from '$lib/i18n';
import { createMessagesList, getCodeBlockContents } from '$lib/utils';
import MessageInput, { type MessageInputRef } from './MessageInput';
import Suggestions from './Suggestions';

interface ChatProps {
        chatIdProp?: string;
}

type ChatMessage = {
        role: 'system' | 'user' | 'assistant';
        content: string;
};

const SUPPORTED_MODEL_IDS = [
        'moonshotai/kimi-k2-thinking',
        'bytedance/seed-oss-36b-instruct',
        'deepseek-ai/deepseek-v3.1',
        'deepseek-ai/deepseek-r1-0528',
        'amazon/nova-2-lite-v1:free'
];

function isSupportedModel(modelId: string): boolean {
        return SUPPORTED_MODEL_IDS.includes(modelId);
}

const Chat: React.FC<ChatProps> = ({ chatIdProp = '' }) => {
        const navigate = useNavigate();
        const location = useLocation();
        
        const {
                chatId,
                setChatId,
                chatTitle,
                setChatTitle,
                config,
                user,
                models,
                settings,
                showSidebar,
                mobile,
                temporaryChatEnabled,
                setTemporaryChatEnabled,
                selectedFolder,
                setSelectedFolder,
                showControls,
                setShowControls,
                showArtifacts,
                setShowArtifacts,
                setArtifactContents,
                setCurrentChatPage,
                setChats,
                WEBUI_NAME
        } = useAppStore();

        const [loading, setLoading] = useState(false);
        const [generating, setGenerating] = useState(false);
        const [autoScroll, setAutoScroll] = useState(true);
        const [prompt, setPrompt] = useState('');
        const [files, setFiles] = useState<any[]>([]);
        const [selectedModels, setSelectedModels] = useState<string[]>(['']);
        const [atSelectedModel, setAtSelectedModel] = useState<Model | undefined>(undefined);
        
        const [history, setHistory] = useState<{
                messages: Record<string, any>;
                currentId: string | null;
        }>({
                messages: {},
                currentId: null
        });

        const messageInputRef = useRef<MessageInputRef>(null);
        const messagesContainerRef = useRef<HTMLDivElement>(null);
        const abortControllerRef = useRef<AbortController | null>(null);

        // Initialize new chat
        const initNewChat = useCallback(async () => {
                if (user?.role !== 'admin' && user?.permissions?.chat?.temporary_enforced) {
                        setTemporaryChatEnabled(true);
                }

                const availableModels = models
                        .filter((m: Model) => !(m?.info?.meta?.hidden ?? false))
                        .map((m: Model) => m.id);

                let newSelectedModels: string[] = [];

                if (selectedFolder?.data?.model_ids) {
                        newSelectedModels = selectedFolder.data.model_ids;
                } else if (settings?.models) {
                        newSelectedModels = settings.models;
                } else if (config?.default_models) {
                        newSelectedModels = config.default_models.split(',');
                }

                newSelectedModels = newSelectedModels.filter((modelId: string) => availableModels.includes(modelId));

                if (newSelectedModels.length === 0 || (newSelectedModels.length === 1 && newSelectedModels[0] === '')) {
                        if (availableModels.length > 0) {
                                newSelectedModels = [availableModels[0] ?? ''];
                        } else {
                                newSelectedModels = [''];
                        }
                }

                setSelectedModels(newSelectedModels);
                setShowControls(false);
                setShowArtifacts(false);

                if (location.pathname.includes('/c/')) {
                        window.history.replaceState(history, '', `/`);
                }

                setAutoScroll(true);
                setChatId('');
                setChatTitle('');

                setHistory({
                        messages: {},
                        currentId: null
                });

                setFiles([]);
                setPrompt('');

                setTimeout(() => {
                        const chatInput = document.getElementById('chat-input');
                        chatInput?.focus();
                }, 0);
        }, [user, models, settings, config, selectedFolder, location.pathname]);

        // Scroll to bottom
        const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
                if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTo({
                                top: messagesContainerRef.current.scrollHeight,
                                behavior
                        });
                }
        }, []);

        // Chat completion stream
        const chatCompletionStream = useCallback(async (
                messages: ChatMessage[],
                modelId: string,
                onUpdate: (data: { error?: string; done?: boolean; content?: string }) => void,
                onStart: (controller: AbortController) => void,
                onEnd: () => void
        ) => {
                const controller = new AbortController();
                onStart(controller);

                try {
                        const { chatStream } = await import('$lib/ai');
                        const stream = await chatStream(messages, modelId as any);

                        for await (const chunk of stream) {
                                if (controller.signal.aborted) break;
                                const content = chunk.choices[0]?.delta?.content || '';
                                if (content) {
                                        onUpdate({ content });
                                }
                        }
                        onUpdate({ done: true });
                } catch (error: any) {
                        onUpdate({ error: error.message, done: true });
                } finally {
                        onEnd();
                }
        }, []);

        // Submit prompt
        const submitPrompt = useCallback(async (userPrompt: string) => {
                if (userPrompt === '' && files.length === 0) {
                        toast.error(i18n.t('Please enter a prompt'));
                        return;
                }

                if (selectedModels.includes('')) {
                        toast.error(i18n.t('Model not selected'));
                        return;
                }

                messageInputRef.current?.setText('');
                setPrompt('');

                const messages = createMessagesList(history, history.currentId);
                const _files = [...files];

                setFiles([]);

                // Create user message
                const userMessageId = uuidv4();
                const userMessage = {
                        id: userMessageId,
                        parentId: messages.length !== 0 ? messages[messages.length - 1].id : null,
                        childrenIds: [],
                        role: 'user',
                        content: userPrompt,
                        files: _files.length > 0 ? _files : undefined,
                        timestamp: Math.floor(Date.now() / 1000),
                        models: selectedModels
                };

                const newHistory = { ...history };
                newHistory.messages[userMessageId] = userMessage;
                newHistory.currentId = userMessageId;

                if (messages.length !== 0) {
                        const lastMessage = newHistory.messages[messages[messages.length - 1].id];
                        if (lastMessage) {
                                lastMessage.childrenIds = [...lastMessage.childrenIds, userMessageId];
                        }
                }

                // Create response message for each selected model
                for (const modelId of selectedModels) {
                        const model = models.find((m: Model) => m.id === modelId);

                        if (model) {
                                const responseMessageId = uuidv4();
                                const responseMessage = {
                                        parentId: userMessageId,
                                        id: responseMessageId,
                                        childrenIds: [],
                                        role: 'assistant',
                                        content: '',
                                        model: model.id,
                                        modelName: model.name ?? model.id,
                                        modelIdx: 0,
                                        timestamp: Math.floor(Date.now() / 1000)
                                };

                                newHistory.messages[responseMessageId] = responseMessage;
                                newHistory.currentId = responseMessageId;
                                newHistory.messages[userMessageId].childrenIds.push(responseMessageId);

                                // Start streaming
                                if (isSupportedModel(model.id)) {
                                        const chatMessages: ChatMessage[] = [
                                                ...messages.map((msg: any) => ({
                                                        role: msg.role as 'system' | 'user' | 'assistant',
                                                        content: typeof msg.content === 'string' ? msg.content : ''
                                                })),
                                                { role: 'user', content: userPrompt }
                                        ];

                                        setGenerating(true);
                                        setHistory(newHistory);
                                        scrollToBottom();

                                        chatCompletionStream(
                                                chatMessages,
                                                model.id,
                                                (data) => {
                                                        if (data.error) {
                                                                toast.error(data.error);
                                                                setHistory(prev => {
                                                                        const updated = { ...prev };
                                                                        if (updated.messages[responseMessageId]) {
                                                                                updated.messages[responseMessageId].error = { content: data.error };
                                                                                updated.messages[responseMessageId].done = true;
                                                                        }
                                                                        return updated;
                                                                });
                                                                setGenerating(false);
                                                                return;
                                                        }

                                                        if (data.done) {
                                                                setHistory(prev => {
                                                                        const updated = { ...prev };
                                                                        if (updated.messages[responseMessageId]) {
                                                                                updated.messages[responseMessageId].done = true;
                                                                        }
                                                                        return updated;
                                                                });
                                                                setGenerating(false);
                                                                scrollToBottom();
                                                                return;
                                                        }

                                                        if (data.content) {
                                                                setHistory(prev => {
                                                                        const updated = { ...prev };
                                                                        if (updated.messages[responseMessageId]) {
                                                                                updated.messages[responseMessageId].content += data.content;
                                                                        }
                                                                        return updated;
                                                                });
                                                                
                                                                if (autoScroll) {
                                                                        scrollToBottom();
                                                                }
                                                        }
                                                },
                                                (controller) => {
                                                        abortControllerRef.current = controller;
                                                        setGenerating(true);
                                                },
                                                () => {
                                                        setGenerating(false);
                                                        abortControllerRef.current = null;
                                                }
                                        );
                                }
                        }
                }
        }, [files, selectedModels, history, models, autoScroll, scrollToBottom, chatCompletionStream]);

        // Stop response
        const stopResponse = useCallback(() => {
                if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                        abortControllerRef.current = null;
                }
                setGenerating(false);
        }, []);

        // Handle prompt selection from suggestions
        const onSelect = useCallback((e: { type: string; data: string }) => {
                if (e.type === 'prompt') {
                        messageInputRef.current?.setText(e.data, async () => {
                                if (!(settings?.insertSuggestionPrompt ?? false)) {
                                        setTimeout(() => submitPrompt(e.data), 0);
                                }
                        });
                }
        }, [settings, submitPrompt]);

        // Initialize on mount
        useEffect(() => {
                if (!chatIdProp) {
                        initNewChat();
                }
        }, [chatIdProp, initNewChat]);

        // Update page title
        useEffect(() => {
                const title = settings?.showChatTitleInTab !== false && chatTitle
                        ? `${chatTitle.length > 30 ? `${chatTitle.slice(0, 30)}...` : chatTitle} • ${WEBUI_NAME}`
                        : WEBUI_NAME;
                document.title = title;
        }, [chatTitle, settings, WEBUI_NAME]);

        // Get messages list
        const messages = createMessagesList(history, history.currentId);
        const hasMessages = messages.length > 0;

        // Get selected model for display
        const selectedModelIdx = selectedModels.length - 1;
        const currentModel = models.find((m: Model) => m.id === selectedModels[selectedModelIdx]);

        return (
                <>
                        <audio id="audioElement" src="" style={{ display: 'none' }}></audio>

                        <div
                                className="h-screen max-h-[100dvh] transition-width duration-200 ease-in-out w-full max-w-full flex flex-col"
                                id="chat-container"
                        >
                                <div className="w-full h-full flex flex-col">
                                        {selectedFolder?.meta?.background_image_url ? (
                                                <>
                                                        <div
                                                                className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
                                                                style={{ backgroundImage: `url(${selectedFolder.meta.background_image_url})` }}
                                                        />
                                                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-t from-white to-white/85 dark:from-gray-900 dark:to-gray-900/90 z-0" />
                                                </>
                                        ) : settings?.backgroundImageUrl || config?.license_metadata?.background_image_url ? (
                                                <>
                                                        <div
                                                                className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
                                                                style={{ backgroundImage: `url(${settings?.backgroundImageUrl ?? config?.license_metadata?.background_image_url})` }}
                                                        />
                                                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-t from-white to-white/85 dark:from-gray-900 dark:to-gray-900/90 z-0" />
                                                </>
                                        ) : null}

                                        <PanelGroup direction="horizontal" className="w-full h-full">
                                                <Panel defaultSize={50} minSize={30} className="h-full flex relative max-w-full flex-col">
                                                        <div className="flex flex-col flex-auto z-10 w-full overflow-auto">
                                                                {(settings?.landingPageMode === 'chat' && !selectedFolder) || hasMessages ? (
                                                                        <>
                                                                                <div
                                                                                        className="pb-2.5 flex flex-col justify-between flex-auto overflow-auto h-0 z-10 scrollbar-hidden"
                                                                                        id="messages-container"
                                                                                        ref={messagesContainerRef}
                                                                                        onScroll={(e) => {
                                                                                                const target = e.target as HTMLDivElement;
                                                                                                setAutoScroll(
                                                                                                        target.scrollHeight - target.scrollTop <= target.clientHeight + 5
                                                                                                );
                                                                                        }}
                                                                                >
                                                                                        <div className="h-full w-full flex flex-col">
                                                                                                {/* Messages would be rendered here */}
                                                                                                <div className="flex-1 flex flex-col justify-end p-4">
                                                                                                        {messages.map((message: any) => (
                                                                                                                <div
                                                                                                                        key={message.id}
                                                                                                                        id={`message-${message.id}`}
                                                                                                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                                                                                                                >
                                                                                                                        <div
                                                                                                                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                                                                                                                        message.role === 'user'
                                                                                                                                                ? 'bg-blue-500 text-white'
                                                                                                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                                                                                                                }`}
                                                                                                                        >
                                                                                                                                <div className="whitespace-pre-wrap">{message.content}</div>
                                                                                                                                {message.error && (
                                                                                                                                        <div className="text-red-500 mt-2">{message.error.content}</div>
                                                                                                                                )}
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        ))}
                                                                                                </div>
                                                                                        </div>
                                                                                </div>

                                                                                <div className="pb-2 z-10">
                                                                                        <MessageInput
                                                                                                ref={messageInputRef}
                                                                                                history={history}
                                                                                                selectedModels={selectedModels}
                                                                                                files={files}
                                                                                                prompt={prompt}
                                                                                                autoScroll={autoScroll}
                                                                                                generating={generating}
                                                                                                stopResponse={stopResponse}
                                                                                                createMessagePair={() => {}}
                                                                                                onPromptChange={setPrompt}
                                                                                                onFilesChange={setFiles}
                                                                                                onSubmit={(p) => submitPrompt(p)}
                                                                                        />

                                                                                        <div className="absolute bottom-1 text-xs text-gray-500 text-center line-clamp-1 right-0 left-0">
                                                                                                {/* Footer text */}
                                                                                        </div>
                                                                                </div>
                                                                        </>
                                                                ) : (
                                                                        <div className="flex items-center h-full">
                                                                                {/* Placeholder view */}
                                                                                {mobile ? (
                                                                                        <div className="flex flex-col h-full w-full">
                                                                                                <div className="flex-1 flex flex-col justify-center overflow-auto px-2 text-center">
                                                                                                        {temporaryChatEnabled && (
                                                                                                                <div className="flex items-center justify-center gap-2 text-gray-500 text-base my-2 w-fit mx-auto">
                                                                                                                        {i18n.t('Temporary Chat')}
                                                                                                                </div>
                                                                                                        )}

                                                                                                        <div className="w-full text-3xl text-gray-800 dark:text-gray-100 text-center flex items-center gap-4 font-primary">
                                                                                                                <div className="w-full flex flex-col justify-center items-center">
                                                                                                                        <div className="flex flex-row justify-center gap-3 w-fit px-5 max-w-xl">
                                                                                                                                <div className="text-3xl line-clamp-1 flex items-center">
                                                                                                                                        {currentModel?.name || i18n.t('Hello, {{name}}', { name: user?.name ?? '' })}
                                                                                                                                </div>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        </div>

                                                                                                        <div className="mx-auto max-w-2xl font-primary mt-4">
                                                                                                                <div className="mx-4 md:mx-5 lg:mx-6">
                                                                                                                        <Suggestions
                                                                                                                                suggestionPrompts={
                                                                                                                                        (atSelectedModel?.info?.meta as any)?.suggestion_prompts ??
                                                                                                                                        (currentModel?.info?.meta as any)?.suggestion_prompts ??
                                                                                                                                        config?.default_prompt_suggestions ??
                                                                                                                                        []
                                                                                                                                }
                                                                                                                                inputValue={prompt}
                                                                                                                                onSelect={onSelect}
                                                                                                                        />
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>

                                                                                                <div className="flex-shrink-0 w-full px-2 pb-2 pt-2 bg-white dark:bg-gray-900">
                                                                                                        <div className="text-base font-normal w-full">
                                                                                                                <MessageInput
                                                                                                                        ref={messageInputRef}
                                                                                                                        history={history}
                                                                                                                        selectedModels={selectedModels}
                                                                                                                        files={files}
                                                                                                                        prompt={prompt}
                                                                                                                        autoScroll={autoScroll}
                                                                                                                        generating={generating}
                                                                                                                        placeholder={i18n.t('How can I help you today?')}
                                                                                                                        stopResponse={stopResponse}
                                                                                                                        createMessagePair={() => {}}
                                                                                                                        onPromptChange={setPrompt}
                                                                                                                        onFilesChange={setFiles}
                                                                                                                        onSubmit={(p) => submitPrompt(p)}
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                ) : (
                                                                                        <div className="m-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-20 text-center">
                                                                                                {temporaryChatEnabled && (
                                                                                                        <div className="flex items-center gap-2 text-gray-500 text-base my-2 w-fit">
                                                                                                                {i18n.t('Temporary Chat')}
                                                                                                        </div>
                                                                                                )}

                                                                                                <div className="w-full text-3xl text-gray-800 dark:text-gray-100 text-center flex items-center gap-4 font-primary">
                                                                                                        <div className="w-full flex flex-col justify-center items-center">
                                                                                                                <div className="flex flex-row justify-center gap-3 w-fit px-5 max-w-xl">
                                                                                                                        <div className="text-3xl line-clamp-1 flex items-center">
                                                                                                                                {currentModel?.name || i18n.t('Hello, {{name}}', { name: user?.name ?? '' })}
                                                                                                                        </div>
                                                                                                                </div>

                                                                                                                <div className="text-base font-normal md:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl w-full py-3">
                                                                                                                        <MessageInput
                                                                                                                                ref={messageInputRef}
                                                                                                                                history={history}
                                                                                                                                selectedModels={selectedModels}
                                                                                                                                files={files}
                                                                                                                                prompt={prompt}
                                                                                                                                autoScroll={autoScroll}
                                                                                                                                generating={generating}
                                                                                                                                placeholder={i18n.t('How can I help you today?')}
                                                                                                                                stopResponse={stopResponse}
                                                                                                                                createMessagePair={() => {}}
                                                                                                                                onPromptChange={setPrompt}
                                                                                                                                onFilesChange={setFiles}
                                                                                                                                onSubmit={(p) => submitPrompt(p)}
                                                                                                                        />
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>

                                                                                                <div className="mx-auto max-w-2xl xl:max-w-3xl 2xl:max-w-4xl font-primary mt-2">
                                                                                                        <div className="mx-4 md:mx-5 lg:mx-6">
                                                                                                                <Suggestions
                                                                                                                        suggestionPrompts={
                                                                                                                                (atSelectedModel?.info?.meta as any)?.suggestion_prompts ??
                                                                                                                                (currentModel?.info?.meta as any)?.suggestion_prompts ??
                                                                                                                                config?.default_prompt_suggestions ??
                                                                                                                                []
                                                                                                                        }
                                                                                                                        inputValue={prompt}
                                                                                                                        onSelect={onSelect}
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                )}
                                                        </div>
                                                </Panel>
                                        </PanelGroup>
                                </div>
                        </div>

                        <style>{`
                                ::-webkit-scrollbar {
                                        height: 0.5rem;
                                        width: 0.5rem;
                                }
                        `}</style>
                </>
        );
};

export default Chat;
