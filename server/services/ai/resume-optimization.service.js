import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const optimizeResumeForJob = async ({
  resumeAnalysis,
  jobAnalysis,
  jobMatch,
}) => {
  if (!resumeAnalysis) {
    throw new Error("Resume analysis is required for resume optimization.");
  }

  if (!jobAnalysis) {
    throw new Error(
      "Job description analysis is required for resume optimization.",
    );
  }

  if (!jobMatch) {
    throw new Error("Job match analysis is required for resume optimization.");
  }

  const resumeData = JSON.stringify(resumeAnalysis, null, 2);

  const jobData = JSON.stringify(jobAnalysis, null, 2);

  const matchData = JSON.stringify(jobMatch, null, 2);

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `
You are CareerIQ's Resume Optimization Engine.

Your task is to improve a candidate's resume alignment with a specific job description.

IMPORTANT RULES:

- Use ONLY information contained in the provided resume analysis.
- Use the job analysis only to understand what the target job requires.
- Never invent work experience.
- Never invent skills.
- Never invent projects.
- Never invent certifications.
- Never invent education.
- Never invent employers.
- Never invent job titles.
- Never invent achievements.
- Never invent numbers, metrics, percentages, dates, technologies, or responsibilities.
- Never claim the candidate has a skill unless the resume provides evidence for it.
- Never create fake accomplishments.
- Never recommend adding a keyword as if the candidate has that skill.
- If an important skill is missing, clearly identify it instead of fabricating experience.
- Preserve the truth of the original resume.
- Improve clarity, relevance, structure, keyword alignment, and impact only where supported by the source information.
- Recommendations may suggest learning a missing skill, but must not rewrite the resume as though the candidate already has it.

ATS OPTIMIZATION:

- Prefer clear professional wording.
- Use relevant job keywords when the candidate's existing experience supports them.
- Avoid keyword stuffing.
- Keep content concise and readable.
- Do not add irrelevant keywords.
- Do not use tables, graphics, or unusual formatting recommendations.

BULLET POINT OPTIMIZATION:

When improving a bullet point:
- Preserve the original meaning.
- Make the wording clearer and more results-oriented.
- Use action verbs where appropriate.
- Include measurable results only when those results already exist in the resume data.
- Do not manufacture metrics.

SUMMARY OPTIMIZATION:

- Create a stronger professional summary using only facts from the resume.
- Align the summary with the target role.
- Do not claim expertise that is not supported by the resume.

SKILLS OPTIMIZATION:

- Identify skills from the resume that are especially relevant to the target job.
- Do not add unsupported skills.
- Separate supported skills from missing job requirements.

Return ONLY valid JSON matching this exact structure:

{
  "optimizedSummary": "",
  "optimizedSkills": [],
  "optimizedExperience": [
    {
      "original": "",
      "optimized": "",
      "reason": ""
    }
  ],
  "optimizedProjects": [
    {
      "original": "",
      "optimized": "",
      "reason": ""
    }
  ],
  "atsKeywordsAdded": [],
  "missingSkills": [],
  "improvementAreas": [],
  "recommendations": []
}

FIELD RULES:

optimizedSummary:
A rewritten professional summary based only on the candidate's existing information.

optimizedSkills:
Only skills already supported by the resume and relevant to the target job.

optimizedExperience:
Only include experience content that can be improved based on the supplied resume information.
"original" must represent the existing content.
"optimized" must preserve the original factual meaning.
"reason" briefly explains the improvement.

optimizedProjects:
Only include projects supported by the resume.
Do not invent project details.

atsKeywordsAdded:
Only include job-related keywords that are actually supported by the resume and incorporated into the optimization.

missingSkills:
Important job requirements that are not supported by the resume.

improvementAreas:
Specific areas where the resume can better align with the job.

recommendations:
Practical suggestions for improving the candidate's resume or qualifications.
Never recommend falsely claiming experience.

Do not include Markdown.
Do not include code fences.
Do not include explanations outside the JSON.
            `.trim(),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
RESUME ANALYSIS:

${resumeData}

JOB DESCRIPTION ANALYSIS:

${jobData}

JOB MATCH ANALYSIS:

${matchData}
            `.trim(),
          },
        ],
      },
    ],
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("OpenAI returned an empty resume optimization analysis.");
  }

  let optimization;

  try {
    optimization = JSON.parse(outputText);
  } catch (error) {
    console.error("OpenAI resume optimization JSON parsing error:", outputText);

    throw new Error("OpenAI returned an invalid resume optimization format.");
  }

  return optimization;
};

export default optimizeResumeForJob;
