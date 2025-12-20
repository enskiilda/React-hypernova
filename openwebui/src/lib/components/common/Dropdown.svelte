<script lang="ts">
        import { DropdownMenu } from 'bits-ui';
        import { createEventDispatcher, getContext } from 'svelte';

        const i18n = getContext('i18n');

        import { flyAndScale } from '$lib/utils/transitions';

        export let show = false;
        export let side = 'bottom';
        export let align = 'start';
        export let closeOnOutsideClick = true;
        export let className = 'min-w-[160px]';

        const dispatch = createEventDispatcher();
</script>

<DropdownMenu.Root
        bind:open={show}
        closeFocus={false}
        {closeOnOutsideClick}
        onOpenChange={(state) => {
                dispatch('change', state);
        }}
        typeahead={false}
>
        <DropdownMenu.Trigger>
                <slot />
        </DropdownMenu.Trigger>

        <slot name="content">
                <DropdownMenu.Content
                        class="ant-dropdown-menu {className}"
                        sideOffset={4}
                        {side}
                        {align}
                        transition={flyAndScale}
                >
                        <DropdownMenu.Item class="ant-dropdown-menu-item">
                                <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
                                        1st menu item
                                </a>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item class="ant-dropdown-menu-item">
                                <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
                                        2nd menu item
                                </a>
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator class="ant-dropdown-menu-divider" />

                        <DropdownMenu.Item class="ant-dropdown-menu-item">
                                3rd menu item
                        </DropdownMenu.Item>
                </DropdownMenu.Content>
        </slot>
</DropdownMenu.Root>

<style>
        :global(.ant-dropdown-menu) {
                margin: 0;
                padding: 4px 0;
                list-style: none;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
                            0 3px 6px -4px rgba(0, 0, 0, 0.12),
                            0 9px 28px 8px rgba(0, 0, 0, 0.05);
                z-index: 1050;
        }

        :global(.ant-dropdown-menu-item) {
                display: flex;
                align-items: center;
                margin: 0;
                padding: 5px 12px;
                color: rgba(0, 0, 0, 0.88);
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
                cursor: pointer;
                transition: background 0.2s ease;
        }

        :global(.ant-dropdown-menu-item:hover) {
                background-color: rgba(0, 0, 0, 0.04);
        }

        :global(.ant-dropdown-menu-item a) {
                color: rgba(0, 0, 0, 0.88);
                text-decoration: none;
                display: block;
                width: 100%;
        }

        :global(.ant-dropdown-menu-item a:hover) {
                color: rgba(0, 0, 0, 0.88);
        }

        :global(.ant-dropdown-menu-divider) {
                height: 1px;
                margin: 4px 0;
                background-color: rgba(5, 5, 5, 0.06);
                border: none;
        }
</style>
