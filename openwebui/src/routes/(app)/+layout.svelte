<script lang="ts">
        import { onMount, tick, getContext } from 'svelte';

        import { goto } from '$app/navigation';
        import { page } from '$app/stores';
        import { fade } from 'svelte/transition';

        import {
                config,
                user,
                settings,
                models,
                tools,
                functions,
                tags,
                showSettings,
                showShortcuts,
                showChangelog,
                temporaryChatEnabled,
                toolServers,
                showSearch,
                showSidebar,
                mobile
        } from '$lib/stores';

        import Sidebar from '$lib/components/layout/Sidebar.svelte';
        import { Shortcut, shortcuts } from '$lib/shortcuts';

        const i18n = getContext('i18n');

        onMount(async () => {
                tools.set([]);
                functions.set([]);
                tags.set([]);
                toolServers.set([]);

                const isShortcutMatch = (event: KeyboardEvent, shortcut): boolean => {
                        const keys = shortcut?.keys || [];

                        const normalized = keys.map((k) => k.toLowerCase());
                        const needCtrl = normalized.includes('ctrl') || normalized.includes('mod');
                        const needShift = normalized.includes('shift');
                        const needAlt = normalized.includes('alt');

                        const mainKeys = normalized.filter((k) => !['ctrl', 'shift', 'alt', 'mod'].includes(k));

                        const keyPressed = event.key.toLowerCase();

                        if (needShift && !event.shiftKey) return false;

                        if (needCtrl && !(event.ctrlKey || event.metaKey)) return false;
                        if (!needCtrl && (event.ctrlKey || event.metaKey)) return false;
                        if (needAlt && !event.altKey) return false;
                        if (!needAlt && event.altKey) return false;

                        if (mainKeys.length && !mainKeys.includes(keyPressed)) return false;

                        return true;
                };

                const setupKeyboardShortcuts = () => {
                        document.addEventListener('keydown', async (event) => {
                                if (isShortcutMatch(event, shortcuts[Shortcut.SEARCH])) {
                                        event.preventDefault();
                                        showSearch.set(!$showSearch);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.NEW_CHAT])) {
                                        event.preventDefault();
                                        document.getElementById('sidebar-new-chat-button')?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.FOCUS_INPUT])) {
                                        event.preventDefault();
                                        document.getElementById('chat-input')?.focus();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.COPY_LAST_CODE_BLOCK])) {
                                        event.preventDefault();
                                        [...document.getElementsByClassName('copy-code-button')]?.at(-1)?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.COPY_LAST_RESPONSE])) {
                                        event.preventDefault();
                                        [...document.getElementsByClassName('copy-response-button')]?.at(-1)?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.TOGGLE_SIDEBAR])) {
                                        event.preventDefault();
                                        showSidebar.set(!$showSidebar);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.DELETE_CHAT])) {
                                        event.preventDefault();
                                        document.getElementById('delete-chat-button')?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.OPEN_SETTINGS])) {
                                        event.preventDefault();
                                        showSettings.set(!$showSettings);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.SHOW_SHORTCUTS])) {
                                        event.preventDefault();
                                        showShortcuts.set(!$showShortcuts);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.CLOSE_MODAL])) {
                                        event.preventDefault();
                                        showSettings.set(false);
                                        showShortcuts.set(false);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.NEW_TEMPORARY_CHAT])) {
                                        event.preventDefault();
                                        if ($user?.role !== 'admin' && $user?.permissions?.chat?.temporary_enforced) {
                                                temporaryChatEnabled.set(true);
                                        } else {
                                                temporaryChatEnabled.set(!$temporaryChatEnabled);
                                        }
                                        await goto('/');
                                        setTimeout(() => {
                                                document.getElementById('new-chat-button')?.click();
                                        }, 0);
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.GENERATE_MESSAGE_PAIR])) {
                                        event.preventDefault();
                                        document.getElementById('generate-message-pair-button')?.click();
                                } else if (isShortcutMatch(event, shortcuts[Shortcut.REGENERATE_RESPONSE])) {
                                        event.preventDefault();
                                        [...document.getElementsByClassName('regenerate-response-button')]?.at(-1)?.click();
                                }
                        });
                };
                setupKeyboardShortcuts();

                if ($page.url.searchParams.get('temporary-chat') === 'true') {
                        temporaryChatEnabled.set(true);
                }

                await tick();
        });
</script>


<div class="app relative">
        <div
                class="text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 h-screen max-h-[100dvh] flex flex-row transition-all duration-300 overflow-hidden"
                style="--sidebar-width: {$showSidebar ? '260px' : '48px'}"
        >
                <style>
                        :global(.app-content-wrapper) {
                                display: flex;
                                flex: 1 1 auto;
                                min-width: 0;
                                width: 100%;
                                overflow: visible;
                        }
                </style>

                <Sidebar />

                <div 
                        class="app-content-wrapper"
                        style={$mobile && $showSidebar ? 'transform: translateX(260px); min-width: 100vw;' : ''}
                >
                        <slot />
                </div>
        </div>
</div>

