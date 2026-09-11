import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";

function ResumeIntelligence() {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setError("");

      const response = await api.get("/resumes");

      setResumes(response.data?.resumes || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (event) => {
    setFormData({
      title: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const fileName = file.name.toLowerCase();

    const hasValidExtension =
      fileName.endsWith(".pdf") || fileName.endsWith(".docx");

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError("Only PDF and DOCX files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError("Resume file must be smaller than 5 MB.");
      return;
    }

    setSelectedFile(file);

    if (!formData.title.trim()) {
      const fileNameWithoutExtension = file.name.replace(/\.(pdf|docx)$/i, "");

      setFormData({
        title: fileNameWithoutExtension,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!selectedFile) {
      setError("Please select a PDF or DOCX resume.");
      return;
    }

    setSaving(true);

    try {
      const uploadData = new FormData();

      uploadData.append("title", formData.title.trim() || selectedFile.name);

      uploadData.append("resume", selectedFile);

      const response = await api.post("/resumes", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newResume = response.data?.resume;

      if (newResume) {
        setResumes((previous) => [newResume, ...previous]);
      }

      setFormData({
        title: "",
      });

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setShowAddForm(false);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to upload the resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (resumeId) => {
    setError("");
    setAnalyzingId(resumeId);

    try {
      const response = await api.post(`/resumes/${resumeId}/analyze`);

      const analysis = response.data?.analysis;

      setResumes((previous) =>
        previous.map((resume) =>
          resume.id === resumeId
            ? {
                ...resume,
                score: analysis?.overallScore ?? resume.score,
                analysis: analysis || resume.analysis,
              }
            : resume,
        ),
      );

      setExpandedId(resumeId);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to analyze this resume with AI.",
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/resumes/${resumeId}`);

      setResumes((previous) =>
        previous.filter((resume) => resume.id !== resumeId),
      );

      if (expandedId === resumeId) {
        setExpandedId(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete the resume.");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);

    setFormData({
      title: "",
    });

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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

              <h1 className="text-lg font-bold">Resume Intelligence</h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Understand your resume with CareerIQ AI.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm((previous) => !previous)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={18} />

            <span className="hidden sm:inline">Add Resume</span>

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
              <h2 className="font-semibold">Upload a resume</h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload a PDF or DOCX file. Maximum file size is 5 MB.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Resume title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Software Engineer Resume"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="resume"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Resume file
                </label>

                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Upload size={24} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Choose your resume file
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PDF or DOCX · Maximum 5 MB
                  </p>

                  <label
                    htmlFor="resume"
                    className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-50"
                  >
                    <Upload size={17} />
                    Choose file
                  </label>

                  <input
                    ref={fileInputRef}
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile && (
                    <div className="mx-auto mt-4 flex max-w-md items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-left">
                      <FileText
                        size={20}
                        className="shrink-0 text-indigo-600"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-indigo-900">
                          {selectedFile.name}
                        </p>

                        <p className="mt-0.5 text-xs text-indigo-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
                  {saving ? "Uploading..." : "Upload Resume"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-semibold">Your Resumes</h2>

            <p className="mt-1 text-sm text-slate-500">
              Analyze your resume and get actionable AI insights.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading resumes...
                </p>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <FileText size={24} />
              </div>

              <h3 className="mt-4 font-semibold">No resumes yet</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Upload your first resume to start using CareerIQ's resume
                intelligence features.
              </p>

              <button
                onClick={() => setShowAddForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Upload your first resume
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => {
                const isAnalyzing = analyzingId === resume.id;

                const hasAnalysis = Boolean(resume.analysis);

                const isExpanded = expandedId === resume.id;

                return (
                  <div
                    key={resume.id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={21} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {resume.title}
                            </h3>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {resume.fileName}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              Added{" "}
                              {new Date(resume.createdAt).toLocaleDateString()}
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

                          {resume.score !== null &&
                            resume.score !== undefined && (
                              <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                                Score: {resume.score}/100
                              </span>
                            )}

                          <button
                            onClick={() => handleAnalyze(resume.id)}
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
                                setExpandedId(isExpanded ? null : resume.id)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              {isExpanded ? "Hide Analysis" : "View Analysis"}
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete resume"
                            aria-label="Delete resume"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {hasAnalysis && isExpanded && (
                      <AnalysisPanel analysis={resume.analysis} />
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
          <h2 className="font-semibold">AI Resume Analysis</h2>

          <p className="text-xs text-slate-500">CareerIQ intelligence report</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ScoreCard
          label="ATS Score"
          value={analysis.atsScore}
          icon={<Target size={18} />}
        />

        <ScoreCard
          label="Keyword Score"
          value={analysis.keywordScore}
          icon={<FileText size={18} />}
        />

        <ScoreCard
          label="Impact Score"
          value={analysis.impactScore}
          icon={<TrendingUp size={18} />}
        />

        <ScoreCard
          label="Overall Score"
          value={analysis.overallScore}
          icon={<Award size={18} />}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <AnalysisSection
          title="Professional Summary"
          icon={<UserRound size={18} />}
        >
          <p className="text-sm leading-7 text-slate-600">
            {analysis.summary || "No professional summary was identified."}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Skills" icon={<Sparkles size={18} />}>
          <TagList
            items={analysis.skills}
            emptyMessage="No skills identified."
          />
        </AnalysisSection>

        <AnalysisSection
          title="Experience"
          icon={<BriefcaseBusiness size={18} />}
        >
          <ObjectList
            items={analysis.experience}
            emptyMessage="No experience details identified."
          />
        </AnalysisSection>

        <AnalysisSection title="Education" icon={<GraduationCap size={18} />}>
          <ObjectList
            items={analysis.education}
            emptyMessage="No education details identified."
          />
        </AnalysisSection>

        <AnalysisSection title="Projects" icon={<Target size={18} />}>
          <ObjectList
            items={analysis.projects}
            emptyMessage="No projects identified."
          />
        </AnalysisSection>

        <AnalysisSection title="Certifications" icon={<Award size={18} />}>
          <ObjectList
            items={analysis.certifications}
            emptyMessage="No certifications identified."
          />
        </AnalysisSection>

        <AnalysisSection title="Strengths" icon={<CheckCircle2 size={18} />}>
          <BulletList
            items={analysis.strengths}
            emptyMessage="No strengths identified."
          />
        </AnalysisSection>

        <AnalysisSection title="Weaknesses" icon={<AlertCircle size={18} />}>
          <BulletList
            items={analysis.weaknesses}
            emptyMessage="No weaknesses identified."
          />
        </AnalysisSection>

        <div className="lg:col-span-2">
          <AnalysisSection title="Missing Skills" icon={<Target size={18} />}>
            <TagList
              items={analysis.missingSkills}
              emptyMessage="No missing skills identified."
            />
          </AnalysisSection>
        </div>
      </div>

      {analysis.analyzedAt && (
        <p className="mt-5 text-right text-xs text-slate-400">
          Analyzed {new Date(analysis.analyzedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function ScoreCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">{icon}</span>

        <span className="text-xs font-medium text-slate-400">/100</span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{value ?? "—"}</p>
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

function ObjectList({ items, emptyMessage }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm leading-6 text-slate-600">{formatItem(item)}</p>
        </div>
      ))}
    </div>
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

export default ResumeIntelligence;
