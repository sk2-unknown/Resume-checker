const paths = {
  resume: (
    <>
      <path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" />
      <path d="M14 4v4h4M8.5 12h7M8.5 15.5h7" />
    </>
  ),
  job: (
    <>
      <rect x="4" y="6.5" width="16" height="13" rx="2" />
      <path d="M9 6.5v-1A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v1M4 11h16m-10 0v1.5h4V11" />
    </>
  ),
  upload: (
    <path d="M12 15V4m0 0L8 8m4-4 4 4M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3" />
  ),
  shield: (
    <>
      <path d="M10 2.5 3.5 5v4.8c0 3.6 2.5 6.8 6.5 7.7 4-.9 6.5-4.1 6.5-7.7V5L10 2.5Z" />
      <path d="m7.5 10 1.7 1.7 3.5-3.5" />
    </>
  ),
  check: <path d="m4 12.5 5 5L20 6.5" />,
  arrow: <path d="M4 10h12m-5-5 5 5-5 5" />,
  plus: <path d="M10 3v14M3 10h14" />,
  sparkle: (
    <>
      <path d="m12 3.5 1.9 5.5 5.6 1.8-5.6 1.9-1.9 5.6-1.8-5.6-5.7-1.9L10.2 9 12 3.5Z" />
      <path d="m19 15 .9 2.2 2.1.8-2.1.8L19 21l-.8-2.2-2.2-.8 2.2-.8L19 15Z" />
    </>
  ),
  warning: (
    <>
      <path d="M12 8v4.5m0 3h.01M10.2 4.6 2.9 17.2a1.7 1.7 0 0 0 1.5 2.5h15.2a1.7 1.7 0 0 0 1.5-2.5L13.8 4.6a2.1 2.1 0 0 0-3.6 0Z" />
    </>
  ),
  restart: <path d="M3.3 9a6.8 6.8 0 1 1 .8 4.4M3 4v5h5" />,
  match: <path d="M12 3.5v17m-8.5-8.5h17M5.5 5.5l13 13m0-13-13 13" />,
  lock: (
    <>
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = "", filled = false }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
