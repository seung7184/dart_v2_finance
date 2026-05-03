import type { CSSProperties, HTMLAttributes, SVGProps } from 'react';

// ── Glyph variants ────────────────────────────────────────────────────────────
// filled  — filled accent-colored rounded-square + inverse A glyph (sidebar/app chrome)
// outline — stroked rounded-square + A glyph in currentColor (marketing/neutral)
// bare    — A glyph paths only, no container box
type GlyphVariant = 'filled' | 'outline' | 'bare';

type DartGlyphProps = SVGProps<SVGSVGElement> & {
  variant?: GlyphVariant;
  title?: string;
};

// The A/compass glyph: calligraphic humanist A inside a 68×68 coordinate space.
// Left/right legs flare slightly; crossbar forms a soft descending bowl.
// Apex carries a small open loop (calligraphic terminal).
function GlyphPaths({ glyphColor }: { glyphColor: string }) {
  const base = { fill: 'none', stroke: glyphColor, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <>
      {/* Left leg */}
      <path d="M34 20 Q31 34 20 51" {...base} strokeWidth="5.25" />
      {/* Right leg */}
      <path d="M34 20 Q37 34 48 51" {...base} strokeWidth="5.25" />
      {/* Curved crossbar — soft descending bowl */}
      <path d="M22 35 Q34 40.5 46 35" {...base} strokeWidth="5" />
      {/* Apex loop — calligraphic terminal */}
      <path d="M29.5 20 Q34 13.5 38.5 20" {...base} strokeWidth="5" />
    </>
  );
}

// ── DartGlyph ─────────────────────────────────────────────────────────────────
export function DartGlyph({
  variant = 'outline',
  title = 'Dart Finance',
  width = 28,
  height = 28,
  style,
  ...props
}: DartGlyphProps) {
  const glyphColor = variant === 'filled' ? 'var(--text-on-accent)' : 'currentColor';

  return (
    <svg
      viewBox="0 0 68 68"
      width={width}
      height={height}
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {variant === 'filled' && (
        <rect x="3" y="3" width="62" height="62" rx="12" fill="var(--accent-500)" />
      )}
      {variant === 'outline' && (
        <rect x="3" y="3" width="62" height="62" rx="12" stroke="currentColor" strokeWidth="6" />
      )}

      <GlyphPaths glyphColor={glyphColor} />
    </svg>
  );
}

// ── DartIcon ──────────────────────────────────────────────────────────────────
// Icon-only form — use for compact / favicon / avatar contexts.
// Defaults to filled variant for strong product identity at small sizes.
export function DartIcon({
  variant = 'filled',
  size = 28,
  title = 'Dart Finance',
  ...props
}: Omit<DartGlyphProps, 'width' | 'height'> & { size?: number }) {
  return (
    <DartGlyph
      variant={variant}
      width={size}
      height={size}
      title={title}
      {...props}
    />
  );
}

// ── DartLockup ────────────────────────────────────────────────────────────────
// App lockup: icon + wordmark, two layout variants.
//
// variant:
//   app              — filled glyph + "Dart Finance"  (sidebar / product chrome)
//   app-outline      — outline glyph + "Dart Finance" (neutral/card contexts)
//   marketing-outline — "DART" + outline glyph + "FINANCE" ± tagline (marketing / auth)
//
// size: sm | md | lg | xl

type LockupVariant = 'app' | 'app-outline' | 'marketing-outline';
type LockupSize = 'sm' | 'md' | 'lg' | 'xl';

type DartLockupProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LockupVariant;
  size?: LockupSize;
  showTagline?: boolean;
};

const APP_SIZES: Record<LockupSize, { glyphSize: number; fontSize: number; gap: number }> = {
  sm: { glyphSize: 22, fontSize: 13, gap: 8 },
  md: { glyphSize: 28, fontSize: 14, gap: 10 },
  lg: { glyphSize: 36, fontSize: 18, gap: 12 },
  xl: { glyphSize: 48, fontSize: 24, gap: 16 },
};

const MARKETING_SIZES: Record<LockupSize, { glyphSize: number; fontSize: number; gap: number }> = {
  sm: { glyphSize: 24, fontSize: 16, gap: 7 },
  md: { glyphSize: 42, fontSize: 28, gap: 14 },
  lg: { glyphSize: 48, fontSize: 32, gap: 16 },
  xl: { glyphSize: 64, fontSize: 44, gap: 18 },
};

export function DartLockup({
  variant = 'app',
  size = 'md',
  showTagline = false,
  style,
  ...props
}: DartLockupProps) {
  const isMarketing = variant === 'marketing-outline';
  const sizes = isMarketing ? MARKETING_SIZES[size] : APP_SIZES[size];
  const glyphVariant: GlyphVariant = variant === 'app' ? 'filled' : 'outline';

  if (isMarketing) {
    const rootStyle: CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: showTagline ? 9 : 0,
      color: 'var(--text-primary)',
      ...style,
    };
    const wordStyle: CSSProperties = {
      fontSize: sizes.fontSize,
      lineHeight: 1,
      fontWeight: 800,
      letterSpacing: '0.04em',
      fontFamily: 'var(--font-sans)',
      color: 'currentColor',
    };
    return (
      <div {...props} style={rootStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sizes.gap,
            color: 'currentColor',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={wordStyle}>DART</span>
          <DartGlyph
            variant="outline"
            width={sizes.glyphSize}
            height={sizes.glyphSize}
            title="Dart Finance logo"
            style={{ flex: '0 0 auto' }}
          />
          <span style={wordStyle}>FINANCE</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontSize: 11,
              lineHeight: 1.2,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
            }}
          >
            SPEND SAFELY. GROW QUIETLY.
          </div>
        )}
      </div>
    );
  }

  // app and app-outline: horizontal [icon + "Dart Finance"]
  const rootStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
    color: 'var(--text-primary)',
    ...style,
  };
  return (
    <div {...props} style={rootStyle}>
      <DartGlyph
        variant={glyphVariant}
        width={sizes.glyphSize}
        height={sizes.glyphSize}
        title="Dart Finance"
        style={{ flex: '0 0 auto' }}
      />
      <span
        style={{
          fontSize: sizes.fontSize,
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          fontFamily: 'var(--font-sans)',
          color: 'currentColor',
          whiteSpace: 'nowrap',
        }}
      >
        Dart Finance
      </span>
    </div>
  );
}
