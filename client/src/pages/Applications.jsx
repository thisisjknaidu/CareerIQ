import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";

const STATUS_OPTIONS = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

function Applications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    jobDescriptionId: "",
    status: "SAVED",
    appliedAt: "",
    notes: "",
    source: "",
    jobUrl: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [applicationsResponse, jobsResponse] = await Promise.all([
        api.get("/applications"),
        api.get("/jobs"),
      ]);

      setApplications(applicationsResponse.data || []);
      setJobs(jobsResponse.data.jobs || []);
    } catch (err) {
      console.error("Load applications error:", err);

      setError(err.response?.data?.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleJobChange = (event) => {
    const jobDescriptionId = event.target.value;

    const selectedJob = jobs.find(
      (job) => String(job.id) === String(jobDescriptionId),
    );

    setForm((previous) => ({
      ...previous,
      jobDescriptionId,
      jobUrl: selectedJob?.jobUrl || "",
    }));
  };

  const resetForm = () => {
    setForm({
      jobDescriptionId: "",
      status: "SAVED",
      appliedAt: "",
      notes: "",
      source: "",
      jobUrl: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.jobDescriptionId) {
      setError("Please select a job.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/applications", {
        jobDescriptionId: Number(form.jobDescriptionId),
        status: form.status,
        appliedAt: form.appliedAt || null,
        notes: form.notes,
        source: form.source,
        jobUrl: form.jobUrl,
      });

      setApplications((previous) => [response.data.application, ...previous]);

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Create application error:", err);

      setError(
        err.response?.data?.message || "Unable to create the application.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      setError("");

      const response = await api.put(`/applications/${applicationId}`, {
        status,
      });

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? response.data.application
            : application,
        ),
      );
    } catch (err) {
      console.error("Update application error:", err);

      setError(err.response?.data?.message || "Unable to update application.");
    }
  };

  const deleteApplication = async (applicationId) => {
    try {
      setError("");

      await api.delete(`/applications/${applicationId}`);

      setApplications((previous) =>
        previous.filter((application) => application.id !== applicationId),
      );
    } catch (err) {
      console.error("Delete application error:", err);

      setError(err.response?.data?.message || "Unable to delete application.");
    }
  };

  const stats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter(
        (application) => application.status === "APPLIED",
      ).length,
      interviews: applications.filter(
        (application) => application.status === "INTERVIEW",
      ).length,
      offers: applications.filter(
        (application) => application.status === "OFFER",
      ).length,
    };
  }, [applications]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "OFFER":
        return "bg-emerald-100 text-emerald-700";
      case "INTERVIEW":
        return "bg-blue-100 text-blue-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-700";
      case "SCREENING":
        return "bg-purple-100 text-purple-700";
      case "APPLIED":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Briefcase className="text-blue-600" size={24} />
              </div>

              <h1 className="text-3xl font-bold text-slate-900">
                Applications
              </h1>
            </div>

            <p className="text-slate-500">
              Track and manage your job applications in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={19} />
            Add Application
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span className="flex-1">{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Applications
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Applied</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {stats.applied}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Interviews</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.interviews}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Offers</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {stats.offers}
            </p>
          </div>
        </div>

        {/* Add Application Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Application
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a job from your Job Intelligence records.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setError("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              {/* Job */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job
                </label>

                <select
                  name="jobDescriptionId"
                  value={form.jobDescriptionId}
                  onChange={handleJobChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">Select a job</option>

                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                      {job.company ? ` — ${job.company}` : ""}
                    </option>
                  ))}
                </select>

                {jobs.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    No jobs found. Add a job in Job Intelligence first.
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Applied Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Applied Date
                </label>

                <input
                  type="date"
                  name="appliedAt"
                  value={form.appliedAt}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Source */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Source
                </label>

                <input
                  type="text"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  placeholder="LinkedIn, company website..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Job URL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job URL
                </label>

                <input
                  type="url"
                  name="jobUrl"
                  value={form.jobUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add notes about this application..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applications List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Tracked Applications
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Briefcase size={42} className="mx-auto text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No applications yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add your first application to start tracking your job search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((application) => {
                const job = application.jobDescription;

                return (
                  <div
                    key={application.id}
                    className="p-6 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Job information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="rounded-xl bg-slate-100 p-3">
                            <Briefcase size={21} className="text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-slate-900">
                              {job?.title || "Job"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {job?.company || "Company not specified"}
                              {job?.location ? ` • ${job.location}` : ""}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={15} />
                                {application.appliedAt
                                  ? `Applied ${formatDate(
                                      application.appliedAt,
                                    )}`
                                  : "Not applied yet"}
                              </span>

                              {application.source && (
                                <span>Source: {application.source}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {application.notes && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            {application.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                        <select
                          value={application.status}
                          onChange={(event) =>
                            updateStatus(application.id, event.target.value)
                          }
                          className={`rounded-full border-0 px-4 py-2 text-sm font-semibold outline-none ${getStatusClasses(
                            application.status,
                          )}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          {(application.jobUrl || job?.jobUrl) && (
                            <a
                              href={application.jobUrl || job?.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <ExternalLink size={16} />
                              Job
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteApplication(application.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {application.status === "OFFER" && (
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        <CheckCircle2 size={18} />
                        Congratulations! You received an offer for this
                        application.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Applications;
