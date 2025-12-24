import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '$lib/stores';
import { setNavigate, setLocation, goto } from '$lib/app/navigation';
import i18n from '$lib/i18n';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
        const location = useLocation();
        const navigate = useNavigate();
        
        const {
                showSidebar,
                setShowSidebar,
                mobile,
                user,
                setTools,
                setFunctions,
                setTags,
                setToolServers,
                setTemporaryChatEnabled,
                showSearch,
                setShowSearch,
                showSettings,
                setShowSettings,
                showShortcuts,
                setShowShortcuts
        } = useAppStore();

        useEffect(() => {
                setNavigate(navigate);
                setLocation(location);
        }, [navigate, location]);

        useEffect(() => {
                setTools([]);
                setFunctions([]);
                setTags([]);
                setToolServers([]);

                const handleKeyDown = async (event: KeyboardEvent) => {
                        // Ctrl/Cmd + K for search
                        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                                event.preventDefault();
                                setShowSearch(!showSearch);
                        }
                        // Ctrl/Cmd + Shift + O for new chat
                        else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'o') {
                                event.preventDefault();
                                document.getElementById('sidebar-new-chat-button')?.click();
                        }
                        // Ctrl/Cmd + Shift + S for toggle sidebar
                        else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 's') {
                                event.preventDefault();
                                setShowSidebar(!showSidebar);
                        }
                        // Escape to close modals
                        else if (event.key === 'Escape') {
                                event.preventDefault();
                                setShowSettings(false);
                                setShowShortcuts(false);
                        }
                };

                document.addEventListener('keydown', handleKeyDown);
                
                // Check for temporary chat param
                const searchParams = new URLSearchParams(location.search);
                if (searchParams.get('temporary-chat') === 'true') {
                        setTemporaryChatEnabled(true);
                }

                return () => {
                        document.removeEventListener('keydown', handleKeyDown);
                };
        }, [location, showSearch, showSidebar]);

        return (
                <div className="app relative">
                        <div
                                className="text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 h-screen max-h-[100dvh] flex flex-row transition-all duration-300 overflow-hidden"
                                style={{ '--sidebar-width': showSidebar ? '260px' : '48px' } as React.CSSProperties}
                        >
                                <style>
                                        {`
                                                .app-content-wrapper {
                                                        display: flex;
                                                        flex: 1 1 auto;
                                                        min-width: 0;
                                                        width: 100%;
                                                        overflow: visible;
                                                }
                                        `}
                                </style>

                                <Sidebar />

                                <div 
                                        className="app-content-wrapper"
                                        style={mobile && showSidebar ? { transform: 'translateX(260px)', minWidth: '100vw' } : {}}
                                >
                                        <Outlet />
                                </div>
                        </div>
                </div>
        );
};

export default AppLayout;
