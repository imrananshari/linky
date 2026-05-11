import React from 'react';
import { Link } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom SVG Icons
const YoutubeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SnapchatIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c-.6 0-1.3.1-2 .3-2.6.9-4 3-4 5.7 0 .5 0 1 .1 1.5-.9.3-1.6.8-2 1.5-.5.8-.3 1.8.4 2.5.4.4.9.6 1.5.7.1.5.3 1 .6 1.4.3.5.7.8 1.2 1 .4.2.8.3 1.2.3.4 0 .7-.1 1.1-.2.5.7 1.2 1.3 2 1.6 1.3.5 2.7.5 4 0 .8-.3 1.5-.9 2-1.6.4.1.7.2 1.1.2.4 0 .8-.1 1.2-.3.5-.2.9-.5 1.2-1 .3-.4.5-.9.6-1.4.6-.1 1.1-.3 1.5-.7.7-.7.9-1.7.4-2.5-.4-.7-1.1-1.2-2-1.5.1-.5.1-1 .1-1.5 0-2.7-1.4-4.8-4-5.7-.7-.2-1.4-.3-2-.3zM9 11c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm6 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
  </svg>
);

interface PlatformBadgeProps {
  platform: "youtube" | "instagram" | "facebook" | "snapchat" | "unknown";
  className?: string;
}

const platformConfig = {
  youtube: { icon: YoutubeIcon, label: 'YouTube', color: 'bg-red-500 text-white' },
  instagram: { icon: InstagramIcon, label: 'Instagram', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white' },
  facebook: { icon: FacebookIcon, label: 'Facebook', color: 'bg-blue-600 text-white' },
  snapchat: { icon: SnapchatIcon, label: 'Snapchat', color: 'bg-yellow-400 text-black' },
  unknown: { icon: Link, label: 'Link', color: 'bg-gray-500 text-white' },
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className }) => {
  const config = platformConfig[platform] || platformConfig.unknown;
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-transform hover:scale-105",
      config.color,
      className
    )}>
      <Icon size={14} />
      <span>{config.label}</span>
    </div>
  );
};
