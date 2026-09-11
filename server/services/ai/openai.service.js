import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeResumeWithAI = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is required for AI analysis.");
  }

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `
You are CareerIQ's resume intelligence engine.

Analyze the provided resume carefully.

IMPORTANT RULES:
- Use only information explicitly present in the resume.
- Never invent skills, education, experience, projects, certifications, or achievements.
- If information is missing, return an empty array or null.
- Keep the analysis factual and concise.
- Identify skills, experience, education, projects, and certifications.
- Evaluate ATS compatibility and resume quality.
- Identify strengths, weaknesses, and missing skills.
- Scores must be integers from 0 to 100.

Return ONLY valid JSON matching this structure:

{
  "summary": "short professional summary",
  "skills": [],
  "experience": [],
  "education": [],
  "projects": [],
  "certifications": [],
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "atsScore": 0,
  "keywordScore": 0,
  "impactScore": 0,
  "overallScore": 0
}

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
            text: resumeText,
          },
        ],
      },
    ],
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("OpenAI returned an empty analysis.");
  }

  let analysis;

  try {
    analysis = JSON.parse(outputText);
  } catch (error) {
    console.error("OpenAI JSON parsing error:", outputText);

    throw new Error("OpenAI returned an invalid analysis format.");
  }

  return analysis;
};

export default analyzeResumeWithAI;
