import { useMemo } from "react";
import Icon from "./Icon.jsx";

function ScoreCard({ score }) {
  const label = score >= 70 ? "Strong alignment" : score >= 45 ? "A promising start" : "Room to strengthen";
  return (
    <article className="score-card overall-card">
      <div className="score-card-label">
        OVERALL MATCH
        <span className="info-dot" title="A keyword overlap estimate, not a hiring prediction.">i</span>
      </div>
      <div className="score-display">
        <div className="score-ring" style={{ "--score-angle": `${score * 3.6}deg` }}>
          <div className="score-ring-inner"><span>{score}</span><small>%</small></div>
        </div>
        <div className="score-verdict"><strong>{label}</strong><span>keyword alignment</span></div>
      </div>
      <div className="score-rule" />
      <p className="score-explainer">An estimate of how closely the terms in your resume align with this job description.</p>
    </article>
  );
}

function StatCard({ icon, iconClass, value, suffix, title, caption }) {
  return (
    <article className="score-card stat-card">
      <span className={`stat-icon ${iconClass}`}><Icon name={icon} /></span>
      <div className="stat-value">{value}{suffix && <span>{suffix}</span>}</div>
      <div className="stat-title">{title}</div>
      <p className="stat-caption">{caption}</p>
    </article>
  );
}

function CategoryScores({ categories }) {
  return (
    <article className="score-card category-card">
      <div className="category-title">Match by category <span>Term coverage within each group</span></div>
      <div className="category-bars">
        {categories.map(({ name, score }) => (
          <div className="category-item" key={name}>
            <div className="category-label">
              <span>{name}</span>
              <span className={score === null ? "category-empty" : ""}>{score === null ? "—" : `${score}%`}</span>
            </div>
            <div
              className="category-track"
              role="progressbar"
              aria-label={`${name} match`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={score === null ? undefined : score}
              aria-valuetext={score === null ? "No terms in this category" : undefined}
            >
              <div className="category-fill" style={{ width: `${score || 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function TermPanel({ title, description, icon, variant, terms, emptyMessage }) {
  return (
    <article className="insight-card">
      <div className="insight-heading">
        <span className={`insight-icon ${variant}-icon`}><Icon name={icon} /></span>
        <div><h3>{title}</h3><p>{description}</p></div>
      </div>
      {terms.length > 0 ? (
        <div className={`tag-list ${variant === "gaps" ? "gap-tags" : ""}`}>
          {terms.slice(0, 10).map((term) => <span className="term-tag" key={term}>{term}</span>)}
        </div>
      ) : (
        <p className="empty-insight">{emptyMessage}</p>
      )}
    </article>
  );
}

export default function ResumeAnalysisResults({ results, resumeName, resultRef, onReset }) {
  const summary = useMemo(
    () => `${resumeName} compared with the job description · ${results.jobTermCount} distinct terms reviewed`,
    [resumeName, results.jobTermCount],
  );

  return (
    <section className="results" aria-labelledby="results-title" ref={resultRef}>
      <div className="results-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR MATCH REPORT</div>
          <h2 id="results-title">Here’s where you stand.</h2>
          <p>{summary}</p>
        </div>
        <button type="button" className="reset-button" onClick={onReset}>
          <Icon name="restart" size={16} />
          Start over
        </button>
      </div>

      <div className="score-grid">
        <ScoreCard score={results.score} />
        <StatCard
          icon="check"
          iconClass="mint-icon"
          value={results.matchedTerms.length}
          suffix={` / ${results.jobTermCount}`}
          title="Relevant terms found"
          caption="From the job description"
        />
        <StatCard
          icon="match"
          iconClass="lavender-icon"
          value={results.missingTerms.length}
          title="Terms to strengthen"
          caption="Worth addressing in your resume"
        />
        <CategoryScores categories={results.categories} />
      </div>

      <div className="insights-grid">
        <TermPanel
          title="What’s already working"
          description="Your resume shows evidence of these terms"
          icon="sparkle"
          variant="strengths"
          terms={results.matchedTerms}
          emptyMessage="No direct term matches found yet. Check for different wording."
        />
        <TermPanel
          title="Potential gaps"
          description="These job terms weren’t found in your resume"
          icon="warning"
          variant="gaps"
          terms={results.missingTerms}
          emptyMessage="All reviewed terms appear in your resume. Make sure they describe your experience accurately."
        />
      </div>
      <article className="ai-report-card">
        <div className="ai-report-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> AI REVIEW</div>
            <h3>Detailed feedback</h3>
          </div>
          <span className="report-id">Report {results.reportId.slice(0, 8)}</span>
        </div>
        <div className="ai-report-content">{results.aiReport}</div>
        <p className="ai-report-meta">
          Generated {new Date(results.createdAt).toLocaleString()}
          {results.credits?.percentLeft != null && ` · ${results.credits.percentLeft}% Labd allowance remaining`}
        </p>
      </article>
      <p className="results-disclaimer">The keyword score is a simple comparison; AI feedback may be imperfect. Neither is an ATS simulation or a prediction of hiring outcomes. Always tailor your resume truthfully to your experience.</p>
    </section>
  );
}
