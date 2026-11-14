const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_JD_LENGTH = 16000;

const elements = {
  fileInput: document.getElementById("resume-file"),
  dropzone: document.getElementById("dropzone"),
  fileStatus: document.getElementById("file-status"),
  jobDescription: document.getElementById("job-description"),
  charCount: document.getElementById("char-count"),
  error: document.getElementById("form-error"),
  analyze: document.getElementById("analyze-button"),
  sample: document.getElementById("sample-button"),
  results: document.getElementById("results"),
  reset: document.getElementById("reset-button"),
};

let resumeText = "";
let selectedFile = null;
let uploadVersion = 0;

const stopWords = new Set(
  `a an and are as at be been being by can could did do does for from had has have he her here him his how i if in into is it its may me might more most must my no not of on or our out over she should so some such than that the their them then there these they this those through to under up us was we were what when where which who will with would you your able across also among another any around based both build built capable common create created current develop developed using use used including include work worked working position team teams strong excellent good knowledge required preferred ability plus ideal candidate candidates join support system systems.`.split(
    " ",
  ),
);

const categoryDefinitions = [
  {
    name: "Core skills",
    terms: new Set(
      `python javascript typescript java csharp golang rust sql nosql postgresql mysql mongodb redis html css react angular vue node aws azure gcp docker kubernetes terraform graphql api apis git github linux tableau powerbi looker excel pandas numpy spark airflow dbt machine learning ai analytics analysis data design testing test automation selenium playwright jest agile scrum skill`.split(
        " ",
      ),
    ),
  },
  {
    name: "Experience",
    terms: new Set(
      `experience leadership led lead managed mentor mentoring ownership owned delivered delivery launched launch implemented implementation improved improvement scaled scaling built designed developed collaborated collaboration crossfunctional stakeholder stakeholders customers client clients strategy strategic production enterprise startup`.split(
        " ",
      ),
    ),
  },
  {
    name: "Qualifications",
    terms: new Set(
      `bachelor bachelors degree master masters phd certification certified certificate graduate postgraduate diploma equivalent education academic computer science engineering mathematics statistics`.split(
        " ",
      ),
    ),
  },
  { name: "Role language", terms: null },
];

const sampleResume = `Product and Data Analyst with 5 years of experience turning complex data into practical product decisions. Skilled in SQL, Python, Tableau, Looker, Excel, A/B testing, and dashboard development.

At Northstar, partnered with product, design, and engineering teams to build self-serve analytics and a reliable KPI framework. Designed experiments that improved activation by 18%, automated weekly reporting with Python, and presented findings to senior stakeholders.

Previously supported customer research and product launches at a growing SaaS company. Comfortable working in Agile teams, documenting requirements, and translating ambiguous questions into measurable outcomes. B.S. in Statistics.`;

const sampleJob = `Product Analyst

We are looking for a Product Analyst to help our product teams make evidence-based decisions. You will work closely with product managers, design, and engineering to define success metrics and uncover opportunities through data.

Responsibilities:
- Analyze product usage and customer behavior using SQL and Python.
- Build dashboards and self-service reporting in Tableau or Looker.
- Design and evaluate A/B tests and experiments; communicate clear recommendations to stakeholders.
- Partner with cross-functional teams to define KPIs and improve activation and retention.
- Automate data workflows and improve the reliability of product analytics.

Qualifications:
- 3+ years of experience in product analytics, data analytics, or a related role.
- Bachelor's degree in statistics, mathematics, computer science, or equivalent experience.
- Strong SQL and Python skills; experience with a BI tool such as Tableau or Looker.
- Familiarity with experimentation, Agile ways of working, and customer research.
- Clear written and verbal communication; experience presenting insights to senior leaders.
- Experience with dbt, Snowflake, and SaaS products is a plus.`;

function normalizeWord(word) {
  const lower = word.toLowerCase();
  if (lower.length > 4 && lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss")) {
    return lower.slice(0, -1);
  }
  return lower;
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.-]{1,}/g) || [])
    .map(normalizeWord)
    .filter((word) => !stopWords.has(word) && !/^\d+$/.test(word));
}

function showFileMessage(message, type = "error") {
  elements.fileStatus.className = `file-status ${type}`;
  elements.fileStatus.textContent = message;
}

function renderFileStatus(file) {
  elements.fileStatus.className = "file-status";
  elements.fileStatus.replaceChildren();

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✓";

  const name = document.createElement("span");
  name.className = "file-name";
  name.textContent = file ? file.name : "Sample resume";

  const detail = document.createElement("span");
  detail.className = "file-size";
  detail.textContent = file ? formatFileSize(file.size) : "Ready";

  const remove = document.createElement("button");
  remove.className = "remove-file";
  remove.type = "button";
  remove.setAttribute("aria-label", "Remove resume");
  remove.textContent = "×";
  remove.addEventListener("click", (event) => {
    event.stopPropagation();
    clearResume();
  });

  elements.fileStatus.append(icon, name, detail, remove);
}

function formatFileSize(size) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function extractText(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  const data = await file.arrayBuffer();

  if (extension === "pdf") {
    if (!window.pdfjsLib) {
      throw new Error("PDF reader couldn't load. Check your internet connection and try again.");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf = await window.pdfjsLib.getDocument({ data }).promise;
    const pageTexts = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item) => item.str).join(" "));
    }
    return pageTexts.join("\n");
  }

  if (extension === "docx") {
    if (!window.mammoth) {
      throw new Error("Word reader couldn't load. Check your internet connection and try again.");
    }
    const result = await window.mammoth.extractRawText({ arrayBuffer: data });
    return result.value;
  }

  throw new Error("Please choose a PDF or DOCX file.");
}

async function loadResume(file) {
  const version = ++uploadVersion;
  selectedFile = null;
  resumeText = "";
  elements.results.hidden = true;
  elements.error.textContent = "";

  const extension = file.name.split(".").pop().toLowerCase();
  if (!["pdf", "docx"].includes(extension)) {
    showFileMessage("That file type isn’t supported. Choose a PDF or DOCX.");
    elements.fileInput.value = "";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    showFileMessage("This file is larger than 10 MB. Choose a smaller resume.");
    elements.fileInput.value = "";
    return;
  }
  if (file.size === 0) {
    showFileMessage("That file is empty. Choose another resume.");
    elements.fileInput.value = "";
    return;
  }

  elements.fileStatus.className = "file-status";
  elements.fileStatus.textContent = "Reading your resume on this device…";

  try {
    const extracted = await extractText(file);
    if (version !== uploadVersion) return;
    if (!extracted.trim()) {
      throw new Error(
        "No text was found. If this is a scanned PDF, save it with selectable text and try again.",
      );
    }
    resumeText = extracted;
    selectedFile = file;
    renderFileStatus(file);
  } catch (error) {
    if (version !== uploadVersion) return;
    resumeText = "";
    selectedFile = null;
    showFileMessage(error.message || "We couldn’t read that file. Try another PDF or DOCX.");
  }
}

function clearResume() {
  uploadVersion += 1;
  resumeText = "";
  selectedFile = null;
  elements.fileInput.value = "";
  elements.fileStatus.className = "file-status";
  elements.fileStatus.replaceChildren();
  elements.results.hidden = true;
}

function renderTags(containerId, terms, className = "") {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  if (className) container.classList.add(className);
  terms.forEach((term) => {
    const tag = document.createElement("span");
    tag.className = "term-tag";
    tag.textContent = term;
    container.append(tag);
  });
  return container;
}

function renderCategories(jdTerms, resumeTerms) {
  const container = document.getElementById("category-bars");
  container.replaceChildren();
  const assigned = new Set(
    categoryDefinitions
      .filter((category) => category.terms)
      .flatMap((category) => Array.from(category.terms)),
  );
  const groups = categoryDefinitions.map(({ name, terms }) => {
    const inGroup = terms ? jdTerms.filter((term) => terms.has(term)) : [];
    const termsForCategory = terms
      ? inGroup
      : jdTerms.filter((term) => !assigned.has(term));
    const score = termsForCategory.length
      ? Math.round(
          (termsForCategory.filter((term) => resumeTerms.has(term)).length /
            termsForCategory.length) *
            100,
        )
      : null;
    return { name, score };
  });

  groups.forEach(({ name, score }) => {
    const item = document.createElement("div");
    item.className = "category-item";
    const label = document.createElement("div");
    label.className = "category-label";
    const nameElement = document.createElement("span");
    nameElement.textContent = name;
    const value = document.createElement("span");
    value.textContent = score === null ? "—" : `${score}%`;
    if (score === null) value.className = "category-empty";
    label.append(nameElement, value);

    const track = document.createElement("div");
    track.className = "category-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `${name} match`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    if (score === null) {
      track.setAttribute("aria-valuetext", "No terms in this category");
    } else {
      track.setAttribute("aria-valuenow", String(score));
    }
    const fill = document.createElement("div");
    fill.className = "category-fill";
    fill.style.width = `${score || 0}%`;
    track.append(fill);
    item.append(label, track);
    container.append(item);
  });
}

function compareResume() {
  const jobText = elements.jobDescription.value.trim();
  if (!resumeText) {
    elements.error.textContent = "Add a readable PDF or DOCX resume first.";
    elements.dropzone.focus();
    return;
  }
  if (jobText.length < 40) {
    elements.error.textContent = "Paste a little more of the job description to get a useful match.";
    elements.jobDescription.focus();
    return;
  }

  elements.error.textContent = "";
  const jdTerms = [...new Set(tokenize(jobText))];
  const resumeTerms = new Set(tokenize(resumeText));
  if (!jdTerms.length) {
    elements.error.textContent = "We couldn’t find enough readable terms in that job description.";
    return;
  }

  const matched = jdTerms.filter((term) => resumeTerms.has(term));
  const missing = jdTerms.filter((term) => !resumeTerms.has(term));
  const score = Math.round((matched.length / jdTerms.length) * 100);
  const overallScore = document.getElementById("overall-score");
  overallScore.textContent = score;
  document.getElementById("score-ring").style.setProperty(
    "--score-angle",
    `${score * 3.6}deg`,
  );
  document.getElementById("score-label").textContent =
    score >= 70 ? "Strong alignment" : score >= 45 ? "A promising start" : "Room to strengthen";
  document.getElementById("matched-count").innerHTML =
    `${matched.length}<span> / ${jdTerms.length}</span>`;
  document.getElementById("gap-count").textContent = missing.length;
  document.getElementById("results-summary").textContent =
    `${selectedFile ? selectedFile.name : "Your sample resume"} compared with the job description · ${jdTerms.length} distinct terms reviewed`;

  const strengthTags = renderTags("strength-tags", matched.slice(0, 10));
  const gapTags = renderTags("gap-tags", missing.slice(0, 10), "gap-tags");
  document.getElementById("strength-empty").hidden = strengthTags.childElementCount > 0;
  document.getElementById("gap-empty").hidden = gapTags.childElementCount > 0;
  renderCategories(jdTerms, resumeTerms);
  elements.results.hidden = false;
  elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
}

elements.fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) loadResume(file);
});

elements.dropzone.addEventListener("click", (event) => {
  if (event.target.closest(".remove-file")) return;
  elements.fileInput.click();
});

elements.dropzone.addEventListener("keydown", (event) => {
  if (event.target !== elements.dropzone || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  elements.fileInput.click();
});

elements.dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.dropzone.classList.add("drag-over");
});
elements.dropzone.addEventListener("dragleave", (event) => {
  if (!elements.dropzone.contains(event.relatedTarget)) {
    elements.dropzone.classList.remove("drag-over");
  }
});
elements.dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  elements.dropzone.classList.remove("drag-over");
  const [file] = event.dataTransfer.files;
  if (file) loadResume(file);
});

elements.jobDescription.addEventListener("input", () => {
  elements.charCount.textContent = elements.jobDescription.value.length;
  elements.error.textContent = "";
  elements.results.hidden = true;
});

elements.analyze.addEventListener("click", compareResume);
elements.sample.addEventListener("click", () => {
  uploadVersion += 1;
  resumeText = sampleResume;
  selectedFile = null;
  elements.fileInput.value = "";
  elements.jobDescription.value = sampleJob;
  elements.charCount.textContent = sampleJob.length;
  elements.error.textContent = "";
  renderFileStatus(null);
  compareResume();
});
elements.reset.addEventListener("click", () => {
  clearResume();
  elements.jobDescription.value = "";
  elements.charCount.textContent = "0";
  elements.error.textContent = "";
  elements.jobDescription.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
