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

# 🚀 Installation & Setup Guide

Follow these steps to download, configure, and run **G-Circle** on your local machine.

## 1. Prerequisites

Make sure you have installed the following software:

| Software | Purpose | Download |
|---|---|---|
| Node.js (LTS) | Run JavaScript applications | [Download](https://nodejs.org/) |
| npm | Install project dependencies | Included with Node.js |
| PostgreSQL | Database management | [Download](https://www.postgresql.org/download/) |
| pgAdmin | Manage PostgreSQL databases | [Download](https://www.pgadmin.org/download/) |
| Git | Clone the repository | [Download](https://git-scm.com/downloads) |
| VS Code | Code editor | [Download](https://code.visualstudio.com/) |

Verify your installations:

```bash
node --version
npm --version
git --version
```

## 2. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/OWNER/REPOSITORY.git
```

Replace `OWNER/REPOSITORY` with the actual GitHub repository path.

Navigate to the project directory:

```bash
cd G-Circle
```

## 3. Install Dependencies

G-Circle has separate dependencies for the root project, frontend, and backend.

Run these commands from the project root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Wait for all dependencies to finish installing.

## 4. Set Up PostgreSQL Database

G-Circle uses PostgreSQL to store user accounts, student profiles, skills, projects, and other application data.

### Step 1: Create a Database

1. Open pgAdmin.
2. Connect to your PostgreSQL server.
3. Right-click **Databases**.
4. Select **Create → Database**.
5. Enter the database name:

```text
g_circle_new
```

6. Click **Save**.

### Step 2: Note Your Database Credentials

You will need:

- PostgreSQL username
- PostgreSQL password
- Host (usually `localhost`)
- Port (commonly `5432`)
- Database name (`g_circle_new`)

Your PostgreSQL port may be different. Use the port configured on your computer.

## 5. Configure Environment Variables

Environment variables store configuration values such as database credentials, authentication secrets, and email settings.

**Never upload your actual `.env` files to GitHub.**

### Step 1: Create the Root Environment File

Copy the root `.env.example` file and rename the copy to:

```text
.env
```

### Step 2: Create the Server Environment File

Inside the `server` directory, copy:

```text
server/.env.example
```

Rename the copy to:

```text
server/.env
```

### Step 3: Configure Server Environment Variables

Open `server/.env` and configure the required values.

Example:

```env
PORT=5002
NODE_ENV=development

DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/g_circle_new?schema=public"

JWT_SECRET="YOUR_SECURE_JWT_SECRET"
JWT_EXPIRES_IN="7d"

CLIENT_URL="http://localhost:5173"

EMAIL_SERVICE_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-google-app-password
EMAIL_FROM="G-Circle <your-gmail@gmail.com>"

OTP_HASH_SECRET=YOUR_RANDOM_SECRET
```

Replace all placeholder values with your own credentials.

**Important:**
- Make sure the database port matches your PostgreSQL configuration.
- Use a strong, unique JWT secret.
- Use a Google App Password for Gmail SMTP instead of your regular Gmail password.
- Keep `OTP_HASH_SECRET` private and stable. Changing it can invalidate pending OTP verification records.

### Step 4: Generate OTP Hash Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `server/.env`:

```env
OTP_HASH_SECRET=your_generated_secret
```

Do not share or commit this secret.

### Step 5: Configure Gmail SMTP

To enable email OTP delivery:

1. Use a Gmail account.
2. Enable 2-Step Verification if required.
3. Generate a Google App Password.
4. Add the Gmail address and App Password to `server/.env`.

Refer to Google's documentation: [Google App Passwords](https://support.google.com/accounts/answer/185833).

## 6. Configure Prisma and Database Tables

G-Circle uses Prisma ORM to communicate with PostgreSQL.

Open a terminal and navigate to the server directory:

```bash
cd server
```

Format the Prisma schema:

```bash
npx prisma format
```

Validate the schema:

```bash
npx prisma validate
```

Generate Prisma Client:

```bash
npm run db:generate
```

### Create Database Tables

For a new, empty local development database, run:

```bash
npx prisma db push
```

This synchronizes your PostgreSQL database structure with the Prisma schema.

**Important:**
- Confirm that `DATABASE_URL` points to your local development database.
- Do not run this command against a production database.
- If the repository provides a Prisma migration history, follow its migration instructions instead of blindly using `db push`.

After successful setup, you can inspect the database tables using pgAdmin.

## 7. Start the Backend

Make sure your terminal is inside the `server` directory.

Run:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5002
```

### Verify Backend Status

Open this URL in your browser:

```text
http://localhost:5002/api/health
```

A successful response should look similar to:

```json
{
  "status": "online",
  "platform": "G-CIRCLE",
  "tagline": "Discover. Collaborate. Build."
}
```

Keep the backend terminal running.

## 8. Start the Frontend

Open a **new terminal**.

Navigate to the client directory:

```bash
cd client
```

Start the frontend:

```bash
npm run dev
```

The frontend will usually be available at:

```text
http://localhost:5173
```

Open the URL displayed in your terminal.

Keep both frontend and backend terminals running.

## 9. Test the Application

Once both applications are running, test the following features:

- [ ] Register a new account.
- [ ] Receive an email OTP.
- [ ] Verify your email address.
- [ ] Log in successfully.
- [ ] Create or update your student profile.
- [ ] Add technical skills.
- [ ] Explore Find Teammates.
- [ ] Explore Project Collaboration.
- [ ] Test team and project workflows that are enabled.

Some features may require multiple test accounts or existing student records.

## 10. Troubleshooting

### Database Connection Error

Check:
- PostgreSQL is running.
- Database name is correct.
- Username and password are correct.
- PostgreSQL port matches `DATABASE_URL`.

### Prisma Client Error

Run from the `server` directory:

```bash
npm run db:generate
```

Restart the backend afterward.

### OTP Email Not Received

Check:
- `EMAIL_SERVICE_ENABLED=true`
- Gmail address is correct.
- Google App Password is correct.
- SMTP host and port are configured correctly.
- Spam folder.

### Frontend Cannot Connect to Backend

Check:
- Backend is running.
- Frontend API base URL is correct.
- CORS configuration allows the frontend origin.
- Frontend and backend ports are configured correctly.

### Port Already in Use

Another application may already be using the configured port. Stop that process or configure an available port and update related frontend API and CORS settings.

## 11. Security Guidelines

- Never commit `.env` files.
- Never upload database passwords or Gmail App Passwords.
- Never share JWT or OTP hashing secrets.
- Do not expose database credentials in frontend code.
- Use a separate database for local development.
- Do not use development credentials in production.

## 12. Useful Commands

| Purpose | Command |
|---|---|
| Install root dependencies | `npm install` |
| Install frontend dependencies | `npm --prefix client install` |
| Install backend dependencies | `npm --prefix server install` |
| Format Prisma schema | `npx prisma format` |
| Validate Prisma schema | `npx prisma validate` |
| Generate Prisma Client | `npm run db:generate` |
| Synchronize database | `npx prisma db push` |
| Start backend | `npm run dev` (inside `server`) |
| Start frontend | `npm run dev` (inside `client`) |

---

## 🎉 Setup Complete!

You have successfully configured the G-Circle development environment.

**Discover. Collaborate. Build.**



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
