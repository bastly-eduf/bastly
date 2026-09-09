import AssessmentAttempt from '../models/AssessmentAttempt.js';
import { gradeBandFromPercentage } from '../utils/gradeBand.js';
import { HttpError } from '../utils/httpError.js';

export function normalizeQuestions(questions) {
  return questions.map((q) => ({
    ...q,
    options: q.type === 'true_false' ? ['True', 'False'] : q.options.map((x) => x.trim()),
  }));
}

export function studentAssessmentPayload(assessment) {
  const a = assessment.toObject ? assessment.toObject() : assessment;
  return {
    _id: a._id,
    type: a.type,
    title: a.title,
    description: a.description,
    instructions: a.instructions,
    questionCount: a.questions.length,
    questions: a.questions.map((q, i) => ({
      _id: q._id,
      number: i + 1,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      points: q.points,
    })),
  };
}

export function gradeAssessment(assessment, submittedAnswers) {
  const answerMap = new Map(submittedAnswers.map((a) => [String(a.questionId), Number(a.selectedOptionIndex)]));
  let scorePoints = 0;
  let maxPoints = 0;

  const answers = assessment.questions.map((q) => {
    const selectedOptionIndex = answerMap.get(String(q._id));
    const points = Number(q.points || 1);
    maxPoints += points;

    if (selectedOptionIndex === undefined || selectedOptionIndex < 0 || selectedOptionIndex >= q.options.length) {
      throw new HttpError(400, 'Answer every question before submitting.');
    }

    const isCorrect = selectedOptionIndex === Number(q.correctOptionIndex);
    const pointsAwarded = isCorrect ? points : 0;
    scorePoints += pointsAwarded;
    return { questionId: q._id, selectedOptionIndex, isCorrect, pointsAwarded };
  });

  const percentage = maxPoints ? Math.round((scorePoints / maxPoints) * 10000) / 100 : 0;
  return { answers, scorePoints, maxPoints, percentage, gradeBand: gradeBandFromPercentage(percentage) };
}

export async function nextAttemptNumber(assessmentId, studentId) {
  const latest = await AssessmentAttempt.findOne({ assessment: assessmentId, student: studentId })
    .sort({ attemptNumber: -1 })
    .select('attemptNumber')
    .lean();
  return (latest?.attemptNumber || 0) + 1;
}

export function buildReview(assessment, attempt) {
  const answerMap = new Map(attempt.answers.map((a) => [String(a.questionId), a]));
  return assessment.questions.map((q) => {
    const answer = answerMap.get(String(q._id));
    return {
      questionId: q._id,
      selectedOptionIndex: answer?.selectedOptionIndex ?? null,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect: Boolean(answer?.isCorrect),
      explanation: q.explanation || '',
    };
  });
}
