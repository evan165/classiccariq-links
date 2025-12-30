import { OG_LAYOUT_MAP, OG_RENDER_RULES, type OgInput, type LayoutBlock, type TextStyle } from "./layout-map";

const DEFAULT_LOGO_URL = "https://links.classiccariq.com/classic-car-iq-square.png";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function resolveText(input: OgInput, from: any, fallback: string) {
  const v = (input as any)[from];
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

function applyTextStyle(style: TextStyle): React.CSSProperties {
  return {
    fontSize: style.size,
    fontWeight: style.weight,
    opacity: style.opacity ?? 1,
    lineHeight: style.lineHeight ?? 1.1,
    letterSpacing: style.tracking ?? 0,
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // next/og supports WebKit line clamp via these properties    WebkitLineClamp: style.maxLines ?? 1,
    WebkitBoxOrient: "vertical" as any,
    whiteSpace: "normal",
  };
}

function renderBlock(block: LayoutBlock, input: OgInput) {
  switch (block.kind) {
    case "logo": {
      const src = input.logoUrl || DEFAULT_LOGO_URL;
      const radius = block.shape === "square" ? OG_RENDER_RULES.logo.cornerRadius : block.size / 2;
      return (
        <img
          key={`logo-${block.x}-${block.y}`}
          src={src}
          width={block.size}
          height={block.size}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            borderRadius: radius,
          }}
        />
      );
    }

    case "title": {
      const text = resolveText(input, block.from, block.fallback);
      return (
        <div
          key={`title-${block.x}-${block.y}`}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            width: block.w,
            ...applyTextStyle(block.style),
          }}
        >
          {text}
        </div>
      );
    }

    case "headline": {
      const text = resolveText(input, block.from, block.fallback);
      return (
        <div
          key={`headline-${block.x}-${block.y}`}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            width: block.w,
            ...applyTextStyle(block.style),
          }}
        >
          {text}
        </div>
      );
    }

    case "subtitle": {
      const text =
        resolveText(input, block.from, (block.fallback ?? "").toString()) || (block.fallback ?? "");
      return (
        <div
          key={`subtitle-${block.x}-${block.y}`}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            width: block.w,
            ...applyTextStyle(block.style),
          }}
        >
          {text}
        </div>
      );
    }

    // Not used for invite yet (we'll implement next)
    case "pill":
    case "avatars":
    case "stats":
      return null;

    default:
      return null;
  }
}

export function renderOg(input: OgInput) {
  const variant = input.variant;
  const spec = OG_LAYOUT_MAP[variant];

  const bgDim = clamp(input.backgroundDim ?? spec.background.dim, 0, 1);
  const backgroundColor = spec.background.color;

  const merged: OgInput = {
    ...spec.defaults,
    ...input,
    logoSize: input.logoSize ?? spec.defaults.logoSize ?? OG_RENDER_RULES.logo.defaultSize,
  };

  return (
    <div
      style={{
        width: spec.width,
        height: spec.height,
        background: backgroundColor,
        color: OG_RENDER_RULES.colors.text,
        fontFamily: spec.fontFamily,
        position: "relative",
      }}
    >
      {/* simple dim overlay (kept for future background images) */}
      {bgDim > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${bgDim})`,
          }}
        />
      ) : null}

      {spec.blocks.map((b) => renderBlock(b, merged))}
    </div>
  );
}
