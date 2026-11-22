export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#" aria-label="Matcha home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M7 22.8 14.8 7l3.1 6.2L12 26H8.5a1.7 1.7 0 0 1-1.5-3.2Z" fill="currentColor" />
            <path d="m18.7 13.2 4.1-8.3 7 14a1.7 1.7 0 0 1-1.5 2.5H16.8l1.9-4h5.3l-5.3-4.2Z" fill="currentColor" opacity=".58" />
            <path d="M11.5 25.5h15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
        <span>matcha<span className="brand-period">.</span></span>
      </a>
      <div className="header-note">
        <span className="privacy-dot" />
        Your resume stays on your device
      </div>
    </header>
  );
}
