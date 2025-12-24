import { create } from 'zustand';
import { APP_NAME } from '$lib/constants';

// Types
export type Model = OpenAIModel | OllamaModel;

type ModelConfig = {
        id: string;
        name?: string;
        meta?: {
                profile_image_url?: string;
                description?: string;
                capabilities?: {
                        vision?: boolean;
                        usage?: boolean;
                        citations?: boolean;
                };
                tags?: { name: string }[];
                hidden?: boolean;
        };
        base_model_id?: string;
        params?: Record<string, any>;
};

type BaseModel = {
        id: string;
        name: string;
        info?: ModelConfig;
        owned_by: 'ollama' | 'openai' | 'arena';
};

export interface OpenAIModel extends BaseModel {
        owned_by: 'openai';
        external: boolean;
        source?: string;
}

export interface OllamaModel extends BaseModel {
        owned_by: 'ollama';
        details: OllamaModelDetails;
        size: number;
        description: string;
        model: string;
        modified_at: string;
        digest: string;
        ollama?: {
                name?: string;
                model?: string;
                modified_at: string;
                size?: number;
                digest?: string;
                details?: {
                        parent_model?: string;
                        format?: string;
                        family?: string;
                        families?: string[];
                        parameter_size?: string;
                        quantization_level?: string;
                };
                urls?: number[];
        };
}

type OllamaModelDetails = {
        parent_model: string;
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
};

type Settings = {
        pinnedModels?: never[];
        toolServers?: never[];
        detectArtifacts?: boolean;
        showUpdateToast?: boolean;
        showChangelog?: boolean;
        showEmojiInCall?: boolean;
        voiceInterruption?: boolean;
        collapseCodeBlocks?: boolean;
        expandDetails?: boolean;
        notificationSound?: boolean;
        notificationSoundAlways?: boolean;
        stylizedPdfExport?: boolean;
        notifications?: any;
        imageCompression?: boolean;
        imageCompressionSize?: any;
        textScale?: number;
        widescreenMode?: null;
        largeTextAsFile?: boolean;
        promptAutocomplete?: boolean;
        hapticFeedback?: boolean;
        responseAutoCopy?: any;
        richTextInput?: boolean;
        params?: any;
        userLocation?: any;
        webSearch?: any;
        memory?: boolean;
        autoTags?: boolean;
        autoFollowUps?: boolean;
        splitLargeChunks?(body: any, splitLargeChunks: any): unknown;
        backgroundImageUrl?: null;
        landingPageMode?: string;
        iframeSandboxAllowForms?: boolean;
        iframeSandboxAllowSameOrigin?: boolean;
        scrollOnBranchChange?: boolean;
        directConnections?: null;
        chatBubble?: boolean;
        copyFormatted?: boolean;
        models?: string[];
        conversationMode?: boolean;
        speechAutoSend?: boolean;
        responseAutoPlayback?: boolean;
        audio?: AudioSettings;
        showUsername?: boolean;
        notificationEnabled?: boolean;
        highContrastMode?: boolean;
        title?: TitleSettings;
        showChatTitleInTab?: boolean;
        splitLargeDeltas?: boolean;
        chatDirection?: 'LTR' | 'RTL' | 'auto';
        ctrlEnterToSend?: boolean;
        system?: string;
        seed?: number;
        temperature?: string;
        repeat_penalty?: string;
        top_k?: string;
        top_p?: string;
        num_ctx?: string;
        num_batch?: string;
        num_keep?: string;
        options?: ModelOptions;
        insertSuggestionPrompt?: boolean;
        temporaryChatByDefault?: boolean;
};

type ModelOptions = {
        stop?: boolean;
};

type AudioSettings = {
        stt: any;
        tts: any;
        STTEngine?: string;
        TTSEngine?: string;
        speaker?: string;
        model?: string;
        nonLocalVoices?: boolean;
};

type TitleSettings = {
        auto?: boolean;
        model?: string;
        modelExternal?: string;
        prompt?: string;
};

type Config = {
        license_metadata: any;
        status: boolean;
        name: string;
        version: string;
        default_locale: string;
        default_models: string;
        default_prompt_suggestions: PromptSuggestion[];
        features: {
                enable_admin_chat_access: boolean;
                enable_community_sharing: boolean;
        };
        ui?: {
                pending_user_overlay_title?: string;
                pending_user_overlay_description?: string;
        };
        audio?: {
                tts?: {
                        split_on?: string;
                };
        };
        file?: {
                max_count?: number;
        };
};

type PromptSuggestion = {
        content: string;
        title: [string, string];
};

export type SessionUser = {
        permissions: any;
        id: string;
        email: string;
        name: string;
        role: string;
        profile_image_url: string;
};

type Document = {
        collection_name: string;
        filename: string;
        name: string;
        title: string;
};

// Default values
const defaultConfig: Config = {
        license_metadata: null,
        status: true,
        name: 'Open WebUI',
        version: '0.6.40',
        default_locale: 'pl-PL',
        default_models: 'deepseek-ai/deepseek-v3.1',
        default_prompt_suggestions: [],
        features: {
                enable_admin_chat_access: true,
                enable_community_sharing: true
        }
};

const defaultUser: SessionUser = {
        id: 'user',
        email: 'user@localhost',
        name: 'User',
        role: 'admin',
        profile_image_url: '/static/favicon.png',
        permissions: {
                chat: {
                        temporary_enforced: false,
                        multiple_models: true
                },
                features: {
                        image_generation: true,
                        code_interpreter: true,
                        web_search: true
                }
        }
};

const defaultModels: Model[] = [
        {
                id: 'moonshotai/kimi-k2-thinking',
                name: 'Kimi K2 Thinking',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        },
        {
                id: 'bytedance/seed-oss-36b-instruct',
                name: 'Seed 36B Instruct',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        },
        {
                id: 'deepseek-ai/deepseek-v3.1',
                name: 'DeepSeek V3.1',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        },
        {
                id: 'deepseek-ai/deepseek-r1-0528',
                name: 'DeepSeek R1',
                owned_by: 'openai' as const,
                external: true,
                source: 'nvidia'
        }
];

// Store interface
interface AppState {
        // Backend
        WEBUI_NAME: string;
        WEBUI_VERSION: string | null;
        config: Config | undefined;
        user: SessionUser | undefined;
        
        // Electron App
        isApp: boolean;
        
        // Frontend
        MODEL_DOWNLOAD_POOL: Record<string, any>;
        mobile: boolean;
        socket: any;
        theme: string;
        
        // Chat
        chatId: string;
        chatTitle: string;
        chats: any[];
        pinnedChats: any[];
        tags: any[];
        folders: any[];
        selectedFolder: any;
        
        // Models
        models: Model[];
        knowledge: Document[];
        tools: any[];
        functions: any[];
        toolServers: any[];
        
        // Settings
        settings: Settings;
        
        // UI State
        showSidebar: boolean;
        showSearch: boolean;
        showSettings: boolean;
        showShortcuts: boolean;
        showArchivedChats: boolean;
        showChangelog: boolean;
        showControls: boolean;
        showEmbeds: boolean;
        showArtifacts: boolean;
        
        // Artifacts
        artifactCode: string;
        artifactContents: any;
        embed: any;
        
        // Chat State
        temporaryChatEnabled: boolean;
        scrollPaginationEnabled: boolean;
        currentChatPage: number;
        
        // Actions
        setWEBUI_NAME: (name: string) => void;
        setWEBUI_VERSION: (version: string | null) => void;
        setConfig: (config: Config | undefined) => void;
        setUser: (user: SessionUser | undefined) => void;
        setIsApp: (isApp: boolean) => void;
        setMODEL_DOWNLOAD_POOL: (pool: Record<string, any>) => void;
        setMobile: (mobile: boolean) => void;
        setSocket: (socket: any) => void;
        setTheme: (theme: string) => void;
        setChatId: (chatId: string) => void;
        setChatTitle: (chatTitle: string) => void;
        setChats: (chats: any[]) => void;
        setPinnedChats: (pinnedChats: any[]) => void;
        setTags: (tags: any[]) => void;
        setFolders: (folders: any[]) => void;
        setSelectedFolder: (folder: any) => void;
        setModels: (models: Model[]) => void;
        setKnowledge: (knowledge: Document[]) => void;
        setTools: (tools: any[]) => void;
        setFunctions: (functions: any[]) => void;
        setToolServers: (toolServers: any[]) => void;
        setSettings: (settings: Settings) => void;
        setShowSidebar: (show: boolean) => void;
        setShowSearch: (show: boolean) => void;
        setShowSettings: (show: boolean) => void;
        setShowShortcuts: (show: boolean) => void;
        setShowArchivedChats: (show: boolean) => void;
        setShowChangelog: (show: boolean) => void;
        setShowControls: (show: boolean) => void;
        setShowEmbeds: (show: boolean) => void;
        setShowArtifacts: (show: boolean) => void;
        setArtifactCode: (code: string) => void;
        setArtifactContents: (contents: any) => void;
        setEmbed: (embed: any) => void;
        setTemporaryChatEnabled: (enabled: boolean) => void;
        setScrollPaginationEnabled: (enabled: boolean) => void;
        setCurrentChatPage: (page: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
        // Backend
        WEBUI_NAME: APP_NAME,
        WEBUI_VERSION: null,
        config: defaultConfig,
        user: defaultUser,
        
        // Electron App
        isApp: false,
        
        // Frontend
        MODEL_DOWNLOAD_POOL: {},
        mobile: false,
        socket: null,
        theme: 'light',
        
        // Chat
        chatId: '',
        chatTitle: '',
        chats: [],
        pinnedChats: [],
        tags: [],
        folders: [],
        selectedFolder: null,
        
        // Models
        models: defaultModels,
        knowledge: [],
        tools: [],
        functions: [],
        toolServers: [],
        
        // Settings
        settings: {},
        
        // UI State
        showSidebar: false,
        showSearch: false,
        showSettings: false,
        showShortcuts: false,
        showArchivedChats: false,
        showChangelog: false,
        showControls: false,
        showEmbeds: false,
        showArtifacts: false,
        
        // Artifacts
        artifactCode: '',
        artifactContents: {},
        embed: null,
        
        // Chat State
        temporaryChatEnabled: false,
        scrollPaginationEnabled: false,
        currentChatPage: 1,
        
        // Actions
        setWEBUI_NAME: (name) => set({ WEBUI_NAME: name }),
        setWEBUI_VERSION: (version) => set({ WEBUI_VERSION: version }),
        setConfig: (config) => set({ config }),
        setUser: (user) => set({ user }),
        setIsApp: (isApp) => set({ isApp }),
        setMODEL_DOWNLOAD_POOL: (pool) => set({ MODEL_DOWNLOAD_POOL: pool }),
        setMobile: (mobile) => set({ mobile }),
        setSocket: (socket) => set({ socket }),
        setTheme: (theme) => set({ theme }),
        setChatId: (chatId) => set({ chatId }),
        setChatTitle: (chatTitle) => set({ chatTitle }),
        setChats: (chats) => set({ chats }),
        setPinnedChats: (pinnedChats) => set({ pinnedChats }),
        setTags: (tags) => set({ tags }),
        setFolders: (folders) => set({ folders }),
        setSelectedFolder: (folder) => set({ selectedFolder: folder }),
        setModels: (models) => set({ models }),
        setKnowledge: (knowledge) => set({ knowledge }),
        setTools: (tools) => set({ tools }),
        setFunctions: (functions) => set({ functions }),
        setToolServers: (toolServers) => set({ toolServers }),
        setSettings: (settings) => set({ settings }),
        setShowSidebar: (show) => set({ showSidebar: show }),
        setShowSearch: (show) => set({ showSearch: show }),
        setShowSettings: (show) => set({ showSettings: show }),
        setShowShortcuts: (show) => set({ showShortcuts: show }),
        setShowArchivedChats: (show) => set({ showArchivedChats: show }),
        setShowChangelog: (show) => set({ showChangelog: show }),
        setShowControls: (show) => set({ showControls: show }),
        setShowEmbeds: (show) => set({ showEmbeds: show }),
        setShowArtifacts: (show) => set({ showArtifacts: show }),
        setArtifactCode: (code) => set({ artifactCode: code }),
        setArtifactContents: (contents) => set({ artifactContents: contents }),
        setEmbed: (embed) => set({ embed }),
        setTemporaryChatEnabled: (enabled) => set({ temporaryChatEnabled: enabled }),
        setScrollPaginationEnabled: (enabled) => set({ scrollPaginationEnabled: enabled }),
        setCurrentChatPage: (page) => set({ currentChatPage: page }),
}));
