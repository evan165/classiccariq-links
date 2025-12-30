/**
 * OG Layout Map (6 variants)
 * - This file is pure config + types (no Next/React imports)
 * - Renderer can consume this to produce images consistently.
 */

export type OgVariant =
  | "invite"
  | "rematch"
  | "daily"
  | "result"
  | "profile"
  | "app"
  | "generic";

export type OgTheme = "dark";

export type OgInput = {
  variant: OgVariant;

  // Shared
  theme?: OgTheme; // default: "dark"
  brandName?: string; // default: "Classic Car IQ"
  subtitle?: string; // short helper line
  cta?: string; // primary action line
  logoUrl?: string; // optional (prefer square logo)
  logoSize?: number; // px, default 96
  backgroundUrl?: string; // optional backdrop
  backgroundBlur?: number; // default 0
  backgroundDim?: number; // 0..1 default 0.35

  // Invite / Rematch
  opponentName?: string; // e.g. "Evan"
  opponentAvatarUrl?: string;
  challengerName?: string; // e.g. "Mike"
  challengerAvatarUrl?: string;

  // Result Matchup
  challengerScore?: string; // e.g. "9/10"
  challengerTime?: string; // e.g. "26s"
  opponentScore?: string;   // e.g. "8/10"
  opponentTime?: string;   // e.g. "31s"
  winner?: "challenger" | "opponent";

  // Daily IQ
  question?: string; // the daily question text
  category?: string; // e.g. "Engines"
  difficulty?: 1 | 2 | 3 | 4 | 5;
  dayLabel?: string; // e.g. "Daily IQ"

  // Profile / Result
  username?: string;
  avatarUrl?: string;
  statPrimaryLabel?: string; // e.g. "Daily Streak"
  statPrimaryValue?: string; // e.g. "17"
  statSecondaryLabel?: string; // e.g. "Best IQ"
  statSecondaryValue?: string; // e.g. "186"

  // Generic/App
  headline?: string; // big headline
  subhead?: string; // secondary line
};

export type TextStyle = {
  size: number; // px
  weight: 400 | 500 | 600 | 700 | 800 | 900;
  opacity?: number; // 0..1
  lineHeight?: number; // multiplier
  tracking?: number; // px letterSpacing
  maxLines?: number;
};

export type LayoutBlock =
  | {
      kind: "logo";
      x: number;
      y: number;
      size: number;
      shape: "square" | "circle";
    }
  | {
      kind: "title";
      x: number;
      y: number;
      w: number;
      style: TextStyle;
      from: "brandName" | "headline" | "dayLabel";
      fallback: string;
    }
  | {
      kind: "headline";
      x: number;
      y: number;
      w: number;
      style: TextStyle;
      from: "cta" | "question" | "headline" | "subtitle" | "subhead" | "category" | "dayLabel" | "brandName";
      fallback: string;
    }
  | {
      kind: "subtitle";
      x: number;
      y: number;
      w: number;
      style: TextStyle;
      from: "subtitle" | "subhead" | "category" | "dayLabel" | "cta";
      fallback?: string;
    }
  | {
      kind: "pill";
      x: number;
      y: number;
      labelFrom: "category" | "dayLabel";
      valueFrom?: "difficulty";
    }
    | {
        kind: "avatars";
        x: number;
        y: number;
        size: number;
        gap: number;
        leftFrom: "challengerAvatarUrl" | "avatarUrl";
        rightFrom: "opponentAvatarUrl";
        leftLabelFrom?: "challengerName" | "username";
        rightLabelFrom?: "opponentName";
      }

    | {
        kind: "matchup";
      x: number;
      y: number;
      size: number;
      gap: number;
      leftFrom: "challengerAvatarUrl";
      rightFrom: "opponentAvatarUrl";
      leftLabelFrom: "challengerName";
      rightLabelFrom: "opponentName";
      leftScoreFrom: "challengerScore";
      leftTimeFrom: "challengerTime";
      rightScoreFrom: "opponentScore";
      rightTimeFrom: "opponentTime";
      winnerFrom: "winner";
    }
  | {
      kind: "stats";
      x: number;
      y: number;
      w: number;
      items: Array<{
        labelFrom: "statPrimaryLabel" | "statSecondaryLabel";
        valueFrom: "statPrimaryValue" | "statSecondaryValue";
      }>;
    };

export type LayoutSpec = {
  width: 1200;
  height: 630;
  padding: number;

  // Background defaults
  background: {
    color: string; // base fill
    dim: number; // overlay opacity 0..1
    blur: number; // px
  };

  // Global font (renderer can map to system font stack)
  fontFamily: string;

  // Variant blocks
  blocks: LayoutBlock[];

  // Copy defaults (used when input fields are missing)
  defaults: Partial<OgInput>;
};

/**
 * Copy + hierarchy rules (human-readable, but structured)
 * Renderer should apply truncation, fallbacks, and safe typography.
 */
export const OG_RENDER_RULES = {
  canvas: { width: 1200, height: 630 },
  safeArea: { padding: 64 },
  truncation: {
    titleMaxLines: 1,
    subtitleMaxLines: 2,
    headlineMaxLines: 3,
    questionMaxLines: 4,
    ellipsis: "…",
  },
  avatars: {
    size: 136,
    shape: "circle" as const,
    ring: { width: 4, opacity: 0.25 },
  },
  logo: {
    defaultSize: 96,
    shape: "square" as const,
    cornerRadius: 24,
  },
  colors: {
    bg: "#0b0b0f",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.85)",
    textFaint: "rgba(255,255,255,0.65)",
    card: "rgba(255,255,255,0.06)",
    stroke: "rgba(255,255,255,0.18)",
  },
};

export const OG_LAYOUT_MAP: Record<OgVariant, LayoutSpec> = {
  invite: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      subtitle: "You’ve been challenged",
      cta: "Tap to open this challenge in the app",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 132, shape: "square" },
      {
        kind: "title",
        x: 220, y: 86, w: 916,
        from: "brandName",
        fallback: "Classic Car IQ",
        style: { size: 42, weight: 700, opacity: 0.92, maxLines: 1 },
      },
      {
        kind: "headline",
        x: 64,
        y: 210,
        w: 1072,
        from: "subtitle",
        fallback: "You’ve been challenged",
        style: { size: 88, weight: 900, lineHeight: 1.04, maxLines: 2 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 332,
        w: 980,
        from: "cta",
        fallback: "Tap to open this challenge in the app",
        style: { size: 45, weight: 600, opacity: 0.85, lineHeight: 1.2, maxLines: 2 },
      },
      {
        kind: "avatars",
        x: 64,
        y: 440,
        size: 136,
        gap: 18,
        leftFrom: "challengerAvatarUrl",
        rightFrom: "opponentAvatarUrl",
        leftLabelFrom: "challengerName",
        rightLabelFrom: "opponentName",
      },
    ],
  },

  rematch: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      subtitle: "Rematch request",
      cta: "Tap to run it back",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 132, shape: "square" },
      {
        kind: "title",
        x: 168,
        y: 78,
        w: 968,
        from: "brandName",
        fallback: "Classic Car IQ",
        style: { size: 42, weight: 700, opacity: 0.92, maxLines: 1 },
      },
      {
        kind: "headline",
        x: 64,
        y: 180,
        w: 1072,
        from: "subtitle",
        fallback: "Rematch request",
        style: { size: 88, weight: 900, lineHeight: 1.04, maxLines: 2 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 332,
        w: 980,
        from: "cta",
        fallback: "Tap to run it back",
        style: { size: 45, weight: 600, opacity: 0.85, lineHeight: 1.2, maxLines: 2 },
      },
      {
        kind: "avatars",
        x: 64,
        y: 440,
        size: 136,
        gap: 18,
        leftFrom: "challengerAvatarUrl",
        rightFrom: "opponentAvatarUrl",
        leftLabelFrom: "challengerName",
        rightLabelFrom: "opponentName",
      },
    ],
  },
  daily: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      subtitle: "Today’s Daily IQ is ready",
      cta: "One shot, every day. Choose wisely.",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 132, shape: "square" },
      {
        kind: "title",
        x: 220, y: 98, w: 916,
        from: "brandName",
        fallback: "Classic Car IQ",
        style: { size: 42, weight: 700, opacity: 0.92, maxLines: 1 },
      },
      {
        kind: "headline",
        x: 64,
        y: 266,
        w: 1072,
        from: "subtitle",
        fallback: "Today’s Daily IQ is ready",
        style: { size: 88, weight: 900, lineHeight: 1.04, maxLines: 2 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 388,
        w: 980,
        from: "cta",
        fallback: "One shot, every day. Choose wisely.",
        style: { size: 45, weight: 600, opacity: 0.85, lineHeight: 1.2, maxLines: 2 },
      },
    ],
  },

  
  profile: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      subtitle: "Player Profile",
      cta: "View stats in the app",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 132, shape: "square" },
      {
        kind: "title",
        x: 168,
        y: 78,
        w: 968,
        from: "brandName",
        fallback: "Classic Car IQ",
        style: { size: 42, weight: 700, opacity: 0.92, maxLines: 1 },
      },
      {
        kind: "avatars",
        x: 64,
        y: 170,
        size: 140,
        gap: 0,
        leftFrom: "avatarUrl",
        rightFrom: "opponentAvatarUrl",
        leftLabelFrom: "username",
      },
      {
        kind: "headline",
        x: 240,
        y: 205,
        w: 880,
        from: "headline",
        fallback: "Player Profile",
        style: { size: 64, weight: 900, lineHeight: 1.05, maxLines: 1 },
      },
      {
        kind: "subtitle",
        x: 240,
        y: 285,
        w: 880,
        from: "cta",
        fallback: "View stats in the app",
        style: { size: 45, weight: 600, opacity: 0.85, maxLines: 1 },
      },
      {
        kind: "stats",
        x: 64,
        y: 390,
        w: 1072,
        items: [
          { labelFrom: "statPrimaryLabel", valueFrom: "statPrimaryValue" },
          { labelFrom: "statSecondaryLabel", valueFrom: "statSecondaryValue" },
        ],
      },
    ],
  },
  result: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      subtitle: "Think you can do better?",
      cta: "Tap to play this challenge in the app",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 132, shape: "square" },
      {
        kind: "title",
        x: 220, y: 98, w: 916,
        from: "brandName",
        fallback: "Classic Car IQ",
        style: { size: 42, weight: 700, opacity: 0.92, maxLines: 1 },
      },
      {
        kind: "headline",
        x: 64,
        y: 230,
        w: 1072,
        from: "subtitle",
        fallback: "Think you can do better?",
        style: { size: 88, weight: 900, lineHeight: 1.04, maxLines: 2 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 352,
        w: 980,
        from: "cta",
        fallback: "Tap to play this challenge in the app",
        style: { size: 45, weight: 600, opacity: 0.85, lineHeight: 1.2, maxLines: 2 },
      },
      {
        kind: "matchup",
        x: 64,
        y: 440,
        size: 136,
        gap: 48,
        leftFrom: "challengerAvatarUrl",
        rightFrom: "opponentAvatarUrl",
        leftLabelFrom: "challengerName",
        rightLabelFrom: "opponentName",
        leftScoreFrom: "challengerScore",
        leftTimeFrom: "challengerTime",
        rightScoreFrom: "opponentScore",
        rightTimeFrom: "opponentTime",
        winnerFrom: "winner",
      },
    ],
  },


  app: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      headline: "Classic Car IQ",
      subhead: "Daily questions • Head-to-head • Streaks",
      cta: "Play now",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 156, shape: "square" },
      {
        kind: "headline",
        x: 64,
        y: 210,
        w: 1072,
        from: "headline",
        fallback: "Classic Car IQ",
        style: { size: 92, weight: 900, lineHeight: 1.0, maxLines: 1 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 320,
        w: 980,
        from: "subhead",
        fallback: "Daily questions • Head-to-head • Streaks",
        style: { size: 34, weight: 600, opacity: 0.85, lineHeight: 1.2, maxLines: 2 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 520,
        w: 980,
        from: "cta",
        fallback: "Play now",
        style: { size: 42, weight: 700, opacity: 0.9, maxLines: 1 },
      },
    ],
  },

  generic: {
    width: 1200,
    height: 630,
    padding: 64,
    fontFamily: "system-ui",
    background: { color: OG_RENDER_RULES.colors.bg, dim: 0.0, blur: 0 },
    defaults: {
      theme: "dark",
      brandName: "Classic Car IQ",
      headline: "Classic Car IQ",
      subhead: "Classic car trivia — built for daily play",
      cta: "Open in app",
    },
    blocks: [
      { kind: "logo", x: 64, y: 64, size: 120, shape: "square" },
      {
        kind: "headline",
        x: 64,
        y: 220,
        w: 1072,
        from: "headline",
        fallback: "Classic Car IQ",
        style: { size: 132, weight: 900, lineHeight: 1.0, maxLines: 1 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 330,
        w: 980,
        from: "subhead",
        fallback: "Classic car trivia — built for daily play",
        style: { size: 34, weight: 600, opacity: 0.85, lineHeight: 1.2, maxLines: 2 },
      },
      {
        kind: "subtitle",
        x: 64,
        y: 520,
        w: 980,
        from: "cta",
        fallback: "Open in app",
        style: { size: 42, weight: 700, opacity: 0.9, maxLines: 1 },
      },
    ],
  },
};

