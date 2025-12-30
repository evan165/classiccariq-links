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

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase();
}

function applyTextStyle(style: TextStyle): React.CSSProperties {
  return {
    fontSize: style.size,
    fontWeight: style.weight,
    opacity: style.opacity ?? 1,
    lineHeight: style.lineHeight ?? 1.25,
    letterSpacing: style.tracking ?? 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: style.maxLines ?? 1,
    WebkitBoxOrient: "vertical" as any,
    whiteSpace: "normal",
  };
}

function Avatar({
  x,
  y,
  size,
  src,
  label,
}: {
  x: number;
  y: number;
  size: number;
  src?: string;
  label?: string;
}) {
  const ringW = OG_RENDER_RULES.avatars.ring.width;
  const ringOpacity = OG_RENDER_RULES.avatars.ring.opacity;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        border: `${ringW}px solid rgba(255,255,255,${ringOpacity})`,
        background: "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src ? (
        <img src={src} width={size} height={size} style={{ objectFit: "cover" }} />
      ) : (
        <div style={{ fontSize: Math.floor(size * 0.34), fontWeight: 900, opacity: 0.9 }}>
          {initials(label)}
        </div>
      )}
    </div>
  );
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
            color: OG_RENDER_RULES.colors.text,
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
            color: OG_RENDER_RULES.colors.text,
            ...applyTextStyle(block.style),
          }}
        >
          {text}
        </div>
      );
    }

    case "subtitle": {
      const text = resolveText(input, block.from, block.fallback ?? "");
      return (
        <div
          key={`subtitle-${block.x}-${block.y}`}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            width: block.w,
            color: OG_RENDER_RULES.colors.textMuted,
            ...applyTextStyle(block.style),
          }}
        >
          {text}
        </div>
      );
    }

    case "pill": {
      const label = resolveText(input, block.labelFrom, "");
      const diff = (block.valueFrom ? (input as any)[block.valueFrom] : undefined) as number | undefined;
      const show = (label && label.length > 0) || (typeof diff === "number" && diff >= 1);
      if (!show) return null;

      const pillText =
        label && typeof diff === "number" ? `${label} • ${"★".repeat(clamp(diff, 1, 5))}` : label || `Difficulty • ${"★".repeat(clamp(diff ?? 1, 1, 5))}`;

      return (
        <div
          key={`pill-${block.x}-${block.y}`}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            padding: "10px 14px",
            borderRadius: 999,
            background: OG_RENDER_RULES.colors.card,
            border: `2px solid ${OG_RENDER_RULES.colors.stroke}`,
            color: OG_RENDER_RULES.colors.textMuted,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 0.2,
            whiteSpace: "nowrap",
          }}
        >
          {pillText}
        </div>
      );
    }

    case "avatars": {
      const leftUrl = (input as any)[block.leftFrom] as string | undefined;
      const rightUrl = (input as any)[block.rightFrom] as string | undefined;

      const leftLabel = block.leftLabelFrom ? ((input as any)[block.leftLabelFrom] as string | undefined) : undefined;
      const rightLabel = block.rightLabelFrom ? ((input as any)[block.rightLabelFrom] as string | undefined) : undefined;

      const size = block.size;
      const gap = block.gap;

      // If only one avatar is relevant (profile), render left only.
      const renderRight = !!rightUrl || !!rightLabel;

      return (
        <div key={`avatars-${block.x}-${block.y}`} style={{ position: "absolute", left: 0, top: 0, display: "flex" }}>
          <Avatar x={block.x} y={block.y} size={size} src={leftUrl} label={leftLabel} />
          {renderRight ? (
            <Avatar x={block.x + size + gap} y={block.y} size={size} src={rightUrl} label={rightLabel} />
          ) : null}

          {/* labels (optional) */}
          {leftLabel ? (
            <div
              style={{
                position: "absolute",
                left: block.x,
                top: block.y + size + 14,
                width: size,
                fontSize: 20,
                fontWeight: 800,
                opacity: 0.85,
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {leftLabel}
            </div>
          ) : null}

          {renderRight && rightLabel ? (
            <div
              style={{
                position: "absolute",
                left: block.x + size + gap,
                top: block.y + size + 14,
                width: size,
                fontSize: 20,
                fontWeight: 800,
                opacity: 0.85,
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {rightLabel}
            </div>
          ) : null}
        </div>
      );
    }

    case "stats": {
      const items = block.items
        .map((it) => {
          const label = resolveText(input, it.labelFrom, "");
          const value = resolveText(input, it.valueFrom, "");
          if (!label || !value) return null;
          return { label, value };
        })
        .filter(Boolean) as Array<{ label: string; value: string }>;

      if (items.length === 0) return null;

      const gap = 20;
      const cardW = Math.floor((block.w - gap * (items.length - 1)) / items.length);
      const cardH = 150;

      return (
        <div key={`stats-${block.x}-${block.y}`} style={{ display: "flex" }}>
          {items.map((it, idx) => (
            <div
              key={`stat-${idx}`}
              style={{
                position: "absolute",
                left: block.x + idx * (cardW + gap),
                top: block.y,
                width: cardW,
                height: cardH,
                borderRadius: 24,
                background: OG_RENDER_RULES.colors.card,
                border: `2px solid ${OG_RENDER_RULES.colors.stroke}`,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, opacity: 0.65, letterSpacing: 0.6 }}>
                {it.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.0 }}>
                {it.value}
              </div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

export function renderOg(input: OgInput) {
  const spec = OG_LAYOUT_MAP[input.variant];
  const bgDim = clamp(input.backgroundDim ?? spec.background.dim, 0, 1);

  const merged: OgInput = {
    ...spec.defaults,
    ...input,
  };

  return (
    <div
      style={{
        width: spec.width,
        height: spec.height,
        background: spec.background.color,
        color: OG_RENDER_RULES.colors.text,
        fontFamily: spec.fontFamily,
        position: "relative",
        display: "flex",
      }}
    >
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
