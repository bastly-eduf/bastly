import { z } from 'zod';

export const lessonCompletionSchema = z.object({
  completed: z.boolean(),
});
