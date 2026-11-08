# G-CIRCLE REST API Documentation
**Platform**: G-CIRCLE  
**Tagline**: Discover. Collaborate. Build.  
**Domain Constraint**: `@galgotiasuniversity.ac.in`  
**Base URL**: `http://localhost:5001/api`

---

## 1. Authentication (`/api/auth`)

### 1.1 Register Student
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Validation**: Email must end with `@galgotiasuniversity.ac.in`. Password minimum 6 characters. Passwords must match.
- **Request Body**:
```json
{
  "name": "Aarav Sharma",
  "studentId": "22SCSE1010045",
  "email": "aarav.sharma@galgotiasuniversity.ac.in",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "academicYear": "3rd Year",
  "course": "B.Tech CSE",
  "linkedin": "https://linkedin.com/in/aarav-sharma-gu",
  "github": "aarav-sharma"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Registration successful. Please enter the verification OTP sent to your university email.",
  "data": {
    "email": "aarav.sharma@galgotiasuniversity.ac.in",
    "name": "Aarav Sharma"
  }
}
```

### 1.2 Verify University Email (OTP)
- **Endpoint**: `POST /api/auth/verify-email`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "aarav.sharma@galgotiasuniversity.ac.in",
  "otp": "123456"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "University email verified successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "c1f7b8b2-...",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@galgotiasuniversity.ac.in",
      "emailVerified": true
    }
  }
}
```

### 1.3 Resend OTP
- **Endpoint**: `POST /api/auth/resend-otp`
- **Request Body**:
```json
{
  "email": "aarav.sharma@galgotiasuniversity.ac.in"
}
```

### 1.4 Student Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "aarav.sharma@galgotiasuniversity.ac.in",
  "password": "Password@123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "c1f7b8b2-...",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@galgotiasuniversity.ac.in",
      "academicYear": "3rd Year",
      "course": "B.Tech CSE",
      "emailVerified": true
    }
  }
}
```

---

## 2. Student Profile & Skills (`/api/users` & `/api/skills`)

### 2.1 Get Current User Profile
- **Endpoint**: `GET /api/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Aarav Sharma",
    "skills": [
      {
        "id": "uuid",
        "proficiency": 4,
        "skill": { "name": "React.js", "category": "Frontend" }
      }
    ],
    "communicationSkills": [
      {
        "proficiency": 4,
        "communicationSkill": { "name": "Leadership" }
      }
    ],
    "preferences": {
      "collaborationStyle": "Brainstorming together",
      "availability": "Flexible",
      "themeMode": "light",
      "themeIntensity": "classic"
    }
  }
}
```

### 2.2 Add Structured Technical Skill
- **Endpoint**: `POST /api/users/me/skills`
- **Request Body**:
```json
{
  "skillName": "PostgreSQL",
  "proficiency": 3
}
```
*(Proficiency: 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert)*

### 2.3 Search Students
- **Endpoint**: `GET /api/users/search?query=react&course=B.Tech+CSE&academicYear=3rd+Year`

---

## 3. Projects & Discovery (`/api/projects`)

### 3.1 AI-Assisted Skill Extraction
- **Endpoint**: `POST /api/projects/analyze`
- **Request Body**:
```json
{
  "title": "Smart Campus Navigation",
  "description": "We are building an AI-powered indoor routing web app with React, FastAPI, Dijkstra pathfinding, and crowd estimation models."
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "project_type": "Hackathon",
    "required_skills": [
      { "skill": "React.js", "importance": 4 },
      { "skill": "Machine Learning", "importance": 5 },
      { "skill": "Python", "importance": 4 }
    ],
    "roles": ["Frontend Developer", "ML Engineer", "Backend Developer"],
    "team_size": 4,
    "difficulty": "Advanced",
    "missing_skills": ["Machine Learning"]
  }
}
```

### 3.2 Create Project & Team
- **Endpoint**: `POST /api/projects`
- **Request Body**:
```json
{
  "title": "CampusNav — Smart Navigation",
  "description": "Interactive map for Galgotias University blocks with crowd estimation.",
  "projectType": "Hackathon",
  "requiredTeamSize": 4,
  "difficulty": "Advanced",
  "deadline": "2026-12-15",
  "requiredSkills": [
    { "name": "React.js", "importance": 4 },
    { "name": "Node.js", "importance": 4 },
    { "name": "Machine Learning", "importance": 5 }
  ],
  "roles": [
    { "roleName": "Backend Engineer", "openCount": 1 },
    { "roleName": "ML Specialist", "openCount": 1 }
  ]
}
```

---

## 4. Complementary Matching Engine (`/api/matching`)

### 4.1 Team Skill Gap Analysis
- **Endpoint**: `GET /api/matching/projects/:projectId/skill-gaps`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "totalRequiredCount": 3,
    "coveredCount": 1,
    "missingCount": 2,
    "coveredSkills": [
      { "name": "React.js", "coveredBy": ["Aarav Sharma"], "maxProficiency": 4 }
    ],
    "missingSkills": [
      { "name": "Machine Learning", "importance": 5 },
      { "name": "Node.js", "importance": 4 }
    ]
  }
}
```

### 4.2 Recommended Collaborators for Project
- **Endpoint**: `GET /api/matching/projects/:projectId/recommendations`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "student": {
        "id": "uuid",
        "name": "Rohan Verma",
        "academicYear": "2nd Year",
        "course": "B.Tech CSE"
      },
      "matchPercentage": 67,
      "whyRecommended": "Your team currently lacks Machine Learning. This student brings this missing capability at Expert level.",
      "filledGaps": [
        { "name": "Machine Learning", "proficiencyLabel": "Expert", "importance": 5 }
      ]
    }
  ]
}
```

### 4.3 Communication Matches ("Find Communication Partners")
- **Endpoint**: `GET /api/matching/communication-matches`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "student": {
        "name": "Ananya Singh",
        "course": "B.Tech ECE",
        "communicationStrengths": [
          { "name": "Public Speaking", "proficiency": 4 },
          { "name": "Presentation Skills", "proficiency": 4 }
        ]
      },
      "matchPercentage": 85,
      "whyRecommended": "Brings strong Public Speaking & Presentation Skills. Both students prefer frequent discussions."
    }
  ]
}
```

---

## 5. Teams & Join Requests (`/api/teams` & `/api/requests`)

### 5.1 Send Join Request
- **Endpoint**: `POST /api/requests/projects/:projectId`
- **Request Body**:
```json
{
  "message": "Hi, I have advanced skills in Node.js and Docker to build your backend APIs."
}
```

### 5.2 Accept Join Request (Team Leader Only)
- **Endpoint**: `PATCH /api/requests/:requestId/accept`
- **Response**: Transaction adds applicant to `team_members` and dispatches notification.

### 5.3 Reject Join Request (Team Leader Only)
- **Endpoint**: `PATCH /api/requests/:requestId/reject`

---

## 6. Kanban Sprint Tasks (`/api/tasks`)

### 6.1 Create Team Task
- **Endpoint**: `POST /api/tasks/team/:teamId`
- **Request Body**:
```json
{
  "title": "Design A* pathfinding API specification",
  "description": "Document OpenAPI schema for node shortest path calculation.",
  "assignedToId": "student-uuid",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-12-01"
}
```

### 6.2 Update Task Status / Assignment
- **Endpoint**: `PATCH /api/tasks/:taskId`
- **Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```
