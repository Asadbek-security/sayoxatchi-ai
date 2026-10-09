// SAYOXATCHI AI — o‘z ikonka tizimi.
// 24×24 setka, 20×20 jonli maydon, 1.5px chiziq (16–20px da 1.75), dumaloq uchlar.
// Har ikonkada: chiziq qatlami (currentColor) + BITTA yopiq "shisha" shakl (yalpiz→aqua, 25–35%).
// "AI tuguni" — 2.5px iridessent nuqta, faqat AI ikonkalarida.
import type { ReactNode } from "react";
import type { Topic } from "@/lib/types";

export interface IconProps {
  size?: 16 | 20 | 24 | 32 | number;
  className?: string;
  active?: boolean;
  title?: string;
}

/** Gradientlar bir marta, layoutda chiziladi */
export function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="ig-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8BF5D0" />
          <stop offset="1" stopColor="#4FD8E8" />
        </linearGradient>
        <linearGradient id="ig-node" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8BF5D0" />
          <stop offset=".55" stopColor="#4FD8E8" />
          <stop offset="1" stopColor="#B9B3FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Svg({ size = 24, className, active, title, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={size <= 20 ? 1.75 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["ico shrink-0", active && "ico-active", className].filter(Boolean).join(" ")}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** "Shisha" qatlam — 1px siljigan */
const G = ({ d }: { d: string }) => (
  <path d={d} fill="url(#ig-glass)" stroke="none" style={{ opacity: "var(--icon-fill)" }} transform="translate(1 1)" />
);
/** AI tuguni */
const N = ({ x, y, amber }: { x: number; y: number; amber?: boolean }) => (
  <circle cx={x} cy={y} r="1.25" fill={amber ? "var(--score-mid)" : "url(#ig-node)"} stroke="none" />
);

const BUBBLE = "M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5v-3.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z";

/* ---------- AI ikonkalar ---------- */
export const IconTrust = (p: IconProps) => (
  <Svg {...p}>
    <G d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" />
    <circle cx="12" cy="12" r="8" pathLength={40} strokeDasharray="6 1.5 6 1.5 6 1.5 6 11.5" transform="rotate(135 12 12)" />
    <N x={18.8} y={16.2} />
  </Svg>
);
export const IconAdMatch = (p: IconProps) => (
  <Svg {...p}>
    <G d="M9 8h5v8H9z" />
    <rect x="3" y="6" width="11" height="10" rx="2" />
    <rect x="10" y="8" width="11" height="10" rx="2" />
    <path d="M12 3.5v17" className="ico-move" />
    <N x={12} y={12} />
  </Svg>
);
export const IconSuspicious = (p: IconProps) => (
  <Svg {...p}>
    <G d="M6 7.5h12v6H6z" />
    <path d={BUBBLE} strokeDasharray="2.4 2.4" />
    <N x={12} y={10.5} amber />
  </Svg>
);
export const IconSummary = (p: IconProps) => (
  <Svg {...p}>
    <G d="M4 5.5h9v3H4z" />
    <path d="M4 7h16M4 12h16M4 17h8" />
    <path className="ico-move" d="M17.5 14.2q.4 2.4 2.8 2.8-2.4.4-2.8 2.8-.4-2.4-2.8-2.8 2.4-.4 2.8-2.8z" fill="url(#ig-node)" strokeWidth="1" />
  </Svg>
);
export const IconAnalyze = (p: IconProps) => (
  <Svg {...p}>
    <G d="M15.5 12l-1.75 3.03h-3.5L8.5 12l1.75-3.03h3.5z" />
    <circle cx="12" cy="12" r="8" />
    <path d="M15.5 12l.5 6.9M13.75 15.03L8 18.9M10.25 15.03L4 12M8.5 12L8 5.1M10.25 8.97L16 5.1M13.75 8.97L20 12" />
    <N x={12} y={12} />
  </Svg>
);
export const IconSafety = (p: IconProps) => (
  <Svg {...p}>
    <G d="M5.5 11.5h13v8h-13z" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" className="ico-move" />
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
    <N x={12} y={16} />
  </Svg>
);

/* ---------- Ko‘rsatkichlar / mavzular ---------- */
export const IconReliability = (p: IconProps) => (
  <Svg {...p}>
    <G d="M5 6.5h14v4H5z" />
    <path d={BUBBLE} />
    <path d="M6.5 10.5h11" className="ico-move" />
  </Svg>
);
export const IconService = (p: IconProps) => (
  <Svg {...p}>
    <G d="M5 16a7 7 0 0 1 14 0z" />
    <path d="M5 16.5a7 7 0 0 1 14 0M3 19.5h18M12 9.5V7.5M10.5 7.5h3" />
    <path d="M17.6 5.6a3.5 3.5 0 0 1 1.6 2.6" className="ico-move" />
  </Svg>
);
export const IconClean = (p: IconProps) => (
  <Svg {...p}>
    <G d="M6.5 14.5a5.5 5.5 0 0 0 11 0z" />
    <path d="M12 3.5c3 3.6 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.9 6-10.5z" />
    <path d="M9.2 15.6l1.8-1.8" className="ico-move" />
  </Svg>
);
export const IconFood = (p: IconProps) => (
  <Svg {...p}>
    <G d="M6.5 15.5a5.5 1.8 0 1 0 11 0 5.5 1.8 0 1 0-11 0z" />
    <ellipse cx="12" cy="16" rx="9" ry="3.5" />
    <ellipse cx="12" cy="16" rx="5.5" ry="1.8" />
    <g className="ico-move">
      <path d="M8.5 10.5c-.9-1.1.9-1.9 0-3.2M12 10.5c-.9-1.1.9-1.9 0-3.2M15.5 10.5c-.9-1.1.9-1.9 0-3.2" />
    </g>
  </Svg>
);
export const IconStaff = (p: IconProps) => (
  <Svg {...p}>
    <G d="M10.5 17.5h3v2.5h-3z" />
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20.5v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M10 14.5l2 3 2-3" />
    <rect x="10.5" y="17.5" width="3" height="2.5" rx=".6" className="ico-move" />
  </Svg>
);
export const IconPrice = (p: IconProps) => (
  <Svg {...p}>
    <G d="M3 13h4a2 2 0 0 1-4 0z" />
    <path d="M12 4v16M8.5 20h7M5 7h14M3 13l2-6 2 6M17 13l2-6 2 6M3 13a2 2 0 0 0 4 0M17 13a2 2 0 0 0 4 0" />
    <circle cx="5" cy="10.6" r="1.1" />
    <path className="ico-move" strokeWidth="1.1" d="M19 9.1l.55 1.1 1.2.18-.87.84.2 1.2L19 11.86l-1.08.56.2-1.2-.87-.84 1.2-.18z" />
  </Svg>
);
export const IconLocation = (p: IconProps) => (
  <Svg {...p}>
    <G d="M8.5 12l2.2-3 1.6 2 1.2-1.4 2 2.4z" />
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <path d="M8.5 12l2.2-3 1.6 2 1.2-1.4 2 2.4" className="ico-move" />
  </Svg>
);
export const IconRoom = (p: IconProps) => (
  <Svg {...p}>
    <G d="M6 9h5v4H6z" />
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <rect x="6" y="9" width="5" height="4" rx="1" />
    <path d="M14 10h4M14 13h2.5" className="ico-move" />
  </Svg>
);
export const IconPool = (p: IconProps) => (
  <Svg {...p}>
    <G d="M3.5 13.5h17V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z" />
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M6 10.5q1.5-1.5 3 0t3 0 3 0 3 0M6 14.5q1.5-1.5 3 0t3 0 3 0 3 0" className="ico-move" />
  </Svg>
);
export const IconOther = (p: IconProps) => (
  <Svg {...p}>
    <G d="M10.5 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0z" />
    <circle cx="5.5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18.5" cy="12" r="1.5" />
  </Svg>
);

/* ---------- Navigatsiya ---------- */
export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <G d="M10 15.5h4v5h-4z" />
    <path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" />
    <path d="M10 20.5v-5h4v5" className="ico-move" />
  </Svg>
);
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <G d="M10.5 5.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L20 20" />
    <path d="M7.6 9.2a3.4 3.4 0 0 1 2.4-2.4" className="ico-move" />
  </Svg>
);
export const IconSaved = (p: IconProps) => (
  <Svg {...p}>
    <G d="M15 4v3h3z" />
    <path d="M6 4h9l3 3v13l-6-4-6 4z" />
    <path d="M15 4v3h3" className="ico-move" />
  </Svg>
);
export const IconProfile = (p: IconProps) => (
  <Svg {...p}>
    <G d="M12 6.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    <circle cx="12" cy="9.5" r="3" />
    <path d="M7 18.5a5 5 0 0 1 10 0" />
    <ellipse cx="12" cy="12.5" rx="10" ry="4.5" transform="rotate(-18 12 12.5)" strokeOpacity=".55" className="ico-move" />
  </Svg>
);
export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <G d="M3 16.5l5-3.5 4 2.5 3-2 2 1.5V20H3z" />
    <rect x="3" y="8" width="14" height="12" rx="2" />
    <path d="M3 16.5l5-3.5 4 2.5 3-2 2 1.5" />
    <path d="M19.5 13V3.5M17 6l2.5-2.5L22 6" className="ico-move" />
  </Svg>
);
export const IconImage = (p: IconProps) => (
  <Svg {...p}>
    <G d="M3 15.5l5-4 4 3 3-2 6 4V19H3z" />
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 15.5l5-4 4 3 3-2 6 4" />
    <circle cx="16" cy="9" r="1.3" className="ico-move" />
  </Svg>
);
export const IconCompareResorts = (p: IconProps) => (
  <Svg {...p}>
    <G d="M3 5h7v14H3z" />
    <rect x="3" y="5" width="7" height="14" rx="2" />
    <rect x="14" y="5" width="7" height="14" rx="2" />
    <path d="M10.5 9.5h3M12.5 8l1.5 1.5-1.5 1.5M13.5 14.5h-3M11.5 13L10 14.5l1.5 1.5" className="ico-move" />
  </Svg>
);
export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <G d="M18 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
    <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" className="ico-move" />
  </Svg>
);
export const IconRecent = (p: IconProps) => (
  <Svg {...p}>
    <G d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.2 4.5V8h3.5" />
    <path d="M12 8v4l3 2" className="ico-move" />
  </Svg>
);
export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <G d="M13 4h7v7h-7z" />
    <rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" className="ico-move" />
  </Svg>
);
export const IconJobs = (p: IconProps) => (
  <Svg {...p}>
    <G d="M12 4l8 4-8 4-8-4z" />
    <path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" />
    <path d="M18.6 2.8a3.2 3.2 0 0 1 2.4 2.6" className="ico-move" />
  </Svg>
);
export const IconModeration = (p: IconProps) => (
  <Svg {...p}>
    <G d="M5 6.5h14v8H5z" />
    <path d={BUBBLE} />
    <path d="M8.8 10.6l2.2 2.2 4.2-4.2" className="ico-move" />
  </Svg>
);
export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <G d="M9 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    <circle cx="9" cy="7.5" r="3" />
    <path d="M3 19.5a6 6 0 0 1 12 0M15.5 4.8a3 3 0 0 1 0 5.4M18 14.2a6 6 0 0 1 3 5.3" className="ico-move" />
  </Svg>
);

/* ---------- Yordamchi ---------- */
export const IconClose = (p: IconProps) => (<Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>);
export const IconBack = (p: IconProps) => (<Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" className="ico-move" /></Svg>);
export const IconArrowRight = (p: IconProps) => (<Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" className="ico-move" /></Svg>);
export const IconChevron = (p: IconProps) => (<Svg {...p}><path d="M9 6l6 6-6 6" className="ico-move" /></Svg>);
export const IconChevronDown = (p: IconProps) => (<Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>);
export const IconFilter = (p: IconProps) => (
  <Svg {...p}><G d="M6.5 5h8v2h-8z" /><path d="M4 6h16M7 12h10M10 18h4" /><circle cx="15" cy="6" r="1.6" fill="var(--bg-0)" className="ico-move" /></Svg>
);
export const IconSort = (p: IconProps) => (<Svg {...p}><path d="M7 20V4M4 7l3-3 3 3M17 4v16M14 17l3 3 3-3" /></Svg>);
export const IconStar = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p}>
    <path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z" fill={filled ? "currentColor" : "none"} />
  </Svg>
);
export const IconRefresh = (p: IconProps) => (
  <Svg {...p}><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1M17.5 3v4h-4M6.5 21v-4h4" /></Svg>
);
export const IconCheck = (p: IconProps) => (<Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>);
export const IconAlert = (p: IconProps) => (
  <Svg {...p}><G d="M12 5.5l6.5 12h-13z" /><path d="M10.3 4.4a2 2 0 0 1 3.4 0l7.4 13A2 2 0 0 1 19.4 20H4.6a2 2 0 0 1-1.7-2.6z" /><path d="M12 9.5v4M12 16.6v.1" /></Svg>
);
export const IconInfo = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.6v.1" /></Svg>
);
export const IconSun = (p: IconProps) => (
  <Svg {...p}><G d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" /><circle cx="12" cy="12" r="4" /><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" className="ico-move" /></Svg>
);
export const IconMoon = (p: IconProps) => (
  <Svg {...p}><G d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" /><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" /></Svg>
);
export const IconPlus = (p: IconProps) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const IconTrash = (p: IconProps) => (
  <Svg {...p}><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" /></Svg>
);
export const IconPlay = (p: IconProps) => (<Svg {...p}><G d="M8 5.5l10 6.5-10 6.5z" /><path d="M7.5 5l11 7-11 7z" /></Svg>);
export const IconLogout = (p: IconProps) => (
  <Svg {...p}><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10M16.5 8.5L20 12l-3.5 3.5" /></Svg>
);
export const IconLink = (p: IconProps) => (
  <Svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></Svg>
);
export const IconSend = (p: IconProps) => (
  <Svg {...p}><G d="M4 11l16-7-5 16z" /><path d="M20.5 3.5L3.5 10.5l7 3 3 7zM10.5 13.5l10-10" /></Svg>
);
export const IconEdit = (p: IconProps) => (
  <Svg {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" /></Svg>
);
export const IconSpark = (p: IconProps) => (
  <Svg {...p}><path d="M12 3.5q.9 7.6 8.5 8.5-7.6.9-8.5 8.5-.9-7.6-8.5-8.5 7.6-.9 8.5-8.5z" fill="url(#ig-node)" strokeWidth="1.2" /></Svg>
);

/* ---------- Lokatsiya turlari ---------- */
export const IconMountain = (p: IconProps) => (
  <Svg {...p}>
    <G d="M9 10l4 5H5z" />
    <path d="M3 19.5l6-9.5 4 5.5 2.5-3 5.5 7z" />
    <path d="M7.4 12.5L9 10l1.6 2.2" className="ico-move" />
  </Svg>
);
export const IconSnow = (p: IconProps) => (
  <Svg {...p}>
    <G d="M12 9.5l2.2 1.25v2.5L12 14.5l-2.2-1.25v-2.5z" />
    <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
    <path d="M9.6 4.6L12 7l2.4-2.4M9.6 19.4L12 17l2.4 2.4" className="ico-move" />
  </Svg>
);
export const IconTree = (p: IconProps) => (
  <Svg {...p}>
    <G d="M12 3.5l5 6.5H7z" />
    <path d="M12 3l5.5 7h-3l4 5.5h-13l4-5.5h-3zM12 15.5V21" />
    <path d="M9.5 21h5" className="ico-move" />
  </Svg>
);
export const IconWaterfall = (p: IconProps) => (
  <Svg {...p}>
    <G d="M3 17.5q2-1.5 4.5 0t4.5 0 4.5 0 4.5 0V21H3z" />
    <path d="M3.5 4h11a2 2 0 0 1 2 2v3" />
    <path d="M8 4v10M11.5 4v9M15 9v5" className="ico-move" />
    <path d="M3 18q2-1.5 4.5 0t4.5 0 4.5 0 4.5 0" />
  </Svg>
);

/** Lokatsiya turi → ikonka */
export const locationIcon = {
  mountain: IconMountain,
  snow: IconSnow,
  green: IconTree,
  water: IconWaterfall,
} as const;

/** Mavzu → ikonka */
export const topicIcon: Record<Topic, (p: IconProps) => React.JSX.Element> = {
  cleanliness: IconClean,
  food: IconFood,
  service: IconService,
  staff: IconStaff,
  price: IconPrice,
  location: IconLocation,
  room: IconRoom,
  pool: IconPool,
  safety: IconSafety,
  other: IconOther,
};

/** Ko‘rsatkich → ikonka */
export const metricIcon = {
  reliability: IconReliability,
  service: IconService,
  cleanliness: IconClean,
  staff: IconStaff,
  food: IconFood,
  price: IconPrice,
  ad_match: IconAdMatch,
} as const;

/** Logo: lupa + barg — linza barg shaklidagi shisha tomchi, ichida AI tuguni */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3EE0B0" />
          <stop offset="1" stopColor="#0E7D60" />
        </linearGradient>
        <linearGradient id="lm-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="1" stopColor="#DFFBEF" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lm-bg)" />
      <rect x=".75" y=".75" width="38.5" height="38.5" rx="11.25" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <path d="M11 24.5C11 15.5 17.5 9.5 28.5 9.5c0 11-6 17.5-15 17.5a2.5 2.5 0 0 1-2.5-2.5z" fill="url(#lm-leaf)" />
      <path d="M13.2 25.3C16.5 20 20.5 16 25.5 12.8" stroke="#0E7D60" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M12.2 26.8L8 31" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="21" cy="18.5" r="2.4" fill="url(#ig-node)" stroke="#fff" strokeWidth=".8" />
    </svg>
  );
}
