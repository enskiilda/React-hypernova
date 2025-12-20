<script lang="ts">
        import { getContext } from 'svelte';
        import { toast } from 'svelte-sonner';

        import {
                WEBUI_NAME,
                chatId,
                config,
                mobile,
                settings,
                showArchivedChats,
                showControls,
                showSidebar,
                temporaryChatEnabled,
                user
        } from '$lib/stores';

        import { slide } from 'svelte/transition';
        import { page } from '$app/stores';
        import { goto } from '$app/navigation';

        import ModelSelector from '../chat/ModelSelector.svelte';
        import Menu from '$lib/components/layout/Navbar/Menu.svelte';
        import UserMenu from '$lib/components/layout/Sidebar/UserMenu.svelte';
        import Icon from '../icons/Icon.svelte';
        import { WEBUI_API_BASE_URL } from '$lib/constants';

        const i18n = getContext('i18n');

        export let initNewChat: Function;
        export let shareEnabled: boolean = false;

        export let chat;
        export let selectedModels;
        export let showModelSelector = true;

        export let onSaveTempChat: () => {};
        export let archiveChatHandler: (id: string) => void;
        export let moveChatHandler: (id: string, folderId: string) => void;

        let showDownloadChatModal = false;
</script>

<button
        id="new-chat-button"
        class="hidden"
        on:click={() => {
                initNewChat();
        }}
        aria-label="New Chat"
/>

<nav
        class="sticky top-0.5 z-30 w-full {chat?.id
                ? 'pb-1'
                : 'pb-1'} -mb-12 flex flex-col items-center drag-region"
>
        <div class="flex items-center w-full pl-1.5 pr-1 pt-1 bg-white dark:bg-gray-900">
                <div
                        id="navbar-bg-gradient-to-b"
                        class="{chat?.id
                                ? 'invisible'
                                : 'invisible'} pointer-events-none absolute inset-0 -bottom-10 z-[-1]"
                ></div>

                <div class=" flex max-w-full w-full mx-auto px-1.5 md:px-2 pt-0.5 bg-transparent">
                        <div class="flex items-center w-full max-w-full">
                                {#if $mobile && !$showSidebar}
                                        <div
                                                class="-translate-x-0.5 mr-1 flex flex-none items-center text-gray-600 dark:text-gray-400"
                                        >
                                                
                                                        <button
                                                                class=" cursor-pointer flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition px-1 py-1.5"
                                                                on:click={() => {
                                                                        showSidebar.set(!$showSidebar);
                                                                }}
                                                        >
                                                                <div class="flex items-center justify-center shrink-0 ">
                                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon"><path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.5381L16.6299 14.3379C16.7073 14.1212 16.7594 13.8478 16.791 13.4619C16.8336 12.9395 16.8349 12.2706 16.8349 11.3262V8.66309C16.8349 7.71888 16.8336 7.04973 16.791 6.52731C16.7594 6.11177 16.7073 5.83848 16.6299 5.62172L16.5439 5.42152C16.32 4.98213 15.9796 4.62255 15.5615 4.39868L15.3779 4.29614C15.1308 4.17023 14.8164 4.09014 14.3018 4.04809C13.7794 4.00543 13.1112 4.00513 12.167 4.00513H8.16504L8.16406 15.995Z"></path></svg>
                                                                </div>
                                                        </button>
                                                
                                        </div>
                                {/if}

                                <div
                                        class="flex-1 overflow-hidden max-w-full self-center
                        {$showSidebar ? 'ml-1' : ''}
                        "
                                >
                                        {#if showModelSelector}
                                                <ModelSelector bind:selectedModels showSetDefault={!shareEnabled} />
                                        {/if}
                                </div>

                                <div class="self-start flex flex-none items-center text-gray-600 dark:text-gray-400">
                                        <!-- <div class="md:hidden flex self-center w-[1px] h-5 mx-2 bg-gray-300 dark:bg-stone-700" /> -->

                                        {#if $user?.role === 'user' ? ($user?.permissions?.chat?.temporary ?? true) && !($user?.permissions?.chat?.temporary_enforced ?? false) : true}
                                                {#if !chat?.id}
                                                        
                                                                <button
                                                                        class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                                                                        id="temporary-chat-button"
                                                                        on:click={async () => {
                                                                                if (($settings?.temporaryChatByDefault ?? false) && $temporaryChatEnabled) {
                                                                                        // for proper initNewChat handling
                                                                                        await temporaryChatEnabled.set(null);
                                                                                } else {
                                                                                        await temporaryChatEnabled.set(!$temporaryChatEnabled);
                                                                                }

                                                                                await goto('/');

                                                                                // add 'temporary-chat=true' to the URL
                                                                                if ($temporaryChatEnabled) {
                                                                                        window.history.replaceState(null, '', '?temporary-chat=true');
                                                                                } else {
                                                                                        window.history.replaceState(null, '', location.pathname);
                                                                                }
                                                                        }}
                                                                >
                                                                        <div class=" m-auto self-center">
                                                                                {#if $temporaryChatEnabled}
                                                                                        <Icon name="ChatBubbleDottedChecked" className=" size-4.5" strokeWidth="1.5" />
                                                                                {:else}
                                                                                        <Icon name="ChatBubbleDotted" className=" size-4.5" strokeWidth="1.5" />
                                                                                {/if}
                                                                        </div>
                                                                </button>
                                                        
                                                {:else if $temporaryChatEnabled}
                                                        
                                                                <button
                                                                        class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                                                                        id="save-temporary-chat-button"
                                                                        on:click={async () => {
                                                                                onSaveTempChat();
                                                                        }}
                                                                >
                                                                        <div class=" m-auto self-center">
                                                                                <Icon name="ChatCheck" className=" size-4.5" strokeWidth="1.5" />
                                                                        </div>
                                                                </button>
                                                        
                                                {/if}
                                        {/if}

                                        {#if $mobile && !$temporaryChatEnabled && chat && chat.id}
                                                
                                                        <button
                                                                class=" flex {$showSidebar
                                                                        ? 'md:hidden'
                                                                        : ''} cursor-pointer px-2 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                                                                on:click={() => {
                                                                        initNewChat();
                                                                }}
                                                                aria-label="New Chat"
                                                        >
                                                                <div class=" m-auto self-center">
                                                                        <Icon name="ChatPlus" className=" size-4.5" strokeWidth="1.5" />
                                                                </div>
                                                        </button>
                                                
                                        {/if}

                                        {#if shareEnabled && chat && (chat.id || $temporaryChatEnabled)}
                                                <Menu
                                                        {chat}
                                                        {shareEnabled}
                                                        shareHandler={() => {
                                                                showShareChatModal = !showShareChatModal;
                                                        }}
                                                        archiveChatHandler={() => {
                                                                archiveChatHandler(chat.id);
                                                        }}
                                                        {moveChatHandler}
                                                >
                                                        <button
                                                                class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                                                                id="chat-context-menu-button"
                                                        >
                                                                <div class=" m-auto self-center">
                                                                        <Icon name="EllipsisHorizontal" className=" size-5" strokeWidth="1.5" />
                                                                </div>
                                                        </button>
                                                </Menu>
                                        {/if}

                                        {#if $user?.role === 'admin' || ($user?.permissions.chat?.controls ?? true)}
                                                
                                                        <button
                                                                class=" flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                                                                on:click={async () => {
                                                                        await showControls.set(!$showControls);
                                                                }}
                                                                aria-label="Controls"
                                                        >
                                                                <div class=" m-auto self-center">
                                                                        
                                                                </div>
                                                        </button>
                                                
                                        {/if}

                                        {#if $user !== undefined && $user !== null}
                                                <UserMenu
                                                        className="max-w-[240px]"
                                                        role={$user?.role}
                                                        help={true}
                                                        on:show={(e) => {
                                                                if (e.detail === 'archived-chat') {
                                                                        showArchivedChats.set(true);
                                                                }
                                                        }}
                                                >
                                                        <div
                                                                class="select-none flex rounded-xl p-1.5 w-full hover:bg-gray-50 dark:hover:bg-gray-850 transition"
                                                        >
                                                                <div class=" self-center">
                                                                        <span class="sr-only">{$i18n.t('User menu')}</span>
                                                                        <Icon name="UserGroup" className="w-5 h-5" strokeWidth="1.5" />
                                                        </div>
                                                        </div>
                                                </UserMenu>
                                        {/if}
                                </div>
                        </div>
                </div>
        </div>

        <div class="w-full h-4 bg-transparent pointer-events-none"></div>

        {#if $temporaryChatEnabled && ($chatId ?? '').startsWith('local:')}
                <div class=" w-full z-30 text-center">
                        <div class="text-xs text-gray-500">{$i18n.t('Temporary Chat')}</div>
                </div>
        {/if}

</nav>
