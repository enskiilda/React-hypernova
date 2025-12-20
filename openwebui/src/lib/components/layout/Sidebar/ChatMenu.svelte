<script lang="ts">
        import { DropdownMenu } from 'bits-ui';
        import { flyAndScale } from '$lib/utils/transitions';
        import { getContext, createEventDispatcher, tick } from 'svelte';


        const dispatch = createEventDispatcher();

        import Dropdown from '$lib/components/common/Dropdown.svelte';
        import Icon from '$lib/components/icons/Icon.svelte';
        import { SquarePen } from 'lucide-svelte';
        import { chats, folders, settings, theme, user } from '$lib/stores';
        import { createMessagesList } from '$lib/utils';
        import Messages from '$lib/components/chat/Messages.svelte';

        const i18n = getContext('i18n');

        export let shareHandler: Function;
        export let moveChatHandler: Function;

        export let cloneChatHandler: Function;
        export let archiveChatHandler: Function;
        export let renameHandler: Function;
        export let deleteHandler: Function;
        export let onClose: Function;

        export let chatId = '';

        let show = false;
        let pinned = false;

        let chat = null;
        let showFullMessages = false;

        const pinHandler = async () => {
                null;
                dispatch('change');
        };

        const checkPinned = async () => {
                pinned = false;
        };

        const getChatAsText = async (chat) => {
                const history = chat.chat.history;
                const messages = createMessagesList(history, history.currentId);
                const chatText = messages.reduce((a, message, i, arr) => {
                        return `${a}### ${message.role.toUpperCase()}\n${message.content}\n\n`;
                }, '');

                return chatText.trim();
        };

        const downloadTxt = async () => {
                const chat = null;
                if (!chat) {
                        return;
                }

                const chatText = await getChatAsText(chat);
                let blob = new Blob([chatText], {
                        type: 'text/plain'
                });

                { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `chat-${chat.chat.title}.txt`; a.click(); URL.revokeObjectURL(url); };
        };

        const downloadJSONExport = async () => {
                const chat = null;

                if (chat) {
                        let blob = new Blob([JSON.stringify([chat])], {
                                type: 'application/json'
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `chat-export-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                }
        };

        $: if (show) {
                checkPinned();
        }
</script>

{#if chat && showFullMessages}
        <div class="hidden w-full h-full flex-col">
                <div id="full-messages-container">
                        <Messages
                                className="h-full flex pt-4 pb-8 w-full"
                                chatId={`chat-preview-${chat?.id ?? ''}`}
                                user={$user}
                                readOnly={true}
                                history={chat.chat.history}
                                messages={chat.chat.messages}
                                autoScroll={true}
                                sendMessage={() => {}}
                                continueResponse={() => {}}
                                regenerateResponse={() => {}}
                                messagesCount={null}
                                editCodeBlock={false}
                        />
                </div>
        </div>
{/if}

<Dropdown
        bind:show
        on:change={(e) => {
                if (e.detail === false) {
                        onClose();
                }
        }}
>
        
                <slot />
        

        <div slot="content">
                <DropdownMenu.Content
                        class="w-full max-w-[200px] rounded-2xl px-1 py-1  border border-gray-100  dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg transition"
                        sideOffset={-2}
                        side="bottom"
                        align="start"
                        transition={flyAndScale}
                >
                        {#if $user?.role === 'admin' || ($user.permissions?.chat?.share ?? true)}
                                <DropdownMenu.Item
                                        class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800  rounded-xl"
                                        on:click={() => {
                                                shareHandler();
                                        }}
                                >
                                        <Icon name="Share" strokeWidth="1.5" />
                                        <div class="flex items-center">{$i18n.t('Share')}</div>
                                </DropdownMenu.Item>
                        {/if}

                        <DropdownMenu.Sub>
                                <DropdownMenu.SubTrigger
                                        class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                >
                                        

                                        <div class="flex items-center">{$i18n.t('Download')}</div>
                                </DropdownMenu.SubTrigger>
                                <DropdownMenu.SubContent
                                        class="w-full rounded-2xl p-1 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg border border-gray-100  dark:border-gray-800"
                                        transition={flyAndScale}
                                        sideOffset={8}
                                >
                                        {#if $user?.role === 'admin' || ($user.permissions?.chat?.export ?? true)}
                                                <DropdownMenu.Item
                                                        class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                                        on:click={() => {
                                                                downloadJSONExport();
                                                        }}
                                                >
                                                        <div class="flex items-center line-clamp-1">{$i18n.t('Export chat (.json)')}</div>
                                                </DropdownMenu.Item>
                                        {/if}

                                        <DropdownMenu.Item
                                                class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                                on:click={() => {
                                                        downloadTxt();
                                                }}
                                        >
                                                <div class="flex items-center line-clamp-1">{$i18n.t('Plain text (.txt)')}</div>
                                        </DropdownMenu.Item>

                        </DropdownMenu.SubContent>
                                        </DropdownMenu.Sub>

                        <DropdownMenu.Item
                                class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                on:click={() => {
                                        renameHandler();
                                }}
                        >
                                <SquarePen class="size-4" />
                                <div class="flex items-center">{$i18n.t('Rename')}</div>
                        </DropdownMenu.Item>

                        <hr class="border-gray-50 dark:border-gray-800 my-1" />

                        <DropdownMenu.Item
                                class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                on:click={() => {
                                        pinHandler();
                                }}
                        >
                                {#if pinned}
                                        
                                        <div class="flex items-center">{$i18n.t('Unpin')}</div>
                                {:else}
                                        
                                        <div class="flex items-center">{$i18n.t('Pin')}</div>
                                {/if}
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                                class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                on:click={() => {
                                        cloneChatHandler();
                                }}
                        >
                                <Icon name="DocumentDuplicate" strokeWidth="1.5" />
                                <div class="flex items-center">{$i18n.t('Clone')}</div>
                        </DropdownMenu.Item>

                        {#if chatId && $folders.length > 0}
                                <DropdownMenu.Sub>
                                        <DropdownMenu.SubTrigger
                                                class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl select-none w-full"
                                        >
                                                

                                                <div class="flex items-center">{$i18n.t('Move')}</div>
                                        </DropdownMenu.SubTrigger>
                                        <DropdownMenu.SubContent
                                                class="w-full rounded-2xl p-1 z-50 bg-white dark:bg-gray-850 dark:text-white border border-gray-100  dark:border-gray-800 shadow-lg max-h-52 overflow-y-auto scrollbar-hidden"
                                                transition={flyAndScale}
                                                sideOffset={8}
                                        >
                                                {#each $folders.sort((a, b) => b.updated_at - a.updated_at) as folder}
                                                        <DropdownMenu.Item
                                                                class="flex gap-2 items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                                                on:click={() => {
                                                                        moveChatHandler(chatId, folder.id);
                                                                }}
                                                        >
                                                                

                                                                <div class="flex items-center">{folder?.name ?? 'Folder'}</div>
                                                        </DropdownMenu.Item>
                                                {/each}
                                        </DropdownMenu.SubContent>
</DropdownMenu.Sub>
                        {/if}

                        <DropdownMenu.Item
                                class="flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                on:click={() => {
                                        archiveChatHandler();
                                }}
                        >
                                <Icon name="ArchiveBox" strokeWidth="1.5" />
                                <div class="flex items-center">{$i18n.t('Archive')}</div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                                class="flex  gap-2  items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
                                on:click={() => {
                                        deleteHandler();
                                }}
                        >
                                <Icon name="GarbageBin" strokeWidth="1.5" />
                                <div class="flex items-center">{$i18n.t('Delete')}</div>
                        </DropdownMenu.Item>
                </DropdownMenu.Content>
        </div>
</Dropdown>
