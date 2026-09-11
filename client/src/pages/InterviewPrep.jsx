import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";

import api from "../services/api";

const getArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [String(value)];
};

const getResumes = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.resumes)) {
    return data.resumes;
  }

  return [];
};

const getJobs = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.jobs)) {
    return data.jobs;
  }

  return [];
};

function QuestionCard({
  question,
  whyAsked,
  suggestedAnswer,
  answerFramework,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold leading-6 text-slate-900">
        {question}
      </h3>

      {whyAsked && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Why this may be asked
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">{whyAsked}</p>
        </div>
      )}

      {suggestedAnswer && (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Suggested answer
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            {suggestedAnswer}
          </p>
        </div>
      )}

      {answerFramework && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Answer framework
          </p>

          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
            {answerFramework}
          </p>
        </div>
      )}
    </div>
  );
}

function QuestionSection({ title, description, icon, questions }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No questions were returned for this section.
        </p>
      ) : (
        <div className="space-y-4">
          {questions.map((item, index) => (
            <QuestionCard
              key={index}
              question={item.question}
              whyAsked={item.whyAsked}
              suggestedAnswer={item.suggestedAnswer}
              answerFramework={item.answerFramework}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ListCard({ title, items, icon, emptyText }) {
  const values = getArray(items);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">{icon}</div>

        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>

      {values.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {values.map((item, index) => (
            <div key={index} className="flex gap-3 rounded-xl bg-slate-50 p-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-indigo-500"
              />

              <p className="text-sm leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function InterviewPrep() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [interviewPrep, setInterviewPrep] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resumeResponse, jobResponse] = await Promise.all([
        api.get("/resumes"),
        api.get("/jobs"),
      ]);

      const resumeList = getResumes(resumeResponse.data);

      const jobList = getJobs(jobResponse.data);

      setResumes(resumeList);
      setJobs(jobList);

      if (resumeList.length > 0) {
        setSelectedResume(String(resumeList[0].id));
      }

      if (jobList.length > 0) {
        setSelectedJob(String(jobList[0].id));
      }
    } catch (err) {
      console.error("Interview prep data loading error:", err);

      setError(
        err.response?.data?.message || "Unable to load resumes and jobs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePreparation = async () => {
    if (!selectedResume || !selectedJob) {
      setError("Please select both a resume and a job.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setInterviewPrep(null);

      const response = await api.post("/interview-prep", {
        resumeId: Number(selectedResume),
        jobDescriptionId: Number(selectedJob),
      });

      setInterviewPrep(response.data?.interviewPrep || null);
    } catch (err) {
      console.error("Interview preparation error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to generate interview preparation.",
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 size={22} className="animate-spin" />
          Loading interview preparation workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
            <MessageSquare size={20} />
          </div>

          <span className="text-sm font-semibold text-indigo-600">
            AI INTERVIEW PREPARATION
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Prepare for your interview
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Practice questions tailored to your resume, target job, and CareerIQ
          job match.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Selection */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <Target size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Choose your interview target
            </h2>

            <p className="text-sm text-slate-500">
              Select the resume and job you want to prepare for.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Resume
            </label>

            <select
              value={selectedResume}
              onChange={(event) => setSelectedResume(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a resume</option>

              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.fileName || resume.name || `Resume #${resume.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Target Job
            </label>

            <select
              value={selectedJob}
              onChange={(event) => setSelectedJob(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a job</option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title || `Job #${job.id}`}
                  {job.company ? ` — ${job.company}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={generatePreparation}
            disabled={generating || !selectedResume || !selectedJob}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Interview Prep
              </>
            )}
          </button>
        </div>
      </section>

      {/* Empty State */}
      {!interviewPrep && !generating && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
            <BookOpen size={26} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Your interview preparation will appear here
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Select an analyzed resume and target job, then generate a
            personalized interview preparation plan.
          </p>
        </section>
      )}

      {/* Results */}
      {interviewPrep && (
        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <Sparkles size={22} className="mt-0.5 shrink-0" />

              <div>
                <h2 className="font-semibold">Interview Preparation Summary</h2>

                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  {interviewPrep.interviewSummary ||
                    "Review the preparation sections below before your interview."}
                </p>
              </div>
            </div>
          </section>

          {/* Question Sections */}
          <QuestionSection
            title="Technical Questions"
            description="Technical topics connected to the skills and technologies in the resume and target job."
            icon={<BookOpen size={20} />}
            questions={getArray(interviewPrep.technicalQuestions)}
          />

          <QuestionSection
            title="Resume-Based Questions"
            description="Questions you may be asked about your actual resume, projects, education, and experience."
            icon={<FileTextIcon />}
            questions={getArray(interviewPrep.resumeQuestions)}
          />

          <QuestionSection
            title="Behavioral Questions"
            description="Practice answering behavioral questions without inventing personal experiences."
            icon={<MessageSquare size={20} />}
            questions={getArray(interviewPrep.behavioralQuestions)}
          />

          <QuestionSection
            title="Job-Specific Questions"
            description="Questions focused on the requirements and responsibilities of the target role."
            icon={<Target size={20} />}
            questions={getArray(interviewPrep.jobSpecificQuestions)}
          />

          {/* Preparation Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ListCard
              title="Strong Areas"
              items={interviewPrep.strongAreas}
              icon={<CheckCircle2 size={20} />}
              emptyText="No strong areas were returned."
            />

            <ListCard
              title="Revision Topics"
              items={interviewPrep.revisionTopics}
              icon={<BookOpen size={20} />}
              emptyText="No revision topics were returned."
            />

            <ListCard
              title="Risk Areas"
              items={interviewPrep.riskAreas}
              icon={<AlertTriangle size={20} />}
              emptyText="No specific risk areas were returned."
            />

            <ListCard
              title="Interview Tips"
              items={interviewPrep.interviewTips}
              icon={<Lightbulb size={20} />}
              emptyText="No interview tips were returned."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FileTextIcon() {
  return (
    <span className="text-indigo-600">
      <BookOpen size={20} />
    </span>
  );
}
