<script lang="ts">
        import { toast } from 'svelte-sonner';

        import { tick, getContext, onMount, createEventDispatcher } from 'svelte';
        const dispatch = createEventDispatcher();
        const i18n = getContext('i18n');

        import { settings } from '$lib/stores';
        import { copyToClipboard } from '$lib/utils';

        import ResponseMessage from './ResponseMessage.svelte';

        export let chatId;
        export let selectedModels = [];

        export let history;
        export let messageId;

        export let setInputText: Function = () => {};
        export let gotoMessage;
        export let showPreviousMessage;
        export let showNextMessage;
        export let updateChat;

        export let editMessage;
        export let saveMessage;
        export let deleteMessage;
        export let rateMessage;
        export let actionMessage;
        export let submitMessage;

        export let regenerateResponse;
        export let continueResponse;

        export let addMessages;
        export let readOnly = false;
        export let editCodeBlock = true;
        export let topPadding = false;
</script>

<div
        role="listitem"
        class="flex flex-col justify-between px-4 md:px-5 lg:px-6 mb-3 w-full {($settings?.widescreenMode ?? null)
                ? 'max-w-full'
                : 'max-w-5xl xl:max-w-6xl 2xl:max-w-7xl'} mx-auto rounded-lg group"
>
        {#if history.messages[messageId]}
                {#if history.messages[messageId].role === 'user'}
                        <div class="flex w-full justify-end">
                                <div class="max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%] 2xl:max-w-[65%] rounded-2xl px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800">
                                        <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm sm:text-base">{history.messages[messageId].content}</p>
                                </div>
                        </div>
                {:else}
                        <ResponseMessage
                                {chatId}
                                {history}
                                {messageId}
                                {selectedModels}
                                isLastMessage={messageId === history.currentId}
                                siblings={history.messages[history.messages[messageId].parentId]?.childrenIds ?? []}
                                {setInputText}
                                {gotoMessage}
                                {showPreviousMessage}
                                {showNextMessage}
                                {updateChat}
                                {editMessage}
                                {saveMessage}
                                {rateMessage}
                                {actionMessage}
                                {submitMessage}
                                {deleteMessage}
                                {continueResponse}
                                {regenerateResponse}
                                {addMessages}
                                {readOnly}
                                {editCodeBlock}
                                {topPadding}
                        />
                {/if}
        {/if}
</div>
