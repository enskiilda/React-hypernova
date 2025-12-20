# replit.md

## Overview

Open WebUI is a minimalistic SvelteKit chat application. The frontend provides a chat interface with sidebar for conversation history. Interface is in Polish only.

## Recent Changes (December 2024)

- Removed backend server (server.js)
- Removed Settings components
- Removed Playground components
- Removed unnecessary routes (playground, watch, error, s/, home)
- Removed modals (SettingsModal, ChangelogModal, ToolServersModal, AddConnectionModal, AddToolServerModal)
- Removed Placeholder folder components (FolderPlaceholder, FolderTitle)
- Cleaned up all imports and references to deleted components
- Stubbed backend API calls (getAllTags, getUsage, getModels, getPinnedChatList, getChatList, importChats, createNewFolder, getFolders) to prevent runtime errors
- Removed unused icon components (AlignHorizontal, AlignVertical, AppNotification, Camera, Cog6, DatabaseSettings, SettingsAlt, WrenchAlt, Heart, InfoCircle, Code, UserGroup)

### December 17, 2024 - Codebase Cleanup
- Removed 9 additional unused icon components (ChatBubbleOval, ChevronLeft, ClockRotateRight, CommandLine, Face, Minus, PencilSolid, UserCircle, Wrench)
- Removed 3 unused components (NotificationToast, SVGPanZoom, AttachWebpageModal)
- Removed 7 unused store exports (WEBUI_DEPLOYMENT_ID, appInfo, appData, activeUserIds, USAGE_POOL, channels, showOverview)
- Cleaned up 14+ unused export properties from various components (icon className props, Selector searchEnabled/searchPlaceholder, ResponseMessage rateMessage, etc.)
- Removed unused CSS selectors from ShortcutsModal.svelte
- Added inline ModelConfig type definition in stores/index.ts
- Replaced SvgPanZoom usage with simple div + {@html} rendering in Artifacts.svelte and CodeBlock.svelte
- Fixed broken imports after component removal

### December 17, 2024 - Additional Cleanup
- Removed 17 unused icon components (ArrowLeftTag, ArrowRightTag, CheckBox, CodeBracket, H2, ListBullet, NumberedList, Underline, Bold, H1, H3, Italic, Reset, Strikethrough, Clip, Code, User)
- Removed 2 unused store exports (isLastActiveTab, playingNotificationSound)
- Removed 1 unused component (CommandSuggestionList.svelte)
- Removed entire Commands folder (Knowledge.svelte, Models.svelte, Prompts.svelte)
- Total reduction: 24 files, ~950 lines of code

### December 17, 2024 - Dependency Simplification
- Removed KaTeX library and all LaTeX math rendering functionality
- Removed CodeMirror (7 packages) - replaced CodeEditor with simple textarea
- Removed highlight.js and lowlight - syntax highlighting removed
- Removed Mermaid (diagrams) and Vega/Vega-lite (charts) rendering
- Removed TipTap editor (12 packages) and ProseMirror (4 packages) - replaced RichTextInput with simple textarea
- Removed turndown and turndown-plugin-gfm libraries
- Total: 71 packages removed from package.json, significantly lighter application

### December 17, 2024 - Deep Code Cleanup
- Removed empty lib/index.ts file
- Removed text-scale.ts (unused)
- Removed 3 unused icon components (ArrowLeft, GlobeAlt, Voice)
- Removed unused common/Sidebar.svelte component
- Cleaned up constants.ts - removed WEBUI_HOSTNAME, OPENAI_API_BASE_URL, AUDIO_API_BASE_URL, IMAGES_API_BASE_URL, RETRIEVAL_API_BASE_URL
- Cleaned up i18n/index.ts - removed getLanguages, changeLanguage exports
- Cleaned up localStorage.ts - removed 13 unused stub functions (generateId export, getChatByShareId, deleteAllChats, getAllChatTags, getChatListByTagName, createNewFolder, getFolderList, updateFolderNameById, deleteFolderById, updateFolderIsExpandedById, updateFolderParentIdById, updateChatFolderIdById, getUserSettings, updateUserSettings, getModels, getUserById, getAndUpdateUserLocation, getFolderById)
- Cleaned up app.css - removed unused CSS classes (editor-selection, font-secondary, input-prose-sm, markdown-prose-sm, svelte-flow, bg-gray-950-90, ai-autocompletion)
- Total codebase now ~26,917 lines (down from ~28,833 initial, ~1,916 lines removed overall)

### December 17, 2024 - Static Assets Cleanup
- Removed unused static files:
  - Leaflet map icons (marker-icon.png, marker-icon-2x.png, marker-shadow.png)
  - Unused font (InstrumentSerif-Italic.ttf)
  - OpenSearch configuration (opensearch.xml)
  - image-placeholder.png
- Cleaned up constants.ts - removed WEBUI_BUILD_HASH, SUPPORTED_FILE_TYPE, SUPPORTED_FILE_EXTENSIONS

## Frontend

Open WebUI is a SvelteKit application that provides a chat interface for interacting with AI models. The project is a static web application built with Vite.

### Core Components Kept
- **Chat UI** - Main chat interface with message input and messages display
- **Sidebar** - Conversation list and navigation
- **Common components** - Reusable UI elements

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **SvelteKit** with static adapter - generates a single-page application (SPA) with client-side rendering only (`ssr = false`)
- **Vite** as the build tool
- **TypeScript** for type safety with strict mode enabled

### Styling
- **Tailwind CSS v4** with custom configuration supporting dark mode via class toggle
- Custom CSS variables for theming (gray color scale) and UI scaling (`--app-text-scale`)
- Typography plugin for prose styling, container queries for responsive layouts
- Theme support with pre-built themes (Rose Pine variants)

### Text Input
- Simple textarea-based message input (TipTap removed for simplicity)

### Markdown Processing
- **Marked** library with custom extensions for:
  - Citation references
  - Footnotes
  - Mention syntax
  - Custom details/summary blocks

### Language
- Static Polish language interface
- Translation strings embedded in `src/lib/i18n/index.ts` from Polish JSON file
- No dynamic language switching - Polish only

### State Management
- Svelte stores for global state (`src/lib/stores/index.ts`)
- Configuration defaults embedded in code
- Local storage utilities for client-side persistence

### Code Editor
- Simple textarea-based code editor (CodeMirror removed for simplicity)

## Project Structure

```
vite-main/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── chat/         # Chat UI components
│   │   │   ├── common/       # Reusable UI components
│   │   │   ├── icons/        # SVG icon components
│   │   │   └── layout/       # Layout components (Sidebar)
│   │   ├── i18n/             # Polish translations
│   │   ├── stores/           # Svelte stores
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── routes/               # SvelteKit routes
│   └── app.css               # Global styles
├── static/                   # Static assets
└── package.json
```

## Key NPM Dependencies
- `chart.js` - Data visualization
- `dompurify` - HTML sanitization
- `fuse.js` - Fuzzy search
- `tippy.js` - Tooltips and popovers
- `dayjs` - Date/time formatting with locale support

## Build/Development
- Run with `npm run dev` in vite-main directory
- Development server on port 5000
