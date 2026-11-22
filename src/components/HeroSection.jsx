export default function HeroSection() {
  return (
    <section className="intro">
      <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT ROLE, IN FOCUS</div>
      <h1>A better match<br className="mobile-break" /> starts <span>right here.</span></h1>
      <p>See how your resume lines up with the role. Get a clear score, spot what’s missing, and know what to work on next.</p>
      <div className="step-track" aria-label="Three steps: upload, compare, improve">
        <div className="step-item active"><span className="step-number">1</span> Add your resume</div>
        <span className="step-connector" />
        <div className="step-item"><span className="step-number">2</span> Add the job</div>
        <span className="step-connector" />
        <div className="step-item"><span className="step-number">3</span> Get your match</div>
      </div>
    </section>
  );
}
