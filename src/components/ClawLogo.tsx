'use client';

export default function ClawLogo({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="64" height="64" rx="14" fill="#1A1A1A" />

      {/* Claw shape — two curved pincers forming an open claw */}
      <g transform="translate(12, 10)">
        {/* Left pincer */}
        <path
          d="M8 8C4 14 2 22 6 30C8 34 12 37 16 38"
          stroke="#C67A25"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 8C12 6 16 8 14 14"
          stroke="#C67A25"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right pincer */}
        <path
          d="M32 8C36 14 38 22 34 30C32 34 28 37 24 38"
          stroke="#C67A25"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M32 8C28 6 24 8 26 14"
          stroke="#C67A25"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body/base connecting the pincers */}
        <path
          d="M16 38C18 40 22 40 24 38"
          stroke="#C67A25"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Small accent dot */}
        <circle cx="20" cy="28" r="2.5" fill="#C67A25" opacity="0.6" />
      </g>
    </svg>
  );
}
