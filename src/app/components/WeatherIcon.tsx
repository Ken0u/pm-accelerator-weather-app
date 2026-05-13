interface WeatherIconProps {
  conditionCode: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isNight?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
};

const Cloud = ({ opacity = 1 }: { opacity?: number }) => (
  <>
    {/* fill */}
    <path
      d="
        M30 68
        C18 68 10 60 10 49
        C10 39 17 31 27 30
        C30 20 39 14 50 14
        C63 14 73 22 76 34
        C85 35 92 43 92 53
        C92 61 87 68 78 68
        Z
      "
      fill="currentColor"
      opacity={opacity * 0.18}
    />

    {/* top cloud outline */}
    <path
      d="
        M30 68
        C18 68 10 60 10 49
        C10 39 17 31 27 30
        C30 20 39 14 50 14
        C63 14 73 22 76 34
        C85 35 92 43 92 53
        C92 61 87 68 78 68
      "
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={opacity}
    />

    {/* soft rounded bottom */}
    <path d="M30 68H78" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity={opacity} />
  </>
);

export default function WeatherIcon({ conditionCode, size = "md", className = "", isNight }: WeatherIconProps) {
  const s = sizeMap[size];

  const iconClass = `${s} ${className}`;

  // THUNDERSTORM 200-299
  if (conditionCode >= 200 && conditionCode < 300) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <Cloud />

        <path d="M50 48 40 66h10l-6 16 20-24H54l6-10Z" fill="currentColor" />

        <path d="M34 74c2-4 2-4 4-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

        <path d="M68 74c2-4 2-4 4-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  // DRIZZLE 300-399
  if (conditionCode >= 300 && conditionCode < 400) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <Cloud />

        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.8">
          <path d="M38 72v6" />
          <path d="M50 76v6" />
          <path d="M62 72v6" />
        </g>
      </svg>
    );
  }

  // RAIN 500-599
  if (conditionCode >= 500 && conditionCode < 600) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <Cloud />

        <g fill="currentColor">
          <path d="M38 70c0 4-3 6-3 9a3 3 0 0 0 6 0c0-3-3-5-3-9Z" />
          <path d="M50 75c0 4-3 6-3 9a3 3 0 0 0 6 0c0-3-3-5-3-9Z" />
          <path d="M62 70c0 4-3 6-3 9a3 3 0 0 0 6 0c0-3-3-5-3-9Z" />
        </g>
      </svg>
    );
  }

  // SNOW 600-699
  if (conditionCode >= 600 && conditionCode < 700) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <Cloud />

        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M38 72v10" />
          <path d="M33 77h10" />

          <path d="M50 72v10" />
          <path d="M45 77h10" />

          <path d="M62 72v10" />
          <path d="M57 77h10" />
        </g>
      </svg>
    );
  }

  // ATMOSPHERE 700-799
  if (conditionCode >= 700 && conditionCode < 800) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8">
          <path d="M20 40h60" />
          <path d="M28 52h44" />
          <path d="M18 64h50" />
        </g>
      </svg>
    );
  }

  // CLEAR NIGHT
  if (conditionCode === 800 && isNight) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <circle cx="52" cy="50" r="24" fill="currentColor" opacity="0.9" />

        <circle cx="62" cy="42" r="24" fill="black" />

        <circle cx="28" cy="30" r="2" fill="currentColor" />
        <circle cx="72" cy="28" r="1.5" fill="currentColor" />
        <circle cx="78" cy="66" r="2" fill="currentColor" />
      </svg>
    );
  }

  // CLEAR DAY
  if (conditionCode === 800) {
    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="18" fill="currentColor" />

        <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
          <path d="M50 10v12" />
          <path d="M50 78v12" />
          <path d="M10 50h12" />
          <path d="M78 50h12" />

          <path d="m22 22 8 8" />
          <path d="m70 70 8 8" />
          <path d="m78 22-8 8" />
          <path d="m30 70-8 8" />
        </g>
      </svg>
    );
  }

  // CLOUDS 801-804
  if (conditionCode >= 801 && conditionCode <= 804) {
    const opacity = conditionCode === 801 ? 0.7 : conditionCode === 802 ? 0.82 : conditionCode === 803 ? 0.9 : 1;

    return (
      <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
        <Cloud opacity={opacity} />

        {conditionCode < 804 && <circle cx="72" cy="30" r="10" fill="currentColor" opacity="0.2" />}
      </svg>
    );
  }

  // FALLBACK
  return (
    <svg viewBox="0 0 100 100" className={iconClass} fill="none" aria-hidden="true">
      <Cloud />
    </svg>
  );
}
