import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Target,
  AlertCircle,
  Lightbulb,
  Award,
} from "lucide-react";

import api from "../services/api";

function ScoreCard({ label, score }) {
  const safeScore = typeof score === "number" ? score : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold text-slate-900">{safeScore}</span>

        <span className="mb-1 text-sm text-slate-400">/100</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{
            width: `${Math.min(Math.max(safeScore, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function TagList({ items, emptyText = "No items found." }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const value =
          typeof item === "string"
            ? item
            : item?.name ||
              item?.skill ||
              item?.keyword ||
              item?.title ||
              JSON.stringify(item);

        return (
          <span
            key={`${value}-${index}`}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            {value}
          </span>
        );
      })}
    </div>
  );
}

function BulletList({ items, emptyText = "No information available." }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const value =
          typeof item === "string"
            ? item
            : item?.description ||
              item?.text ||
              item?.name ||
              item?.title ||
              JSON.stringify(item);

        return (
          <div key={index} className="flex gap-3">
            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />

            <p className="text-sm leading-6 text-slate-700">{value}</p>
          </div>
        );
      })}
    </div>
  );
}

function AnalysisSection({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </div>

        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      {children}
    </section>
  );
}

function JobMatches() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [selectedJobId, setSelectedJobId] = useState("");

  const [match, setMatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [resumesResponse, jobsResponse] = await Promise.all([
          api.get("/resumes"),
          api.get("/jobs"),
        ]);

        setResumes(
          Array.isArray(resumesResponse.data)
            ? resumesResponse.data
            : resumesResponse.data?.resumes || [],
        );

        setJobs(
          Array.isArray(jobsResponse.data)
            ? jobsResponse.data
            : jobsResponse.data?.jobs || [],
        );
      } catch (err) {
        console.error("Load matching data error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load resumes and job descriptions.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAnalyzeMatch = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!selectedJobId) {
      setError("Please select a job description.");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setMatch(null);

      const response = await api.post("/job-matches", {
        resumeId: Number(selectedResumeId),
        jobDescriptionId: Number(selectedJobId),
      });

      setMatch(response.data?.match || null);
    } catch (err) {
      console.error("Analyze match error:", err);

      setError(
        err.response?.data?.message || "Unable to analyze this job match.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedResume = resumes.find(
    (resume) => resume.id === Number(selectedResumeId),
  );

  const selectedJob = jobs.find((job) => job.id === Number(selectedJobId));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading your resumes and jobs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
              <Target size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Job Matching
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Compare your resume with a job description using AI.
              </p>
            </div>
          </div>
        </div>

        {/* Selection Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Resume */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Resume
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={selectedResumeId}
                  onChange={(event) => {
                    setSelectedResumeId(event.target.value);
                    setMatch(null);
                    setError("");
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Choose a resume...</option>

                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title || resume.fileName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {selectedResume && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedResume.fileName}
                  {selectedResume.score != null &&
                    ` • Resume score: ${selectedResume.score}/100`}
                </p>
              )}
            </div>

            {/* Job */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Job Description
              </label>

              <div className="relative">
                <BriefcaseBusiness
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={selectedJobId}
                  onChange={(event) => {
                    setSelectedJobId(event.target.value);
                    setMatch(null);
                    setError("");
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Choose a job description...</option>

                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                      {job.company ? ` — ${job.company}` : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {selectedJob && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedJob.company || "Company not specified"}
                  {selectedJob.location ? ` • ${selectedJob.location}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyzeMatch}
            disabled={analyzing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {analyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Target size={18} />
                Analyze Match
              </>
            )}
          </button>
        </div>

        {/* Empty State */}
        {!match && !analyzing && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
            <Target className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              Ready to compare
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Select an AI-analyzed resume and an AI-analyzed job description to
              see how well they match.
            </p>
          </div>
        )}

        {/* Results */}
        {match && (
          <div className="space-y-6">
            {/* Overall */}
            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Award size={20} />

                    <span className="text-sm font-semibold">
                      AI Match Result
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {selectedResume?.title ||
                      selectedResume?.fileName ||
                      "Resume"}{" "}
                    <span className="font-normal text-slate-400">×</span>{" "}
                    {selectedJob?.title || "Job"}
                  </h2>

                  {selectedJob?.company && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedJob.company}
                    </p>
                  )}
                </div>

                <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-indigo-100 bg-indigo-50">
                  <span className="text-3xl font-bold text-indigo-600">
                    {match.overallScore ?? 0}
                  </span>

                  <span className="text-xs font-medium text-slate-500">
                    /100
                  </span>
                </div>
              </div>

              {match.summary && (
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">
                    {match.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Scores */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ScoreCard label="Skill Match" score={match.skillScore} />

              <ScoreCard
                label="Experience Match"
                score={match.experienceScore}
              />

              <ScoreCard label="Education Match" score={match.educationScore} />

              <ScoreCard label="Keyword Match" score={match.keywordScore} />
            </div>

            {/* Skills */}
            <AnalysisSection
              title="Matched Skills"
              icon={<CheckCircle2 size={19} />}
            >
              <TagList
                items={match.matchedSkills}
                emptyText="No matching skills were identified."
              />
            </AnalysisSection>

            {/* Missing Skills */}
            <AnalysisSection
              title="Missing Skills"
              icon={<AlertCircle size={19} />}
            >
              <TagList
                items={match.missingSkills}
                emptyText="No important missing skills were identified."
              />
            </AnalysisSection>

            {/* Strengths */}
            <AnalysisSection
              title="Why This Resume Matches"
              icon={<Award size={19} />}
            >
              <BulletList
                items={match.strengths}
                emptyText="No specific strengths were identified."
              />
            </AnalysisSection>

            {/* Recommendations */}
            <AnalysisSection
              title="Recommendations"
              icon={<Lightbulb size={19} />}
            >
              <BulletList
                items={match.recommendations}
                emptyText="No additional recommendations were identified."
              />
            </AnalysisSection>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobMatches;
