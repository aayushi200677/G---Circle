import prisma from '../../config/db.js';

export const getAllSkills = async () => {
  return await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
};

export const addUserSkill = async (userId, { skillName, skillId, proficiency }) => {
  let targetSkillId = skillId;

  if (!targetSkillId && skillName) {
    let skill = await prisma.skill.findUnique({
      where: { name: skillName.trim() },
    });
    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillName.trim(),
          category: 'Other',
        },
      });
    }
    targetSkillId = skill.id;
  }

  if (!targetSkillId) {
    const error = new Error('Skill ID or Name is required.');
    error.statusCode = 400;
    throw error;
  }

  const validProficiency = Math.min(Math.max(parseInt(proficiency || '2', 10), 1), 4);

  const userSkill = await prisma.userSkill.upsert({
    where: {
      userId_skillId: {
        userId,
        skillId: targetSkillId,
      },
    },
    update: {
      proficiency: validProficiency,
    },
    create: {
      userId,
      skillId: targetSkillId,
      proficiency: validProficiency,
    },
    include: {
      skill: true,
    },
  });

  return userSkill;
};

export const updateUserSkill = async (userId, userSkillId, { proficiency }) => {
  const validProficiency = Math.min(Math.max(parseInt(proficiency, 10), 1), 4);

  const existing = await prisma.userSkill.findFirst({
    where: { id: userSkillId, userId },
  });

  if (!existing) {
    const error = new Error('User skill record not found.');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.userSkill.update({
    where: { id: userSkillId },
    data: { proficiency: validProficiency },
    include: { skill: true },
  });
};

export const deleteUserSkill = async (userId, userSkillId) => {
  const existing = await prisma.userSkill.findFirst({
    where: { id: userSkillId, userId },
  });

  if (!existing) {
    const error = new Error('User skill record not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.userSkill.delete({
    where: { id: userSkillId },
  });

  return { message: 'Skill removed successfully.' };
};

// Communication skills
export const getAllCommunicationSkills = async () => {
  return await prisma.communicationSkill.findMany({
    orderBy: { name: 'asc' },
  });
};

export const addUserCommunicationSkill = async (userId, { communicationSkillId, communicationSkillName, proficiency }) => {
  let targetId = communicationSkillId;

  if (!targetId && communicationSkillName) {
    let commSkill = await prisma.communicationSkill.findUnique({
      where: { name: communicationSkillName.trim() },
    });
    if (!commSkill) {
      commSkill = await prisma.communicationSkill.create({
        data: { name: communicationSkillName.trim() },
      });
    }
    targetId = commSkill.id;
  }

  const validProficiency = Math.min(Math.max(parseInt(proficiency || '3', 10), 1), 4);

  const userComm = await prisma.userCommunicationSkill.upsert({
    where: {
      userId_communicationSkillId: {
        userId,
        communicationSkillId: targetId,
      },
    },
    update: {
      proficiency: validProficiency,
    },
    create: {
      userId,
      communicationSkillId: targetId,
      proficiency: validProficiency,
    },
    include: {
      communicationSkill: true,
    },
  });

  return userComm;
};

export const deleteUserCommunicationSkill = async (userId, id) => {
  const existing = await prisma.userCommunicationSkill.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    const error = new Error('Communication skill record not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.userCommunicationSkill.delete({ where: { id } });
  return { message: 'Communication skill removed successfully.' };
};
