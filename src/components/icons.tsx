const PATHS: Record<string, React.ReactNode> = {
  facebook: (
    <path
      fill="currentColor"
      stroke="none"
      d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z"
    />
  ),
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  "twitter-x": (
    <path
      fill="currentColor"
      stroke="none"
      d="M17.2 3h3.3l-7.2 8.23L22 21h-6.63l-4.2-5.5L6.2 21H2.9l7.7-8.8L2.3 3h6.8l3.8 5.03L17.2 3Zm-1.16 16.03h1.83L8.03 4.88H6.07l9.97 14.15Z"
    />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10.2 9.2 5 2.8-5 2.8V9.2Z" fill="currentColor" stroke="none" />
    </>
  ),
  spotify: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M7.4 9.3c3-.8 6.2-.5 8.9 1M8 12.4c2.4-.6 5-.4 7.2.9M8.6 15.4c1.9-.5 3.9-.3 5.7.7" />
    </>
  ),
  tiktok: (
    <path
      fill="currentColor"
      stroke="none"
      d="M16.5 2h-3v13.1a2.6 2.6 0 1 1-2.1-2.55V9.5a5.7 5.7 0 1 0 5.1 5.67V8.9a7 7 0 0 0 4 1.27V7.1a4 4 0 0 1-4-4.03V2Z"
    />
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4V8Z" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <path d="M16 4.5a4 4 0 0 1 0 7M19.5 21c0-2.5-1.3-4.7-3.2-6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  badge: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M8.5 17c.6-2 2-3 3.5-3s2.9 1 3.5 3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5" />
      <path d="M12 18h.01" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  "user-cog": (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M2 21c0-3.9 3.1-7 7-7 1 0 2 .2 2.8.6" />
      <circle cx="18" cy="17" r="3" />
      <path d="M18 12.5v1.2M18 20.3v1.2M22 17h-1.3M15.3 17H14M20.8 14.2l-.9.9M16.1 18.9l-.9.9M20.8 19.8l-.9-.9M16.1 15.1l-.9-.9" />
    </>
  ),
  "user-plus": (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M2 21c0-3.9 3.1-7 7-7 1.2 0 2.3.3 3.3.8" />
      <path d="M19 14v6M16 17h6" />
    </>
  ),
  door: (
    <>
      <path d="M3 21h18" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M14 12h.01" />
    </>
  ),
  tag: (
    <>
      <path d="M2 12 12 2h8v8L10 20a2 2 0 0 1-2.8 0L2 14.8a2 2 0 0 1 0-2.8Z" />
      <circle cx="16" cy="6" r="1.5" />
    </>
  ),
  doc: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 19h16" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 10 6-10 6L2 8l10-6Z" />
      <path d="m2 14 10 6 10-6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 5 5L20 7" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  star: (
    <>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </>
  ),
  quiz: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="m8 12 2 2 4-4M8 17h8" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  back: (
    <>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  chevron: (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  live: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </>
  ),
  phone: (
    <>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
    </>
  ),
  handshake: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9A5 5 0 0 0 9.4 9.5L8 11l-3-3 4-4 3 1 2.5-1L21 11" />
      <path d="m3 8 4 4" />
    </>
  ),
  text: (
    <>
      <path d="M4 6h16M4 12h10M4 18h16" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  className,
  strokeWidth = 1.8,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name] ?? PATHS.grid}
    </svg>
  );
}
