"use client";

import { useActionState } from "react";
import { clsx } from "clsx";
import { submitQuiz } from "./actions";
import { Button, FormError } from "@/components/ui";
import { Icon } from "@/components/icons";

type Question = {
  id: string;
  text: string;
  description: string | null;
  options: { id: string; text: string }[];
};

export function QuizForm({
  lectureId,
  questions,
  hasKey,
  lastAttempt,
}: {
  lectureId: string;
  questions: Question[];
  hasKey: boolean;
  lastAttempt: { score: number | null; total: number; createdAt: string } | null;
}) {
  const [state, action, pending] = useActionState(submitQuiz, {});
  const done = state.done;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="lectureId" value={lectureId} />

      {lastAttempt && !done && (
        <p className="rounded-xl bg-ink-900 px-4 py-3 text-sm text-ink-200">
          Você já respondeu este quiz em {new Date(lastAttempt.createdAt).toLocaleDateString("pt-BR")}
          {lastAttempt.score !== null ? ` — acertou ${lastAttempt.score} de ${lastAttempt.total}.` : "."}{" "}
          Responda novamente se quiser.
        </p>
      )}

      {done && (
        <div className="rounded-2xl border border-brand-500 bg-ink-800 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-black">
              <Icon name="check" size={24} strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-lg font-bold text-brand-900">
                {state.hasKey ? `Você acertou ${state.score} de ${state.total}` : "Respostas registradas!"}
              </p>
              <p className="text-sm text-brand-400">
                {state.hasKey
                  ? state.score === state.total
                    ? "Excelente! Todas as questões corretas."
                    : "Confira abaixo as alternativas corretas e refaça quando quiser."
                  : "Obrigado por participar. Suas respostas foram salvas."}
              </p>
            </div>
          </div>
        </div>
      )}

      <ol className="space-y-6">
        {questions.map((q, qi) => {
          const d = state.details?.[q.id];
          return (
            <li key={q.id} className="rounded-2xl border border-ink-700 bg-ink-900/60 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Questão {qi + 1}</p>
              <p className="mt-1 font-semibold leading-snug text-ink-50">{q.text}</p>
              {q.description && (
                <div className="mt-2 space-y-1 text-sm text-ink-300">
                  {q.description.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              <div className="mt-4 space-y-2">
                {q.options.map((o) => {
                  const isChosen = d?.chosen === o.id;
                  const isCorrect = d?.correct === o.id;
                  return (
                    <label
                      key={o.id}
                      className={clsx(
                        "flex cursor-pointer items-start gap-3 rounded-xl border bg-ink-900 px-4 py-3 text-sm transition",
                        done && hasKey && isCorrect && "border-brand-500 bg-ink-800 text-brand-900",
                        done && hasKey && isChosen && !isCorrect && "border-red-300 bg-red-50 text-red-800",
                        !(done && hasKey && (isCorrect || isChosen)) && "border-ink-600 hover:border-brand-500"
                      )}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={o.id}
                        required
                        disabled={!!done}
                        defaultChecked={isChosen}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
                      />
                      <span className="flex-1">{o.text}</span>
                      {done && hasKey && isCorrect && <Icon name="check" size={16} className="mt-0.5 shrink-0 text-brand-500" strokeWidth={2.4} />}
                      {done && hasKey && isChosen && !isCorrect && <Icon name="x" size={16} className="mt-0.5 shrink-0 text-red-600" strokeWidth={2.4} />}
                    </label>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <FormError message={state.error} />
      {done ? (
        <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
          Refazer o quiz
        </Button>
      ) : (
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Enviando…" : "Enviar respostas"}
        </Button>
      )}
    </form>
  );
}
