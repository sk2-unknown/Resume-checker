import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeResumeMatch } from "../utils/analyzeResume.js";

export function useResumeMatch(resumeText, jobDescription) {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    requestId.current += 1;
    setResults(null);
    setError("");
    setIsAnalyzing(false);
  }, [resumeText, jobDescription]);

  const analyze = useCallback(async (currentResumeText) => {
    if (!resumeText) {
      setError("Add a readable PDF or DOCX resume first.");
      return false;
    }
    if (jobDescription.trim().length < 40) {
      setError("Paste a little more of the job description to get a useful match.");
      return false;
    }

    const comparison = analyzeResumeMatch(resumeText, jobDescription.trim());
    if (comparison.error) {
      setError(comparison.error);
      return false;
    }

    const currentRequest = ++requestId.current;
    setError("");
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription.trim());
      formData.append("resumeText", currentResumeText);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(95000),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "The analysis request failed.");
      }
      if (currentRequest !== requestId.current) return false;

      setResults({
        ...comparison,
        aiReport: payload.content,
        reportId: payload.reportId,
        createdAt: payload.createdAt,
        credits: payload.credits,
      });
      return true;
    } catch (requestError) {
      if (currentRequest !== requestId.current) return false;
      setError(
        requestError.name === "TimeoutError"
          ? "The analysis took too long. Please try again."
          : requestError.name === "TypeError"
            ? "Could not reach the analysis server. Start it with npm run dev:all and try again."
            : requestError.message || "The analysis request failed.",
      );
      return false;
    } finally {
      if (currentRequest === requestId.current) setIsAnalyzing(false);
    }
  }, [resumeText, jobDescription]);

  return { results, error, isAnalyzing, analyze };
}
