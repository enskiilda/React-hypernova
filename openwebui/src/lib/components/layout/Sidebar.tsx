import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppStore } from '$lib/stores';
import i18n from '$lib/i18n';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';
import Icon from '../icons/Icon';

const BREAKPOINT = 768;

const Sidebar: React.FC = () => {
        const navigate = useNavigate();
        
        const {
                user,
                chats,
                setChats,
                showSidebar,
                setShowSidebar,
                showSearch,
                setShowSearch,
                mobile,
                pinnedChats,
                setPinnedChats,
                setTags,
                chatId,
                setChatId,
                temporaryChatEnabled,
                setTemporaryChatEnabled,
                scrollPaginationEnabled,
                setScrollPaginationEnabled,
                currentChatPage,
                setCurrentChatPage,
                setSelectedFolder,
                WEBUI_NAME
        } = useAppStore();

        const [scrollTop, setScrollTop] = useState(0);
        const [shiftKey, setShiftKey] = useState(false);
        const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
        const [chatListLoading, setChatListLoading] = useState(false);
        const [allChatsLoaded, setAllChatsLoaded] = useState(true);

        const initChatList = useCallback(async () => {
                setCurrentChatPage(1);
                setAllChatsLoaded(true);
                setScrollPaginationEnabled(false);

                setTags([]);
                setPinnedChats([]);
                setChats([]);

                setScrollPaginationEnabled(true);
        }, [setCurrentChatPage, setScrollPaginationEnabled, setTags, setPinnedChats, setChats]);

        useEffect(() => {
                const handleKeyDown = (e: KeyboardEvent) => {
                        if (e.key === 'Shift') {
                                setShiftKey(true);
                        }
                };

                const handleKeyUp = (e: KeyboardEvent) => {
                        if (e.key === 'Shift') {
                                setShiftKey(false);
                        }
                };

                const handleBlur = () => {
                        setShiftKey(false);
                        setSelectedChatId(null);
                };

                window.addEventListener('keydown', handleKeyDown);
                window.addEventListener('keyup', handleKeyUp);
                window.addEventListener('blur', handleBlur);

                return () => {
                        window.removeEventListener('keydown', handleKeyDown);
                        window.removeEventListener('keyup', handleKeyUp);
                        window.removeEventListener('blur', handleBlur);
                };
        }, []);

        useEffect(() => {
                if (!mobile) {
                        setShowSidebar(false);
                }
        }, [mobile, setShowSidebar]);

        useEffect(() => {
                if (showSidebar) {
                        initChatList();
                }
        }, [showSidebar, initChatList]);

        const newChatHandler = async () => {
                setSelectedChatId(null);
                setSelectedFolder(null);

                if (user?.role !== 'admin' && user?.permissions?.chat?.temporary_enforced) {
                        setTemporaryChatEnabled(true);
                } else {
                        setTemporaryChatEnabled(false);
                }

                setTimeout(() => {
                        if (mobile) {
                                setShowSidebar(false);
                        }
                }, 0);
        };

        if (!showSidebar && mobile) {
                return null;
        }

        return (
                <>
                        <button
                                id="sidebar-new-chat-button"
                                className="hidden"
                                onClick={() => {
                                        navigate('/');
                                        newChatHandler();
                                }}
                        />

                        <div
                                id="sidebar"
                                className={`h-screen max-h-[100dvh] min-h-screen select-none flex-shrink-0 ${showSidebar ? 'w-[260px]' : 'w-[48px]'} ${showSidebar ? 'bg-[#f9f9f9] dark:bg-[#181818]' : 'bg-white dark:bg-[#212121]'} border-e border-[#f5f5f5] dark:border-[#2e2e2e] text-gray-900 dark:text-gray-200 text-sm overflow-x-hidden transition-all duration-500 ease-in-out ${mobile ? 'fixed left-0 top-0 z-50' : ''} ${mobile ? (showSidebar ? 'translate-x-0' : '-translate-x-full') : ''}`}
                                data-state={showSidebar}
                        >
                                <div
                                        className={`flex flex-col justify-between h-screen max-h-[100dvh] ${showSidebar ? 'w-[260px]' : 'w-[48px]'} overflow-x-hidden scrollbar-hidden z-50`}
                                >
                                        <div className="sidebar px-1.5 pt-1.5 pb-1.5 flex flex-col text-gray-600 dark:text-gray-400 sticky top-0 z-10">
                                                <div className="flex items-center">
                                                        <button
                                                                className="cursor-pointer flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition no-drag-region shrink-0 size-9"
                                                                onClick={() => setShowSidebar(!showSidebar)}
                                                                aria-label={showSidebar ? i18n.t('Close Sidebar') : i18n.t('Open Sidebar')}
                                                        >
                                                                <div className="flex items-center justify-center size-9 shrink-0">
                                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
                                                                                <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.5381L16.6299 14.3379C16.7073 14.1212 16.7594 13.8478 16.791 13.4619C16.8336 12.9395 16.8349 12.2706 16.8349 11.3262V8.66309C16.8349 7.71888 16.8336 7.04973 16.791 6.52731C16.7594 6.11177 16.7073 5.83848 16.6299 5.62172L16.5439 5.42152C16.32 4.98213 15.9796 4.62255 15.5615 4.39868L15.3779 4.29614C15.1308 4.17023 14.8164 4.09014 14.3018 4.04809C13.7794 4.00543 13.1112 4.00513 12.167 4.00513H8.16504L8.16406 15.995Z" />
                                                                        </svg>
                                                                </div>
                                                        </button>
                                                        {showSidebar && (
                                                                <Link to="/" className="flex flex-1 items-center px-1.5 mt-0.5" onClick={newChatHandler}>
                                                                        <div
                                                                                id="sidebar-webui-name"
                                                                                className="text-base font-medium text-gray-850 dark:text-white font-primary"
                                                                        >
                                                                                {WEBUI_NAME}
                                                                        </div>
                                                                </Link>
                                                        )}
                                                </div>

                                                <div
                                                        className={`${scrollTop > 0 ? 'visible' : 'invisible'} sidebar-bg-gradient-to-b bg-linear-to-b from-gray-50 dark:from-gray-950 to-transparent from-50% pointer-events-none absolute inset-0 -z-10 -mb-6`}
                                                />
                                        </div>

                                        <div className="px-1.5 pt-0.5 pb-1 flex flex-col gap-0 text-gray-600 dark:text-gray-400">
                                                <Link
                                                        id="sidebar-new-chat-button-link"
                                                        className={`group flex items-center justify-center rounded-xl ${showSidebar ? 'w-full' : 'size-9'} hover:bg-gray-100 dark:hover:bg-gray-850 transition outline-none`}
                                                        to="/"
                                                        draggable={false}
                                                        onClick={newChatHandler}
                                                        aria-label={i18n.t('New Chat')}
                                                >
                                                        <div className="flex items-center justify-center size-9 shrink-0">
                                                                <Icon name="PencilSquare" className="size-5" />
                                                        </div>
                                                        {showSidebar && (
                                                                <div className="flex flex-1 items-center">
                                                                        <div className="text-[15px] font-primary text-gray-800 dark:text-gray-200">{i18n.t('New Chat')}</div>
                                                                        <div className="flex-1"></div>
                                                                </div>
                                                        )}
                                                </Link>

                                                <button
                                                        id="sidebar-search-button"
                                                        className={`group flex items-center justify-center rounded-xl ${showSidebar ? 'w-full' : 'size-9'} hover:bg-gray-100 dark:hover:bg-gray-850 transition outline-none text-left`}
                                                        onClick={() => setShowSearch(true)}
                                                        draggable={false}
                                                        aria-label={i18n.t('Search')}
                                                >
                                                        <div className="flex items-center justify-center size-9 shrink-0">
                                                                <Icon name="Search" strokeWidth="2" className="size-5" />
                                                        </div>
                                                        {showSidebar && (
                                                                <div className="flex flex-1 items-center">
                                                                        <div className="text-[15px] font-primary text-gray-800 dark:text-gray-200">{i18n.t('Search')}</div>
                                                                        <div className="flex-1"></div>
                                                                </div>
                                                        )}
                                                </button>
                                        </div>

                                        <div
                                                className="relative flex flex-col flex-1 overflow-y-auto scrollbar-hidden pb-3"
                                                onScroll={(e) => {
                                                        const target = e.target as HTMLDivElement;
                                                        if (target.scrollTop === 0) {
                                                                setScrollTop(0);
                                                        } else {
                                                                setScrollTop(target.scrollTop);
                                                        }
                                                }}
                                        >
                                                {showSidebar && (
                                                        <div id="sidebar-chats" className="px-2 mt-0.5">
                                                                {pinnedChats.length > 0 && (
                                                                        <div className="mb-1">
                                                                                <div className="flex flex-col space-y-1 rounded-xl">
                                                                                        <div className="ml-3 pl-1 mt-[1px] flex flex-col overflow-y-auto scrollbar-hidden border-s border-gray-100 dark:border-gray-900 text-gray-900 dark:text-gray-200">
                                                                                                {pinnedChats.map((chat: any, idx: number) => (
                                                                                                        <div key={`pinned-chat-${idx}-${chat?.id ?? 'unknown'}`} className="py-1 px-2">
                                                                                                                {chat.title}
                                                                                                        </div>
                                                                                                ))}
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                )}
                                                                <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hidden">
                                                                        <div className="pt-1.5">
                                                                                {chats && chats.length > 0 ? (
                                                                                        chats.map((chat: any, idx: number) => (
                                                                                                <React.Fragment key={`chat-${idx}-${chat?.id ?? 'unknown'}`}>
                                                                                                        {(idx === 0 || (idx > 0 && chat.time_range !== chats[idx - 1].time_range)) && (
                                                                                                                <div
                                                                                                                        className={`w-full pl-2.5 text-xs text-gray-500 dark:text-gray-500 font-medium ${idx === 0 ? '' : 'pt-5'} pb-1.5`}
                                                                                                                >
                                                                                                                        {i18n.t(chat.time_range)}
                                                                                                                </div>
                                                                                                        )}
                                                                                                        <div className="py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                                                                                                {chat.title}
                                                                                                        </div>
                                                                                                </React.Fragment>
                                                                                        ))
                                                                                ) : chatListLoading ? (
                                                                                        <div className="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">
                                                                                                <Spinner className="size-4" />
                                                                                                <div>{i18n.t('Loading...')}</div>
                                                                                        </div>
                                                                                ) : null}

                                                                                {scrollPaginationEnabled && !allChatsLoaded && (
                                                                                        <div className="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">
                                                                                                <Spinner className="size-4" />
                                                                                                <div>{i18n.t('Loading...')}</div>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                )}
                                        </div>

                                        <div className="px-1.5 pt-1.5 pb-2 sticky bottom-0 z-10 sidebar">
                                                {showSidebar && (
                                                        <div className="sidebar-bg-gradient-to-t bg-linear-to-t from-gray-50 dark:from-gray-950 to-transparent from-50% pointer-events-none absolute inset-0 -z-10 -mt-6" />
                                                )}
                                                <div className="flex flex-col font-primary">
                                                        {user !== undefined && user !== null && (
                                                                <div
                                                                        className={`flex items-center rounded-2xl py-2 px-1 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition ${showSidebar ? 'w-full' : ''}`}
                                                                >
                                                                        <div className="self-center shrink-0">
                                                                                <Avatar name={user?.name} size="md" />
                                                                        </div>
                                                                        {showSidebar && (
                                                                                <div className="self-center font-medium ml-3">{user?.name}</div>
                                                                        )}
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>
                </>
        );
};

export default Sidebar;
