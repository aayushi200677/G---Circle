import prisma from '../../config/db.js';

export const getCurrentUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      university: true,
      preferences: true,
      skills: {
        include: { skill: true },
        orderBy: { proficiency: 'desc' },
      },
      communicationSkills: {
        include: { communicationSkill: true },
        orderBy: { proficiency: 'desc' },
      },
      languages: true,
      showcaseVideos: {
        orderBy: { createdAt: 'desc' },
      },
      createdProjects: {
        include: {
          team: {
            include: {
              members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
          },
        },
      },
      teamMemberships: {
        include: {
          team: {
            include: {
              project: true,
              leader: { select: { id: true, name: true, avatar: true } },
              members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
            },
          },
        },
      },
      assignedTasks: {
        include: {
          team: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

export const updateProfile = async (userId, data) => {
  const allowedFields = ['name', 'bio', 'availability', 'preferredRoles', 'linkedin', 'github', 'avatar', 'experience'];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      skills: { include: { skill: true } },
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
      preferences: true,
    },
  });

  const { password, ...safeUser } = updated;
  return safeUser;
};

export const getPublicProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      skills: {
        include: { skill: true },
        orderBy: { proficiency: 'desc' },
      },
      communicationSkills: {
        include: { communicationSkill: true },
        orderBy: { proficiency: 'desc' },
      },
      languages: true,
      showcaseVideos: {
        where: { visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
      },
      preferences: {
        select: {
          communicationMethods: true,
          collaborationStyle: true,
          availability: true,
        },
      },
      createdProjects: {
        select: {
          id: true,
          title: true,
          description: true,
          projectType: true,
          status: true,
        },
      },
      teamMemberships: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              project: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    const error = new Error('Student not found.');
    error.statusCode = 404;
    throw error;
  }

  const { password, ...safeProfile } = user;
  return safeProfile;
};

export const searchStudents = async (filters) => {
  const { query, course, academicYear, skill, role, availability, showcaseCategory, hasShowcase } = filters;
  const where = { emailVerified: true };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (course && course !== 'All') {
    where.course = course;
  }

  if (academicYear && academicYear !== 'All') {
    where.academicYear = academicYear;
  }

  if (availability && availability !== 'All') {
    where.availability = availability;
  }

  if (role && role !== 'All') {
    where.preferredRoles = { has: role };
  }

  if (skill && skill !== 'All') {
    where.skills = {
      some: {
        skill: {
          name: { contains: skill, mode: 'insensitive' },
        },
      },
    };
  }

  if (showcaseCategory && showcaseCategory !== 'All') {
    where.showcaseVideos = {
      some: {
        category: { contains: showcaseCategory, mode: 'insensitive' },
        visibility: 'PUBLIC',
      },
    };
  } else if (hasShowcase === 'true' || hasShowcase === true) {
    where.showcaseVideos = {
      some: {
        visibility: 'PUBLIC',
      },
    };
  }

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      studentId: true,
      academicYear: true,
      course: true,
      avatar: true,
      bio: true,
      availability: true,
      preferredRoles: true,
      skills: {
        include: { skill: true },
        orderBy: { proficiency: 'desc' },
      },
      communicationSkills: {
        include: { communicationSkill: true },
        orderBy: { proficiency: 'desc' },
      },
      showcaseVideos: {
        where: { visibility: 'PUBLIC' },
        select: {
          id: true,
          title: true,
          category: true,
          duration: true,
          thumbnailUrl: true,
          videoUrl: true,
          skillTags: true,
        },
      },
      preferences: true,
      languages: true,
    },
    take: 50,
  });

  return students;
};
