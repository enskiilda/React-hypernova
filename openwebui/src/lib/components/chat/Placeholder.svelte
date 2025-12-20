<script lang="ts">
        import { toast } from 'svelte-sonner';
        import { marked } from 'marked';

        import { onMount, getContext, tick, createEventDispatcher } from 'svelte';
        import { blur, fade } from 'svelte/transition';

        const dispatch = createEventDispatcher();

        import {
                config,
                user,
                models as _models,
                temporaryChatEnabled,
                mobile
        } from '$lib/stores';
        import { sanitizeResponseContent, extractCurlyBraceWords } from '$lib/utils';
        import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';

        import Suggestions from './Suggestions.svelte';
        import Icon from '$lib/components/icons/Icon.svelte';
        import MessageInput from './MessageInput.svelte';

        const i18n = getContext('i18n');

        export let createMessagePair: Function;
        export let stopResponse: Function;

        export let autoScroll = false;

        export let atSelectedModel: Model | undefined;
        export let selectedModels: [''];

        export let history;

        export let prompt = '';
        export let files = [];
        export let messageInput = null;

        export let selectedToolIds = [];
        export let selectedFilterIds = [];

        export let showCommands = false;

        export let imageGenerationEnabled = false;
        export let codeInterpreterEnabled = false;
        export let webSearchEnabled = false;

        export let onSelect = (e) => {};
        export let onChange = (e) => {};

        export let toolServers = [];

        let models = [];
        let selectedModelIdx = 0;

        $: if (selectedModels.length > 0) {
                selectedModelIdx = models.length - 1;
        }

        $: models = selectedModels.map((id) => $_models.find((m) => m.id === id));
</script>

{#if $mobile}
        <div class="flex flex-col h-full w-full">
                <div class="flex-1 flex flex-col justify-center overflow-auto px-2 text-center">
                        {#if $temporaryChatEnabled}
                                
                                        <div class="flex items-center justify-center gap-2 text-gray-500 text-base my-2 w-fit mx-auto">
                                                {$i18n.t('Temporary Chat')}
                                        </div>
                                
                        {/if}

                        <div class="w-full text-3xl text-gray-800 dark:text-gray-100 text-center flex items-center gap-4 font-primary">
                                <div class="w-full flex flex-col justify-center items-center">
                                        <div class="flex flex-row justify-center gap-3 w-fit px-5 max-w-xl">
                                                <div class="text-3xl line-clamp-1 flex items-center" in:fade={{ duration: 100 }}>
                                                        {#if models[selectedModelIdx]?.name}
                                                                
                                                                        <span class="line-clamp-1">{models[selectedModelIdx]?.name}</span>
                                                                
                                                        {:else}
                                                                {$i18n.t('Hello, {{name}}', { name: $user?.name })}
                                                        {/if}
                                                </div>
                                        </div>

                                        <div class="flex mt-1 mb-2">
                                                <div in:fade={{ duration: 100, delay: 50 }}>
                                                        {#if models[selectedModelIdx]?.info?.meta?.description ?? null}
                                                                '))}
                                                                        placement="top"
                                                                >
                                                                        <div class="mt-0.5 px-2 text-sm font-normal text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xl markdown">
                                                                                {@html marked.parse(sanitizeResponseContent(models[selectedModelIdx]?.info?.meta?.description ?? '').replaceAll('\n', '<br>'))}
                                                                        </div>
                                                                
                                                        {/if}
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div class="mx-auto max-w-2xl font-primary mt-4" in:fade={{ duration: 200, delay: 200 }}>
                                <div class="mx-4 md:mx-5 lg:mx-6">
                                        <Suggestions
                                                suggestionPrompts={atSelectedModel?.info?.meta?.suggestion_prompts ??
                                                        models[selectedModelIdx]?.info?.meta?.suggestion_prompts ??
                                                        $config?.default_prompt_suggestions ??
                                                        []}
                                                inputValue={prompt}
                                                {onSelect}
                                        />
                                </div>
                        </div>
                </div>

                <div class="flex-shrink-0 w-full px-2 pb-2 pt-2 bg-white dark:bg-gray-900">
                        <div class="text-base font-normal w-full">
                                <MessageInput
                                        bind:this={messageInput}
                                        {history}
                                        {selectedModels}
                                        bind:files
                                        bind:prompt
                                        bind:autoScroll
                                        bind:selectedToolIds
                                        bind:selectedFilterIds
                                        bind:imageGenerationEnabled
                                        bind:codeInterpreterEnabled
                                        bind:webSearchEnabled
                                        bind:atSelectedModel
                                        bind:showCommands
                                        {toolServers}
                                        {stopResponse}
                                        {createMessagePair}
                                        placeholder={$i18n.t('How can I help you today?')}
                                        {onChange}
                                        on:upload={(e) => {
                                                dispatch('upload', e.detail);
                                        }}
                                        on:submit={(e) => {
                                                dispatch('submit', e.detail);
                                        }}
                                />
                        </div>
                </div>
        </div>
{:else}
        <div class="m-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-20 text-center">
                {#if $temporaryChatEnabled}
                        
                                <div class="flex items-center gap-2 text-gray-500 text-base my-2 w-fit">
                                        {$i18n.t('Temporary Chat')}
                                </div>
                        
                {/if}

                <div
                        class="w-full text-3xl text-gray-800 dark:text-gray-100 text-center flex items-center gap-4 font-primary"
                >
                        <div class="w-full flex flex-col justify-center items-center">
                                <div class="flex flex-row justify-center gap-3 @sm:gap-3.5 w-fit px-5 max-w-xl">
                                        <div
                                                class=" text-3xl @sm:text-3xl line-clamp-1 flex items-center"
                                                in:fade={{ duration: 100 }}
                                        >
                                                {#if models[selectedModelIdx]?.name}
                                                        
                                                                <span class="line-clamp-1">
                                                                        {models[selectedModelIdx]?.name}
                                                                </span>
                                                        
                                                {:else}
                                                        {$i18n.t('Hello, {{name}}', { name: $user?.name })}
                                                {/if}
                                        </div>
                                </div>

                                <div class="flex mt-1 mb-2">
                                        <div in:fade={{ duration: 100, delay: 50 }}>
                                                {#if models[selectedModelIdx]?.info?.meta?.description ?? null}
                                                        ')
                                                                )}
                                                                placement="top"
                                                        >
                                                                <div
                                                                        class="mt-0.5 px-2 text-sm font-normal text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xl markdown"
                                                                >
                                                                        {@html marked.parse(
                                                                                sanitizeResponseContent(
                                                                                        models[selectedModelIdx]?.info?.meta?.description ?? ''
                                                                                ).replaceAll('\n', '<br>')
                                                                        )}
                                                                </div>
                                                        

                                                        {#if models[selectedModelIdx]?.info?.meta?.user}
                                                                <div class="mt-0.5 text-sm font-normal text-gray-400 dark:text-gray-500">
                                                                        By
                                                                        {#if models[selectedModelIdx]?.info?.meta?.user.community}
                                                                                <a
                                                                                        href="https://openwebui.com/m/{models[selectedModelIdx]?.info?.meta?.user
                                                                                                .username}"
                                                                                        >{models[selectedModelIdx]?.info?.meta?.user.name
                                                                                                ? models[selectedModelIdx]?.info?.meta?.user.name
                                                                                                : `@${models[selectedModelIdx]?.info?.meta?.user.username}`}</a
                                                                                >
                                                                        {:else}
                                                                                {models[selectedModelIdx]?.info?.meta?.user.name}
                                                                        {/if}
                                                                </div>
                                                        {/if}
                                                {/if}
                                        </div>
                                </div>

                                <div class="text-base font-normal @md:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl w-full py-3 {atSelectedModel ? 'mt-2' : ''}">
                                        <MessageInput
                                                bind:this={messageInput}
                                                {history}
                                                {selectedModels}
                                                bind:files
                                                bind:prompt
                                                bind:autoScroll
                                                bind:selectedToolIds
                                                bind:selectedFilterIds
                                                bind:imageGenerationEnabled
                                                bind:codeInterpreterEnabled
                                                bind:webSearchEnabled
                                                bind:atSelectedModel
                                                bind:showCommands
                                                {toolServers}
                                                {stopResponse}
                                                {createMessagePair}
                                                placeholder={$i18n.t('How can I help you today?')}
                                                {onChange}
                                                on:upload={(e) => {
                                                        dispatch('upload', e.detail);
                                                }}
                                                on:submit={(e) => {
                                                        dispatch('submit', e.detail);
                                                }}
                                        />
                                </div>
                        </div>
                </div>

                <div class="mx-auto max-w-2xl xl:max-w-3xl 2xl:max-w-4xl font-primary mt-2" in:fade={{ duration: 200, delay: 200 }}>
                        <div class="mx-4 md:mx-5 lg:mx-6">
                                <Suggestions
                                        suggestionPrompts={atSelectedModel?.info?.meta?.suggestion_prompts ??
                                                models[selectedModelIdx]?.info?.meta?.suggestion_prompts ??
                                                $config?.default_prompt_suggestions ??
                                                []}
                                        inputValue={prompt}
                                        {onSelect}
                                />
                        </div>
                </div>
        </div>
{/if}
