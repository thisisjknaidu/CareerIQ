import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

function JobIntelligence() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setError("");

      const response = await api.get("/jobs");

      setJobs(response.data?.jobs || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load your saved jobs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter the job description.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/jobs", {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        salary: formData.salary,
        jobUrl: formData.jobUrl,
        description: formData.description,
      });

      const newJob = response.data?.job;

      if (newJob) {
        setJobs((previous) => [newJob, ...previous]);
      }

      setFormData({
        title: "",
        company: "",
        location: "",
        salary: "",
        jobUrl: "",
        description: "",
      });

      setShowAddForm(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to save this job description.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (jobId) => {
    setError("");
    setAnalyzingId(jobId);

    try {
      const response = await api.post(`/jobs/${jobId}/analyze`);

      const analysis = response.data?.analysis;

      setJobs((previous) =>
        previous.map((job) =>
          job.id === jobId
            ? {
                ...job,
                summary: analysis?.summary ?? job.summary,
                requiredSkills: analysis?.requiredSkills ?? job.requiredSkills,
                technologies: analysis?.technologies ?? job.technologies,
                responsibilities:
                  analysis?.responsibilities ?? job.responsibilities,
                education: analysis?.education ?? job.education,
                experience: analysis?.experience ?? job.experience,
                keywords: analysis?.keywords ?? job.keywords,
              }
            : job,
        ),
      );

      setExpandedId(jobId);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to analyze this job description with AI.",
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job description?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/jobs/${jobId}`);

      setJobs((previous) => previous.filter((job) => job.id !== jobId));

      if (expandedId === jobId) {
        setExpandedId(null);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete this job description.",
      );
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);

    setFormData({
      title: "",
      company: "",
      location: "",
      salary: "",
      jobUrl: "",
      description: "",
    });

    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Sparkles size={19} />
              </div>

              <h1 className="text-lg font-bold">Job Intelligence</h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Understand job requirements with CareerIQ AI.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm((previous) => !previous)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">Add Job</span>

            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {showAddForm && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="font-semibold">Add a job description</h2>

              <p className="mt-1 text-sm text-slate-500">
                Add the job information so CareerIQ can analyze it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Job title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  icon={<BriefcaseBusiness size={17} />}
                  required
                />

                <Field
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  icon={<Building2 size={17} />}
                />

                <Field
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru / Remote"
                  icon={<MapPin size={17} />}
                />

                <Field
                  label="Salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹8–12 LPA"
                  icon={<Sparkles size={17} />}
                />

                <div className="md:col-span-2">
                  <Field
                    label="Job URL"
                    name="jobUrl"
                    value={formData.jobUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    icon={<ExternalLink size={17} />}
                    type="url"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Job description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Paste the complete job description here..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Include responsibilities, requirements, skills, technologies,
                  and qualifications when available.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Job Description"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-semibold">Saved Jobs</h2>

            <p className="mt-1 text-sm text-slate-500">
              Analyze job requirements and prepare for matching.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="mt-4 text-sm text-slate-500">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <BriefcaseBusiness size={24} />
              </div>

              <h3 className="mt-4 font-semibold">No jobs saved yet</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add a job description to start building your CareerIQ job
                intelligence workspace.
              </p>

              <button
                onClick={() => setShowAddForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Add your first job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const hasAnalysis = Boolean(
                  job.summary ||
                  hasItems(job.requiredSkills) ||
                  hasItems(job.technologies) ||
                  hasItems(job.responsibilities) ||
                  hasItems(job.education) ||
                  hasItems(job.experience) ||
                  hasItems(job.keywords),
                );

                const isAnalyzing = analyzingId === job.id;

                const isExpanded = expandedId === job.id;

                return (
                  <div
                    key={job.id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <BriefcaseBusiness size={21} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {job.title}
                            </h3>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                              {job.company && (
                                <span className="inline-flex items-center gap-1">
                                  <Building2 size={13} />
                                  {job.company}
                                </span>
                              )}

                              {job.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={13} />
                                  {job.location}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                              Added{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {hasAnalysis ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={14} />
                              Analyzed
                            </span>
                          ) : (
                            <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              Ready for AI
                            </span>
                          )}

                          <button
                            onClick={() => handleAnalyze(job.id)}
                            disabled={isAnalyzing}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 size={15} className="animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={15} />
                                {hasAnalysis
                                  ? "Analyze Again"
                                  : "Analyze with AI"}
                              </>
                            )}
                          </button>

                          {hasAnalysis && (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : job.id)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              {isExpanded ? "Hide Analysis" : "View Analysis"}
                            </button>
                          )}

                          {job.jobUrl && (
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-indigo-600"
                              title="Open job"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}

                          <button
                            onClick={() => handleDelete(job.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete job"
                            aria-label="Delete job"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <FileText size={14} />
                        Job Description
                      </div>

                      <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {job.description}
                      </p>
                    </div>

                    {hasAnalysis && isExpanded && (
                      <AnalysisPanel
                        analysis={{
                          summary: job.summary,
                          requiredSkills: job.requiredSkills,
                          technologies: job.technologies,
                          responsibilities: job.responsibilities,
                          education: job.education,
                          experience: job.experience,
                          keywords: job.keywords,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function AnalysisPanel({ analysis }) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Sparkles size={18} />
        </div>

        <div>
          <h2 className="font-semibold">AI Job Analysis</h2>

          <p className="text-xs text-slate-500">CareerIQ intelligence report</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AnalysisSection
          title="Job Summary"
          icon={<BriefcaseBusiness size={18} />}
        >
          <p className="text-sm leading-7 text-slate-600">
            {analysis.summary || "No summary was generated."}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Required Skills" icon={<Target size={18} />}>
          <TagList
            items={analysis.requiredSkills}
            emptyMessage="No required skills identified."
          />
        </AnalysisSection>

        <AnalysisSection title="Technologies" icon={<Sparkles size={18} />}>
          <TagList
            items={analysis.technologies}
            emptyMessage="No technologies identified."
          />
        </AnalysisSection>

        <AnalysisSection
          title="Experience Requirements"
          icon={<BriefcaseBusiness size={18} />}
        >
          <BulletList
            items={analysis.experience}
            emptyMessage="No experience requirements identified."
          />
        </AnalysisSection>

        <AnalysisSection
          title="Education Requirements"
          icon={<GraduationCap size={18} />}
        >
          <BulletList
            items={analysis.education}
            emptyMessage="No education requirements identified."
          />
        </AnalysisSection>

        <AnalysisSection
          title="Responsibilities"
          icon={<CheckCircle2 size={18} />}
        >
          <BulletList
            items={analysis.responsibilities}
            emptyMessage="No responsibilities identified."
          />
        </AnalysisSection>

        <div className="lg:col-span-2">
          <AnalysisSection
            title="Important Keywords"
            icon={<FileText size={18} />}
          >
            <TagList
              items={analysis.keywords}
              emptyMessage="No keywords identified."
            />
          </AnalysisSection>
        </div>
      </div>
    </div>
  );
}

function AnalysisSection({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-indigo-600">{icon}</span>

        <h3 className="font-semibold">{title}</h3>
      </div>

      {children}
    </section>
  );
}

function TagList({ items, emptyMessage }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
        >
          {formatItem(item)}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items, emptyMessage }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-2 text-sm leading-6 text-slate-600"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

          <span>{formatItem(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function formatItem(item) {
  if (typeof item === "string") {
    return item;
  }

  if (item === null || item === undefined) {
    return "";
  }

  if (typeof item === "object") {
    return Object.entries(item)
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (character) => character.toUpperCase());

        if (Array.isArray(value)) {
          return `${label}: ${value.join(", ")}`;
        }

        return `${label}: ${value}`;
      })
      .join(" • ");
  }

  return String(item);
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

export default JobIntelligence;
