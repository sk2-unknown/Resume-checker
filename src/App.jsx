import { useCallback, useEffect, useRef, useState } from "react";
import HeroSection from "./components/HeroSection.jsx";
import Icon from "./components/Icon.jsx";
import JobDescriptionInput from "./components/JobDescriptionInput.jsx";
import ResumeAnalysisResults from "./components/ResumeAnalysisResults.jsx";
import ResumeUploader from "./components/ResumeUploader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import { sampleJobDescription, sampleResume } from "./data/sampleData.js";
import { useResumeFile } from "./hooks/useResumeFile.js";
import { useResumeMatch } from "./hooks/useResumeMatch.js";

export default function App() {
  const resume = useResumeFile();
  const [jobDescription, setJobDescription] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const { results, error, isAnalyzing, analyze } = useResumeMatch(resume.text, jobDescription);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [results]);

  const loadFile = useCallback((file) => {
    setConsentGiven(false);
    resume.loadFile(file);
  }, [resume.loadFile]);

  function handleJobDescriptionChange(value) {
    setConsentGiven(false);
    setJobDescription(value);
  }

  function handleSample() {
    resume.loadSample(sampleResume);
    setJobDescription(sampleJobDescription);
    setConsentGiven(false);
  }

  function handleReset() {
    resume.clearResume();
    setJobDescription("");
    setConsentGiven(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans text-ink antialiased">
      <SiteHeader />
      <main className="page-shell">
        <HeroSection />
        <section className="workspace" aria-label="Resume comparison">
          <div className="input-grid">
            <ResumeUploader
              file={resume.file}
              status={resume.status}
              onFile={loadFile}
              onClear={() => {
                resume.clearResume();
                setConsentGiven(false);
              }}
            />
            <JobDescriptionInput value={jobDescription} onChange={handleJobDescriptionChange} />
          </div>
          <div className="action-row">
            <button className="sample-button" type="button" onClick={handleSample}>
              <Icon name="plus" size={16} />
              Try a sample
            </button>
            <div className="analyze-wrap">
              {error && <span className="form-error" role="alert">{error}</span>}
              <button
                className="analyze-button"
                type="button"
                onClick={() => analyze(resume.file, resume.text)}
                disabled={resume.isLoading || isAnalyzing || !consentGiven}
              >
                <span>{resume.isLoading ? "Reading resume…" : isAnalyzing ? "Analyzing…" : "See my match"}</span>
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
          <label className="consent-row">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(event) => setConsentGiven(event.target.checked)}
            />
            <span>
              I agree to send my resume and job description to Labd AI for analysis.
              The generated report is saved on this server and is not committed to Git.
            </span>
          </label>
        </section>
        {results && (
          <ResumeAnalysisResults
            results={results}
            resumeName={resume.file?.name || "Sample resume"}
            resultRef={resultsRef}
            onReset={handleReset}
          />
        )}
        <SiteFooter />
      </main>
    </div>
  );
}
