import { APP_NAME } from '$lib/constants';
import { type Writable, writable } from 'svelte/store';

// Backend
export const WEBUI_NAME = writable(APP_NAME);

export const WEBUI_VERSION = writable(null);

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
export const config: Writable<Config | undefined> = writable(defaultConfig);

const defaultUser = {
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
export const user: Writable<SessionUser | undefined> = writable(defaultUser);

// Electron App
export const isApp = writable(false);

// Frontend
export const MODEL_DOWNLOAD_POOL = writable({});

export const mobile = writable(false);

export const socket: Writable<null | any> = writable(null);

export const theme = writable('light');

export const chatId = writable('');
export const chatTitle = writable('');

export const chats = writable([]);
export const pinnedChats = writable([]);
export const tags = writable([]);
export const folders = writable([]);

export const selectedFolder = writable(null);

export const models: Writable<Model[]> = writable([
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
]);

export const knowledge: Writable<Document[]> = writable([]);
export const tools = writable([]);
export const functions = writable([]);

export const toolServers = writable([]);

export const settings: Writable<Settings> = writable({});


export const showSidebar = writable(false);
export const showSearch = writable(false);
export const showSettings = writable(false);
export const showShortcuts = writable(false);
export const showArchivedChats = writable(false);
export const showChangelog = writable(false);

export const showControls = writable(false);
export const showEmbeds = writable(false);
export const showArtifacts = writable(false);

export const artifactCode = writable('');
export const artifactContents = writable({});

export const embed = writable(null);

export const temporaryChatEnabled = writable(false);
export const scrollPaginationEnabled = writable(false);
export const currentChatPage = writable(1);


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

type Prompt = {
        command: string;
        user_id: string;
        title: string;
        content: string;
        timestamp: number;
};

type Document = {
        collection_name: string;
        filename: string;
        name: string;
        title: string;
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
