const stopWords = new Set(
  `a an and are as at be been being by can could did do does for from had has have he her here him his how i if in into is it its may me might more most must my no not of on or our out over she should so some such than that the their them then there these they this those through to under up us was we were what when where which who will with would you your able across also among another any around based both build built capable common create created current develop developed using use used including include work worked working position team teams strong excellent good knowledge required preferred ability plus ideal candidate candidates join support system systems looking help make closely responsibility responsibilities qualification qualifications role related familiar familiarity ways job description.`.split(
    " ",
  ),
);

export const categoryDefinitions = [
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

function normalizeWord(word) {
  const lower = word.toLowerCase();
  if (["analysis", "news", "saas", "series", "species"].includes(lower)) return lower;
  if (lower.length > 4 && lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (
    lower.length > 3 &&
    lower.endsWith("s") &&
    !lower.endsWith("ss") &&
    !lower.endsWith("us") &&
    !lower.endsWith("is")
  ) {
    return lower.slice(0, -1);
  }
  return lower;
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9]*(?:[+#]{1,2}|\.[a-z0-9]+)?/g) || [])
    .map(normalizeWord)
    .filter((word) => word.length > 1 && !stopWords.has(word) && !/^\d+$/.test(word));
}

export function analyzeResumeMatch(resumeText, jobDescription) {
  const jobTerms = [...new Set(tokenize(jobDescription))];
  if (!jobTerms.length) {
    return { error: "We couldn’t find enough readable terms in that job description." };
  }

  const resumeTerms = new Set(tokenize(resumeText));
  const priority = (term) => {
    const categoryIndex = categoryDefinitions.findIndex((category) => category.terms?.has(term));
    return categoryIndex === -1 ? categoryDefinitions.length : categoryIndex;
  };
  const prioritizeTerms = (terms) =>
    terms.sort((first, second) => priority(first) - priority(second));
  const matchedTerms = prioritizeTerms(jobTerms.filter((term) => resumeTerms.has(term)));
  const missingTerms = prioritizeTerms(jobTerms.filter((term) => !resumeTerms.has(term)));

  return {
    score: Math.round((matchedTerms.length / jobTerms.length) * 100),
    jobTermCount: jobTerms.length,
    matchedTerms,
    missingTerms,
    categories: getCategoryScores(jobTerms, resumeTerms),
  };
}

function getCategoryScores(jobTerms, resumeTerms) {
  const categorizedTerms = new Set(
    categoryDefinitions
      .filter((category) => category.terms)
      .flatMap((category) => [...category.terms]),
  );

  return categoryDefinitions.map(({ name, terms }) => {
    const categoryTerms = terms
      ? jobTerms.filter((term) => terms.has(term))
      : jobTerms.filter((term) => !categorizedTerms.has(term));

    return {
      name,
      score: categoryTerms.length
        ? Math.round(
            (categoryTerms.filter((term) => resumeTerms.has(term)).length /
              categoryTerms.length) *
              100,
          )
        : null,
    };
  });
}
