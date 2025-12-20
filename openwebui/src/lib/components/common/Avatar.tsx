import React from 'react';

interface AvatarProps {
        name?: string;
        size?: 'sm' | 'md' | 'lg';
        className?: string;
}

const getInitial = (fullName: string): string => {
        if (!fullName) return '?';
        return fullName.charAt(0).toUpperCase();
};

const sizeClasses = {
        sm: 'w-5 h-5 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base'
};

const Avatar: React.FC<AvatarProps> = ({ name = '', size = 'md', className = '' }) => {
        return (
                <div
                        className={`rounded-full flex items-center justify-center font-semibold bg-[#ededed] text-black dark:bg-gray-700 dark:text-white ${sizeClasses[size]} ${className}`}
                >
                        {getInitial(name)}
                </div>
        );
};

export default Avatar;
