import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Chat from '../chat/Chat';

const ChatPage: React.FC = () => {
        const { id } = useParams<{ id?: string }>();
        const [searchParams] = useSearchParams();

        useEffect(() => {
                const error = searchParams.get('error');
                if (error) {
                        toast.error(error || 'An unknown error occurred.');
                }
        }, [searchParams]);

        return <Chat chatIdProp={id || ''} />;
};

export default ChatPage;
