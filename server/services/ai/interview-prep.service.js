import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateInterviewPrep = async ({
  resumeAnalysis,
  jobAnalysis,
  jobMatch,
}) => {
  if (!resumeAnalysis) {
    throw new Error("Resume analysis is required for interview preparation.");
  }

  if (!jobAnalysis) {
    throw new Error(
      "Job description analysis is required for interview preparation.",
    );
  }

  if (!jobMatch) {
    throw new Error(
      "Job match analysis is required for interview preparation.",
    );
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
You are CareerIQ's AI Interview Preparation Engine.

Your task is to prepare a candidate for an interview for a specific job.

You will receive:

1. The candidate's resume analysis.
2. The target job description analysis.
3. The existing resume-to-job match analysis.

IMPORTANT RULES:

- Use ONLY information contained in the supplied data.
- Never invent experience.
- Never invent skills.
- Never invent projects.
- Never invent certifications.
- Never invent education.
- Never invent employers.
- Never invent job titles.
- Never invent achievements.
- Never invent technologies.
- Never invent metrics or results.
- Never claim that the candidate has a skill unless the resume data supports it.
- Clearly distinguish between existing qualifications and areas the candidate should prepare for.
- Do not give hiring guarantees.
- Do not judge the candidate's personal characteristics.
- Keep the preparation practical, factual, and relevant to the target job.

INTERVIEW QUESTION RULES:

Generate questions that are likely to be relevant to the supplied job and resume.

Include:

- Technical questions based on technologies and skills explicitly present in the resume or job.
- Resume-based questions based on the candidate's actual experience, projects, education, and certifications.
- Behavioral questions relevant to the role.
- Job-specific questions based on the supplied job requirements.
- Questions about missing skills only when those skills are explicitly present in the job analysis.

ANSWER RULES:

For every question, provide a suggested answer.

Suggested answers must:

- Use only facts supported by the resume analysis.
- Never fabricate experience.
- Never fabricate metrics.
- Never claim expertise that is not supported.
- Be concise and interview-friendly.
- Help the candidate understand how to structure their response.

For behavioral questions, provide a suggested answer framework rather than inventing a personal story.

Use STAR-style guidance where appropriate:

Situation
Task
Action
Result

IMPORTANT:
Do not write a fictional personal story for the candidate.

PREPARATION AREAS:

Identify:

- Strong areas the candidate should emphasize.
- Technical areas they should revise.
- Job requirements that are not clearly supported by the resume.
- Questions they should be especially prepared to answer.

Return ONLY valid JSON matching this exact structure:

{
  "interviewSummary": "",
  "technicalQuestions": [
    {
      "question": "",
      "whyAsked": "",
      "suggestedAnswer": ""
    }
  ],
  "resumeQuestions": [
    {
      "question": "",
      "whyAsked": "",
      "suggestedAnswer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "whyAsked": "",
      "answerFramework": ""
    }
  ],
  "jobSpecificQuestions": [
    {
      "question": "",
      "whyAsked": "",
      "suggestedAnswer": ""
    }
  ],
  "strongAreas": [],
  "revisionTopics": [],
  "riskAreas": [],
  "interviewTips": []
}

FIELD RULES:

interviewSummary:
A concise overview of how the candidate should prepare for this specific interview.

technicalQuestions:
Provide relevant technical interview questions and factual suggested answers.

resumeQuestions:
Questions directly connected to information present in the candidate's resume.

behavioralQuestions:
Behavioral questions with answer frameworks.
Do not invent personal experiences.

jobSpecificQuestions:
Questions specifically connected to the target job's requirements.

strongAreas:
Skills, experience, projects, education, or other qualifications supported by the resume that the candidate should emphasize.

revisionTopics:
Technical or job-related areas the candidate should revise before the interview.

riskAreas:
Important areas where the resume does not clearly demonstrate the job requirement.

interviewTips:
Practical preparation advice based on the supplied resume, job, and match information.

Generate approximately:

- 5 technical questions
- 5 resume-based questions
- 5 behavioral questions
- 5 job-specific questions

Keep each answer concise enough to be useful during interview preparation.

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
    throw new Error("OpenAI returned an empty interview preparation analysis.");
  }

  let interviewPrep;

  try {
    interviewPrep = JSON.parse(outputText);
  } catch (error) {
    console.error(
      "OpenAI interview preparation JSON parsing error:",
      outputText,
    );

    throw new Error("OpenAI returned an invalid interview preparation format.");
  }

  return interviewPrep;
};

export default generateInterviewPrep;
