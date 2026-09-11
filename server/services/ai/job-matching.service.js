import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeJobMatch = async ({ resumeAnalysis, jobAnalysis }) => {
  if (!resumeAnalysis) {
    throw new Error("Resume analysis is required for job matching.");
  }

  if (!jobAnalysis) {
    throw new Error("Job description analysis is required for job matching.");
  }

  const resumeData = JSON.stringify(resumeAnalysis, null, 2);
  const jobData = JSON.stringify(jobAnalysis, null, 2);

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `
You are CareerIQ's Resume-to-Job Matching Engine.

Your task is to compare a candidate's resume analysis with a job description analysis.

IMPORTANT RULES:

- Use ONLY the information provided in the resume analysis and job analysis.
- Never invent skills, experience, education, projects, certifications, or achievements.
- Never claim that the candidate has a skill unless it appears in the resume data.
- Clearly distinguish between matched skills and missing skills.
- A missing skill means the job requires or prefers it, but the resume does not provide evidence that the candidate has it.
- Do not penalize the candidate for information that the job description does not require.
- Do not invent requirements that are not present in the job description.
- Keep the analysis factual, fair, concise, and explainable.
- Scores must be integers from 0 to 100.
- Do not give employment, hiring, or legal guarantees.
- Do not judge the candidate's personal characteristics.
- Base the match on skills, experience, education, keywords, and the information explicitly available.

SCORING GUIDELINES:

overallScore:
Overall compatibility between the resume and job description.

skillScore:
How well the candidate's demonstrated skills match the required job skills.

experienceScore:
How well the candidate's documented experience matches the job's experience requirements.

educationScore:
How well the candidate's documented education matches the job's education requirements.

keywordScore:
How well important job-related keywords appear in the candidate's resume information.

IMPORTANT:
Do not simply average the scores blindly. Use reasonable judgment based on the available evidence.

Return ONLY valid JSON matching this exact structure:

{
  "overallScore": 0,
  "skillScore": 0,
  "experienceScore": 0,
  "educationScore": 0,
  "keywordScore": 0,
  "summary": "short explanation of the overall match",
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "recommendations": []
}

Rules for arrays:

matchedSkills:
Skills explicitly supported by the resume that also appear to be relevant to the job.

missingSkills:
Important skills explicitly required or strongly expected by the job that are not supported by the resume.

strengths:
Short factual reasons why the resume matches the job.

recommendations:
Practical suggestions for improving the resume's alignment with the job.
Do not tell the candidate to claim experience they do not have.

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
            `.trim(),
          },
        ],
      },
    ],
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("OpenAI returned an empty job matching analysis.");
  }

  let matchAnalysis;

  try {
    matchAnalysis = JSON.parse(outputText);
  } catch (error) {
    console.error("OpenAI job matching JSON parsing error:", outputText);

    throw new Error("OpenAI returned an invalid job matching format.");
  }

  return matchAnalysis;
};

export default analyzeJobMatch;
