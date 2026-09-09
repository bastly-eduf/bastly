import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

const questionSchema = z
  .object({
    type: z.enum(['mcq', 'true_false']),
    prompt: z.string().trim().min(1).max(2000),
    options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
    correctOptionIndex: z.coerce.number().int().min(0),
    explanation: z.string().trim().max(2000).optional().default(''),
    points: z.coerce.number().int().min(1).max(100).optional().default(1),
  })
  .superRefine((question, ctx) => {
    if (question.correctOptionIndex >= question.options.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['correctOptionIndex'],
        message: 'Choose a valid correct answer.',
      });
    }
    if (question.type === 'true_false' && ![0, 1].includes(question.correctOptionIndex)) {
      ctx.addIssue({
        code: 'custom',
        path: ['correctOptionIndex'],
        message: 'True/False answer must be True or False.',
      });
    }
  });

export const createAssessmentSchema = z.object({
  type: z.enum(['quiz', 'homework']),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).optional().default(''),
  instructions: z.string().trim().max(3000).optional().default(''),
  questions: z.array(questionSchema).min(1).max(100),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  performanceWeekStart: z.coerce.date().optional(),
});

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: objectId,
        selectedOptionIndex: z.coerce.number().int().min(0).max(10),
      }),
    )
    .min(1)
    .max(100),
});
