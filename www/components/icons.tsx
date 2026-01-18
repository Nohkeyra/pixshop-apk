
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const BaseSVG: React.FC<{ children: React.ReactNode; className?: string; viewBox?: string; strokeWidth?: number }> = ({ children, className, viewBox = "0 0 24 24", strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox={viewBox} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </BaseSVG>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </BaseSVG>
);

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </BaseSVG>
);

export const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </BaseSVG>
);

export const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 3.7" />
  </BaseSVG>
);

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-5.5-4.5-10-10-10Z" />
    </BaseSVG>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </BaseSVG>
);

export const TypeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </BaseSVG>
);

export const VectorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <rect width="7" height="7" x="2" y="2" rx="1" />
    <rect width="7" height="7" x="15" y="15" rx="1" />
    <path d="M9 5h6" />
    <path d="M5 9v6" />
    <path d="M15 9h-4a2 2 0 0 0-2 2v4" />
  </BaseSVG>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </BaseSVG>
);

export const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </BaseSVG>
);

// Removed SettingsIcon as it is replaced by RinneganIcon
// export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
//     <BaseSVG className={className}>
//       <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
//       <circle cx="12" cy="12" r="3" />
//     </BaseSVG>
// );

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
      <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M3 5h4" />
      <path d="M19 17v4" /><path d="M17 19h4" />
    </BaseSVG>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </BaseSVG>
);

export const StyleExtractorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
    <path d="M12 3v18" />
    <path d="M3 12h18" />
  </BaseSVG>
);

export const EraserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L13 18" />
    <path d="M22 21H7" /><path d="m5 11 9 9" />
  </BaseSVG>
);

export const SlidersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </BaseSVG>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <polyline points="20 6 9 17 4 12" />
  </BaseSVG>
);

export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </BaseSVG>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </BaseSVG>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </BaseSVG>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </BaseSVG>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" /><polyline points="12 7 12 12 16 14" />
  </BaseSVG>
);

export const CompareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M12 21v-3" /><path d="M12 15V9" /><path d="M12 6V3" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    <path d="M3 17h2c2 0 5 1 7 2 2-1 5-2 7-2h2" />
  </BaseSVG>
);

export const ChevronIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <polyline points="6 9 12 15 18 9" />
  </BaseSVG>
);

export const MaximizeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
        <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </BaseSVG>
);

export const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.8 11.8 19 13" />
    <path d="M15 9h0" />
    <path d="M17.8 6.2 19 5" />
    <path d="m3 21 9-9" />
    <path d="M12.2 6.2 11 5" />
  </BaseSVG>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BaseSVG className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </BaseSVG>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </BaseSVG>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </BaseSVG>
);

export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <BaseSVG className={className}>
        <path d="m21 2-2 2" />
        <circle cx="10" cy="14" r="8" />
        <path d="m21 2-3 3" />
        <path d="m15 8 2 2" />
        <path d="m12 5 7-3 3 7-3 7" />
    </BaseSVG>
);

// New Rinnegan Icon for System Config
export const RinneganIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* Outer purple circle */}
        <circle cx="50" cy="50" r="45" fill="#6a0dad" stroke="#a020f0" strokeWidth="2" />
        {/* Inner dark purple circle */}
        <circle cx="50" cy="50" r="30" fill="#300060" stroke="#a020f0" strokeWidth="1.5" />
        {/* Innermost black circle - pupil */}
        <circle cx="50" cy="50" r="10" fill="#000000" />
        
        {/* Concentric rings */}
        <circle cx="50" cy="50" r="25" stroke="#a020f0" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="35" stroke="#a020f0" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="45" stroke="#a020f0" strokeWidth="1.5" />
    </svg>
);
