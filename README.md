# G-CIRCLE — Discover. Collaborate. Build.

> **G-CIRCLE** is a university collaboration ecosystem built for Galgotias University that connects students based on their technical skills, communication abilities, academic interests, experience, and complementary strengths.

Instead of simple keyword or similarity matching, G-CIRCLE prioritises **COMPLEMENTARY TEAM FORMATION** — discovering collaborators who fill the collective missing technical and communication gaps of a project team.

---

## 🏛️ Platform Highlights & Unique Selling Proposition (USP)

1. **Complementary Team Formation (Core USP)**:
   - Analyzes capabilities already covered by existing members of a team.
   - Calculates true missing capabilities with weighted skill scoring:
     $$\text{Skill Score} = \frac{\sum (\text{Importance Weight} \times \text{Proficiency})}{\text{Max Possible Score}}$$
   - Prioritizes candidates who fill those exact missing gaps.
   - Provides human-readable, transparent explanations: *"Your team needs Machine Learning and Node.js. This student brings Machine Learning at Expert proficiency."*

2. **Communication & Collaboration Matching ("Find Communication Partners")**:
   - Matches technical students with partners strong in Public Speaking, Presentation Skills, Pitch Decks, and Team Coordination.
   - Evaluates self-declared communication strengths, collaboration styles, preferred communication channels, and availability.

3. **Integrated Team Workspace & Sprint Kanban**:
   - Team workspaces with three-column Kanban sprint boards (`TO DO`, `IN PROGRESS`, `DONE`).
   - Assign members, track deadlines, set task priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and update statuses with real-time progress calculations.

4. **University Identity & Security**:
   - Restricted exclusively to `@galgotiasuniversity.ac.in` email addresses (validated on both client and server).
   - Email verification with expiring 6-digit OTPs and rate limiting.
   - Password hashing with `bcrypt` (10 rounds) and stateless JWT authentication.

5. **Strict Elegant University Palette**:
   - Strictly built using **Burgundy** (`#722F3E`, `#51212E`), **Warm Beige** (`#E9DDCE`, `#F3EBE1`), and **Ivory** (`#FAF8F4`, `#FFFFFF`).
   - Strict contrast rule: Dark text on light surfaces; light text on dark surfaces.
   - Dedicated **Theme & Appearance** customizer in Settings supporting **Light Mode**, **Dark Mode**, and **System Default**, across **Soft**, **Classic**, and **Rich** intensities.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Context API, Lucide React icons, Vanilla CSS custom properties.
- **Backend**: Node.js v24, Express.js (Modular Monolithic Architecture), REST APIs, Zod validation, Helmet, CORS, Morgan, Express Rate Limit, Nodemailer.
- **Database & ORM**: PostgreSQL 18 with Prisma ORM (24 normalized relational tables, transactions, foreign keys, cascades, unique constraints).
- **Authentication**: JWT, bcryptjs, Galgotias University domain verification, 6-digit OTP verification.

---

## 📂 Project Architecture & Folder Structure

```
G-Circle/
├── package.json                   # Root workspace management
├── .env.example                   # Root environment template
├── API_DOCUMENTATION.md           # Complete REST API specifications
├── postman_collection.json        # Postman test collection
├── server/
│   ├── .env.example               # Backend environment template
│   ├── package.json               # Backend dependencies & scripts
│   ├── prisma/
│   │   └── schema.prisma          # 24 normalized PostgreSQL models
│   └── src/
│       ├── config/
│       │   ├── db.js              # Prisma Client singleton
│       │   └── constants.js       # University rules, weights, courses
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT validation & user attachment
│       │   └── errorHandler.js    # Centralized Zod & Prisma error handler
│       ├── modules/
│       │   ├── auth/              # Registration, OTP, Login, Password Reset
│       │   ├── users/             # Profile, Student search, Preferences
│       │   ├── skills/            # Structured technical & comm skills
│       │   ├── projects/          # CRUD & AI skill analysis
│       │   ├── teams/             # Team management & Join requests
│       │   ├── matching/          # Complementary matching & gap engine
│       │   ├── tasks/             # Kanban sprint task management
│       │   └── dashboard/         # Statistics & Notifications
│       ├── routes/
│       │   └── index.js           # Master API router
│       ├── scripts/
│       │   ├── start-db.js        # PostgreSQL zero-friction runner
│       │   └── seed.js            # Galgotias student & project seed data
│       ├── utils/
│       │   ├── jwt.js             # Token sign & verify
│       │   ├── emailService.js    # OTP dispatch & simulation
│       │   └── response.js        # Standard response formatting
│       ├── validators/            # Zod validation schemas
│       ├── app.js                 # Express application configuration
│       └── server.js              # Server entry point
├── client/
│   ├── index.html                 # App shell with Inter & Manrope fonts
│   ├── vite.config.js             # Vite configuration with /api proxy
│   ├── package.json               # Frontend dependencies
│   └── src/
│       ├── components/            # Sidebar, Navbar, StatCard, ProjectCard,
│       │                          # StudentCard, TaskCard, SkillBadge, Modal
│       ├── context/
│       │   ├── AuthContext.jsx    # Session state & auth actions
│       │   └── ThemeContext.jsx   # Theme mode & intensity state
│       ├── layouts/
│       │   ├── DashboardLayout.jsx# Fixed 250px sidebar & 72px navbar
│       │   └── AuthLayout.jsx     # Elegant university branding pane
│       ├── pages/
│       │   ├── Login.jsx          # Official Galgotias student login
│       │   ├── Register.jsx       # Student registration & domain check
│       │   ├── VerifyEmail.jsx    # 6-digit OTP verification
│       │   ├── Dashboard.jsx      # Overview, stats, recommendations, tasks
│       │   ├── ExploreProjects.jsx# Search & filtered project discovery
│       │   ├── FindCollaborators.jsx # Dual-mode Technical & Communication
│       │   ├── CreateProject.jsx  # AI-assisted skill extraction & team creation
│       │   ├── ProjectDetails.jsx # Team Skill Gap Analysis & Join Request
│       │   ├── MyProjects.jsx     # Managed projects table
│       │   ├── MyTeams.jsx        # Active collaborative teams
│       │   ├── TeamWorkspace.jsx  # 3-column Kanban board & member roster
│       │   ├── MyTasks.jsx        # Personal sprint task tracking
│       │   ├── RequestsInbox.jsx  # Join request accept/reject actions
│       │   ├── StudentProfile.jsx # Structured skills & proficiency levels
│       │   └── Settings.jsx       # Theme customizer & privacy settings
│       ├── services/              # Axios service layer
│       └── styles/
│           ├── theme.css          # Burgundy, Warm Beige, Ivory tokens
│           └── global.css         # Typography, buttons, inputs, cards
```

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ or v24+
- **npm**: v9+

### 2. Clone / Open Repository
```bash
cd "c:\Users\aayus\OneDrive\Desktop\G-Circle"
```

### 3. Install Dependencies
Run from root (or install in client and server):
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 4. Database Setup (PostgreSQL 18)
G-CIRCLE is configured to connect to PostgreSQL on port `5432` with connection URL:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/gcircle?schema=public"
```

> **Zero Friction Local PostgreSQL**:
> If you do not have an external PostgreSQL instance running, G-CIRCLE includes an automated PostgreSQL runner powered by `embedded-postgres`:
> ```bash
> npm run db:start
> ```
> This automatically downloads native PostgreSQL binaries, initializes data files in `server/data/postgres/`, creates the `gcircle` database, and serves it on `127.0.0.1:5432`.

### 5. Run Migrations & Seed Data
Push the Prisma schema to PostgreSQL and seed rich sample data:
```bash
# Push 24 relational tables to PostgreSQL
npm --prefix server run db:push

# Seed Galgotias University students, skills, projects, and Kanban tasks
npm --prefix server run db:seed
```

---

## 🚀 Running the Application

### Option A: Run Full-Stack Concurrently
From the project root:
```bash
npm run dev
```

### Option B: Run Services Separately
In Terminal 1 (Backend API on `http://localhost:5001`):
```bash
npm run server
```

In Terminal 2 (Frontend Client on `http://localhost:5173`):
```bash
npm run client
```

Open your browser to: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Student Demo Accounts

All accounts use password: **`Password@123`**

| Student Name | University Email | Academic Role | Key Strengths |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `aarav.sharma@galgotiasuniversity.ac.in` | B.Tech CSE, 3rd Year | React.js (Expert), UI/UX (Adv), Team Leader |
| **Priya Patel** | `priya.patel@galgotiasuniversity.ac.in` | B.Tech CSE, 3rd Year | Node.js (Expert), PostgreSQL (Expert), Backend Lead |
| **Rohan Verma** | `rohan.verma@galgotiasuniversity.ac.in` | B.Tech CSE, 2nd Year | Machine Learning (Expert), Python (Expert), AI Specialist |
| **Ananya Singh** | `ananya.singh@galgotiasuniversity.ac.in` | B.Tech ECE, 4th Year | Public Speaking (Expert), Presentation (Expert), Coordinator |
| **Devansh Gupta** | `devansh.gupta@galgotiasuniversity.ac.in` | MCA, 2nd Year | Docker (Expert), Full-Stack, Technical Explanation |
| **Ishita Roy** | `ishita.roy@galgotiasuniversity.ac.in` | BBA, 2nd Year | Product Management, Presentation, Leadership |

*(Clickable demo login pills are also provided right on the Login screen for instant one-click login during testing.)*

---

## 🧮 Matching Engine Algorithm Details

The matching engine is designed to prioritize **Complementary Team Formation**:

### 1. Skill Gap Analysis
For any project team:
1. Gathers all skills possessed by existing team members and records the maximum collective proficiency for each skill.
2. Compares against `project_skills` (each with `importance` 1 to 5).
3. If an existing member has proficiency $\ge 2$, the skill is categorized as **Covered**.
4. Otherwise, the skill is identified as a **Missing Team Gap**.

### 2. Weighted Score Breakdown
Candidates are evaluated against the existing team using a configurable weighted model:

$$\text{Final Score} = 0.40 \cdot S_{\text{comp}} + 0.15 \cdot S_{\text{role}} + 0.10 \cdot S_{\text{avail}} + 0.10 \cdot S_{\text{exp}} + 0.10 \cdot S_{\text{int}} + 0.05 \cdot S_{\text{past}} + 0.10 \cdot S_{\text{comm}}$$

Where:
- $S_{\text{comp}}$: Complementary missing skill match percentage.
- $S_{\text{role}}$: Open role compatibility.
- $S_{\text{avail}}$: Working availability alignment (Flexible / Morning / Afternoon / Evening).
- $S_{\text{exp}}$: Academic year and project experience.
- $S_{\text{int}}$: Academic domain interest match.
- $S_{\text{past}}$: Past team collaboration track record.
- $S_{\text{comm}}$: Collaboration style and communication method overlap.

---

## ✅ Feature Verification Checklist

- [x] **Strict Palette**: Burgundy, Warm Beige, Ivory only. No prohibited colors.
- [x] **WCAG Contrast**: Dark typography on light surfaces; light typography on dark surfaces.
- [x] **Theme Customization**: Light, Dark, System Default modes with Soft, Classic, Rich intensities in Settings.
- [x] **Galgotias Email Enforcement**: `@galgotiasuniversity.ac.in` checked on frontend and backend.
- [x] **Email Verification**: 6-digit OTP verification with expiration and attempt tracking.
- [x] **AI-Assisted Skill Extraction**: Rule-based structured extractor with Zod validation.
- [x] **Automatic Team Creation**: Creating a project automatically initializes team with creator as Leader.
- [x] **Team Skill Gap Analysis**: Covered vs Missing capabilities with priority weights.
- [x] **Complementary Recommendations**: Recommends students who fill missing skills with clear explanations.
- [x] **Find Communication Partners**: Dual-mode discovery for technical skills vs soft skills / presentations.
- [x] **Sprint Kanban Board**: To Do, In Progress, Done columns with status updates and member assignment.
- [x] **Requests Inbox**: Team leaders can review, accept, and reject join requests with database transactions.
- [x] **Personal Task Tracking**: View all tasks assigned across multiple teams in one personal workspace.
