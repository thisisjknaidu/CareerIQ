import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeJobDescription = async (jobDescription) => {
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("Job description is required for AI analysis.");
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
You are CareerIQ's Job Description Intelligence Engine.

Analyze the provided job description carefully.

IMPORTANT RULES:
- Use only information explicitly present in the job description.
- Never invent requirements, skills, technologies, salary, education, or experience.
- If information is missing, return an empty array.
- Keep the analysis factual and concise.
- Extract important job requirements.
- Identify required skills and technologies.
- Identify responsibilities.
- Identify education requirements.
- Identify experience requirements.
- Identify important keywords.
- Create a concise professional summary.
- Do not evaluate or judge the candidate.
- Do not compare the job against a resume.
            `.trim(),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: jobDescription,
          },
        ],
      },
    ],

    text: {
      format: {
        type: "json_schema",
        name: "job_description_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
            },
            requiredSkills: {
              type: "array",
              items: {
                type: "string",
              },
            },
            technologies: {
              type: "array",
              items: {
                type: "string",
              },
            },
            responsibilities: {
              type: "array",
              items: {
                type: "string",
              },
            },
            education: {
              type: "array",
              items: {
                type: "string",
              },
            },
            experience: {
              type: "array",
              items: {
                type: "string",
              },
            },
            keywords: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: [
            "summary",
            "requiredSkills",
            "technologies",
            "responsibilities",
            "education",
            "experience",
            "keywords",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("OpenAI returned an empty job analysis.");
  }

  let analysis;

  try {
    analysis = JSON.parse(outputText);
  } catch (error) {
    console.error("Job analysis JSON parsing error:", outputText);
    throw new Error("OpenAI returned an invalid job analysis format.");
  }

  return {
    summary: analysis.summary || "",
    requiredSkills: Array.isArray(analysis.requiredSkills)
      ? analysis.requiredSkills
      : [],
    technologies: Array.isArray(analysis.technologies)
      ? analysis.technologies
      : [],
    responsibilities: Array.isArray(analysis.responsibilities)
      ? analysis.responsibilities
      : [],
    education: Array.isArray(analysis.education) ? analysis.education : [],
    experience: Array.isArray(analysis.experience) ? analysis.experience : [],
    keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
  };
};

export default analyzeJobDescription;
