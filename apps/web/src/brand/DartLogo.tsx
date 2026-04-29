import type { SVGProps, CSSProperties } from 'react';

type DartLogoIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function DartLogoIcon({
  title = 'Dart Finance',
  width = 28,
  height = 28,
  ...props
}: DartLogoIconProps) {
  return (
    <svg
      viewBox="0 0 68 68"
      width={width}
      height={height}
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* Rounded square outline — ink weight matches glyph */}
      <rect
        x="2"
        y="2"
        width="64"
        height="64"
        rx="14"
        stroke="currentColor"
        strokeWidth="4"
      />
      {/* Calligraphic A — left leg, slight outward curve */}
      <path
        d="M34 22 Q31.5 35 21 50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Calligraphic A — right leg, slight outward curve */}
      <path
        d="M34 22 Q36.5 35 47 50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curved crossbar — soft bowl dipping below midline */}
      <path
        d="M23.15 34.1 Q34 39 44.85 34.1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Calligraphic loop above apex — open arc terminal */}
      <path
        d="M30 22 Q34 15.5 38 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LockupSize = 'sm' | 'md' | 'lg';

interface DartLogoLockupProps {
  showTagline?: boolean;
  size?: LockupSize;
  className?: string;
  style?: CSSProperties;
}

const LOCKUP_SIZES: Record<LockupSize, { iconSize: number; fontSize: number; gap: number }> = {
  sm: { iconSize: 24, fontSize: 16, gap: 6 },
  md: { iconSize: 32, fontSize: 22, gap: 10 },
  lg: { iconSize: 40, fontSize: 28, gap: 14 },
};

export function DartLogoLockup({
  showTagline = false,
  size = 'md',
  className,
  style,
}: DartLogoLockupProps) {
  const { iconSize, fontSize, gap } = LOCKUP_SIZES[size];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          DART
        </span>
        <DartLogoIcon
          width={iconSize}
          height={iconSize}
          title="Dart Finance"
          style={{ flexShrink: 0 }}
        />
        <span
          style={{
            fontSize,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          FINANCE
        </span>
      </div>
      {showTagline && (
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            lineHeight: 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          SPEND SAFELY. GROW QUIETLY.
        </span>
      )}
    </div>
  );
}
