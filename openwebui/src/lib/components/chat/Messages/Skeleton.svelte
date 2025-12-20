<script lang="ts">
        export let size = 'md';
</script>

<span
        class="flex {size === 'md'
                ? 'size-4 my-2'
                : size === 'xs'
                        ? 'size-2 my-1'
                        : 'size-3 my-1'} mx-1"
>
        <span
                class="inline-flex {size === 'md'
                        ? 'size-4'
                        : size === 'xs'
                                ? 'size-2'
                                : 'size-3'} rounded-full bg-gray-800 dark:bg-white animate-breathe"
        ></span>
</span>

<style>
        @keyframes breathe {
                0%, 100% {
                        transform: scale(0.6);
                        opacity: 0.7;
                }
                50% {
                        transform: scale(1);
                        opacity: 1;
                }
        }

        .animate-breathe {
                animation: breathe 1.2s ease-in-out infinite;
        }
</style>
