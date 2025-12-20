<script lang="ts">
        export let name: string;
        export let className: string | undefined = undefined;
        export let strokeWidth: string | undefined = undefined;

        const defaults: Record<string, { className: string; strokeWidth: string }> = {
                AdjustmentsHorizontal: { className: 'w-4 h-4', strokeWidth: '1.5' },
                ArchiveBox: { className: 'size-4', strokeWidth: '2.5' },
                ArrowRightCircle: { className: 'size-4', strokeWidth: '1.5' },
                ArrowUpTray: { className: 'size-4', strokeWidth: '1.5' },
                ChatBubble: { className: 'size-4', strokeWidth: '1.5' },
                ChatBubbleDotted: { className: 'size-4', strokeWidth: '1.5' },
                ChatBubbleDottedChecked: { className: 'size-4', strokeWidth: '1.5' },
                ChatCheck: { className: 'w-4 h-4', strokeWidth: '1.5' },
                ChatPlus: { className: 'w-4 h-4', strokeWidth: '1.5' },
                Check: { className: 'w-4 h-4', strokeWidth: '1.5' },
                ChevronDown: { className: 'w-4 h-4', strokeWidth: '1.5' },
                ChevronUp: { className: 'w-4 h-4', strokeWidth: '1.5' },
                ChevronUpDown: { className: 'w-4 h-4', strokeWidth: '1.5' },
                Clipboard: { className: 'size-4', strokeWidth: '2' },
                Document: { className: 'size-4', strokeWidth: '1.5' },
                DocumentDuplicate: { className: 'w-4 h-4', strokeWidth: '1.5' },
                EllipsisHorizontal: { className: 'w-4 h-4', strokeWidth: '1.5' },
                GarbageBin: { className: 'w-4 h-4', strokeWidth: '1.5' },
                Link: { className: 'size-4', strokeWidth: '1.5' },
                Merge: { className: 'w-4 h-4', strokeWidth: '1.5' },
                PencilSquare: { className: 'w-5 h-5', strokeWidth: '1.5' },
                Plus: { className: 'w-4 h-4', strokeWidth: '2' },
                Search: { className: 'w-5 h-5', strokeWidth: '1.5' },
                Settings: { className: 'w-5 h-5', strokeWidth: '1.5' },
                Share: { className: 'size-4', strokeWidth: '1.5' },
                SignOut: { className: 'w-5 h-5', strokeWidth: '1.5' },
                Star: { className: 'w-4 h-4', strokeWidth: '1.5' },
                UserGroup: { className: 'w-5 h-5', strokeWidth: '1.5' },
                XMark: { className: 'size-3.5', strokeWidth: '2' }
        };

        $: finalClassName = className ?? defaults[name]?.className ?? 'w-4 h-4';
        $: finalStrokeWidth = strokeWidth ?? defaults[name]?.strokeWidth ?? '1.5';
</script>

{#if name === 'AdjustmentsHorizontal'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="currentColor"
                class={finalClassName}
                stroke-width={finalStrokeWidth}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
        </svg>
{:else if name === 'ArchiveBox'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                aria-hidden="true"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
        </svg>
{:else if name === 'ArrowRightCircle'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
        </svg>
{:else if name === 'ArrowUpTray'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
        </svg>
{:else if name === 'ChatBubble'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
        </svg>
{:else if name === 'ChatBubbleDotted'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-dasharray="2.5 3.5"
                ></path>
        </svg>
{:else if name === 'ChatBubbleDottedChecked'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path d="M8 12L11 15L16 10" stroke-linecap="round" stroke-linejoin="round"></path>
                <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-dasharray="2.5 3.5"
                ></path>
        </svg>
{:else if name === 'ChatCheck'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
                ><path d="M8 12L11 15L16 10" stroke-linecap="round" stroke-linejoin="round"></path><path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                ></path></svg
        >
{:else if name === 'ChatPlus'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
                ><path d="M9 12H12M15 12H12M12 12V9M12 12V15" stroke-linecap="round" stroke-linejoin="round"
                ></path><path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                ></path></svg
        >
{:else if name === 'Check'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
{:else if name === 'ChevronDown'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
                aria-hidden="true"
        >
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
{:else if name === 'ChevronUp'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
{:else if name === 'ChevronUpDown'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
                aria-hidden="true"
        >
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
{:else if name === 'Clipboard'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                />
        </svg>
{:else if name === 'Document'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
        </svg>
{:else if name === 'DocumentDuplicate'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                />
        </svg>
{:else if name === 'EllipsisHorizontal'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
        </svg>
{:else if name === 'GarbageBin'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
        </svg>
{:else if name === 'Link'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
                ><path
                        d="M14 11.9976C14 9.5059 11.683 7 8.85714 7C8.52241 7 7.41904 7.00001 7.14286 7.00001C4.30254 7.00001 2 9.23752 2 11.9976C2 14.376 3.70973 16.3664 6 16.8714C6.36756 16.9525 6.75006 16.9952 7.14286 16.9952"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                ></path><path
                        d="M10 11.9976C10 14.4893 12.317 16.9952 15.1429 16.9952C15.4776 16.9952 16.581 16.9952 16.8571 16.9952C19.6975 16.9952 22 14.7577 22 11.9976C22 9.6192 20.2903 7.62884 18 7.12383C17.6324 7.04278 17.2499 6.99999 16.8571 6.99999"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                ></path></svg
        >
{:else if name === 'Merge'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6-2a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm0 0h-1a5 5 0 0 1-5-5v-.5"
                />
        </svg>
{:else if name === 'PencilSquare'}
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" class={finalClassName} aria-hidden="true"><path d="M15.6729 3.91275C16.8918 2.6938 18.8682 2.6938 20.0871 3.91275C21.3061 5.1317 21.3061 7.10801 20.0871 8.32696L14.1499 14.2642C13.3849 15.0291 12.3925 15.5254 11.3215 15.6784L9.14142 15.9898C8.82983 16.0343 8.51546 15.9295 8.29289 15.707C8.07033 15.4844 7.96554 15.17 8.01005 14.8584L8.32149 12.6784C8.47449 11.6074 8.97072 10.6149 9.7357 9.84994L15.6729 3.91275ZM18.6729 5.32696C18.235 4.88906 17.525 4.88906 17.0871 5.32696L11.1499 11.2642C10.6909 11.7231 10.3932 12.3186 10.3014 12.9612L10.1785 13.8213L11.0386 13.6985C11.6812 13.6067 12.2767 13.3089 12.7357 12.8499L18.6729 6.91275C19.1108 6.47485 19.1108 5.76486 18.6729 5.32696ZM11 3.99916C11.0004 4.55145 10.5531 4.99951 10.0008 4.99994C9.00227 5.00072 8.29769 5.00815 7.74651 5.06052C7.20685 5.11179 6.88488 5.20104 6.63803 5.32682C6.07354 5.61444 5.6146 6.07339 5.32698 6.63787C5.19279 6.90123 5.10062 7.24891 5.05118 7.85408C5.00078 8.47092 5 9.26324 5 10.3998V13.5998C5 14.7364 5.00078 15.5288 5.05118 16.1456C5.10062 16.7508 5.19279 17.0985 5.32698 17.3618C5.6146 17.9263 6.07354 18.3852 6.63803 18.6729C6.90138 18.807 7.24907 18.8992 7.85424 18.9487C8.47108 18.9991 9.26339 18.9998 10.4 18.9998H13.6C14.7366 18.9998 15.5289 18.9991 16.1458 18.9487C16.7509 18.8992 17.0986 18.807 17.362 18.6729C17.9265 18.3852 18.3854 17.9263 18.673 17.3618C18.7988 17.115 18.8881 16.793 18.9393 16.2533C18.9917 15.7021 18.9991 14.9976 18.9999 13.9991C19.0003 13.4468 19.4484 12.9994 20.0007 12.9998C20.553 13.0003 21.0003 13.4483 20.9999 14.0006C20.9991 14.9788 20.9932 15.7807 20.9304 16.4425C20.8664 17.1159 20.7385 17.7135 20.455 18.2698C19.9757 19.2106 19.2108 19.9755 18.27 20.4549C17.6777 20.7567 17.0375 20.8825 16.3086 20.942C15.6008 20.9999 14.7266 20.9999 13.6428 20.9998H10.3572C9.27339 20.9999 8.39925 20.9999 7.69138 20.942C6.96253 20.8825 6.32234 20.7567 5.73005 20.4549C4.78924 19.9755 4.02433 19.2106 3.54497 18.2698C3.24318 17.6775 3.11737 17.0373 3.05782 16.3085C2.99998 15.6006 2.99999 14.7264 3 13.6426V10.357C2.99999 9.27325 2.99998 8.3991 3.05782 7.69122C3.11737 6.96237 3.24318 6.32218 3.54497 5.72989C4.02433 4.78908 4.78924 4.02418 5.73005 3.54481C6.28633 3.26137 6.88399 3.13346 7.55735 3.06948C8.21919 3.0066 9.02103 3.00071 9.99922 2.99994C10.5515 2.99951 10.9996 3.44688 11 3.99916Z" /></svg>
{:else if name === 'Plus'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
                aria-hidden="true"
        >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
{:else if name === 'Search'}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true"><path d="M14.0857 8.74999C14.0857 5.80355 11.6972 3.41503 8.75073 3.41503C5.80429 3.41503 3.41577 5.80355 3.41577 8.74999C3.41577 11.6964 5.80429 14.085 8.75073 14.085C11.6972 14.085 14.0857 11.6964 14.0857 8.74999ZM15.4158 8.74999C15.4158 10.3539 14.848 11.8245 13.9041 12.9746L13.9705 13.0303L16.9705 16.0303L17.0564 16.1338C17.2269 16.3919 17.1977 16.7434 16.9705 16.9707C16.7432 17.1975 16.3925 17.226 16.1345 17.0557L16.03 16.9707L13.03 13.9707L12.9753 13.9033C11.8253 14.8472 10.3547 15.415 8.75073 15.415C5.06975 15.415 2.08569 12.431 2.08569 8.74999C2.08569 5.06901 5.06975 2.08495 8.75073 2.08495C12.4317 2.08495 15.4158 5.06901 15.4158 8.74999Z"></path></svg>
{:else if name === 'Settings'}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon" aria-hidden="true"><path d="M10.3227 1.62663C11.1514 1.62663 11.9182 2.066 12.3373 2.78092L13.1586 4.18131L13.2123 4.25065C13.2735 4.31105 13.3565 4.34658 13.4448 4.34733L15.06 4.36002L15.2143 4.36686C15.9825 4.4239 16.6774 4.85747 17.0649 5.53092L17.393 6.10221L17.4662 6.23795C17.7814 6.88041 17.7842 7.63306 17.4741 8.27799L17.4028 8.41373L16.6 9.83561C16.5426 9.937 16.5425 10.0627 16.6 10.1647L17.4028 11.5856L17.4741 11.7223C17.7841 12.3673 17.7815 13.1199 17.4662 13.7624L17.393 13.8981L17.0649 14.4694C16.6774 15.1427 15.9824 15.5764 15.2143 15.6335L15.06 15.6393L13.4448 15.653C13.3565 15.6537 13.2736 15.6892 13.2123 15.7497L13.1586 15.818L12.3373 17.2194C11.9182 17.9342 11.1513 18.3737 10.3227 18.3737H9.6762C8.8995 18.3735 8.17705 17.9874 7.74456 17.3503L7.66253 17.2194L6.84124 15.818C6.79652 15.7418 6.72408 15.6876 6.64105 15.6647L6.55511 15.653L4.93987 15.6393C4.16288 15.633 3.44339 15.2413 3.01605 14.6003L2.93499 14.4694L2.60687 13.8981C2.19555 13.1831 2.1916 12.3039 2.5971 11.5856L3.39886 10.1647L3.43206 10.0846C3.44649 10.0293 3.44644 9.97102 3.43206 9.91569L3.39886 9.83561L2.5971 8.41373C2.19175 7.6955 2.19562 6.8171 2.60687 6.10221L2.93499 5.53092L3.01605 5.40006C3.44337 4.75894 4.1628 4.36636 4.93987 4.36002L6.55511 4.34733L6.64105 4.33561C6.72418 4.31275 6.79651 4.25762 6.84124 4.18131L7.66253 2.78092L7.74456 2.65006C8.17704 2.01277 8.89941 1.62678 9.6762 1.62663H10.3227ZM9.6762 2.9567C9.36439 2.95685 9.07299 3.10138 8.88421 3.34342L8.80999 3.45377L7.9887 4.85416C7.72933 5.29669 7.28288 5.59093 6.78265 5.6608L6.56585 5.67741L4.95062 5.6901C4.63868 5.69265 4.34845 5.84001 4.16155 6.08366L4.08733 6.19401L3.75921 6.7653C3.58227 7.073 3.5808 7.45131 3.7553 7.76041L4.55706 9.18131L4.65179 9.37663C4.81309 9.77605 4.81294 10.2232 4.65179 10.6227L4.55706 10.819L3.7553 12.2399C3.58083 12.549 3.5822 12.9273 3.75921 13.235L4.08733 13.8053L4.16155 13.9166C4.34845 14.1603 4.63867 14.3077 4.95062 14.3102L6.56585 14.3229L6.78265 14.3395C7.28288 14.4094 7.72933 14.7036 7.9887 15.1462L8.80999 16.5466L8.88421 16.6569C9.07299 16.899 9.36438 17.0435 9.6762 17.0437H10.3227C10.6345 17.0435 10.9259 16.899 11.1147 16.6569L11.189 16.5466L12.0103 15.1462C12.2696 14.7036 12.716 14.4094 13.2163 14.3395L13.433 14.3229L15.0483 14.3102C15.3602 14.3077 15.6505 14.1603 15.8374 13.9166L15.9116 13.8053L16.2397 13.235C16.4167 12.9273 16.4181 12.549 16.2436 12.2399L15.4418 10.819L15.3471 10.6227C15.186 10.2232 15.1858 9.77605 15.3471 9.37663L15.4418 9.18131L16.2436 7.76041C16.4181 7.45131 16.4167 7.073 16.2397 6.7653L15.9116 6.19401L15.8374 6.08366C15.6505 5.84001 15.3602 5.69265 15.0483 5.6901L13.433 5.67741L13.2163 5.6608C12.716 5.59093 12.2696 5.29669 12.0103 4.85416L11.189 3.45377L11.1147 3.34342C10.9259 3.10138 10.6345 2.95685 10.3227 2.9567H9.6762ZM9.99988 6.66748C11.8409 6.66748 13.3327 8.15924 13.3327 10.0003C13.3327 11.8413 11.8409 13.333 9.99988 13.333C8.15893 13.333 6.66716 11.8413 6.66716 10.0003C6.66716 8.15924 8.15893 6.66748 9.99988 6.66748ZM9.99988 7.99756C8.89379 7.99756 7.99725 8.89411 7.99725 10.0003C7.99725 11.1063 8.89379 12.0029 9.99988 12.0029C11.106 12.0029 12.0025 11.1063 12.0025 10.0003C12.0025 8.89411 11.106 7.99756 9.99988 7.99756Z"></path></svg>
{:else if name === 'Share'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                aria-hidden="true"
                class={finalClassName}
                ><path
                        d="M20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                ></path><path
                        d="M12 15V3M12 3L8.5 6.5M12 3L15.5 6.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                ></path></svg
        >
{:else if name === 'SignOut'}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class={finalClassName}>
                <path
                        fill-rule="evenodd"
                        d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                        clip-rule="evenodd"
                        aria-hidden="true"
                />
                <path
                        fill-rule="evenodd"
                        d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                        clip-rule="evenodd"
                />
        </svg>
{:else if name === 'Star'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
        </svg>
{:else if name === 'UserGroup'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
                stroke-width={finalStrokeWidth}
                stroke="currentColor"
                class={finalClassName}
        >
                <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
        </svg>
{:else if name === 'XMark'}
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                stroke-width={finalStrokeWidth}
                class={finalClassName}
        >
                <slot />
                <path
                        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
        </svg>
{/if}
