<script>
        import { Toaster } from 'svelte-sonner';
        import { browser } from '$app/environment';

        import { onMount, setContext } from 'svelte';
        import {
                config,
                user,
                settings,
                theme,
                WEBUI_NAME,
                mobile,
                models
        } from '$lib/stores';

        import i18n, { initI18n } from '$lib/i18n';

        import '../tailwind.css';
        import '../app.css';

        const AI_MODELS = [
                {
                        id: 'moonshotai/kimi-k2-thinking',
                        name: 'Kimi K2 Thinking',
                        owned_by: 'openai',
                        external: true,
                        source: 'nvidia'
                },
                {
                        id: 'bytedance/seed-oss-36b-instruct',
                        name: 'Seed 36B Instruct',
                        owned_by: 'openai',
                        external: true,
                        source: 'nvidia'
                },
                {
                        id: 'deepseek-ai/deepseek-v3.1',
                        name: 'DeepSeek V3.1',
                        owned_by: 'openai',
                        external: true,
                        source: 'nvidia'
                },
                {
                        id: 'deepseek-ai/deepseek-r1-0528',
                        name: 'DeepSeek R1',
                        owned_by: 'openai',
                        external: true,
                        source: 'nvidia'
                },
                {
                        id: 'amazon/nova-2-lite-v1',
                        name: 'Amazon Nova 2 Lite',
                        owned_by: 'openrouter',
                        external: true,
                        source: 'openrouter'
                }
        ];

        setContext('i18n', i18n);

        const BREAKPOINT = 768;

        const staticConfig = {
                status: true,
                name: 'Open WebUI',
                version: '0.6.40',
                default_locale: 'pl-PL',
                default_models: 'moonshotai/kimi-k2-thinking',
                default_prompt_suggestions: [
                        { content: 'Wymyśl nazwę', title: ['Wymyśl nazwę', 'dla nowej kawiarni'] },
                        { content: 'Przetłumacz tekst', title: ['Przetłumacz tekst', 'z polskiego na angielski'] },
                        { content: 'Zadaj mi pytanie', title: ['Zadaj mi pytanie', 'żeby rozpocząć ciekawą rozmowę'] }
                ],
                features: {
                        enable_admin_chat_access: true,
                        enable_community_sharing: true,
                }
        };

        const defaultUser = {
                id: 'default',
                name: 'User',
                role: 'admin',
                profile_image_url: '/static/favicon.png',
                permissions: {
                        chat: {
                                temporary_enforced: false,
                                multiple_models: true
                        },
                        features: {
                                image_generation: true,
                                code_interpreter: true,
                                web_search: true
                        }
                }
        };

        const staticModels = AI_MODELS.map(m => ({
                ...m,
                info: {
                        meta: {
                                capabilities: {
                                        vision: false,
                                        usage: true
                                }
                        }
                }
        }));

        function getSystemTheme() {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function applyTheme(themeValue) {
                let themeToApply = themeValue;
                
                if (themeValue === 'system') {
                        themeToApply = getSystemTheme();
                } else if (themeValue === 'oled-dark') {
                        themeToApply = 'dark';
                }
                
                document.documentElement.classList.remove('dark', 'light', 'oled-dark');
                document.documentElement.classList.add(themeToApply);
                
                if (themeValue === 'oled-dark') {
                        document.documentElement.style.setProperty('--color-gray-800', '#101010');
                        document.documentElement.style.setProperty('--color-gray-850', '#050505');
                        document.documentElement.style.setProperty('--color-gray-900', '#000000');
                        document.documentElement.style.setProperty('--color-gray-950', '#000000');
                } else if (themeToApply === 'dark') {
                        document.documentElement.style.setProperty('--color-gray-800', '#333');
                        document.documentElement.style.setProperty('--color-gray-850', '#262626');
                        document.documentElement.style.setProperty('--color-gray-900', '#171717');
                        document.documentElement.style.setProperty('--color-gray-950', '#0d0d0d');
                }
                
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                        metaThemeColor.setAttribute('content', themeToApply === 'light' ? '#ffffff' : themeValue === 'oled-dark' ? '#000000' : '#171717');
                }
        }

        if (browser) {
                initI18n('pl-PL');
                
                config.set(staticConfig);
                WEBUI_NAME.set(staticConfig.name);
                user.set(defaultUser);
                models.set(staticModels);
                
                const defaultTheme = 'system';
                theme.set(defaultTheme);
                applyTheme(defaultTheme);
                
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                        if ($theme === 'system') {
                                applyTheme('system');
                        }
                });
                
                mobile.set(window.innerWidth < BREAKPOINT);
        }

        onMount(() => {
                settings.set({});

                const onResize = () => mobile.set(window.innerWidth < BREAKPOINT);
                window.addEventListener('resize', onResize);
                return () => window.removeEventListener('resize', onResize);
        });
</script>

<svelte:head>
        <title>{$WEBUI_NAME}</title>
        <link crossorigin="anonymous" rel="icon" href="/static/favicon.png" />
</svelte:head>

<slot />

<Toaster theme={$theme === 'system' ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : $theme === 'dark' || $theme === 'oled-dark' ? 'dark' : 'light'} richColors position="top-right" />
