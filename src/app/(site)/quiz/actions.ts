"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type QuizResult = {
  error?: string;
  done?: boolean;
  score?: number | null;
  total?: number;
  hasKey?: boolean;
  /** por questão: opção escolhida e opção correta (quando há gabarito) */
  details?: Record<string, { chosen: string | null; correct: string | null }>;
};

export async function submitQuiz(_prev: QuizResult, formData: FormData): Promise<QuizResult> {
  const user = await requireUser();
  const lectureId = String(formData.get("lectureId") ?? "");
  const lecture = await db.lecture.findUnique({
    where: { id: lectureId },
    include: { questions: { include: { options: true }, orderBy: { order: "asc" } } },
  });
  if (!lecture || lecture.questions.length === 0) return { error: "Quiz não encontrado." };

  const answers: Record<string, string> = {};
  const details: QuizResult["details"] = {};
  let answered = 0;
  let score = 0;
  let hasKey = false;
  for (const q of lecture.questions) {
    const chosen = String(formData.get(`q_${q.id}`) ?? "");
    const valid = q.options.find((o) => o.id === chosen);
    if (valid) {
      answers[q.id] = valid.id;
      answered++;
    }
    const correct = q.options.find((o) => o.correct) ?? null;
    if (correct) {
      hasKey = true;
      if (valid && valid.id === correct.id) score++;
    }
    details[q.id] = { chosen: valid?.id ?? null, correct: correct?.id ?? null };
  }
  if (answered < lecture.questions.length) {
    return { error: `Responda todas as questões (${answered} de ${lecture.questions.length} respondidas).` };
  }

  await db.quizAttempt.create({
    data: {
      lectureId: lecture.id,
      userId: user.id,
      answers,
      score: hasKey ? score : null,
      total: lecture.questions.length,
    },
  });

  return { done: true, score: hasKey ? score : null, total: lecture.questions.length, hasKey, details };
}
