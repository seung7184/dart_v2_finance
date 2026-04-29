import type { SVGProps } from 'react';

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
      <rect
        x="2"
        y="2"
        width="64"
        height="64"
        rx="13"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M34 22 Q31.5 35 21 50"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 22 Q36.5 35 47 50"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.15 34.1 Q34 39 44.85 34.1"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 21 Q34 15 38 21"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
