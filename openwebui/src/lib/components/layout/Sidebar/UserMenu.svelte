<script lang="ts">
        import { DropdownMenu } from 'bits-ui';
        import { createEventDispatcher, getContext, onMount, tick } from 'svelte';

        import { flyAndScale } from '$lib/utils/transitions';
        import { goto } from '$app/navigation';
        import { fade, slide } from 'svelte/transition';


        import { showSettings, mobile, showSidebar, user } from '$lib/stores';

        import Icon from '$lib/components/icons/Icon.svelte';

        const i18n = getContext('i18n');

        export let show = false;
        export let help = false;
        export let className = 'max-w-[240px]';

        const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<DropdownMenu.Root
        bind:open={show}
        onOpenChange={(state) => {
                dispatch('change', state);
        }}
>
        <DropdownMenu.Trigger>
                <slot />
        </DropdownMenu.Trigger>

        <slot name="content">
                <DropdownMenu.Content
                        class="w-full {className}  rounded-2xl px-1 py-1  border border-gray-100  dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg text-sm"
                        sideOffset={4}
                        side="top"
                        align="end"
                        transition={(e) => fade(e, { duration: 100 })}
                >
                        <DropdownMenu.Item
                                class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                on:click={async () => {
                                        show = false;

                                        await showSettings.set(true);

                                        if ($mobile) {
                                                await tick();
                                                showSidebar.set(false);
                                        }
                                }}
                        >
                                <div class=" self-center mr-3">
                                        <Icon name="Settings" className="w-5 h-5" strokeWidth="1.5" />
                                </div>
                                <div class=" self-center truncate">{$i18n.t('Settings')}</div>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                                class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                on:click={async () => {
                                        show = false;

                                        dispatch('show', 'archived-chat');

                                        if ($mobile) {
                                                await tick();

                                                showSidebar.set(false);
                                        }
                                }}
                        >
                                <div class=" self-center mr-3">
                                        <Icon name="ArchiveBox" className="size-5" strokeWidth="1.5" />
                                </div>
                                <div class=" self-center truncate">{$i18n.t('Archived Chats')}</div>
                        </DropdownMenu.Item>


                        {#if help}
                                <hr class=" border-gray-50 dark:border-gray-800 my-1 p-0" />

                                <!-- {$i18n.t('Help')} -->

                                {#if $user?.role === 'admin'}
                                        <DropdownMenu.Item
                                                as="a"
                                                target="_blank"
                                                class="flex gap-3 items-center py-1.5 px-3 text-sm select-none w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                                                id="chat-share-button"
                                                on:click={() => {
                                                        show = false;
                                                }}
                                                href="https://docs.openwebui.com"
                                        >
                                                
                                                <div class="flex items-center">{$i18n.t('Documentation')}</div>
                                        </DropdownMenu.Item>

                                        <!-- Releases -->
                                        <DropdownMenu.Item
                                                as="a"
                                                target="_blank"
                                                class="flex gap-3 items-center py-1.5 px-3 text-sm select-none w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                                                id="chat-share-button"
                                                on:click={() => {
                                                        show = false;
                                                }}
                                                href="https://github.com/open-webui/open-webui/releases"
                                        >
                                                
                                                <div class="flex items-center">{$i18n.t('Releases')}</div>
                                        </DropdownMenu.Item>
                                {/if}

                        {/if}

                        <hr class=" border-gray-50 dark:border-gray-800 my-1 p-0" />

                        <DropdownMenu.Item
                                class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                on:click={async () => {
                                        user.set(null);
                                        location.href = '/';
                                        show = false;
                                }}
                        >
                                <div class=" self-center mr-3">
                                        <Icon name="SignOut" className="w-5 h-5" strokeWidth="1.5" />
                                </div>
                                <div class=" self-center truncate">{$i18n.t('Sign Out')}</div>
                        </DropdownMenu.Item>


                        <!-- <DropdownMenu.Item class="flex items-center py-1.5 px-3 text-sm ">
                                <div class="flex items-center">Profile</div>
                        </DropdownMenu.Item> -->
                </DropdownMenu.Content>
        </slot>
</DropdownMenu.Root>
