import React from 'react';

const Icon = ({ children, className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Activity = (props) => (
  <Icon {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Icon>
);

export const AlertCircle = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

export const Award = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="5" />
    <polyline points="8.5 13 7 21 12 18 17 21 15.5 13" />
  </Icon>
);

export const Briefcase = (props) => (
  <Icon {...props}>
    <rect x="3" y="7" width="18" height="13" rx="2" ry="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </Icon>
);

export const Camera = (props) => (
  <Icon {...props}>
    <rect x="3" y="6" width="18" height="14" rx="2" ry="2" />
    <circle cx="12" cy="13" r="3" />
    <path d="M9 6l1.5-2h3L15 6" />
  </Icon>
);

export const Check = (props) => (
  <Icon {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

export const CheckCircle = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 12 15 17 10" />
  </Icon>
);

export const ChevronLeft = (props) => (
  <Icon {...props}>
    <polyline points="15 18 9 12 15 6" />
  </Icon>
);

export const ChevronRight = (props) => (
  <Icon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export const CreditCard = (props) => (
  <Icon {...props}>
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
  </Icon>
);

export const FileCheck = (props) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 14 11 16 15 12" />
  </Icon>
);

export const FileText = (props) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </Icon>
);

export const Filter = (props) => (
  <Icon {...props}>
    <path d="M4 4h16" />
    <path d="M7 12h10" />
    <path d="M10 20h4" />
  </Icon>
);

export const Layout = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </Icon>
);

export const Linkedin = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="8" y1="11" x2="8" y2="17" />
    <line x1="8" y1="7" x2="8" y2="7" />
    <path d="M12 17v-3a2 2 0 0 1 4 0v3" />
  </Icon>
);

export const Lock = (props) => (
  <Icon {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

export const MapPin = (props) => (
  <Icon {...props}>
    <path d="M21 10c0 5-9 12-9 12S3 15 3 10a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const Menu = (props) => (
  <Icon {...props}>
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </Icon>
);

export const MessageCircle = (props) => (
  <Icon {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-5.4-1.9L3 21l2.9-4.1a8.38 8.38 0 0 1-1.9-5.4 8.5 8.5 0 0 1 3.1-6.6A8.38 8.38 0 0 1 12 3" />
  </Icon>
);

export const Play = (props) => (
  <Icon {...props}>
    <polygon points="6 4 20 12 6 20 6 4" />
  </Icon>
);

export const RefreshCw = (props) => (
  <Icon {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
  </Icon>
);

export const ScanLine = (props) => (
  <Icon {...props}>
    <rect x="3" y="7" width="18" height="10" rx="2" ry="2" />
    <line x1="3" y1="3" x2="7" y2="3" />
    <line x1="17" y1="3" x2="21" y2="3" />
    <line x1="3" y1="21" x2="7" y2="21" />
    <line x1="17" y1="21" x2="21" y2="21" />
  </Icon>
);

export const Search = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

export const Send = (props) => (
  <Icon {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
);

export const Shield = (props) => (
  <Icon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);

export const Star = (props) => (
  <Icon {...props}>
    <polygon points="12 2 15 8.5 22 9 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9 9 8.5 12 2" />
  </Icon>
);

export const TrendingUp = (props) => (
  <Icon {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Icon>
);

export const User = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const X = (props) => (
  <Icon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);
