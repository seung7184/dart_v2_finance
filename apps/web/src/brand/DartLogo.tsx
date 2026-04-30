import type { CSSProperties, HTMLAttributes, SVGProps } from 'react';

type DartLogoIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

type LockupSize = 'sm' | 'md' | 'lg';

type DartLogoLockupProps = HTMLAttributes<HTMLDivElement> & {
  showTagline?: boolean;
  size?: LockupSize;
  iconSize?: number;
};

const LOCKUP_SIZES: Record<LockupSize, { iconSize: number; fontSize: number; gap: number }> = {
  sm: { iconSize: 24, fontSize: 16, gap: 7 },
  md: { iconSize: 42, fontSize: 28, gap: 14 },
  lg: { iconSize: 48, fontSize: 32, gap: 16 },
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
      <rect
        x="3"
        y="3"
        width="62"
        height="62"
        rx="12"
        stroke="currentColor"
        strokeWidth="6"
      />
      <path
        d="M34 20 Q31 34 20 51"
        stroke="currentColor"
        strokeWidth="5.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 20 Q37 34 48 51"
        stroke="currentColor"
        strokeWidth="5.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 35 Q34 40.5 46 35"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.5 20 Q34 13.5 38.5 20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DartLogoLockup({
  showTagline = true,
  size = 'md',
  iconSize,
  style,
  ...props
}: DartLogoLockupProps) {
  const resolvedSize = LOCKUP_SIZES[size];
  const resolvedIconSize = iconSize ?? resolvedSize.iconSize;
  const rootStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: showTagline ? 9 : 0,
    color: 'var(--text-primary)',
    ...style,
  };

  return (
    <div {...props} style={rootStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: resolvedSize.gap,
          color: 'currentColor',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontSize: resolvedSize.fontSize,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          DART
        </span>
        <DartLogoIcon
          width={resolvedIconSize}
          height={resolvedIconSize}
          title="Dart Finance logo"
          style={{ flex: '0 0 auto' }}
        />
        <span
          style={{
            fontSize: resolvedSize.fontSize,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          FINANCE
        </span>
      </div>
      {showTagline ? (
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
      ) : null}
    </div>
  );
}
