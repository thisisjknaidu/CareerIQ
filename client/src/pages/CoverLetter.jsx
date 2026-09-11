import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Mail,
  Sparkles,
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

export default function CoverLetter() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copying, setCopying] = useState(false);
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
      console.error("Cover letter data loading error:", err);

      setError(
        err.response?.data?.message || "Unable to load resumes and jobs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!selectedResume || !selectedJob) {
      setError("Please select both a resume and a job.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setCoverLetter(null);

      const response = await api.post("/cover-letter", {
        resumeId: Number(selectedResume),
        jobDescriptionId: Number(selectedJob),
      });

      setCoverLetter(response.data?.coverLetter || null);
    } catch (err) {
      console.error("Cover letter generation error:", err);

      setError(
        err.response?.data?.message || "Unable to generate the cover letter.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyCoverLetter = async () => {
    if (!coverLetter?.coverLetter) {
      return;
    }

    try {
      setCopying(true);

      await navigator.clipboard.writeText(coverLetter.coverLetter);

      setTimeout(() => {
        setCopying(false);
      }, 1500);
    } catch (err) {
      console.error("Copy cover letter error:", err);

      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 size={22} className="animate-spin" />
          Loading cover letter workspace...
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
            <Mail size={20} />
          </div>

          <span className="text-sm font-semibold text-indigo-600">
            AI COVER LETTER GENERATOR
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create a tailored cover letter
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Generate a personalized cover letter using your analyzed resume,
          target job, and CareerIQ job match results.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Selection Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <Sparkles size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Choose your target</h2>

            <p className="text-sm text-slate-500">
              Select an analyzed resume and job.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Resume */}
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

          {/* Job */}
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
            onClick={generateCoverLetter}
            disabled={generating || !selectedResume || !selectedJob}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>
      </section>

      {/* Empty State */}
      {!coverLetter && !generating && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
            <FileText size={26} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Your cover letter will appear here
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Choose a resume and target job above, then let CareerIQ create a
            personalized cover letter based on your existing qualifications.
          </p>
        </section>
      )}

      {/* Generated Cover Letter */}
      {coverLetter && (
        <div className="space-y-6">
          {/* Subject */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Suggested Subject
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  A concise subject for your application.
                </p>
              </div>

              <CheckCircle2 size={22} className="shrink-0 text-emerald-500" />
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
              {coverLetter.subjectSuggestion || "Application for the position"}
            </div>
          </section>

          {/* Letter */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Cover Letter</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review and edit before using it in an application.
                </p>
              </div>

              <button
                type="button"
                onClick={copyCoverLetter}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {copying ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <textarea
              value={coverLetter.coverLetter || ""}
              onChange={(event) =>
                setCoverLetter((current) => ({
                  ...current,
                  coverLetter: event.target.value,
                }))
              }
              rows={18}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </section>

          {/* Strengths + Skills */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Strengths */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 font-semibold text-slate-900">
                Highlighted Strengths
              </h2>

              {getArray(coverLetter.highlightedStrengths).length === 0 ? (
                <p className="text-sm text-slate-500">
                  No highlighted strengths were returned.
                </p>
              ) : (
                <div className="space-y-3">
                  {getArray(coverLetter.highlightedStrengths).map(
                    (strength, index) => (
                      <div
                        key={index}
                        className="flex gap-3 rounded-xl bg-emerald-50 p-3"
                      >
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />

                        <p className="text-sm leading-6 text-slate-700">
                          {strength}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 font-semibold text-slate-900">
                Mentioned Skills
              </h2>

              {getArray(coverLetter.mentionedSkills).length === 0 ? (
                <p className="text-sm text-slate-500">
                  No skills were returned.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getArray(coverLetter.mentionedSkills).map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
