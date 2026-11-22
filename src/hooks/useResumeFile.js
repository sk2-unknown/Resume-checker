import { useCallback, useRef, useState } from "react";
import { extractResumeText } from "../utils/extractResumeText.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const supportedExtensions = new Set(["pdf", "docx"]);

export function useResumeFile() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);

  const loadFile = useCallback(async (nextFile) => {
    const currentRequest = ++requestId.current;
    setFile(null);
    setText("");
    setIsLoading(false);

    const extension = nextFile.name.split(".").pop().toLowerCase();
    if (!supportedExtensions.has(extension)) {
      setStatus({ type: "error", message: "Choose a PDF or DOCX file." });
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setStatus({ type: "error", message: "This file is larger than 10 MB. Choose a smaller resume." });
      return;
    }
    if (nextFile.size === 0) {
      setStatus({ type: "error", message: "That file is empty. Choose another resume." });
      return;
    }

    setStatus({ type: "loading", message: "Reading your resume on this device…" });
    setIsLoading(true);
    try {
      const extractedText = await extractResumeText(nextFile);
      if (currentRequest !== requestId.current) return;
      if (!extractedText.trim()) {
        throw new Error(
          "No text was found. If this is a scanned PDF, save it with selectable text and try again.",
        );
      }
      setFile(nextFile);
      setText(extractedText);
      setStatus({ type: "success", message: "Resume ready to compare." });
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setFile(null);
      setText("");
      setStatus({
        type: "error",
        message: error.message || "We couldn’t read that file. Try another PDF or DOCX.",
      });
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, []);

  const loadSample = useCallback((sampleText) => {
    requestId.current += 1;
    setFile(null);
    setText(sampleText);
    setIsLoading(false);
    setStatus({ type: "success", message: "Sample resume ready to compare." });
  }, []);

  const clearResume = useCallback(() => {
    requestId.current += 1;
    setFile(null);
    setText("");
    setStatus(null);
    setIsLoading(false);
  }, []);

  return { file, text, status, isLoading, loadFile, loadSample, clearResume };
}
