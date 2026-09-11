import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

function ResumeOptimization() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [selectedJobId, setSelectedJobId] = useState("");

  const [optimization, setOptimization] = useState(null);

  const [loading, setLoading] = useState(true);

  const [optimizing, setOptimizing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resumesResponse, jobsResponse] = await Promise.all([
        api.get("/resumes"),
        api.get("/jobs"),
      ]);

      const resumeData = Array.isArray(resumesResponse.data)
        ? resumesResponse.data
        : resumesResponse.data.resumes || [];

      const jobData = Array.isArray(jobsResponse.data)
        ? jobsResponse.data
        : jobsResponse.data.jobs || [];

      setResumes(resumeData);
      setJobs(jobData);
    } catch (err) {
      console.error("Failed to load optimization data:", err);

      setError(
        err.response?.data?.message || "Unable to load resumes and jobs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!selectedJobId) {
      setError("Please select a job.");
      return;
    }

    try {
      setOptimizing(true);
      setError("");
      setSuccess("");
      setOptimization(null);

      const response = await api.post("/resume-optimization", {
        resumeId: Number(selectedResumeId),
        jobDescriptionId: Number(selectedJobId),
      });

      setOptimization(response.data.optimization);

      setSuccess("Resume optimization completed successfully.");
    } catch (err) {
      console.error("Resume optimization failed:", err);

      setError(err.response?.data?.message || "Unable to optimize the resume.");
    } finally {
      setOptimizing(false);
    }
  };

  const selectedResume = resumes.find(
    (resume) => Number(resume.id) === Number(selectedResumeId),
  );

  const selectedJob = jobs.find(
    (job) => Number(job.id) === Number(selectedJobId),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 size={22} className="animate-spin" />
            Loading resumes and jobs...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={20} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">Resume Optimization</h1>

              <p className="text-xs text-slate-500">
                Tailor your resume for a target job
              </p>
            </div>
          </div>

          <Link
            to="/job-matches"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex"
          >
            <Target size={17} />
            Job Matching
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Introduction */}
        <section className="mb-6 rounded-2xl bg-indigo-600 p-5 text-white shadow-sm sm:p-6">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={20} />

              <span className="text-sm font-medium text-indigo-100">
                AI Resume Optimization
              </span>
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              Optimize your resume for the job.
            </h2>

            <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
              CareerIQ compares your analyzed resume with an analyzed job
              description and suggests improvements without inventing
              experience, skills, or achievements.
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        {/* Selection */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Select your resume and target job
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Both the resume and job description must already have AI analysis
              and matching results.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Resume */}
            <div>
              <label
                htmlFor="resume"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Resume
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="resume"
                  value={selectedResumeId}
                  onChange={(event) => {
                    setSelectedResumeId(event.target.value);
                    setOptimization(null);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select a resume</option>

                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.fileName || resume.name || `Resume #${resume.id}`}
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
                  Selected resume:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedResume.fileName ||
                      selectedResume.name ||
                      `Resume #${selectedResume.id}`}
                  </span>
                </p>
              )}
            </div>

            {/* Job */}
            <div>
              <label
                htmlFor="job"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Target Job
              </label>

              <div className="relative">
                <Target
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="job"
                  value={selectedJobId}
                  onChange={(event) => {
                    setSelectedJobId(event.target.value);
                    setOptimization(null);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select a job</option>

                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title || job.name || `Job #${job.id}`}
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
                  Selected job:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedJob.title ||
                      selectedJob.name ||
                      `Job #${selectedJob.id}`}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Optimize button */}
          <button
            onClick={handleOptimize}
            disabled={optimizing || !selectedResumeId || !selectedJobId}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {optimizing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Optimizing Resume...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Optimize Resume
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </section>

        {/* Results */}
        {optimization && (
          <div className="mt-6 space-y-6">
            {/* Optimized Summary */}
            <ResultSection
              icon={<FileText size={19} />}
              title="Optimized Professional Summary"
            >
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">
                  {optimization.optimizedSummary ||
                    "No optimized summary was generated."}
                </p>
              </div>
            </ResultSection>

            {/* Optimized Skills */}
            <ResultSection
              icon={<CheckCircle2 size={19} />}
              title="Optimized Skills"
            >
              {optimization.optimizedSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {optimization.optimizedSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState text="No optimized skills were identified." />
              )}
            </ResultSection>

            {/* Experience Changes */}
            <ResultSection
              icon={<ArrowRight size={19} />}
              title="Experience Improvements"
            >
              {optimization.optimizedExperience?.length > 0 ? (
                <div className="space-y-4">
                  {optimization.optimizedExperience.map((item, index) => (
                    <ComparisonCard
                      key={index}
                      original={item.original}
                      optimized={item.optimized}
                      reason={item.reason}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState text="No experience changes were suggested." />
              )}
            </ResultSection>

            {/* Project Changes */}
            <ResultSection
              icon={<FileText size={19} />}
              title="Project Improvements"
            >
              {optimization.optimizedProjects?.length > 0 ? (
                <div className="space-y-4">
                  {optimization.optimizedProjects.map((item, index) => (
                    <ComparisonCard
                      key={index}
                      original={item.original}
                      optimized={item.optimized}
                      reason={item.reason}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState text="No project changes were suggested." />
              )}
            </ResultSection>

            {/* ATS Keywords */}
            <ResultSection
              icon={<Target size={19} />}
              title="ATS Keywords Added"
            >
              {optimization.atsKeywordsAdded?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {optimization.atsKeywordsAdded.map((keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
                      className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState text="No additional supported ATS keywords were identified." />
              )}
            </ResultSection>

            {/* Missing Skills */}
            <ResultSection
              icon={<AlertCircle size={19} />}
              title="Missing Skills"
            >
              {optimization.missingSkills?.length > 0 ? (
                <div className="space-y-2">
                  {optimization.missingSkills.map((skill, index) => (
                    <div
                      key={`${skill}-${index}`}
                      className="flex items-start gap-3 rounded-xl bg-amber-50 p-3"
                    >
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <span className="text-sm text-amber-800">{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No important missing skills were identified." />
              )}
            </ResultSection>

            {/* Improvement Areas */}
            <ResultSection
              icon={<Lightbulb size={19} />}
              title="Improvement Areas"
            >
              {optimization.improvementAreas?.length > 0 ? (
                <div className="space-y-3">
                  {optimization.improvementAreas.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                    >
                      <Lightbulb
                        size={18}
                        className="mt-0.5 shrink-0 text-indigo-600"
                      />

                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No additional improvement areas were identified." />
              )}
            </ResultSection>

            {/* Recommendations */}
            <ResultSection
              icon={<Sparkles size={19} />}
              title="AI Recommendations"
            >
              {optimization.recommendations?.length > 0 ? (
                <div className="space-y-3">
                  {optimization.recommendations.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4"
                    >
                      <Sparkles
                        size={18}
                        className="mt-0.5 shrink-0 text-indigo-600"
                      />

                      <p className="text-sm leading-6 text-indigo-900">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No additional recommendations were generated." />
              )}
            </ResultSection>
          </div>
        )}

        {/* Empty state */}
        {!optimization && !optimizing && !error && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Ready to optimize
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Select an analyzed resume and an analyzed job, then let CareerIQ
              identify practical improvements.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* =====================================
   RESULT SECTION
===================================== */

function ResultSection({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      {children}
    </section>
  );
}

/* =====================================
   COMPARISON CARD
===================================== */

function ComparisonCard({ original, optimized, reason }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Original */}
        <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Original
          </p>

          <p className="text-sm leading-6 text-slate-600">
            {original || "Not provided"}
          </p>
        </div>

        {/* Optimized */}
        <div className="bg-indigo-50/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Optimized
          </p>

          <p className="text-sm leading-6 text-slate-800">
            {optimized || "Not provided"}
          </p>
        </div>
      </div>

      {reason && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Why this improves the resume
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">{reason}</p>
        </div>
      )}
    </div>
  );
}

/* =====================================
   EMPTY STATE
===================================== */

function EmptyState({ text }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </div>
  );
}

export default ResumeOptimization;
