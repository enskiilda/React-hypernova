<script lang="ts">
        import { marked } from 'marked';

        import { toast } from 'svelte-sonner';

        import { v4 as uuidv4 } from 'uuid';

        import { onMount, tick, getContext, createEventDispatcher, onDestroy } from 'svelte';
        const dispatch = createEventDispatcher();

        import {
                type Model,
                mobile,
                settings,
                models,
                config,
                tools,
                toolServers,
                user as _user,
                showControls,
                temporaryChatEnabled
        } from '$lib/stores';

        import {
                convertHeicToJpeg,
                compressImage,
                createMessagesList,
                extractContentFromFile,
                extractCurlyBraceWords,
                getAge,
                getCurrentDateTime,
                getFormattedDate,
                getFormattedTime,
                getUserPosition,
                getUserTimezone,
                getWeekday
        } from '$lib/utils';

        import { WEBUI_BASE_URL, WEBUI_API_BASE_URL, PASTED_TEXT_CHARACTER_LIMIT } from '$lib/constants';

        import RichTextInput from '../common/RichTextInput.svelte';
        import FileItem from '../common/FileItem.svelte';
        import Image from '../common/Image.svelte';

        import Icon from '../icons/Icon.svelte';
        import { ArrowUp, Square } from 'lucide-svelte';

        const i18n = getContext('i18n');

        export let onChange: Function = () => {};
        export let createMessagePair: Function;
        export let stopResponse: Function;

        export let autoScroll = false;
        export let generating = false;

        export let atSelectedModel: Model | undefined = undefined;
        export let selectedModels: [''];

        let selectedModelIds = [];
        $: selectedModelIds = atSelectedModel !== undefined ? [atSelectedModel.id] : selectedModels;

        export let history;

        export let prompt = '';
        export let files = [];

        export let selectedToolIds = [];
        export let selectedFilterIds = [];

        export let imageGenerationEnabled = false;
        export let webSearchEnabled = false;
        export let codeInterpreterEnabled = false;

        $: onChange({
                prompt,
                files: files
                        .filter((file) => file.type !== 'image')
                        .map((file) => {
                                return {
                                        ...file,
                                        user: undefined,
                                        access_control: undefined
                                };
                        }),
                selectedToolIds,
                selectedFilterIds,
                imageGenerationEnabled,
                webSearchEnabled,
                codeInterpreterEnabled
        });

        const inputVariableHandler = async (text: string): Promise<string> => {
                return text;
        };

        const textVariableHandler = async (text: string) => {
                if (text.includes('{{CLIPBOARD}}')) {
                        const clipboardText = await navigator.clipboard.readText().catch((err) => {
                                toast.error($i18n.t('Failed to read clipboard contents'));
                                return '{{CLIPBOARD}}';
                        });

                        const clipboardItems = await navigator.clipboard.read().catch((err) => {
                                console.error('Failed to read clipboard items:', err);
                                return [];
                        });

                        for (const item of clipboardItems) {
                                for (const type of item.types) {
                                        if (type.startsWith('image/')) {
                                                const blob = await item.getType(type);
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                        files = [
                                                                ...files,
                                                                {
                                                                        type: 'image',
                                                                        url: event.target.result as string
                                                                }
                                                        ];
                                                };
                                                reader.readAsDataURL(blob);
                                        }
                                }
                        }

                        text = text.replaceAll('{{CLIPBOARD}}', clipboardText);
                }

                if (text.includes('{{USER_LOCATION}}')) {
                        let location;
                        try {
                                location = await getUserPosition();
                        } catch (error) {
                                toast.error($i18n.t('Location access not allowed'));
                                location = 'LOCATION_UNKNOWN';
                        }
                        text = text.replaceAll('{{USER_LOCATION}}', String(location));
                }

                const sessionUser = $_user;

                if (text.includes('{{USER_NAME}}')) {
                        const name = sessionUser?.name || 'User';
                        text = text.replaceAll('{{USER_NAME}}', name);
                }

                if (text.includes('{{USER_BIO}}')) {
                        const bio = '';
                        if (bio) {
                                text = text.replaceAll('{{USER_BIO}}', bio);
                        }
                }

                if (text.includes('{{USER_GENDER}}')) {
                        const gender = '';
                        if (gender) {
                                text = text.replaceAll('{{USER_GENDER}}', gender);
                        }
                }

                if (text.includes('{{USER_BIRTH_DATE}}')) {
                        const birthDate = '';
                        if (birthDate) {
                                text = text.replaceAll('{{USER_BIRTH_DATE}}', birthDate);
                        }
                }

                if (text.includes('{{USER_AGE}}')) {
                        const birthDate = '';
                        if (birthDate) {
                                const age = getAge(birthDate);
                                text = text.replaceAll('{{USER_AGE}}', age);
                        }
                }

                if (text.includes('{{USER_LANGUAGE}}')) {
                        const language = 'pl-PL';
                        text = text.replaceAll('{{USER_LANGUAGE}}', language);
                }

                if (text.includes('{{CURRENT_DATE}}')) {
                        const date = getFormattedDate();
                        text = text.replaceAll('{{CURRENT_DATE}}', date);
                }

                if (text.includes('{{CURRENT_TIME}}')) {
                        const time = getFormattedTime();
                        text = text.replaceAll('{{CURRENT_TIME}}', time);
                }

                if (text.includes('{{CURRENT_DATETIME}}')) {
                        const dateTime = getCurrentDateTime();
                        text = text.replaceAll('{{CURRENT_DATETIME}}', dateTime);
                }

                if (text.includes('{{CURRENT_TIMEZONE}}')) {
                        const timezone = getUserTimezone();
                        text = text.replaceAll('{{CURRENT_TIMEZONE}}', timezone);
                }

                if (text.includes('{{CURRENT_WEEKDAY}}')) {
                        const weekday = getWeekday();
                        text = text.replaceAll('{{CURRENT_WEEKDAY}}', weekday);
                }

                return text;
        };

        const replaceVariables = (variables: Record<string, any>) => {
                const chatInput = document.getElementById('chat-input');

                if (chatInput) {
                        chatInputElement.replaceVariables(variables);
                        chatInputElement.focus();
                }
        };

        export const setText = async (text?: string, cb?: (text: string) => void) => {
                const chatInput = document.getElementById('chat-input');

                if (chatInput) {
                        if (text !== '') {
                                text = await textVariableHandler(text || '');
                        }

                        chatInputElement?.setText(text);
                        chatInputElement?.focus();

                        if (text !== '') {
                                text = await inputVariableHandler(text);
                        }

                        await tick();
                        if (cb) await cb(text);
                }
        };

        const getCommand = () => {
                const chatInput = document.getElementById('chat-input');
                let word = '';

                if (chatInput) {
                        word = chatInputElement?.getWordAtDocPos();
                }

                return word;
        };

        const replaceCommandWithText = (text) => {
                const chatInput = document.getElementById('chat-input');
                if (!chatInput) return;

                chatInputElement?.replaceCommandWithText(text);
        };

        const insertTextAtCursor = async (text: string) => {
                const chatInput = document.getElementById('chat-input');
                if (!chatInput) return;

                text = await textVariableHandler(text);

                if (command) {
                        replaceCommandWithText(text);
                } else {
                        chatInputElement?.insertContent(text);
                }

                await tick();
                text = await inputVariableHandler(text);
                await tick();

                const chatInputContainer = document.getElementById('chat-input-container');
                if (chatInputContainer) {
                        chatInputContainer.scrollTop = chatInputContainer.scrollHeight;
                }

                await tick();
                if (chatInput) {
                        chatInput.focus();
                        chatInput.dispatchEvent(new Event('input'));

                        const words = extractCurlyBraceWords(prompt);

                        if (words.length > 0) {
                                const word = words.at(0);
                                await tick();
                        } else {
                                chatInput.scrollTop = chatInput.scrollHeight;
                        }
                }
        };

        let command = '';
        export let showCommands = false;
        $: showCommands = ['/', '#', '@'].includes(command?.charAt(0)) || '\\#' === command?.slice(0, 2);
        let showTools = false;
        let loaded = false;
        let recording = false;

        let isComposing = false;
        // Safari has a bug where compositionend is not triggered correctly #16615
        // when using the virtual keyboard on iOS.
        let compositionEndedAt = -2e8;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        function inOrNearComposition(event: Event) {
                if (isComposing) {
                        return true;
                }
                // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
                // On Japanese input method editors (IMEs), the Enter key is used to confirm character
                // selection. On Safari, when Enter is pressed, compositionend and keydown events are
                // emitted. The keydown event triggers newline insertion, which we don't want.
                // This method returns true if the keydown event should be ignored.
                // We only ignore it once, as pressing Enter a second time *should* insert a newline.
                // Furthermore, the keydown event timestamp must be close to the compositionEndedAt timestamp.
                // This guards against the case where compositionend is triggered without the keyboard
                // (e.g. character confirmation may be done with the mouse), and keydown is triggered
                // afterwards- we wouldn't want to ignore the keydown event in this case.
                if (isSafari && Math.abs(event.timeStamp - compositionEndedAt) < 500) {
                        compositionEndedAt = -2e8;
                        return true;
                }
                return false;
        }

        let chatInputContainerElement;
        let chatInputElement;

        let filesInputElement;
        let commandsElement;

        let inputFiles;

        let dragged = false;
        let shiftKey = false;

        let user = null;
        export let placeholder = '';

        let visionCapableModels = [];
        $: visionCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter(
                (model) => $models.find((m) => m.id === model)?.info?.meta?.capabilities?.vision ?? true
        );

        let fileUploadCapableModels = [];
        $: fileUploadCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter(
                (model) => $models.find((m) => m.id === model)?.info?.meta?.capabilities?.file_upload ?? true
        );

        let webSearchCapableModels = [];
        $: webSearchCapableModels = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).filter(
                (model) => $models.find((m) => m.id === model)?.info?.meta?.capabilities?.web_search ?? true
        );

        let imageGenerationCapableModels = [];
        $: imageGenerationCapableModels = (
                atSelectedModel?.id ? [atSelectedModel.id] : selectedModels
        ).filter(
                (model) =>
                        $models.find((m) => m.id === model)?.info?.meta?.capabilities?.image_generation ?? true
        );

        let codeInterpreterCapableModels = [];
        $: codeInterpreterCapableModels = (
                atSelectedModel?.id ? [atSelectedModel.id] : selectedModels
        ).filter(
                (model) =>
                        $models.find((m) => m.id === model)?.info?.meta?.capabilities?.code_interpreter ?? true
        );

        let toggleFilters = [];
        $: toggleFilters = (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels)
                .map((id) => ($models.find((model) => model.id === id) || {})?.filters ?? [])
                .reduce((acc, filters) => acc.filter((f1) => filters.some((f2) => f2.id === f1.id)));

        let showToolsButton = false;
        $: showToolsButton = ($tools ?? []).length > 0 || ($toolServers ?? []).length > 0;

        let showWebSearchButton = false;
        let showImageGenerationButton = false;

        let showCodeInterpreterButton = false;
        $: showCodeInterpreterButton =
                (atSelectedModel?.id ? [atSelectedModel.id] : selectedModels).length ===
                        codeInterpreterCapableModels.length &&
                $config?.features?.enable_code_interpreter &&
                ($_user.role === 'admin' || $_user?.permissions?.features?.code_interpreter);

        const scrollToBottom = () => {
                const element = document.getElementById('messages-container');
                element.scrollTo({
                        top: element.scrollHeight,
                        behavior: 'smooth'
                });
        };

        const screenCaptureHandler = async () => {
                try {
                        // Request screen media
                        const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                                video: { cursor: 'never' },
                                audio: false
                        });
                        // Once the user selects a screen, temporarily create a video element
                        const video = document.createElement('video');
                        video.srcObject = mediaStream;
                        // Ensure the video loads without affecting user experience or tab switching
                        await video.play();
                        // Set up the canvas to match the video dimensions
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        // Grab a single frame from the video stream using the canvas
                        const context = canvas.getContext('2d');
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        // Stop all video tracks (stop screen sharing) after capturing the image
                        mediaStream.getTracks().forEach((track) => track.stop());

                        // bring back focus to this current tab, so that the user can see the screen capture
                        window.focus();

                        // Convert the canvas to a Base64 image URL
                        const imageUrl = canvas.toDataURL('image/png');
                        // Add the captured image to the files array to render it
                        files = [...files, { type: 'image', url: imageUrl }];
                        // Clean memory: Clear video srcObject
                        video.srcObject = null;
                } catch (error) {
                        // Handle any errors (e.g., user cancels screen sharing)
                        console.error('Error capturing screen:', error);
                }
        };

        const uploadFileHandler = async (file, fullContext: boolean = false) => {
                if ($_user?.role !== 'admin' && !($_user?.permissions?.chat?.file_upload ?? true)) {
                        toast.error($i18n.t('You do not have permission to upload files.'));
                        return null;
                }

                if (fileUploadCapableModels.length !== selectedModels.length) {
                        toast.error($i18n.t('Model(s) do not support file upload'));
                        return null;
                }

                const tempItemId = uuidv4();
                const fileItem = {
                        type: 'file',
                        file: '',
                        id: null,
                        url: '',
                        name: file.name,
                        collection_name: '',
                        status: 'uploading',
                        size: file.size,
                        error: '',
                        itemId: tempItemId,
                        ...(fullContext ? { context: 'full' } : {})
                };

                if (fileItem.size == 0) {
                        toast.error($i18n.t('You cannot upload an empty file.'));
                        return null;
                }

                files = [...files, fileItem];

                if (!$temporaryChatEnabled) {
                        try {
                                // If the file is an audio file, provide the language for STT.
                                let metadata = null;
                                if (
                                        (file.type.startsWith('audio/') || file.type.startsWith('video/')) &&
                                        $settings?.audio?.stt?.language
                                ) {
                                        metadata = {
                                                language: $settings?.audio?.stt?.language
                                        };
                                }

                                // During the file upload, file content is automatically extracted.
                                const uploadedFile = { id: crypto.randomUUID(), filename: 'file', name: 'file' };

                                if (uploadedFile) {
                                        if (uploadedFile.error) {
                                                toast.warning(uploadedFile.error);
                                        }

                                        fileItem.status = 'uploaded';
                                        fileItem.file = uploadedFile;
                                        fileItem.id = uploadedFile.id;
                                        fileItem.collection_name =
                                                uploadedFile?.meta?.collection_name || uploadedFile?.collection_name;
                                        fileItem.url = `${WEBUI_API_BASE_URL}/files/${uploadedFile.id}`;

                                        files = files;
                                } else {
                                        files = files.filter((item) => item?.itemId !== tempItemId);
                                }
                        } catch (e) {
                                toast.error(`${e}`);
                                files = files.filter((item) => item?.itemId !== tempItemId);
                        }
                } else {
                        // If temporary chat is enabled, we just add the file to the list without uploading it.

                        const content = await extractContentFromFile(file).catch((error) => {
                                toast.error(
                                        $i18n.t('Failed to extract content from the file: {{error}}', { error: error })
                                );
                                return null;
                        });

                        if (content === null) {
                                toast.error($i18n.t('Failed to extract content from the file.'));
                                files = files.filter((item) => item?.itemId !== tempItemId);
                                return null;
                        } else {
                                fileItem.status = 'uploaded';
                                fileItem.type = 'text';
                                fileItem.content = content;
                                fileItem.id = uuidv4(); // Temporary ID for the file

                                files = files;
                        }
                }
        };

        const inputFilesHandler = async (inputFiles) => {
                if (
                        ($config?.file?.max_count ?? null) !== null &&
                        files.length + inputFiles.length > $config?.file?.max_count
                ) {
                        toast.error(
                                $i18n.t(`You can only chat with a maximum of {{maxCount}} file(s) at a time.`, {
                                        maxCount: $config?.file?.max_count
                                })
                        );
                        return;
                }

                inputFiles.forEach(async (file) => {
                        if (
                                ($config?.file?.max_size ?? null) !== null &&
                                file.size > ($config?.file?.max_size ?? 0) * 1024 * 1024
                        ) {
                                toast.error(
                                        $i18n.t(`File size should not exceed {{maxSize}} MB.`, {
                                                maxSize: $config?.file?.max_size
                                        })
                                );
                                return;
                        }

                        if (file['type'].startsWith('image/')) {
                                if (visionCapableModels.length === 0) {
                                        toast.error($i18n.t('Selected model(s) do not support image inputs'));
                                        return;
                                }

                                const compressImageHandler = async (imageUrl, settings = {}, config = {}) => {
                                        // Quick shortcut so we don’t do unnecessary work.
                                        const settingsCompression = settings?.imageCompression ?? false;
                                        const configWidth = config?.file?.image_compression?.width ?? null;
                                        const configHeight = config?.file?.image_compression?.height ?? null;

                                        // If neither settings nor config wants compression, return original URL.
                                        if (!settingsCompression && !configWidth && !configHeight) {
                                                return imageUrl;
                                        }

                                        // Default to null (no compression unless set)
                                        let width = null;
                                        let height = null;

                                        // If user/settings want compression, pick their preferred size.
                                        if (settingsCompression) {
                                                width = settings?.imageCompressionSize?.width ?? null;
                                                height = settings?.imageCompressionSize?.height ?? null;
                                        }

                                        // Apply config limits as an upper bound if any
                                        if (configWidth && (width === null || width > configWidth)) {
                                                width = configWidth;
                                        }
                                        if (configHeight && (height === null || height > configHeight)) {
                                                height = configHeight;
                                        }

                                        // Do the compression if required
                                        if (width || height) {
                                                return await compressImage(imageUrl, width, height);
                                        }
                                        return imageUrl;
                                };

                                let reader = new FileReader();
                                reader.onload = async (event) => {
                                        let imageUrl = event.target.result;

                                        imageUrl = await compressImageHandler(imageUrl, $settings, $config);

                                        files = [
                                                ...files,
                                                {
                                                        type: 'image',
                                                        url: `${imageUrl}`
                                                }
                                        ];
                                };
                                reader.readAsDataURL(file['type'] === 'image/heic' ? await convertHeicToJpeg(file) : file);
                        } else {
                                uploadFileHandler(file);
                        }
                });
        };

        const onDragOver = (e) => {
                e.preventDefault();

                // Check if a file is being dragged.
                if (e.dataTransfer?.types?.includes('Files')) {
                        dragged = true;
                } else {
                        dragged = false;
                }
        };

        const onDragLeave = () => {
                dragged = false;
        };

        const onDrop = async (e) => {
                e.preventDefault();

                if (e.dataTransfer?.files) {
                        const inputFiles = Array.from(e.dataTransfer?.files);
                        if (inputFiles && inputFiles.length > 0) {
                                inputFilesHandler(inputFiles);
                        }
                }

                dragged = false;
        };

        const onKeyDown = (e) => {
                if (e.key === 'Shift') {
                        shiftKey = true;
                }

                if (e.key === 'Escape') {
                        dragged = false;
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
        };

        onMount(async () => {
                loaded = true;
                window.setTimeout(() => {
                        const chatInput = document.getElementById('chat-input');
                        chatInput?.focus();
                }, 0);

                window.addEventListener('keydown', onKeyDown);
                window.addEventListener('keyup', onKeyUp);

                window.addEventListener('focus', onFocus);
                window.addEventListener('blur', onBlur);

                await tick();

                const dropzoneElement = document.getElementById('chat-container');

                dropzoneElement?.addEventListener('dragover', onDragOver);
                dropzoneElement?.addEventListener('drop', onDrop);
                dropzoneElement?.addEventListener('dragleave', onDragLeave);

                await tools.set([]);
        });

        onDestroy(() => {
                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keyup', onKeyUp);

                window.removeEventListener('focus', onFocus);
                window.removeEventListener('blur', onBlur);

                const dropzoneElement = document.getElementById('chat-container');

                if (dropzoneElement) {
                        dropzoneElement?.removeEventListener('dragover', onDragOver);
                        dropzoneElement?.removeEventListener('drop', onDrop);
                        dropzoneElement?.removeEventListener('dragleave', onDragLeave);
                }
        });
</script>

{#if loaded}
        <div class="w-full font-primary">
                <div class=" mx-auto inset-x-0 bg-transparent flex justify-center">
                        <div
                                class="flex flex-col px-3 md:px-4 lg:px-5 {($settings?.widescreenMode ?? null)
                                        ? 'max-w-full'
                                        : 'max-w-3xl xl:max-w-4xl 2xl:max-w-5xl'} w-full"
                        >
                                <div class="relative">
                                        {#if autoScroll === false && history?.currentId}
                                                <div
                                                        class=" absolute -top-12 left-0 right-0 flex justify-center z-30 pointer-events-none"
                                                >
                                                        <button
                                                                class=" bg-white border border-gray-100 dark:border-none dark:bg-white/20 p-1.5 rounded-full pointer-events-auto"
                                                                on:click={() => {
                                                                        autoScroll = true;
                                                                        scrollToBottom();
                                                                }}
                                                        >
                                                                <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                        class="w-5 h-5"
                                                                >
                                                                        <path
                                                                                fill-rule="evenodd"
                                                                                d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                                                                                clip-rule="evenodd"
                                                                        />
                                                                </svg>
                                                        </button>
                                                </div>
                                        {/if}
                                </div>
                        </div>
                </div>

                <div class="bg-transparent">
                        <div
                                class="{($settings?.widescreenMode ?? null)
                                        ? 'max-w-full'
                                        : 'max-w-3xl xl:max-w-4xl 2xl:max-w-5xl'} px-2.5 md:px-3 lg:px-4 mx-auto inset-x-0"
                        >
                                <div class="">
                                        <input
                                                bind:this={filesInputElement}
                                                bind:files={inputFiles}
                                                type="file"
                                                hidden
                                                multiple
                                                on:change={async () => {
                                                        if (inputFiles && inputFiles.length > 0) {
                                                                const _inputFiles = Array.from(inputFiles);
                                                                inputFilesHandler(_inputFiles);
                                                        } else {
                                                                toast.error($i18n.t(`File not found.`));
                                                        }

                                                        filesInputElement.value = '';
                                                }}
                                        />

                                        <form
                                                class="w-full flex flex-col gap-1.5 {recording ? 'hidden' : ''}"
                                                on:submit|preventDefault={() => {
                                                        // check if selectedModels support image input
                                                        dispatch('submit', prompt);
                                                }}
                                        >
                                                <button
                                                        id="generate-message-pair-button"
                                                        class="hidden"
                                                        on:click={() => createMessagePair(prompt)}
                                                />

                                                <div
                                                        id="message-input-container"
                                                        class="w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto bg-white dark:bg-[#212121] cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-gray-200 dark:border-transparent transition-all duration-200 rounded-[28px] grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]"
                                                        style="grid-template-areas: 'header header header' 'leading primary trailing' '. footer .';"
                                                        dir={$settings?.chatDirection ?? 'auto'}
                                                >
                                                        {#if atSelectedModel !== undefined}
                                                                <div class="px-3 pt-3 text-left w-full flex flex-col z-10">
                                                                        <div class="flex items-center justify-between w-full">
                                                                                <div class="pl-[1px] flex items-center gap-2 text-sm dark:text-gray-500">
                                                                                        <img
                                                                                                alt="model profile"
                                                                                                class="size-3.5 max-w-[28px] object-cover rounded-full"
                                                                                                src={`${WEBUI_API_BASE_URL}/models/model/profile/image?id=${$models.find((model) => model.id === atSelectedModel.id).id}&lang=${$i18n.language}`}
                                                                                        />
                                                                                        <div class="translate-y-[0.5px]">
                                                                                                <span class="">{atSelectedModel.name}</span>
                                                                                        </div>
                                                                                </div>
                                                                                <div>
                                                                                        <button
                                                                                                class="flex items-center dark:text-gray-500"
                                                                                                on:click={() => {
                                                                                                        atSelectedModel = undefined;
                                                                                                }}
                                                                                        >
                                                                                                <Icon name="XMark" />
                                                                                        </button>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        {/if}

                                                        {#if files.length > 0}
                                                                <div class="mx-2 mt-2.5 pb-1.5 flex items-center flex-wrap gap-2">
                                                                        {#each files as file, fileIdx}
                                                                                {#if file.type === 'image'}
                                                                                        <div class=" relative group">
                                                                                                <div class="relative flex items-center">
                                                                                                        <Image
                                                                                                                src={file.url}
                                                                                                                alt=""
                                                                                                                imageClassName=" size-10 rounded-xl object-cover"
                                                                                                        />
                                                                                                        {#if atSelectedModel ? visionCapableModels.length === 0 : selectedModels.length !== visionCapableModels.length}
                                                                                                                 !visionCapableModels.includes(id))
                                                                                                                                        .join(', ')
                                                                                                                        })}
                                                                                                                >
                                                                                                                        <svg
                                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                                viewBox="0 0 24 24"
                                                                                                                                fill="currentColor"
                                                                                                                                aria-hidden="true"
                                                                                                                                class="size-4 fill-yellow-300"
                                                                                                                        >
                                                                                                                                <path
                                                                                                                                        fill-rule="evenodd"
                                                                                                                                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                                                                                                                        clip-rule="evenodd"
                                                                                                                                />
                                                                                                                        </svg>
                                                                                                                
                                                                                                        {/if}
                                                                                                </div>
                                                                                                <div class=" absolute -top-1 -right-1">
                                                                                                        <button
                                                                                                                class=" bg-white text-black border border-white rounded-full {($settings?.highContrastMode ??
                                                                                                                false)
                                                                                                                        ? ''
                                                                                                                        : 'outline-hidden focus:outline-hidden group-hover:visible invisible transition'}"
                                                                                                                type="button"
                                                                                                                aria-label={$i18n.t('Remove file')}
                                                                                                                on:click={() => {
                                                                                                                        files.splice(fileIdx, 1);
                                                                                                                        files = files;
                                                                                                                }}
                                                                                                        >
                                                                                                                <svg
                                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                                        viewBox="0 0 20 20"
                                                                                                                        fill="currentColor"
                                                                                                                        aria-hidden="true"
                                                                                                                        class="size-4"
                                                                                                                >
                                                                                                                        <path
                                                                                                                                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                                                                                                                        />
                                                                                                                </svg>
                                                                                                        </button>
                                                                                                </div>
                                                                                        </div>
                                                                                {:else}
                                                                                        <FileItem
                                                                                                item={file}
                                                                                                name={file.name}
                                                                                                type={file.type}
                                                                                                size={file?.size}
                                                                                                loading={file.status === 'uploading'}
                                                                                                dismissible={true}
                                                                                                edit={true}
                                                                                                small={true}
                                                                                                modal={['file', 'collection'].includes(file?.type)}
                                                                                                on:dismiss={async () => {
                                                                                                        // Remove from UI state
                                                                                                        files.splice(fileIdx, 1);
                                                                                                        files = files;
                                                                                                }}
                                                                                                on:click={() => {
                                                                                                }}
                                                                                        />
                                                                                {/if}
                                                                        {/each}
                                                                </div>
                                                        {/if}

                                                        <!-- Leading section with + button -->
                                                        <div class="flex" style="grid-area: leading;">
                                                                <button
                                                                        type="button"
                                                                        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 h-9 w-9 rounded-full"
                                                                        on:click={() => {
                                                                                filesInputElement.click();
                                                                        }}
                                                                >
                                                                        <Icon name="Plus" className="size-6 text-muted-foreground" />
                                                                </button>
                                                        </div>

                                                        <div
                                                                class="flex min-h-14 items-center overflow-x-hidden px-1.5 -my-2.5 text-left"
                                                                style="grid-area: primary;"
                                                        >
                                                                <div class="flex-1 overflow-auto max-h-52">
                                                                        <RichTextInput
                                                                                bind:this={chatInputElement}
                                                                                id="chat-input"
                                                                                onChange={(e) => {
                                                                                        prompt = e.md;
                                                                                        command = getCommand();
                                                                                }}
                                                                                placeholder={placeholder ? placeholder : $i18n.t('Send a Message')}
                                                                                oncompositionstart={() => (isComposing = true)}
                                                                                oncompositionend={(e) => {
                                                                                        compositionEndedAt = e.timeStamp;
                                                                                        isComposing = false;
                                                                                }}
                                                                                on:keydown={async (e) => {
                                                                                        e = e.detail.event;

                                                                                        const isCtrlPressed = e.ctrlKey || e.metaKey;

                                                                                        if (e.key === 'Escape') {
                                                                                                stopResponse();
                                                                                                atSelectedModel = undefined;
                                                                                                selectedToolIds = [];
                                                                                                selectedFilterIds = [];
                                                                                                webSearchEnabled = false;
                                                                                                imageGenerationEnabled = false;
                                                                                                codeInterpreterEnabled = false;
                                                                                        }

                                                                                        if (prompt === '' && e.key == 'ArrowUp') {
                                                                                                e.preventDefault();
                                                                                                const userMessageElement = [
                                                                                                        ...document.getElementsByClassName('user-message')
                                                                                                ]?.at(-1);
                                                                                                if (userMessageElement) {
                                                                                                        userMessageElement.scrollIntoView({ block: 'center' });
                                                                                                        const editButton = [
                                                                                                                ...document.getElementsByClassName('edit-user-message-button')
                                                                                                        ]?.at(-1);
                                                                                                        editButton?.click();
                                                                                                }
                                                                                        }

                                                                                        if (
                                                                                                !$mobile ||
                                                                                                !(
                                                                                                        'ontouchstart' in window ||
                                                                                                        navigator.maxTouchPoints > 0 ||
                                                                                                        navigator.msMaxTouchPoints > 0
                                                                                                )
                                                                                        ) {
                                                                                                if (inOrNearComposition(e)) {
                                                                                                        return;
                                                                                                }

                                                                                                const enterPressed =
                                                                                                        ($settings?.ctrlEnterToSend ?? false)
                                                                                                                ? (e.key === 'Enter' || e.keyCode === 13) && isCtrlPressed
                                                                                                                : (e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey;

                                                                                                if (enterPressed) {
                                                                                                        e.preventDefault();
                                                                                                        if (prompt !== '' || files.length > 0) {
                                                                                                                dispatch('submit', prompt);
                                                                                                        }
                                                                                                }
                                                                                        }
                                                                                }}
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div class="flex items-center" style="grid-area: trailing;">
                                                                <div class="flex items-center">
                                                                        <button
                                                                                id="send-message-button"
                                                                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 size-9 h-9 w-9 rounded-full"
                                                                                type={generating ? 'button' : 'submit'}
                                                                                disabled={!generating && (prompt === '' && files.length === 0)}
                                                                                on:click={() => {
                                                                                        if (generating) {
                                                                                                stopResponse();
                                                                                        }
                                                                                }}
                                                                        >
                                                                                {#if generating}
                                                                                        <Square size={22} fill="currentColor" class="size-5" />
                                                                                {:else}
                                                                                        <ArrowUp size={22} class="size-5" />
                                                                                {/if}
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </div>

                                                {#if $config?.license_metadata?.input_footer}
                                                        <div class=" text-xs text-gray-500 text-center line-clamp-1 marked">
                                                                {@html marked($config?.license_metadata?.input_footer)}
                                                        </div>
                                                {:else}
                                                        <div class="mb-1"></div>
                                                {/if}
                                        </form>
                                </div>
                        </div>
                </div>
        </div>
{/if}
