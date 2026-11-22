import Icon from "./Icon.jsx";

const MAX_LENGTH = 16000;

export default function JobDescriptionInput({ value, onChange }) {
  return (
    <section className="input-card job-card" aria-labelledby="job-heading">
      <div className="card-heading">
        <div className="heading-icon job-icon"><Icon name="job" /></div>
        <div>
          <h2 id="job-heading">The job description</h2>
          <p>Paste the role you have your eye on</p>
        </div>
        <span className="card-count">02</span>
      </div>
      <div className="jd-wrap">
        <label className="sr-only" htmlFor="job-description">Paste the job description</label>
        <textarea
          id="job-description"
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(event) => onChange(event.target.value)}
          placeholder={"Paste the job description here…\n\nInclude the responsibilities, qualifications, and skills so we can give you the most useful comparison."}
          spellCheck="true"
        />
        <div className="textarea-footer">
          <span>The more detail, the better your match.</span>
          <span><b>{value.length}</b> / {MAX_LENGTH.toLocaleString()}</span>
        </div>
      </div>
      <div className="job-tip"><span aria-hidden="true">✦</span> Tip: include the full posting, not just the title.</div>
    </section>
  );
}
