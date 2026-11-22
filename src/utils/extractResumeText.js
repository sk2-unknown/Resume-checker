export async function extractResumeText(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  const data = await file.arrayBuffer();

  if (extension === "pdf") {
    const [pdfjsLib, worker] = await Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]);
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(" "));
    }
    return pages.join("\n");
  }

  if (extension === "docx") {
    const { default: mammoth } = await import("mammoth/mammoth.browser");
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return result.value;
  }

  throw new Error("Please choose a PDF or DOCX file.");
}
