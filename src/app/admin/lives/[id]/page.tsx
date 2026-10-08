import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { materialsOf } from "@/lib/content";
import { toInputDate, toInputDateTimeBr } from "@/lib/format";
import { adminDeleteLecture, adminDeleteQuestion, adminSaveLecture, adminSaveQuestion } from "../../actions/content";
import { Button, Checkbox, Input, Label, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Editar live | Admin" };

export default async function AdminLiveEditPage({ params, searchParams }: PageProps<"/admin/lives/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "nova";
  const lecture = isNew
    ? null
    : await db.lecture.findUnique({
        where: { id },
        include: {
          speakers: true,
          questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
          _count: { select: { attempts: true } },
        },
      });
  if (!isNew && !lecture) notFound();

  const [editions, speakers] = await Promise.all([
    db.edition.findMany({ orderBy: { year: "desc" } }),
    db.speaker.findMany({ orderBy: { name: "asc" } }),
  ]);
  const defaultEdition =
    lecture?.editionId ?? editions.find((e) => e.year === parseInt(String(sp.edicao ?? ""), 10))?.id ?? editions.find((e) => e.current)?.id ?? editions[0]?.id;
  const selectedSpeakers = new Set(lecture?.speakers.map((s) => s.speakerId) ?? []);
  const materialsText = lecture ? materialsOf(lecture).map((m) => `${m.title ?? ""} | ${m.url}`).join("\n") : "";

  return (
    <div className="max-w-4xl">
      <Link href="/admin/lives" className="text-sm font-semibold text-ink-500 hover:text-brand-700">
        ← Lives / Salas
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-ink-900">{isNew ? "Nova live" : lecture!.title}</h1>
        {!isNew && (
          <Link href={`/sala/${lecture!.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 hover:border-brand-300">
            Abrir sala <Icon name="external" size={14} />
          </Link>
        )}
      </div>
      {sp.ok && <p className="mt-3 rounded-xl bg-brand-50 px-4 py-2 text-sm text-brand-800">Salvo com sucesso.</p>}

      <form action={adminSaveLecture} className="mt-6 space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        {!isNew && <input type="hidden" name="id" value={lecture!.id} />}
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <div>
            <Label htmlFor="title">Título da aula</Label>
            <Input id="title" name="title" required defaultValue={lecture?.title} placeholder="Ex.: Pneumonias" />
          </div>
          <div>
            <Label htmlFor="editionId">Edição</Label>
            <Select id="editionId" name="editionId" defaultValue={defaultEdition} required>
              {editions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.year}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {isNew && (
          <div>
            <Label htmlFor="slug">Endereço (slug) — opcional</Label>
            <Input id="slug" name="slug" placeholder="gerado a partir do título" />
          </div>
        )}
        <div>
          <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
          <Input id="subtitle" name="subtitle" defaultValue={lecture?.subtitle ?? ""} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="date">Data da live</Label>
            <Input id="date" name="date" type="date" defaultValue={toInputDate(lecture?.date)} />
          </div>
          <div>
            <Label htmlFor="timeLabel">Horário (texto exibido)</Label>
            <Input id="timeLabel" name="timeLabel" defaultValue={lecture?.timeLabel ?? ""} placeholder="Ex.: 19h30 (Brasília)" />
          </div>
          <div>
            <Label htmlFor="startsAt">Início exato (cronômetro, Brasília)</Label>
            <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toInputDateTimeBr(lecture?.startsAt)} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={lecture?.status ?? "SCHEDULED"}>
              <option value="SCHEDULED">Agendada (mostra data / cronômetro)</option>
              <option value="LIVE">Ao vivo agora (embute o Zoom)</option>
              <option value="RECORDED">Gravação disponível</option>
            </Select>
            <p className="mt-1 text-xs text-ink-500">
              Com “Início exato” + link do Zoom, a sala entra ao vivo sozinha 15 min antes do horário e volta a “agendada” 3 h depois.
            </p>
          </div>
          <div>
            <Label htmlFor="liveUrl">Link do Zoom (ao vivo)</Label>
            <Input id="liveUrl" name="liveUrl" defaultValue={lecture?.liveUrl ?? ""} placeholder="https://zoom.us/j/…" />
            <p className="mt-1 text-xs text-ink-500">Cole o link do convite. Ele é embutido na sala com o nome do participante.</p>
          </div>
          <div>
            <Label htmlFor="recordingUrl">Gravação (Vimeo / YouTube)</Label>
            <Input id="recordingUrl" name="recordingUrl" defaultValue={lecture?.recordingUrl ?? ""} placeholder="https://vimeo.com/…" />
            <p className="mt-1 text-xs text-ink-500">Vídeos não listados do Vimeo: use o link com o código (vimeo.com/ID/CODIGO).</p>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descrição / ementa (opcional)</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={lecture?.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="materials">Materiais (um por linha: título | link)</Label>
          <Textarea id="materials" name="materials" rows={3} defaultValue={materialsText} placeholder={"Conteúdo da palestra (PDF) | /uploads/2026/09/aula.pdf\nArtigo de referência | https://…"} />
        </div>
        <div>
          <Label>Palestrantes</Label>
          <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-ink-200 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm text-ink-800">
                <Checkbox name="speakerIds" value={s.id} defaultChecked={selectedSpeakers.has(s.id)} />
                {s.name}
              </label>
            ))}
            {speakers.length === 0 && <p className="text-sm text-ink-500">Cadastre palestrantes primeiro.</p>}
          </div>
          <Link href="/admin/palestrantes/novo" className="mt-1 inline-block text-xs font-semibold text-brand-700 hover:underline">
            + Novo palestrante
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-28">
            <Label htmlFor="order">Ordem</Label>
            <Input id="order" name="order" type="number" defaultValue={lecture?.order ?? 0} />
          </div>
          <label className="flex items-center gap-2 pt-5 text-sm font-medium text-ink-800">
            <Checkbox name="active" defaultChecked={lecture?.active ?? true} /> Visível no site
          </label>
          <div className="ml-auto pt-5">
            <Button type="submit">{isNew ? "Criar live" : "Salvar"}</Button>
          </div>
        </div>
      </form>

      {!isNew && (
        <>
          <section id="quiz" className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl text-ink-900">Quiz da aula</h2>
              <span className="text-sm text-ink-500">
                {lecture!.questions.length} questões · {lecture!._count.attempts} respostas de participantes
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-600">
              Marque a alternativa correta para o participante ver a nota. Sem gabarito, as respostas apenas ficam registradas.
            </p>

            <div className="mt-4 space-y-3">
              {lecture!.questions.map((q, qi) => {
                const correctIdx = q.options.findIndex((o) => o.correct);
                return (
                  <details key={q.id} className="rounded-2xl border border-ink-100 bg-white shadow-card">
                    <summary className="flex cursor-pointer items-center gap-3 px-5 py-3.5 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{qi + 1}</span>
                      <span className="flex-1 font-medium text-ink-900">{q.text}</span>
                      <span className="text-xs text-ink-400">
                        {q.options.length} alt. {correctIdx >= 0 ? "· gabarito ok" : "· sem gabarito"}
                      </span>
                    </summary>
                    <form action={adminSaveQuestion} className="space-y-3 border-t border-ink-100 px-5 py-4">
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="lectureId" value={lecture!.id} />
                      <Textarea name="text" rows={2} defaultValue={q.text} required aria-label="Pergunta" />
                      <Textarea name="description" rows={2} defaultValue={q.description ?? ""} placeholder="Enunciado complementar (opcional, ex.: afirmativas I, II, III)" aria-label="Descrição" />
                      <Textarea name="options" rows={q.options.length + 1} defaultValue={q.options.map((o) => o.text).join("\n")} required aria-label="Alternativas (uma por linha)" />
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <Label>Alternativa correta</Label>
                          <Select name="correct" defaultValue={String(correctIdx)} className="w-40">
                            <option value="-1">Sem gabarito</option>
                            {q.options.map((o, i) => (
                              <option key={o.id} value={i}>
                                {i + 1}ª — {o.text.slice(0, 30)}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="w-24">
                          <Label>Ordem</Label>
                          <Input name="order" type="number" defaultValue={q.order} />
                        </div>
                        <Button type="submit" variant="secondary">
                          Salvar questão
                        </Button>
                      </div>
                    </form>
                    <form action={adminDeleteQuestion} className="px-5 pb-4 text-right">
                      <input type="hidden" name="id" value={q.id} />
                      <button type="submit" className="text-xs font-medium text-red-500 hover:underline">
                        Excluir questão
                      </button>
                    </form>
                  </details>
                );
              })}
            </div>

            <form action={adminSaveQuestion} className="mt-4 space-y-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-5">
              <input type="hidden" name="lectureId" value={lecture!.id} />
              <h3 className="text-sm font-bold text-brand-800">+ Nova questão</h3>
              <Textarea name="text" rows={2} required placeholder="Pergunta" aria-label="Pergunta" />
              <Textarea name="description" rows={2} placeholder="Enunciado complementar (opcional)" aria-label="Descrição" />
              <Textarea name="options" rows={4} required placeholder={"Alternativa 1\nAlternativa 2\nAlternativa 3"} aria-label="Alternativas" />
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label>Alternativa correta (nº da linha)</Label>
                  <Select name="correct" defaultValue="-1" className="w-40">
                    <option value="-1">Sem gabarito</option>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <option key={i} value={i}>
                        {i + 1}ª alternativa
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Ordem</Label>
                  <Input name="order" type="number" defaultValue={lecture!.questions.length} />
                </div>
                <Button type="submit">Adicionar questão</Button>
              </div>
            </form>
          </section>

          <form action={adminDeleteLecture} className="mt-8 text-right">
            <input type="hidden" name="id" value={lecture!.id} />
            <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline">
              Excluir esta live (e seu quiz)
            </button>
          </form>
        </>
      )}
    </div>
  );
}
