import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResumeIntelligence from "./pages/ResumeIntelligence";
import JobIntelligence from "./pages/JobIntelligence";
import JobMatches from "./pages/JobMatches";
import ResumeOptimization from "./pages/ResumeOptimization";
import CoverLetter from "./pages/CoverLetter";
import InterviewPrep from "./pages/InterviewPrep";
import Applications from "./pages/Applications";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./services/api";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Resume Intelligence */}
        <Route
          path="/resume-intelligence"
          element={
            <ProtectedRoute>
              <ResumeIntelligence />
            </ProtectedRoute>
          }
        />

        {/* Job Intelligence */}
        <Route
          path="/job-intelligence"
          element={
            <ProtectedRoute>
              <JobIntelligence />
            </ProtectedRoute>
          }
        />

        {/* Job Matching */}
        <Route
          path="/job-matches"
          element={
            <ProtectedRoute>
              <JobMatches />
            </ProtectedRoute>
          }
        />

        {/* Resume Optimization */}
        <Route
          path="/resume-optimization"
          element={
            <ProtectedRoute>
              <ResumeOptimization />
            </ProtectedRoute>
          }
        />

        {/* Cover Letter */}
        <Route
          path="/cover-letter"
          element={
            <ProtectedRoute>
              <CoverLetter />
            </ProtectedRoute>
          }
        />

        {/* Interview Preparation */}
        <Route
          path="/interview-prep"
          element={
            <ProtectedRoute>
              <InterviewPrep />
            </ProtectedRoute>
          }
        />

        {/* Applications */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const responses = await Promise.allSettled([
        api.get("/resumes"),
        api.get("/jobs"),
        api.get("/job-matches"),
        api.get("/applications"),
        api.get("/auth/me"),
      ]);

      const [
        resumesResponse,
        jobsResponse,
        matchesResponse,
        applicationsResponse,
        userResponse,
      ] = responses;

      if (
        resumesResponse.status === "rejected" &&
        resumesResponse.reason?.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (
        jobsResponse.status === "rejected" &&
        jobsResponse.reason?.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (
        matchesResponse.status === "rejected" &&
        matchesResponse.reason?.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (
        applicationsResponse.status === "rejected" &&
        applicationsResponse.reason?.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      /* -----------------------------
         RESUMES
      ----------------------------- */

      if (resumesResponse.status === "fulfilled") {
        const data = resumesResponse.value?.data;

        const resumeList =
          data?.resumes || data?.data || (Array.isArray(data) ? data : []);

        setResumes(Array.isArray(resumeList) ? resumeList : []);
      } else {
        setResumes([]);
      }

      /* -----------------------------
         JOBS
      ----------------------------- */

      if (jobsResponse.status === "fulfilled") {
        const data = jobsResponse.value?.data;

        const jobList =
          data?.jobs || data?.data || (Array.isArray(data) ? data : []);

        setJobs(Array.isArray(jobList) ? jobList : []);
      } else {
        setJobs([]);
      }

      /* -----------------------------
         JOB MATCHES
      ----------------------------- */

      if (matchesResponse.status === "fulfilled") {
        const data = matchesResponse.value?.data;

        const matchList =
          data?.matches ||
          data?.jobMatches ||
          data?.data ||
          (Array.isArray(data) ? data : []);

        setMatches(Array.isArray(matchList) ? matchList : []);
      } else {
        setMatches([]);
      }

      /* -----------------------------
         APPLICATIONS
      ----------------------------- */

      if (applicationsResponse.status === "fulfilled") {
        const data = applicationsResponse.value?.data;

        const applicationList =
          data?.applications || data?.data || (Array.isArray(data) ? data : []);

        setApplications(Array.isArray(applicationList) ? applicationList : []);
      } else {
        setApplications([]);
      }

      /* -----------------------------
         CURRENT USER
      ----------------------------- */

      if (userResponse.status === "fulfilled") {
        const currentUser = extractUser(userResponse.value?.data);

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);

      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  /* =========================================================
     REAL DASHBOARD CALCULATIONS
  ========================================================= */

  const latestResume = getLatestResume(resumes);

  const resumeScore = getResumeScore(latestResume);

  const totalMatches = matches.length;

  const totalApplications = applications.length;

  const interviewApplications = applications.filter((application) =>
    isInterviewStatus(application?.status),
  ).length;

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviewApplications / totalApplications) * 100)
      : 0;

  const topMatches = [...matches]
    .sort((a, b) => getMatchScore(b) - getMatchScore(a))
    .slice(0, 3);

  const recommendations = buildRecommendations(
    latestResume,
    topMatches,
    totalApplications,
  );

  const displayName = user?.name || user?.fullName || user?.username || "there";

  const initials = getInitials(user);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Sparkles size={20} />
          </div>

          <span className="text-lg font-bold">CareerIQ</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 p-4">
          <NavItem
            to="/"
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active
          />

          <NavItem
            to="/resume-intelligence"
            icon={<FileText size={19} />}
            label="Resume Intelligence"
          />

          <NavItem
            to="/job-intelligence"
            icon={<BriefcaseBusiness size={19} />}
            label="Job Intelligence"
          />

          <NavItem
            to="/job-matches"
            icon={<Target size={19} />}
            label="Job Matching"
          />

          <NavItem
            to="/resume-optimization"
            icon={<Sparkles size={19} />}
            label="Resume Optimization"
          />

          <NavItem
            to="/cover-letter"
            icon={<Mail size={19} />}
            label="Cover Letter"
          />

          <NavItem
            to="/interview-prep"
            icon={<MessageSquare size={19} />}
            label="Interview Prep"
          />

          <NavItem
            to="/applications"
            icon={<TrendingUp size={19} />}
            label="Applications"
          />

          {/* FIXED PROFILE */}
          <NavItem
            to="/profile"
            icon={<UserRound size={19} />}
            label="Profile"
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="text-lg">↪</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform border-r border-slate-200 bg-white transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={20} />
            </div>

            <span className="text-lg font-bold">CareerIQ</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="space-y-2 p-4">
          <MobileNavItem
            to="/"
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            active
            onClick={() => setMobileMenuOpen(false)}
          />

          <MobileNavItem
            to="/resume-intelligence"
            icon={<FileText size={19} />}
            label="Resume Intelligence"
            onClick={() => setMobileMenuOpen(false)}
          />

          <MobileNavItem
            to="/job-intelligence"
            icon={<BriefcaseBusiness size={19} />}
            label="Job Intelligence"
            onClick={() => setMobileMenuOpen(false)}
          />

          <MobileNavItem
            to="/job-matches"
            icon={<Target size={19} />}
            label="Job Matching"
            onClick={() => setMobileMenuOpen(false)}
          />

          <MobileNavItem
            to="/resume-optimization"
            icon={<Sparkles size={19} />}
            label="Resume Optimization"
            onClick={() => setMobileMenuOpen(false)}
          />

          <MobileNavItem
            to="/cover-letter"
            icon={<Mail size={19} />}
            label="Cover Letter"
            onClick={() => setMobileMenuOpen(false)}
          />

          <MobileNavItem
            to="/interview-prep"
            icon={<MessageSquare size={19} />}
            label="Interview Prep"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* FIXED MOBILE APPLICATIONS */}
          <MobileNavItem
            to="/applications"
            icon={<TrendingUp size={19} />}
            label="Applications"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* FIXED MOBILE PROFILE */}
          <MobileNavItem
            to="/profile"
            icon={<UserRound size={19} />}
            label="Profile"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="text-lg">↪</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-base font-semibold sm:text-lg">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              title="Refresh dashboard"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            {/* Profile */}
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
              title="Profile"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6">
          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                onClick={() => loadDashboard(true)}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="mb-6 overflow-hidden rounded-2xl bg-indigo-600 p-5 text-white shadow-sm sm:p-6">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-medium text-indigo-100 sm:text-sm">
                AI Career Intelligence
              </p>

              <h2 className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                Welcome back, {displayName}.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
                Track your resume strength, job matches, applications and
                interview progress from one place.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/resume-intelligence"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                >
                  Analyze Resume
                </Link>

                <Link
                  to="/job-intelligence"
                  className="inline-flex items-center justify-center rounded-xl border border-indigo-300 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Add Job
                </Link>
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Resume Score"
              value={loading ? "—" : resumeScore > 0 ? resumeScore : "—"}
              suffix={resumeScore > 0 ? "/100" : ""}
              description={
                loading
                  ? "Loading resume data..."
                  : latestResume
                    ? getResumeScoreDescription(resumeScore)
                    : "Upload and analyze a resume"
              }
              icon={<FileText size={20} />}
            />

            <StatCard
              title="Job Matches"
              value={loading ? "—" : totalMatches}
              description={
                loading
                  ? "Loading matches..."
                  : totalMatches === 0
                    ? "No matches yet"
                    : "AI job matches available"
              }
              icon={<Target size={20} />}
            />

            <StatCard
              title="Applications"
              value={loading ? "—" : totalApplications}
              description={
                loading
                  ? "Loading applications..."
                  : totalApplications === 0
                    ? "No applications tracked"
                    : "Tracked applications"
              }
              icon={<TrendingUp size={20} />}
            />

            <StatCard
              title="Interview Rate"
              value={loading ? "—" : `${interviewRate}%`}
              description={
                totalApplications === 0
                  ? "Apply to jobs to track progress"
                  : `${interviewApplications} interview-stage application${
                      interviewApplications === 1 ? "" : "s"
                    }`
              }
              icon={<MessageSquare size={20} />}
            />
          </section>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            resumes.length === 0 &&
            jobs.length === 0 &&
            matches.length === 0 &&
            applications.length === 0 && (
              <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Sparkles size={26} />
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  Your CareerIQ dashboard is ready
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Upload your resume and add a job description to start
                  generating real career intelligence.
                </p>

                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/resume-intelligence"
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Upload Resume
                  </Link>

                  <Link
                    to="/job-intelligence"
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Add Job
                  </Link>
                </div>
              </section>
            )}

          {/* =================================================
              MAIN DASHBOARD CONTENT
          ================================================= */}

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Top Job Matches */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">Top Job Matches</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your highest-scoring matches based on your resume.
                  </p>
                </div>

                <Link
                  to="/job-matches"
                  className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <div className="mt-5 space-y-3">
                  <LoadingRow />
                  <LoadingRow />
                  <LoadingRow />
                </div>
              ) : topMatches.length === 0 ? (
                <EmptyPanel
                  icon={<Target size={22} />}
                  title="No job matches yet"
                  text="Analyze a resume and job description to generate your first match."
                  link="/job-matches"
                  linkText="Go to Job Matching"
                />
              ) : (
                <div className="mt-5 space-y-3">
                  {topMatches.map((match, index) => (
                    <JobRow
                      key={match.id || match._id || index}
                      title={getMatchJobTitle(match, jobs)}
                      company={getMatchCompany(match, jobs)}
                      match={getMatchScore(match)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="font-semibold">AI Recommendations</h3>

              <p className="mt-1 text-sm text-slate-500">
                Suggestions based on your current CareerIQ data.
              </p>

              {loading ? (
                <div className="mt-5 space-y-3">
                  <LoadingRecommendation />
                  <LoadingRecommendation />
                  <LoadingRecommendation />
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <Recommendation
                      key={`${recommendation}-${index}`}
                      text={recommendation}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <h3 className="font-semibold">Quick Actions</h3>

              <p className="mt-1 text-sm text-slate-500">
                Continue building your job application profile.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                to="/resume-intelligence"
                icon={<FileText size={20} />}
                title="Resume Intelligence"
                text="Analyze your resume"
              />

              <QuickAction
                to="/job-intelligence"
                icon={<BriefcaseBusiness size={20} />}
                title="Job Intelligence"
                text="Add a target job"
              />

              <QuickAction
                to="/resume-optimization"
                icon={<Sparkles size={20} />}
                title="Optimize Resume"
                text="Improve your resume"
              />

              <QuickAction
                to="/interview-prep"
                icon={<MessageSquare size={20} />}
                title="Interview Prep"
                text="Prepare for interviews"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

function Profile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get("/auth/me");

        const currentUser = extractUser(response?.data);

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const name =
    user?.name || user?.fullName || user?.username || "CareerIQ User";

  const email = user?.email || "Email not available";

  const initials = getInitials(user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardLayout />

      <main className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div>
            <h1 className="text-base font-semibold sm:text-lg">Profile</h1>
          </div>

          <Link
            to="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to Dashboard
          </Link>
        </header>

        <div className="p-4 sm:p-6">
          <section className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Profile Banner */}
              <div className="h-32 bg-indigo-600" />

              <div className="-mt-12 px-5 pb-6 sm:px-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-sm">
                    {initials}
                  </div>

                  <Link
                    to="/"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                </div>

                <div className="mt-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {loading ? "Loading..." : name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {loading ? "Loading profile..." : email}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProfileField label="Full Name" value={name} />

                  <ProfileField label="Email Address" value={email} />
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="font-semibold">Account</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your CareerIQ account and continue building your
                    application profile.
                  </p>

                  <button
                    onClick={handleLogout}
                    className="mt-5 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   DASHBOARD SIDEBAR FOR PROFILE
========================================================= */

function DashboardLayout() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Sparkles size={20} />
        </div>

        <span className="text-lg font-bold">CareerIQ</span>
      </div>

      <nav className="space-y-2 p-4">
        <NavItem
          to="/"
          icon={<LayoutDashboard size={19} />}
          label="Dashboard"
        />

        <NavItem
          to="/resume-intelligence"
          icon={<FileText size={19} />}
          label="Resume Intelligence"
        />

        <NavItem
          to="/job-intelligence"
          icon={<BriefcaseBusiness size={19} />}
          label="Job Intelligence"
        />

        <NavItem
          to="/job-matches"
          icon={<Target size={19} />}
          label="Job Matching"
        />

        <NavItem
          to="/resume-optimization"
          icon={<Sparkles size={19} />}
          label="Resume Optimization"
        />

        <NavItem
          to="/cover-letter"
          icon={<Mail size={19} />}
          label="Cover Letter"
        />

        <NavItem
          to="/interview-prep"
          icon={<MessageSquare size={19} />}
          label="Interview Prep"
        />

        <NavItem
          to="/applications"
          icon={<TrendingUp size={19} />}
          label="Applications"
        />

        <NavItem
          to="/profile"
          icon={<UserRound size={19} />}
          label="Profile"
          active
        />

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <span className="text-lg">↪</span>
          Logout
        </button>
      </nav>
    </aside>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

/* =========================================================
   MOBILE NAV ITEM
========================================================= */

function MobileNavItem({ to, icon, label, active = false, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value, suffix = "", description, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-3xl font-bold text-slate-900">
        {value}

        <span className="text-lg font-medium text-slate-400">{suffix}</span>
      </div>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

/* =========================================================
   JOB ROW
========================================================= */

function JobRow({ title, company, match }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h4 className="truncate text-sm font-semibold text-slate-900">
          {title || "Job Match"}
        </h4>

        <p className="mt-1 truncate text-xs text-slate-500">
          {company || "Company not available"}
        </p>
      </div>

      <div className="self-start rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 sm:self-auto">
        {match > 0 ? `${match}%` : "—"} match
      </div>
    </div>
  );
}

/* =========================================================
   RECOMMENDATION
========================================================= */

function Recommendation({ text }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0 text-indigo-600">
          <Sparkles size={17} />
        </div>

        <p className="text-sm leading-5 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({ to, icon, title, text }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-white">
        {icon}
      </div>

      <h4 className="mt-3 text-sm font-semibold text-slate-900">{title}</h4>

      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </Link>
  );
}

/* =========================================================
   EMPTY PANEL
========================================================= */

function EmptyPanel({ icon, title, text, link, linkText }) {
  return (
    <div className="mt-5 rounded-xl bg-slate-50 p-7 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <h4 className="mt-3 text-sm font-semibold text-slate-800">{title}</h4>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        {text}
      </p>

      <Link
        to={link}
        className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {linkText}
      </Link>
    </div>
  );
}

/* =========================================================
   LOADING ROW
========================================================= */

function LoadingRow() {
  return (
    <div className="animate-pulse rounded-xl bg-slate-50 p-4">
      <div className="h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
    </div>
  );
}

/* =========================================================
   LOADING RECOMMENDATION
========================================================= */

function LoadingRecommendation() {
  return (
    <div className="animate-pulse rounded-xl bg-slate-50 p-4">
      <div className="h-3 w-full rounded bg-slate-200" />
      <div className="mt-2 h-3 w-4/5 rounded bg-slate-200" />
    </div>
  );
}

/* =========================================================
   PROFILE FIELD
========================================================= */

function ProfileField({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function extractUser(data) {
  if (!data) return null;

  return (
    data.user ||
    data.data?.user ||
    data.data ||
    (data.id || data.email || data.name ? data : null)
  );
}

function getInitials(user) {
  if (!user) return "U";

  const name =
    user.name || user.fullName || user.username || user.email || "User";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return parts[0]?.slice(0, 2).toUpperCase() || "U";
}

function getLatestResume(resumes) {
  if (!Array.isArray(resumes) || resumes.length === 0) {
    return null;
  }

  return [...resumes].sort((a, b) => {
    const dateA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();

    const dateB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();

    return dateB - dateA;
  })[0];
}

function getResumeScore(resume) {
  if (!resume) return 0;

  const possibleScores = [
    resume.score,
    resume.overallScore,
    resume.atsScore,
    resume.analysis?.overallScore,
    resume.analysis?.atsScore,
    resume.ResumeAnalysis?.overallScore,
  ];

  for (const score of possibleScores) {
    const number = Number(score);

    if (Number.isFinite(number) && number >= 0) {
      return Math.round(Math.min(100, number));
    }
  }

  return 0;
}

function getResumeScoreDescription(score) {
  if (score >= 85) return "Excellent resume strength";
  if (score >= 70) return "Good resume strength";
  if (score >= 50) return "Needs some improvement";
  if (score > 0) return "Resume needs improvement";

  return "Analyze your resume to get a score";
}

function getMatchScore(match) {
  if (!match) return 0;

  const possibleScores = [
    match.overallScore,
    match.matchScore,
    match.score,
    match.percentage,
    match.overall_score,
  ];

  for (const score of possibleScores) {
    const number = Number(score);

    if (Number.isFinite(number)) {
      return Math.round(Math.max(0, Math.min(100, number)));
    }
  }

  return 0;
}

function getMatchJobTitle(match, jobs) {
  if (!match) return "Job Match";

  const directTitle =
    match.jobDescription?.title ||
    match.job?.title ||
    match.title ||
    match.jobTitle;

  if (directTitle) return directTitle;

  const jobId = match.jobDescriptionId || match.jobId;

  if (jobId && Array.isArray(jobs)) {
    const job = jobs.find((item) => String(item?.id) === String(jobId));

    if (job?.title) return job.title;
  }

  return "Job Match";
}

function getMatchCompany(match, jobs) {
  if (!match) return "Company not available";

  const directCompany =
    match.jobDescription?.company || match.job?.company || match.company;

  if (directCompany) return directCompany;

  const jobId = match.jobDescriptionId || match.jobId;

  if (jobId && Array.isArray(jobs)) {
    const job = jobs.find((item) => String(item?.id) === String(jobId));

    if (job?.company) return job.company;
  }

  return "Company not available";
}

function isInterviewStatus(status) {
  const normalized = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  return [
    "INTERVIEW",
    "INTERVIEWING",
    "INTERVIEW_SCHEDULED",
    "PHONE_SCREEN",
    "TECHNICAL_INTERVIEW",
    "FINAL_INTERVIEW",
  ].includes(normalized);
}

function buildRecommendations(resume, topMatches, applicationCount) {
  const recommendations = [];

  if (!resume) {
    recommendations.push(
      "Upload and analyze your resume to unlock personalized career recommendations.",
    );
  } else {
    const analysis =
      resume.analysis || resume.ResumeAnalysis || resume.resumeAnalysis || {};

    const missingSkills = analysis.missingSkills || resume.missingSkills || [];

    const weaknesses = analysis.weaknesses || resume.weaknesses || [];

    if (Array.isArray(missingSkills) && missingSkills.length > 0) {
      recommendations.push(
        `Consider strengthening these missing skills: ${missingSkills
          .slice(0, 3)
          .map(formatRecommendationItem)
          .join(", ")}.`,
      );
    }

    if (Array.isArray(weaknesses) && weaknesses.length > 0) {
      recommendations.push(
        `Work on a resume improvement area: ${formatRecommendationItem(
          weaknesses[0],
        )}.`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Keep your resume focused on measurable achievements and relevant technical skills.",
      );
    }
  }

  if (topMatches.length === 0) {
    recommendations.push(
      "Add a job description and run Job Matching to discover your strongest opportunities.",
    );
  } else {
    const bestScore = getMatchScore(topMatches[0]);

    if (bestScore < 70) {
      recommendations.push(
        "Your current strongest match is below 70%. Review missing skills and optimize your resume for the target job.",
      );
    } else {
      recommendations.push(
        `Your strongest current job match is ${bestScore}%. Focus your applications on roles with strong alignment.`,
      );
    }
  }

  if (applicationCount === 0) {
    recommendations.push(
      "Start tracking applications so CareerIQ can measure your application progress.",
    );
  } else {
    recommendations.push(
      "Use Interview Prep for your strongest opportunities and keep your application statuses updated.",
    );
  }

  return recommendations.slice(0, 3);
}

function formatRecommendationItem(item) {
  if (typeof item === "string") return item;

  if (item && typeof item === "object") {
    return (
      item.name ||
      item.skill ||
      item.title ||
      item.text ||
      item.description ||
      "this area"
    );
  }

  return String(item);
}

export default App;
