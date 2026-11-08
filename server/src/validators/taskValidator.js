import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(150),
  description: z.string().optional().default(''),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();
