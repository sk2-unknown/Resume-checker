import { useRef } from "react";
import { useDropzone } from "../hooks/useDropzone.js";
import Icon from "./Icon.jsx";

function formatFileSize(size) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUploader({
  file,
  status,
  onFile,
  onClear,
}) {
  const fileInput = useRef(null);
  const { isDragging, onDragOver, onDragLeave, onDrop } = useDropzone(onFile);
  const openFilePicker = () => fileInput.current?.click();

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  return (
    <section className="input-card resume-card" aria-labelledby="resume-heading">
      <div className="card-heading">
        <div className="heading-icon resume-icon"><Icon name="resume" /></div>
        <div>
          <h2 id="resume-heading">Your resume</h2>
          <p>Start with the latest version</p>
        </div>
        <span className="card-count">01</span>
      </div>
      <div
        className={`dropzone${isDragging ? " drag-over" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Choose a PDF or DOCX resume, or drop it here"
        onClick={(event) => {
          if (event.target !== fileInput.current) openFilePicker();
        }}
        onKeyDown={handleKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={(event) => {
            const [selectedFile] = event.target.files;
            if (selectedFile) onFile(selectedFile);
            event.target.value = "";
          }}
        />
        <div className="upload-icon"><Icon name="upload" /></div>
        <div className="drop-title">Drop your resume here</div>
        <div className="drop-subtitle">or <span>browse files</span> from your device</div>
        <div className="file-types"><span>PDF</span><span>DOCX</span><span>UP TO 10 MB</span></div>
      </div>
      {status && (
        <div className={`file-status ${status.type}`} role="status" aria-live="polite">
          {status.type === "success" && <span aria-hidden="true">✓</span>}
          <span className="file-name">{file?.name || status.message}</span>
          {file && <span className="file-size">{formatFileSize(file.size)}</span>}
          {status.type === "success" && (
            <button
              className="remove-file"
              type="button"
              aria-label="Remove resume"
              onClick={onClear}
            >
              ×
            </button>
          )}
        </div>
      )}
      <p className="privacy-note">
        <Icon name="shield" size={15} />
        Your file is sent to the analysis server only when you compare
      </p>
    </section>
  );
}
