import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

async function main() {
  console.log('[Seed] Starting database seed...');

  // 1. Clean existing data in reverse order of foreign keys
  await prisma.peerFeedback.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.projectCommunicationRequirement.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.userLanguage.deleteMany();
  await prisma.userCommunicationSkill.deleteMany();
  await prisma.communicationSkill.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamRequest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.projectRole.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.university.deleteMany();

  console.log('[Seed] Cleaned old records.');

  // 2. University
  const university = await prisma.university.create({
    data: {
      name: 'Galgotias University',
      code: 'GU',
      domain: 'galgotiasuniversity.ac.in',
      location: 'Greater Noida, Uttar Pradesh, India',
    },
  });

  // 3. Departments
  const deptCSE = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      universityId: university.id,
    },
  });

  const deptECE = await prisma.department.create({
    data: {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      universityId: university.id,
    },
  });

  const deptMgmt = await prisma.department.create({
    data: {
      name: 'School of Business & Management',
      code: 'SOB',
      universityId: university.id,
    },
  });

  // 4. Skills Catalog
  const skillsData = [
    { name: 'React.js', category: 'Frontend', description: 'Modern UI library with hooks and component architecture' },
    { name: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime environment' },
    { name: 'Express.js', category: 'Backend', description: 'Fast, unopinionated web framework for Node.js' },
    { name: 'Python', category: 'Backend', description: 'High-level programming language for web and AI/ML' },
    { name: 'Machine Learning', category: 'AI/ML', description: 'Supervised and unsupervised predictive modeling' },
    { name: 'Deep Learning', category: 'AI/ML', description: 'Neural networks, PyTorch, and TensorFlow' },
    { name: 'PostgreSQL', category: 'Database', description: 'Advanced relational SQL database' },
    { name: 'MongoDB', category: 'Database', description: 'NoSQL document-oriented database' },
    { name: 'UI/UX Design', category: 'Design', description: 'User experience research, wireframing, and Figma prototypes' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework' },
    { name: 'Docker', category: 'DevOps', description: 'Containerization and environment reproducibility' },
    { name: 'Git & GitHub', category: 'DevOps', description: 'Version control and collaborative workflows' },
    { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript' },
    { name: 'Java', category: 'Backend', description: 'Object-oriented enterprise programming' },
    { name: 'Spring Boot', category: 'Backend', description: 'Java framework for cloud-native microservices' },
    { name: 'FastAPI', category: 'Backend', description: 'Modern high-performance Python API framework' },
    { name: 'Next.js', category: 'Frontend', description: 'React framework for server-rendered and static web apps' },
    { name: 'Flutter', category: 'Mobile', description: 'Multi-platform UI framework from Google' },
  ];

  const skillMap = {};
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    skillMap[s.name] = created.id;
  }

  // 5. Communication Skills Catalog
  const commSkillsData = [
    { name: 'Public Speaking', description: 'Engaging large audiences with clarity and confidence' },
    { name: 'Presentation Skills', description: 'Designing visual decks and delivering structured technical pitches' },
    { name: 'Group Discussion', description: 'Facilitating collaborative dialogues and active perspective-taking' },
    { name: 'Technical Explanation', description: 'Translating complex architecture into digestible concepts' },
    { name: 'Active Listening', description: 'Deeply comprehending team feedback and synthesizing next steps' },
    { name: 'Team Coordination', description: 'Organizing sprint milestones, check-ins, and task dependencies' },
    { name: 'Leadership', description: 'Inspiring teams and resolving deadlocks with empathetic decision making' },
    { name: 'Written Communication', description: 'Clear technical documentation, PR descriptions, and specifications' },
  ];

  const commMap = {};
  for (const cs of commSkillsData) {
    const created = await prisma.communicationSkill.create({ data: cs });
    commMap[cs.name] = created.id;
  }

  // 6. Seed Students (All Galgotias University official emails)
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const studentsData = [
    {
      name: 'Aarav Sharma',
      studentId: '22SCSE1010045',
      email: 'aarav.sharma@galgotiasuniversity.ac.in',
      password: passwordHash,
      academicYear: '3rd Year',
      course: 'B.Tech CSE',
      departmentId: deptCSE.id,
      universityId: university.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      linkedin: 'https://linkedin.com/in/aarav-sharma-gu',
      github: 'https://github.com/aarav-sharma',
      bio: 'Frontend enthusiast passionate about creating delightful user experiences and design systems. Love hackathons and building fast responsive web apps.',
      experience: '2 years building React apps, 1 hackathon runner-up at Smart India Hackathon internal rounds.',
      availability: 'Flexible',
      preferredRoles: ['Frontend Developer', 'UI/UX Designer', 'Team Leader'],
      emailVerified: true,
      skills: [
        { name: 'React.js', proficiency: 4 },
        { name: 'UI/UX Design', proficiency: 3 },
        { name: 'Tailwind CSS', proficiency: 4 },
        { name: 'Git & GitHub', proficiency: 3 },
      ],
      commSkills: [
        { name: 'Leadership', proficiency: 4 },
        { name: 'Presentation Skills', proficiency: 4 },
        { name: 'Group Discussion', proficiency: 3 },
      ],
      languages: ['English', 'Hindi'],
      preferences: {
        communicationMethods: ['Voice discussions', 'In-person collaboration'],
        collaborationStyle: 'Brainstorming together',
        availability: 'Flexible',
        themeMode: 'light',
        themeIntensity: 'classic',
      },
    },
    {
      name: 'Priya Patel',
      studentId: '22SCSE1010112',
      email: 'priya.patel@galgotiasuniversity.ac.in',
      password: passwordHash,
      academicYear: '3rd Year',
      course: 'B.Tech CSE',
      departmentId: deptCSE.id,
      universityId: university.id,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      linkedin: 'https://linkedin.com/in/priya-patel-gu',
      github: 'https://github.com/priyapatel-dev',
      bio: 'Backend architect focused on robust REST APIs, PostgreSQL schema design, and microservices reliability.',
      experience: 'Built 5+ production REST backends using Express and PostgreSQL. Solid understanding of ORMs and database indexes.',
      availability: 'Evening',
      preferredRoles: ['Backend Developer', 'Database Architect'],
      emailVerified: true,
      skills: [
        { name: 'Node.js', proficiency: 4 },
        { name: 'Express.js', proficiency: 4 },
        { name: 'PostgreSQL', proficiency: 4 },
        { name: 'TypeScript', proficiency: 3 },
      ],
      commSkills: [
        { name: 'Written Communication', proficiency: 4 },
        { name: 'Active Listening', proficiency: 4 },
        { name: 'Technical Explanation', proficiency: 3 },
      ],
      languages: ['English', 'Hindi'],
      preferences: {
        communicationMethods: ['Text-based communication', 'Voice discussions'],
        collaborationStyle: 'Structured task-based collaboration',
        availability: 'Evening',
        themeMode: 'light',
        themeIntensity: 'classic',
      },
    },
    {
      name: 'Rohan Verma',
      studentId: '23SCSE1010321',
      email: 'rohan.verma@galgotiasuniversity.ac.in',
      password: passwordHash,
      academicYear: '2nd Year',
      course: 'B.Tech CSE',
      departmentId: deptCSE.id,
      universityId: university.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      linkedin: 'https://linkedin.com/in/rohan-verma-ml',
      github: 'https://github.com/rohan-ai',
      bio: 'Machine learning practitioner keen on computer vision and predictive models. Looking for software engineering partners to productize models.',
      experience: 'Trained CNNs and LLM fine-tuning pipelines. Proficient in PyTorch, scikit-learn, and vector embeddings.',
      availability: 'Afternoon',
      preferredRoles: ['ML Engineer', 'Data Scientist'],
      emailVerified: true,
      skills: [
        { name: 'Python', proficiency: 4 },
        { name: 'Machine Learning', proficiency: 4 },
        { name: 'Deep Learning', proficiency: 3 },
        { name: 'FastAPI', proficiency: 3 },
      ],
      commSkills: [
        { name: 'Technical Explanation', proficiency: 4 },
        { name: 'Active Listening', proficiency: 3 },
      ],
      languages: ['English', 'Hindi'],
      preferences: {
        communicationMethods: ['Video meetings', 'Voice discussions'],
        collaborationStyle: 'Frequent discussions',
        availability: 'Afternoon',
        themeMode: 'dark',
        themeIntensity: 'classic',
      },
    },
    {
      name: 'Ananya Singh',
      studentId: '21ECE1010078',
      email: 'ananya.singh@galgotiasuniversity.ac.in',
      password: passwordHash,
      academicYear: '4th Year',
      course: 'B.Tech ECE',
      departmentId: deptECE.id,
      universityId: university.id,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      linkedin: 'https://linkedin.com/in/ananya-singh-ece',
      github: 'https://github.com/ananya-singh',
      bio: 'Tech enthusiast bridging hardware with cloud services. Experienced in team coordination, pitching projects, and leading hackathon teams.',
      experience: 'Led university innovation club; final year capstone project leader on IoT energy grids.',
      availability: 'Morning',
      preferredRoles: ['Project Coordinator', 'Team Leader', 'IoT Engineer'],
      emailVerified: true,
      skills: [
        { name: 'Python', proficiency: 3 },
        { name: 'Git & GitHub', proficiency: 4 },
        { name: 'Docker', proficiency: 3 },
      ],
      commSkills: [
        { name: 'Public Speaking', proficiency: 4 },
        { name: 'Presentation Skills', proficiency: 4 },
        { name: 'Team Coordination', proficiency: 4 },
        { name: 'Leadership', proficiency: 4 },
      ],
      languages: ['English', 'Hindi'],
      preferences: {
        communicationMethods: ['In-person collaboration', 'Voice discussions'],
        collaborationStyle: 'Frequent discussions',
        availability: 'Morning',
        themeMode: 'light',
        themeIntensity: 'soft',
      },
    },
    {
      name: 'Devansh Gupta',
      studentId: '23MCA1010019',
      email: 'devansh.gupta@galgotiasuniversity.ac.in',
      password: passwordHash,
      academicYear: '2nd Year',
      course: 'MCA',
      departmentId: deptCSE.id,
      universityId: university.id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      linkedin: 'https://linkedin.com/in/devansh-gupta-dev',
      github: 'https://github.com/devansh-gupta',
      bio: 'Full-stack developer with DevOps focus. Always eager to dockerize applications and ensure high code quality.',
      experience: 'Full-stack projects with Next.js, Node.js, and CI/CD pipelines on GitHub Actions.',
      availability: 'Flexible',
      preferredRoles: ['Full Stack Developer', 'DevOps Specialist'],
      emailVerified: true,
      skills: [
        { name: 'React.js', proficiency: 3 },
        { name: 'Node.js', proficiency: 3 },
        { name: 'Docker', proficiency: 4 },
        { name: 'PostgreSQL', proficiency: 3 },
      ],
      commSkills: [
        { name: 'Technical Explanation', proficiency: 4 },
        { name: 'Written Communication', proficiency: 3 },
      ],
      languages: ['English', 'Hindi'],
      preferences: {
        communicationMethods: ['Text-based communication', 'Voice discussions'],
        collaborationStyle: 'Independent work with regular updates',
        availability: 'Flexible',
        themeMode: 'light',
        themeIntensity: 'classic',
      },
    },
    {
      name: 'Ishita Roy',
      studentId: '23SOB1010064',
      email: 'ishita.roy@galgotiasuniversity.ac.in',
      password: passwordHash,
      academicYear: '2nd Year',
      course: 'BBA',
      departmentId: deptMgmt.id,
      universityId: university.id,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      linkedin: 'https://linkedin.com/in/ishita-roy-mgmt',
      github: 'https://github.com/ishita-roy',
      bio: 'Passionate about product strategy, market research, and high-impact pitch presentations. Love partnering with engineers to bring ideas to life.',
      experience: 'Managed marketing and presentations for 3 university flagship fests. Case study competition national finalist.',
      availability: 'Flexible',
      preferredRoles: ['Product Manager', 'Presenter', 'Documentation Lead'],
      emailVerified: true,
      skills: [
        { name: 'UI/UX Design', proficiency: 2 },
      ],
      commSkills: [
        { name: 'Public Speaking', proficiency: 4 },
        { name: 'Presentation Skills', proficiency: 4 },
        { name: 'Group Discussion', proficiency: 4 },
        { name: 'Team Coordination', proficiency: 4 },
      ],
      languages: ['English', 'Hindi'],
      preferences: {
        communicationMethods: ['In-person collaboration', 'Voice discussions'],
        collaborationStyle: 'Brainstorming together',
        availability: 'Flexible',
        themeMode: 'light',
        themeIntensity: 'rich',
      },
    },
  ];

  const userMap = {};

  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        studentId: s.studentId,
        email: s.email,
        password: s.password,
        academicYear: s.academicYear,
        course: s.course,
        departmentId: s.departmentId,
        universityId: s.universityId,
        avatar: s.avatar,
        linkedin: s.linkedin,
        github: s.github,
        bio: s.bio,
        experience: s.experience,
        availability: s.availability,
        preferredRoles: s.preferredRoles,
        emailVerified: s.emailVerified,
      },
    });

    userMap[s.email] = user;

    // Attach technical skills
    for (const sk of s.skills) {
      if (skillMap[sk.name]) {
        await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: skillMap[sk.name],
            proficiency: sk.proficiency,
          },
        });
      }
    }

    // Attach communication skills
    for (const cs of s.commSkills) {
      if (commMap[cs.name]) {
        await prisma.userCommunicationSkill.create({
          data: {
            userId: user.id,
            communicationSkillId: commMap[cs.name],
            proficiency: cs.proficiency,
          },
        });
      }
    }

    // Attach languages
    for (const lang of s.languages) {
      await prisma.userLanguage.create({
        data: {
          userId: user.id,
          language: lang,
          proficiency: 'Fluent',
        },
      });
    }

    // Attach preferences
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        communicationMethods: s.preferences.communicationMethods,
        collaborationStyle: s.preferences.collaborationStyle,
        availability: s.preferences.availability,
        themeMode: s.preferences.themeMode,
        themeIntensity: s.preferences.themeIntensity,
      },
    });
  }

  console.log(`[Seed] Seeded ${studentsData.length} students with skills & communication preferences.`);

  // 7. Seed Projects & Teams
  // Project 1: CampusNav (Aarav's project looking for Backend & ML)
  const aarav = userMap['aarav.sharma@galgotiasuniversity.ac.in'];
  const priya = userMap['priya.patel@galgotiasuniversity.ac.in'];
  const rohan = userMap['rohan.verma@galgotiasuniversity.ac.in'];
  const ananya = userMap['ananya.singh@galgotiasuniversity.ac.in'];
  const devansh = userMap['devansh.gupta@galgotiasuniversity.ac.in'];

  const projectCampusNav = await prisma.project.create({
    data: {
      title: 'CampusNav — Smart Campus Navigation & AI Guide',
      description: 'An interactive indoor & outdoor turn-by-turn navigation web app for Galgotias University blocks, lecture halls, and auditoriums. Features AI route recommendations and crowd density estimation.',
      projectType: 'Hackathon',
      requiredTeamSize: 4,
      difficulty: 'Advanced',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
      status: 'RECRUITING',
      creatorId: aarav.id,
    },
  });

  // Project skills with importance
  await prisma.projectSkill.createMany({
    data: [
      { projectId: projectCampusNav.id, skillId: skillMap['React.js'], importance: 4 },
      { projectId: projectCampusNav.id, skillId: skillMap['Node.js'], importance: 4 },
      { projectId: projectCampusNav.id, skillId: skillMap['Machine Learning'], importance: 5 },
      { projectId: projectCampusNav.id, skillId: skillMap['UI/UX Design'], importance: 3 },
    ],
  });

  await prisma.projectRole.createMany({
    data: [
      { projectId: projectCampusNav.id, roleName: 'Frontend Lead', openCount: 0 },
      { projectId: projectCampusNav.id, roleName: 'Backend Engineer', openCount: 1 },
      { projectId: projectCampusNav.id, roleName: 'ML Specialist', openCount: 1 },
      { projectId: projectCampusNav.id, roleName: 'Pitch & Presentation Lead', openCount: 1 },
    ],
  });

  // Team for CampusNav
  const teamCampusNav = await prisma.team.create({
    data: {
      name: 'CampusNav Builders',
      projectId: projectCampusNav.id,
      leaderId: aarav.id,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamCampusNav.id,
      userId: aarav.id,
      role: 'Team Leader & Frontend Lead',
    },
  });

  // Project 2: UniShare (Priya's project)
  const projectUniShare = await prisma.project.create({
    data: {
      title: 'UniShare — Peer-to-Peer Academic Resource Exchange',
      description: 'A verified academic notes, past papers, and lab code repository platform tailored for university departments with peer verification and ratings.',
      projectType: 'Academic',
      requiredTeamSize: 3,
      difficulty: 'Intermediate',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'RECRUITING',
      creatorId: priya.id,
    },
  });

  await prisma.projectSkill.createMany({
    data: [
      { projectId: projectUniShare.id, skillId: skillMap['React.js'], importance: 4 },
      { projectId: projectUniShare.id, skillId: skillMap['PostgreSQL'], importance: 4 },
      { projectId: projectUniShare.id, skillId: skillMap['Node.js'], importance: 4 },
      { projectId: projectUniShare.id, skillId: skillMap['UI/UX Design'], importance: 3 },
    ],
  });

  await prisma.projectRole.createMany({
    data: [
      { projectId: projectUniShare.id, roleName: 'Backend Lead', openCount: 0 },
      { projectId: projectUniShare.id, roleName: 'Frontend Developer', openCount: 1 },
      { projectId: projectUniShare.id, roleName: 'UI/UX Designer', openCount: 1 },
    ],
  });

  const teamUniShare = await prisma.team.create({
    data: {
      name: 'UniShare Core Team',
      projectId: projectUniShare.id,
      leaderId: priya.id,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamUniShare.id,
      userId: priya.id,
      role: 'Team Leader & Backend Lead',
    },
  });

  // Project 3: GreenPulse (Ananya's project)
  const projectGreenPulse = await prisma.project.create({
    data: {
      title: 'GreenPulse — IoT Energy Grid for University Hostels',
      description: 'Smart sensor integration and real-time power telemetry to monitor and reduce hostel energy wastage with predictive consumption alerts.',
      projectType: 'Research',
      requiredTeamSize: 4,
      difficulty: 'Advanced',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'RECRUITING',
      creatorId: ananya.id,
    },
  });

  await prisma.projectSkill.createMany({
    data: [
      { projectId: projectGreenPulse.id, skillId: skillMap['Python'], importance: 4 },
      { projectId: projectGreenPulse.id, skillId: skillMap['Docker'], importance: 3 },
      { projectId: projectGreenPulse.id, skillId: skillMap['React.js'], importance: 3 },
      { projectId: projectGreenPulse.id, skillId: skillMap['Node.js'], importance: 3 },
    ],
  });

  await prisma.projectRole.createMany({
    data: [
      { projectId: projectGreenPulse.id, roleName: 'Project Lead', openCount: 0 },
      { projectId: projectGreenPulse.id, roleName: 'Cloud & Telemetry Lead', openCount: 1 },
      { projectId: projectGreenPulse.id, roleName: 'Dashboard Developer', openCount: 1 },
    ],
  });

  const teamGreenPulse = await prisma.team.create({
    data: {
      name: 'GreenPulse IoT Collective',
      projectId: projectGreenPulse.id,
      leaderId: ananya.id,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamGreenPulse.id,
      userId: ananya.id,
      role: 'Team Leader',
    },
  });

  // Add Devansh to GreenPulse to demonstrate multi-member team
  await prisma.teamMember.create({
    data: {
      teamId: teamGreenPulse.id,
      userId: devansh.id,
      role: 'DevOps & Backend Engineer',
    },
  });

  // 8. Seed Sample Tasks for CampusNav & GreenPulse
  await prisma.task.createMany({
    data: [
      {
        teamId: teamCampusNav.id,
        title: 'Design Campus Interactive Map SVG wireframe',
        description: 'Create scalable floor plans for Block A, B and C with room numbering.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToId: aarav.id,
        createdById: aarav.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teamCampusNav.id,
        title: 'Define Dijkstra and A* pathfinding API specification',
        description: 'Document graph node structure and shortest-route endpoints in OpenAPI format.',
        priority: 'MEDIUM',
        status: 'TODO',
        assignedToId: null,
        createdById: aarav.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teamCampusNav.id,
        title: 'Project architecture diagram and requirements signoff',
        description: 'Initial system diagram completed and shared with faculty advisor.',
        priority: 'MEDIUM',
        status: 'DONE',
        assignedToId: aarav.id,
        createdById: aarav.id,
      },
      {
        teamId: teamGreenPulse.id,
        title: 'Deploy telemetry ingestion microservice via Docker',
        description: 'Setup containerized Express receiver with rate limits for IoT sensors.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToId: devansh.id,
        createdById: ananya.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        teamId: teamGreenPulse.id,
        title: 'Calibrate current sensor modules in Hostel Block 1',
        description: 'Verify accuracy of readings under varying electrical load.',
        priority: 'HIGH',
        status: 'DONE',
        assignedToId: ananya.id,
        createdById: ananya.id,
      },
    ],
  });

  // 9. Seed Sample Join Requests
  // Devansh sends request to join CampusNav as Backend Engineer
  await prisma.teamRequest.create({
    data: {
      teamId: teamCampusNav.id,
      userId: devansh.id,
      message: 'Hi Aarav! I have experience with Node.js and Dockerizing applications. I would love to build the backend and API endpoints for CampusNav.',
      status: 'PENDING',
    },
  });

  // Rohan sends request to join CampusNav as ML Specialist
  await prisma.teamRequest.create({
    data: {
      teamId: teamCampusNav.id,
      userId: rohan.id,
      message: 'Hey Aarav, I can build the crowd estimation and intelligent path routing model using Python and FastAPI!',
      status: 'PENDING',
    },
  });

  // Ishita sends request to join UniShare
  await prisma.teamRequest.create({
    data: {
      teamId: teamUniShare.id,
      userId: userMap['ishita.roy@galgotiasuniversity.ac.in'].id,
      message: 'Hello Priya! I can handle documentation, user research with students, and the pitch presentation for UniShare.',
      status: 'PENDING',
    },
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: aarav.id,
        title: 'New Join Request',
        message: 'Devansh Gupta requested to join CampusNav Builders as Backend Engineer.',
        type: 'JOIN_REQUEST',
        link: '/requests',
      },
      {
        userId: aarav.id,
        title: 'New Join Request',
        message: 'Rohan Verma requested to join CampusNav Builders as ML Specialist.',
        type: 'JOIN_REQUEST',
        link: '/requests',
      },
    ],
  });

  // 11. Seed "Beyond Skills — Talent Showcase" Videos
  const sampleVideos = [
    {
      userId: aarav.id,
      title: 'CampusNav Interactive Map & Routing Architecture',
      category: 'Technical Explanation',
      description: 'An architectural walkthrough of campus routing, showing how client-side SVG rendering integrates with backend Dijkstra shortest-path queries.',
      storageKey: 'demo-sample.webm',
      duration: 85,
      skillTags: ['Algorithms', 'System Design', 'React.js', 'FastAPI'],
      visibility: 'PUBLIC',
    },
    {
      userId: priya.id,
      title: 'UniShare — Academic Resource Sharing Platform Walkthrough',
      category: 'Project Demonstration',
      description: 'Demonstrating the document search, department-level classification, and peer review workflow on UniShare.',
      storageKey: 'demo-sample.webm',
      duration: 140,
      skillTags: ['Product Demo', 'PostgreSQL', 'Express', 'Architecture'],
      visibility: 'PUBLIC',
    },
    {
      userId: userMap['ishita.roy@galgotiasuniversity.ac.in'].id,
      title: 'Galgotias Innovate 2024 Winning Pitch Presentation',
      category: 'Presentation Skills',
      description: 'Pitching our university collaboration concept to faculty judges and investors, explaining the core problem of fragmented student teams.',
      storageKey: 'demo-sample.webm',
      duration: 110,
      skillTags: ['Pitch Deck', 'Public Speaking', 'Slide Design', 'Product Strategy'],
      visibility: 'PUBLIC',
    },
    {
      userId: rohan.id,
      title: 'Explaining Transformer Attention & Vector Embeddings',
      category: 'Technical Explanation',
      description: 'A 90-second conceptual explanation of self-attention mechanisms and high-dimensional cosine similarity for teammate search.',
      storageKey: 'demo-sample.webm',
      duration: 95,
      skillTags: ['Machine Learning', 'PyTorch', 'Vector Search', 'Python'],
      visibility: 'PUBLIC',
    },
    {
      userId: devansh.id,
      title: 'Why Containerization Matters for Fast University Hackathons',
      category: 'Public Speaking',
      description: 'Short talk breaking down common environment pitfalls during 24-hour hackathons and how minimal Docker compose templates save hours.',
      storageKey: 'demo-sample.webm',
      duration: 75,
      skillTags: ['DevOps', 'Docker', 'Public Speaking', 'Cloud'],
      visibility: 'PUBLIC',
    },
  ];

  for (const sv of sampleVideos) {
    const created = await prisma.showcaseVideo.create({
      data: {
        userId: sv.userId,
        title: sv.title,
        category: sv.category,
        description: sv.description,
        storageKey: sv.storageKey,
        videoUrl: '/api/showcase/stream/placeholder',
        duration: sv.duration,
        skillTags: sv.skillTags,
        visibility: sv.visibility,
      },
    });

    await prisma.showcaseVideo.update({
      where: { id: created.id },
      data: { videoUrl: `/api/showcase/stream/${created.id}` },
    });
  }

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
