import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAppStore } from '$lib/stores';
import { initI18n } from '$lib/i18n';
import { setNavigate, setLocation } from '$lib/app/navigation';
import AppLayout from './lib/components/layout/AppLayout';
import ChatPage from './lib/components/pages/ChatPage';

const BREAKPOINT = 768;

function getSystemTheme(): string {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(themeValue: string): void {
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

const App: React.FC = () => {
        const navigate = useNavigate();
        const location = useLocation();
        
        const {
                theme,
                setTheme,
                setMobile,
                setSettings,
                WEBUI_NAME
        } = useAppStore();

        useEffect(() => {
                // Set navigation refs for programmatic navigation
                setNavigate(navigate);
                setLocation(location);
        }, [navigate, location]);

        useEffect(() => {
                // Initialize i18n
                initI18n('pl-PL');
                
                // Apply default theme
                const defaultTheme = 'system';
                setTheme(defaultTheme);
                applyTheme(defaultTheme);
                
                // Listen for system theme changes
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const handleThemeChange = () => {
                        if (theme === 'system') {
                                applyTheme('system');
                        }
                };
                mediaQuery.addEventListener('change', handleThemeChange);
                
                // Set mobile state
                const handleResize = () => {
                        setMobile(window.innerWidth < BREAKPOINT);
                };
                setMobile(window.innerWidth < BREAKPOINT);
                window.addEventListener('resize', handleResize);
                
                // Initialize settings
                setSettings({});
                
                return () => {
                        mediaQuery.removeEventListener('change', handleThemeChange);
                        window.removeEventListener('resize', handleResize);
                };
        }, []);

        useEffect(() => {
                applyTheme(theme);
        }, [theme]);

        useEffect(() => {
                document.title = WEBUI_NAME;
        }, [WEBUI_NAME]);

        const toasterTheme = theme === 'system' 
                ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme === 'dark' || theme === 'oled-dark' ? 'dark' : 'light';

        return (
                <>
                        <Routes>
                                <Route path="/" element={<AppLayout />}>
                                        <Route index element={<ChatPage />} />
                                        <Route path="c/:id" element={<ChatPage />} />
                                </Route>
                        </Routes>
                        <Toaster theme={toasterTheme as 'light' | 'dark'} richColors position="top-right" />
                </>
        );
};

export default App;
