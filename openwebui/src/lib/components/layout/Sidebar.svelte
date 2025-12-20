<script lang="ts">
        import { toast } from 'svelte-sonner';
        import { v4 as uuidv4 } from 'uuid';

        import { goto } from '$app/navigation';
        import {
                user,
                chats,
                settings,
                chatId,
                tags,
                folders as _folders,
                showSidebar,
                showSearch,
                mobile,
                showArchivedChats,
                pinnedChats,
                scrollPaginationEnabled,
                currentChatPage,
                temporaryChatEnabled,
                socket,
                config,
                isApp,
                models,
                selectedFolder,
                WEBUI_NAME
        } from '$lib/stores';
        import { onMount, getContext, tick, onDestroy } from 'svelte';

        const i18n = getContext('i18n');

        import UserMenu from './Sidebar/UserMenu.svelte';
        import ChatItem from './Sidebar/ChatItem.svelte';
        import Spinner from '../common/Spinner.svelte';
        import Loader from '../common/Loader.svelte';
        import Icon from '../icons/Icon.svelte';
        import { slide } from 'svelte/transition';
        import Avatar from '../common/Avatar.svelte';

        const BREAKPOINT = 768;

        let scrollTop = 0;

        let navElement;
        let shiftKey = false;

        let selectedChatId = null;

        // Pagination variables
        let chatListLoading = false;
        let allChatsLoaded = false;

        let showCreateFolderModal = false;

        let folders = {};
        let folderRegistry = {};

        let newFolderId = null;

        $: if ($selectedFolder) {
                initFolders();
        }

        const initFolders = async () => {
                _folders.set([]);
                folders = {};
        };

        const createFolder = async ({ name }) => {
                name = name?.trim();
                if (!name) {
                        toast.error($i18n.t('Folder name cannot be empty.'));
                        return;
                }
                toast.info($i18n.t('Folder creation not available in this version.'));
        };

        const initChatList = async () => {
                // Reset pagination variables
                currentChatPage.set(1);
                allChatsLoaded = true;
                scrollPaginationEnabled.set(false);

                initFolders();
                tags.set([]);
                pinnedChats.set([]);
                chats.set([]);

                // Enable pagination
                scrollPaginationEnabled.set(true);
        };

        const loadMoreChats = async () => {
                chatListLoading = true;
                allChatsLoaded = true;
                chatListLoading = false;
        };

        const importChatHandler = async (items, pinned = false, folderId = null) => {
                toast.info($i18n.t('Chat import not available in this version.'));
        };

        const inputFilesHandler = async (files) => {
                for (const file of files) {
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                                const content = e.target.result;

                                try {
                                        const chatItems = JSON.parse(content);
                                        importChatHandler(chatItems);
                                } catch {
                                        toast.error($i18n.t(`Invalid file format.`));
                                }
                        };

                        reader.readAsText(file);
                }
        };

        const tagEventHandler = async (type, tagName, chatId) => {
                if (type === 'delete') {
                        initChatList();
                } else if (type === 'add') {
                        initChatList();
                }
        };

        let draggedOver = false;

        const onDragOver = (e) => {
                e.preventDefault();

                // Check if a file is being draggedOver.
                if (e.dataTransfer?.types?.includes('Files')) {
                        draggedOver = true;
                } else {
                        draggedOver = false;
                }
        };

        const onDragLeave = () => {
                draggedOver = false;
        };

        const onDrop = async (e) => {
                e.preventDefault();

                // Perform file drop check and handle it accordingly
                if (e.dataTransfer?.files) {
                        const inputFiles = Array.from(e.dataTransfer?.files);

                        if (inputFiles && inputFiles.length > 0) {
                                inputFilesHandler(inputFiles); // Handle the dropped files
                        }
                }

                draggedOver = false; // Reset draggedOver status after drop
        };

        let touchstart;
        let touchend;

        function checkDirection() {
                if (!$mobile) return;
                
                const screenWidth = window.innerWidth;
                const swipeDistance = Math.abs(touchend.screenX - touchstart.screenX);
                const swipeThreshold = screenWidth / 8;
                
                if (swipeDistance >= swipeThreshold) {
                        if (touchend.screenX > touchstart.screenX && !$showSidebar) {
                                showSidebar.set(true);
                        }
                        if (touchend.screenX < touchstart.screenX && $showSidebar) {
                                showSidebar.set(false);
                        }
                }
        }

        const onTouchStart = (e) => {
                touchstart = e.changedTouches[0];
        };

        const onTouchEnd = (e) => {
                touchend = e.changedTouches[0];
                checkDirection();
        };

        const onKeyDown = (e) => {
                if (e.key === 'Shift') {
                        shiftKey = true;
                }
        };

        const onKeyUp = (e) => {
                if (e.key === 'Shift') {
                        shiftKey = false;
                }
        };

        const onFocus = () => {};

        const onBlur = () => {
                shiftKey = false;
                selectedChatId = null;
        };

        let unsubscribers = [];
        onMount(async () => {
                await showSidebar.set(!$mobile ? false : false);

                unsubscribers = [
                        mobile.subscribe((value) => {
                                if ($showSidebar && value) {
                                        showSidebar.set(false);
                                }

                                if ($showSidebar && !value) {
                                        const navElement = document.getElementsByTagName('nav')[0];
                                        if (navElement) {
                                                navElement.style['-webkit-app-region'] = 'drag';
                                        }
                                }
                        }),
                        showSidebar.subscribe(async (value) => {
                                // nav element is not available on the first render
                                const navElement = document.getElementsByTagName('nav')[0];

                                if (navElement) {
                                        if ($mobile) {
                                                if (!value) {
                                                        navElement.style['-webkit-app-region'] = 'drag';
                                                } else {
                                                        navElement.style['-webkit-app-region'] = 'no-drag';
                                                }
                                        } else {
                                                navElement.style['-webkit-app-region'] = 'drag';
                                        }
                                }

                                if (value) {
                                        await initChatList();
                                }
                        })
                ];

                window.addEventListener('keydown', onKeyDown);
                window.addEventListener('keyup', onKeyUp);

                window.addEventListener('touchstart', onTouchStart);
                window.addEventListener('touchend', onTouchEnd);

                window.addEventListener('focus', onFocus);
                window.addEventListener('blur', onBlur);

                const dropZone = document.getElementById('sidebar');

                dropZone?.addEventListener('dragover', onDragOver);
                dropZone?.addEventListener('drop', onDrop);
                dropZone?.addEventListener('dragleave', onDragLeave);
        });

        onDestroy(() => {
                if (unsubscribers && unsubscribers.length > 0) {
                        unsubscribers.forEach((unsubscriber) => {
                                if (unsubscriber) {
                                        unsubscriber();
                                }
                        });
                }

                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keyup', onKeyUp);

                window.removeEventListener('touchstart', onTouchStart);
                window.removeEventListener('touchend', onTouchEnd);

                window.removeEventListener('focus', onFocus);
                window.removeEventListener('blur', onBlur);

                const dropZone = document.getElementById('sidebar');

                dropZone?.removeEventListener('dragover', onDragOver);
                dropZone?.removeEventListener('drop', onDrop);
                dropZone?.removeEventListener('dragleave', onDragLeave);
        });

        const newChatHandler = async () => {
                selectedChatId = null;
                selectedFolder.set(null);

                if ($user?.role !== 'admin' && $user?.permissions?.chat?.temporary_enforced) {
                        await temporaryChatEnabled.set(true);
                } else {
                        await temporaryChatEnabled.set(false);
                }

                setTimeout(() => {
                        if ($mobile) {
                                showSidebar.set(false);
                        }
                }, 0);
        };

        const itemClickHandler = async () => {
                selectedChatId = null;
                chatId.set('');

                if ($mobile) {
                        showSidebar.set(false);
                }

                await tick();
        };

        const isWindows = /Windows/i.test(navigator.userAgent);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->

<button
        id="sidebar-new-chat-button"
        class="hidden"
        on:click={() => {
                goto('/');
                newChatHandler();
        }}
/>

{#if $showSidebar || !$mobile}
        <div
                bind:this={navElement}
                id="sidebar"
                class="h-screen max-h-[100dvh] min-h-screen select-none flex-shrink-0 {$showSidebar ? 'w-[260px]' : 'w-[48px]'} {$showSidebar ? 'bg-[#f9f9f9] dark:bg-[#181818]' : 'bg-white dark:bg-[#212121]'} border-e border-[#f5f5f5] dark:border-[#2e2e2e] text-gray-900 dark:text-gray-200 text-sm overflow-x-hidden transition-all duration-500 ease-in-out {$mobile ? 'fixed left-0 top-0 z-50' : ''} {$mobile ? ($showSidebar ? 'translate-x-0' : '-translate-x-full') : ''}
        "
                data-state={$showSidebar}
        >
                <div
                        class="flex flex-col justify-between h-screen max-h-[100dvh] {$showSidebar ? 'w-[260px]' : 'w-[48px]'} overflow-x-hidden scrollbar-hidden z-50"
                >
                        <div
                                class="sidebar px-1.5 pt-1.5 pb-1.5 flex flex-col text-gray-600 dark:text-gray-400 sticky top-0 z-10"
                        >
                                <div class="flex items-center">
                                        <button
                                                class="cursor-pointer flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition no-drag-region shrink-0 size-9"
                                                on:click={() => {
                                                        showSidebar.set(!$showSidebar);
                                                }}
                                                aria-label={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}
                                        >
                                                <div class="flex items-center justify-center size-9 shrink-0">
                                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon"><path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.5381L16.6299 14.3379C16.7073 14.1212 16.7594 13.8478 16.791 13.4619C16.8336 12.9395 16.8349 12.2706 16.8349 11.3262V8.66309C16.8349 7.71888 16.8336 7.04973 16.791 6.52731C16.7594 6.11177 16.7073 5.83848 16.6299 5.62172L16.5439 5.42152C16.32 4.98213 15.9796 4.62255 15.5615 4.39868L15.3779 4.29614C15.1308 4.17023 14.8164 4.09014 14.3018 4.04809C13.7794 4.00543 13.1112 4.00513 12.167 4.00513H8.16504L8.16406 15.995Z"></path></svg>
                                                </div>
                                        </button>
                                        {#if $showSidebar}
                                                <a href="/" class="flex flex-1 items-center px-1.5 mt-0.5" on:click={newChatHandler}>
                                                        <div
                                                                id="sidebar-webui-name"
                                                                class="text-base font-medium text-gray-850 dark:text-white font-primary"
                                                        >
                                                                {$WEBUI_NAME}
                                                        </div>
                                                </a>
                                        {/if}
                                </div>

                                <div
                                        class="{scrollTop > 0
                                                ? 'visible'
                                                : 'invisible'} sidebar-bg-gradient-to-b bg-linear-to-b from-gray-50 dark:from-gray-950 to-transparent from-50% pointer-events-none absolute inset-0 -z-10 -mb-6"
                                ></div>
                        </div>

                        <div class="px-1.5 pt-0.5 pb-1 flex flex-col gap-0 text-gray-600 dark:text-gray-400">
                                <a
                                        id="sidebar-new-chat-button"
                                        class="group flex items-center justify-center rounded-xl {$showSidebar ? 'w-full' : 'size-9'} hover:bg-gray-100 dark:hover:bg-gray-850 transition outline-none"
                                        href="/"
                                        draggable="false"
                                        on:click={newChatHandler}
                                        aria-label={$i18n.t('New Chat')}
                                >
                                        <div class="flex items-center justify-center size-9 shrink-0">
                                                <Icon name="PencilSquare" className="size-5" />
                                        </div>
                                        {#if $showSidebar}
                                                <div class="flex flex-1 items-center">
                                                        <div class="text-[15px] font-primary text-gray-800 dark:text-gray-200">{$i18n.t('New Chat')}</div>
                                                        <div class="flex-1"></div>
                                                </div>
                                        {/if}
                                </a>

                                <button
                                        id="sidebar-search-button"
                                        class="group flex items-center justify-center rounded-xl {$showSidebar ? 'w-full' : 'size-9'} hover:bg-gray-100 dark:hover:bg-gray-850 transition outline-none text-left"
                                        on:click={() => {
                                                showSearch.set(true);
                                        }}
                                        draggable="false"
                                        aria-label={$i18n.t('Search')}
                                >
                                        <div class="flex items-center justify-center size-9 shrink-0">
                                                <Icon name="Search" strokeWidth="2" className="size-5" />
                                        </div>
                                        {#if $showSidebar}
                                                <div class="flex flex-1 items-center">
                                                        <div class="text-[15px] font-primary text-gray-800 dark:text-gray-200">{$i18n.t('Search')}</div>
                                                        <div class="flex-1"></div>
                                                </div>
                                        {/if}
                                </button>

                                </div>

                        <div
                                class="relative flex flex-col flex-1 overflow-y-auto scrollbar-hidden pb-3"
                                on:scroll={(e) => {
                                        if (e.target.scrollTop === 0) {
                                                scrollTop = 0;
                                        } else {
                                                scrollTop = e.target.scrollTop;
                                        }
                                }}
                        >
                                {#if $showSidebar}
                                <div id="sidebar-chats" class="px-2 mt-0.5">
                                        {#if $pinnedChats.length > 0}
                                                <div class="mb-1">
                                                        <div class="flex flex-col space-y-1 rounded-xl">
                                                                <div
                                                                        class="ml-3 pl-1 mt-[1px] flex flex-col overflow-y-auto scrollbar-hidden border-s border-gray-100 dark:border-gray-900 text-gray-900 dark:text-gray-200"
                                                                >
                                                                        {#each $pinnedChats as chat, idx (`pinned-chat-${idx}-${chat?.id ?? 'unknown'}`)}
                                                                                <ChatItem
                                                                                        className=""
                                                                                        id={chat.id}
                                                                                        title={chat.title}
                                                                                        {shiftKey}
                                                                                        selected={selectedChatId === chat.id}
                                                                                        on:select={() => {
                                                                                                selectedChatId = chat.id;
                                                                                        }}
                                                                                        on:unselect={() => {
                                                                                                selectedChatId = null;
                                                                                        }}
                                                                                        on:change={async () => {
                                                                                                initChatList();
                                                                                        }}
                                                                                        on:tag={(e) => {
                                                                                                const { type, name } = e.detail;
                                                                                                tagEventHandler(type, name, chat.id);
                                                                                        }}
                                                                                />
                                                                        {/each}
                                                                </div>
                                                        </div>
                                                </div>
                                        {/if}
                                        <div class=" flex-1 flex flex-col overflow-y-auto scrollbar-hidden">
                                                <div class="pt-1.5">
                                                        {#if $chats}
                                                                {#each $chats as chat, idx (`chat-${idx}-${chat?.id ?? 'unknown'}`)}
                                                                        {#if idx === 0 || (idx > 0 && chat.time_range !== $chats[idx - 1].time_range)}
                                                                                <div
                                                                                        class="w-full pl-2.5 text-xs text-gray-500 dark:text-gray-500 font-medium {idx ===
                                                                                        0
                                                                                                ? ''
                                                                                                : 'pt-5'} pb-1.5"
                                                                                >
                                                                                        {$i18n.t(chat.time_range)}
                                                                                        <!-- localisation keys for time_range to be recognized from the i18next parser (so they don't get automatically removed):
                                                        {$i18n.t('Today')}
                                                        {$i18n.t('Yesterday')}
                                                        {$i18n.t('Previous 7 days')}
                                                        {$i18n.t('Previous 30 days')}
                                                        {$i18n.t('January')}
                                                        {$i18n.t('February')}
                                                        {$i18n.t('March')}
                                                        {$i18n.t('April')}
                                                        {$i18n.t('May')}
                                                        {$i18n.t('June')}
                                                        {$i18n.t('July')}
                                                        {$i18n.t('August')}
                                                        {$i18n.t('September')}
                                                        {$i18n.t('October')}
                                                        {$i18n.t('November')}
                                                        {$i18n.t('December')}
                                                        -->
                                                                                </div>
                                                                        {/if}

                                                                        <ChatItem
                                                                                className=""
                                                                                id={chat.id}
                                                                                title={chat.title}
                                                                                {shiftKey}
                                                                                selected={selectedChatId === chat.id}
                                                                                on:select={() => {
                                                                                        selectedChatId = chat.id;
                                                                                }}
                                                                                on:unselect={() => {
                                                                                        selectedChatId = null;
                                                                                }}
                                                                                on:change={async () => {
                                                                                        initChatList();
                                                                                }}
                                                                                on:tag={(e) => {
                                                                                        const { type, name } = e.detail;
                                                                                        tagEventHandler(type, name, chat.id);
                                                                                }}
                                                                        />
                                                                {/each}

                                                                {#if $scrollPaginationEnabled && !allChatsLoaded}
                                                                        <Loader
                                                                                on:visible={(e) => {
                                                                                        if (!chatListLoading) {
                                                                                                loadMoreChats();
                                                                                        }
                                                                                }}
                                                                        >
                                                                                <div
                                                                                        class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2"
                                                                                >
                                                                                        <Spinner className=" size-4" />
                                                                                        <div class=" ">{$i18n.t('Loading...')}</div>
                                                                                </div>
                                                                        </Loader>
                                                                {/if}
                                                        {:else}
                                                                <div
                                                                        class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2"
                                                                >
                                                                        <Spinner className=" size-4" />
                                                                        <div class=" ">{$i18n.t('Loading...')}</div>
                                                                </div>
                                                        {/if}
                                                </div>
                                        </div>
                                </div>
                                {/if}
                        </div>

                        <div class="px-1.5 pt-1.5 pb-2 sticky bottom-0 z-10 sidebar">
                                {#if $showSidebar}
                                        <div
                                                class="sidebar-bg-gradient-to-t bg-linear-to-t from-gray-50 dark:from-gray-950 to-transparent from-50% pointer-events-none absolute inset-0 -z-10 -mt-6"
                                        ></div>
                                {/if}
                                <div class="flex flex-col font-primary">
                                        {#if $user !== undefined && $user !== null}
                                                <UserMenu
                                                        role={$user?.role}
                                                        on:show={(e) => {
                                                                if (e.detail === 'archived-chat') {
                                                                        showArchivedChats.set(true);
                                                                }
                                                        }}
                                                >
                                                        <div
                                                                class="flex items-center rounded-2xl py-2 px-1 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition {$showSidebar ? 'w-full' : ''}"
                                                        >
                                                                <div class="self-center shrink-0">
                                                                        <Avatar name={$user?.name} size="md" />
                                                                </div>
                                                                {#if $showSidebar}
                                                                        <div class="self-center font-medium ml-3">{$user?.name}</div>
                                                                {/if}
                                                        </div>
                                                </UserMenu>
                                        {/if}
                                </div>
                        </div>
                </div>
        </div>
{/if}
