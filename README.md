# CareerIQ — AI Career Intelligence Platform

CareerIQ is a full-stack AI-powered career intelligence platform designed to help job seekers analyze their resumes, understand job requirements, identify skill gaps, optimize applications, generate personalized cover letters, and prepare for interviews.

The platform combines modern web technologies, AI-powered analysis, document processing, cloud storage, and a relational database into one integrated career management application.

## Live Application

https://careeriq-pyqq.onrender.com

## GitHub Repository

https://github.com/thisisjknaidu/CareerIQ

---

## Project Overview

Finding a suitable job involves more than simply submitting a resume.

CareerIQ provides an intelligent workflow that helps users:

- Analyze and score their resumes
- Extract information from PDF and DOCX resumes
- Analyze job descriptions using AI
- Match resumes with job requirements
- Identify matched and missing skills
- Optimize resumes for specific jobs
- Generate personalized cover letters
- Prepare for job interviews
- Track job applications
- Monitor career-related information through a centralized dashboard

The goal of CareerIQ is to provide an end-to-end AI-assisted career management experience.

---

## Key Features

### 1. User Authentication

CareerIQ provides secure user authentication using:

- User registration
- User login
- JWT-based authentication
- Protected API routes
- User-specific data access
- Logout functionality

---

### 2. Resume Intelligence

Users can upload resumes in:

- PDF
- DOCX

CareerIQ extracts the resume content and uses AI to analyze it.

The system provides information such as:

- Overall resume score
- ATS score
- Keyword score
- Impact score
- Resume summary
- Skills
- Experience
- Education
- Projects
- Certifications
- Strengths
- Weaknesses
- Missing skills

Uploaded resumes are stored using Cloudinary while extracted resume text and analysis data are stored in PostgreSQL.

---

### 3. Job Intelligence

Users can add job descriptions and analyze them using AI.

CareerIQ identifies:

- Required skills
- Technologies
- Responsibilities
- Education requirements
- Experience requirements
- Keywords
- Job summary

This helps users understand what a particular job actually requires.

---

### 4. AI Job Matching

CareerIQ compares a user's resume with a selected job description.

The matching system provides:

- Overall match score
- Skill score
- Experience score
- Education score
- Keyword score
- Matched skills
- Missing skills
- Strengths
- Recommendations

This helps users understand how well their current profile matches a specific job.

---

### 5. Resume Optimization

Users can select a resume and job description and generate an AI-assisted optimized resume.

The feature provides recommendations focused on improving the resume for the selected job.

---

### 6. AI Cover Letter Generator

CareerIQ generates personalized cover letters based on:

- Resume information
- Job description
- Candidate profile

Users can edit and copy the generated cover letter before using it.

---

### 7. AI Interview Preparation

CareerIQ generates interview preparation material based on the user's resume and target job.

It can provide:

- Technical questions
- Resume-based questions
- Behavioral questions
- Job-specific questions

This helps users prepare for interviews using their actual career information.

---

### 8. Application Tracking

Users can track their job applications through the platform.

Application information includes:

- Job
- Status
- Application date
- Notes
- Source
- Job URL

This provides a centralized view of the user's job search activity.

---

### 9. Career Dashboard

The dashboard provides an overview of the user's career activity, including:

- Resume score
- Job matches
- Applications
- Interview rate
- Recent job matches
- Career activity

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Recharts

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- Multer

### Database

- PostgreSQL
- Neon PostgreSQL
- Prisma ORM

### AI

- OpenAI API

AI is used for:

- Resume analysis
- Job description analysis
- Resume-job matching
- Resume optimization
- Cover letter generation
- Interview preparation

### File Storage

- Cloudinary

Cloudinary is used for storing uploaded resume files.

### Deployment

- Render
- GitHub
- Neon PostgreSQL
- Cloudinary

---

## System Architecture

```text
                         ┌─────────────────────┐
                         │      User           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React Frontend      │
                         │ Vite + Tailwind     │
                         └──────────┬──────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Express Backend     │
                         │ Node.js             │
                         └──────┬──────┬───────┘
                                │      │
                 ┌──────────────┘      └──────────────┐
                 ▼                                    ▼
       ┌──────────────────┐                  ┌──────────────────┐
       │ PostgreSQL       │                  │ OpenAI API       │
       │ Neon             │                  │ AI Processing    │
       └──────────────────┘                  └──────────────────┘
                 │
                 │
                 ▼
       ┌──────────────────┐
       │ Cloudinary       │
       │ Resume Storage   │
       └──────────────────┘
Application Workflow
Register / Login
       │
       ▼
Upload Resume
       │
       ▼
Extract Resume Text
       │
       ▼
AI Resume Analysis
       │
       ▼
Add Job Description
       │
       ▼
AI Job Analysis
       │
       ▼
Resume ↔ Job Matching
       │
       ├───────────────┐
       ▼               ▼
Resume Optimization   Cover Letter
       │
       ▼
Interview Preparation
       │
       ▼
Application Tracking
Database Design

CareerIQ uses PostgreSQL with Prisma ORM.

Main Models
User
Resume
ResumeAnalysis
JobDescription
JobMatch
Application
Relationships
User
 │
 ├── Resumes
 │      │
 │      └── ResumeAnalysis
 │
 ├── JobDescriptions
 │      │
 │      ├── JobMatches
 │      └── Applications
 │
 ├── JobMatches
 │
 └── Applications
API Structure

The backend exposes REST API endpoints for the major application modules.

Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Resumes
GET    /api/resumes
GET    /api/resumes/:id
POST   /api/resumes
POST   /api/resumes/:id/analyze
DELETE /api/resumes/:id
Jobs
GET    /api/jobs
POST   /api/jobs
POST   /api/jobs/:id/analyze
DELETE /api/jobs/:id
Job Matching
GET  /api/job-matches
POST /api/job-matches
Resume Optimization
POST /api/resume-optimization
Cover Letter
POST /api/cover-letter
Interview Preparation
POST /api/interview-prep
Applications
GET    /api/applications
POST   /api/applications
PUT    /api/applications/:id
DELETE /api/applications/:id
Health Check
GET /api/health
Security

CareerIQ implements several security practices:

JWT-based authentication
Protected backend routes
User-specific database queries
Password hashing using bcrypt
Environment variables for sensitive credentials
Server-side OpenAI API access
Cloudinary credentials stored as environment variables
File type validation
File size limits for resume uploads

Sensitive environment variables are intentionally excluded from GitHub.

Resume Processing

CareerIQ supports both PDF and DOCX resumes.

The processing pipeline is:

Resume File
     │
     ▼
Multer
     │
     ▼
Memory Buffer
     │
     ├───────────────┐
     ▼               ▼
   PDF             DOCX
     │               │
     ▼               ▼
 pdf-parse         Mammoth
     │               │
     └───────┬───────┘
             ▼
       Extracted Text
             │
             ▼
         PostgreSQL
             │
             ▼
          OpenAI
             │
             ▼
       Resume Analysis
AI Architecture

CareerIQ uses AI as an assistance layer across multiple career workflows.

Resume Analysis

Resume content is analyzed to identify:

Skills
Experience
Education
Projects
Certifications
Strengths
Weaknesses
Missing skills
ATS-related metrics
Job Analysis

Job descriptions are analyzed to identify the requirements and important keywords.

Matching

Resume and job information are compared to calculate multiple matching dimensions.

Resume Optimization

The system uses the selected job requirements to provide targeted resume improvements.

Cover Letters

The candidate's profile and target job are used to generate a personalized cover letter.

Interview Preparation

The system generates interview questions based on the candidate's resume and target position.

Local Development
Prerequisites

Make sure the following are installed:

Node.js
npm
Git
PostgreSQL/Neon account
Cloudinary account
OpenAI API access
Clone the Repository
git clone https://github.com/thisisjknaidu/CareerIQ.git
cd CareerIQ
Backend Setup
cd server
npm install

Create a .env file:

DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Generate Prisma Client:

npx prisma generate

Run database migrations when required:

npx prisma migrate dev

Start the development server:

npm run dev

The backend runs locally on:

http://localhost:5000
Frontend Setup

Open another terminal:

cd client
npm install

Create a .env file if required:

VITE_API_URL=http://localhost:5000

Start the frontend:

npm run dev

The frontend runs locally on:

http://localhost:5173
Environment Variables

The following variables are required for production:

DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

Environment files containing real credentials must never be committed to GitHub.

Deployment

CareerIQ is deployed using Render.

Frontend

The React application is deployed as a Render Static Site.

client/
   ↓
npm install
   ↓
npm run build
   ↓
dist/
Backend

The Express API is deployed as a Render Web Service.

server/
   ↓
npm install
   ↓
npx prisma generate
   ↓
npm start
Production Services
Frontend → Render
Backend  → Render
Database → Neon PostgreSQL
Storage  → Cloudinary
AI       → OpenAI API
Source   → GitHub
Testing

The application was tested across the major user workflows:

User registration
User login
JWT authentication
User logout
Resume upload
Resume text extraction
Resume AI analysis
Job creation
Job AI analysis
Resume-job matching
Resume optimization
Cover letter generation
Interview preparation
Application tracking
Dashboard data
Protected API routes
Production deployment
Cloudinary resume storage
Project Structure
CareerIQ/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── cloudinary.js
│   │
│   ├── lib/
│   │   └── prisma.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── resume.routes.js
│   │   ├── job.routes.js
│   │   ├── job-match.routes.js
│   │   ├── resume-optimization.routes.js
│   │   ├── cover-letter.routes.js
│   │   ├── interview-prep.routes.js
│   │   └── application.routes.js
│   │
│   ├── services/
│   │   ├── ai/
│   │   └── resume/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
Future Enhancements

Possible future improvements include:

Job search and job-board integration
Automated job recommendations
Email notifications
Application deadline reminders
Advanced career analytics
Skill development recommendations
Interview feedback analysis
Resume version management
More AI-powered career insights
Additional job-source integrations
Project Objectives

The main objectives of CareerIQ are:

Build a centralized career management platform.
Use AI to analyze resumes and job descriptions.
Help users understand their compatibility with job opportunities.
Provide personalized resume improvement recommendations.
Generate job-specific cover letters.
Assist users with interview preparation.
Track applications through a unified dashboard.
Demonstrate the integration of modern full-stack technologies with AI.
Conclusion

CareerIQ demonstrates how artificial intelligence can be integrated with a modern full-stack web application to solve practical problems in the job application process.

The project combines frontend development, backend API development, database management, authentication, document processing, cloud storage, AI integration, and cloud deployment into a single application.

It provides an end-to-end workflow from resume analysis to job matching, application preparation, interview preparation, and application tracking.

Author

Jaya Krishna

CareerIQ — AI Career Intelligence Platform

Built as a full-stack AI-powered college project.
```
