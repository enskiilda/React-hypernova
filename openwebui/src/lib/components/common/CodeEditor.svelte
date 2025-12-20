<script lang="ts">
        export let value = '';

        export let onSave = () => {};
        export let onChange = () => {};

        export let id = '';

        let _value = value;

        $: if (value !== _value) {
                _value = value;
        }

        const handleInput = (e) => {
                _value = e.target.value;
                onChange(_value);
        };

        const handleKeyDown = (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                        e.preventDefault();
                        onSave();
                }
                if (e.key === 'Tab') {
                        e.preventDefault();
                        const textarea = e.target;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        _value = _value.substring(0, start) + '\t' + _value.substring(end);
                        onChange(_value);
                        setTimeout(() => {
                                textarea.selectionStart = textarea.selectionEnd = start + 1;
                        }, 0);
                }
        };

        export const focus = () => {};
        export const formatPythonCodeHandler = async () => {};
</script>

<textarea
        {id}
        class="w-full h-full min-h-[100px] p-4 px-5 font-mono text-sm bg-white dark:bg-black text-gray-900 dark:text-white border-none outline-none resize-none"
        value={_value}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        spellcheck="false"
></textarea>
