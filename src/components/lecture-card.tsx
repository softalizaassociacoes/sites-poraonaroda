import Link from "next/link";
import { clsx } from "clsx";
import { effectiveStatus, type LectureWithSpeakers } from "@/lib/content";
import { shortDate, longDate } from "@/lib/format";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function DateBlock({ date, label, size = "md" }: { date: Date | null; label?: string | null; size?: "md" | "lg" }) {
  const day = date ? String(date.getUTCDate()).padStart(2, "0") : label?.split("/")[0] ?? "--";
  const month = date ? MONTHS_SHORT[date.getUTCMonth()] : label?.split("/")[1] ?? "";
  return (
    <div
      className={clsx(
        "flex shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-500 font-display text-black shadow-soft",
        size === "lg" ? "h-20 w-20" : "h-16 w-16"
      )}
    >
      <span className={clsx("font-bold leading-none", size === "lg" ? "text-3xl" : "text-2xl")}>{day}</span>
      <span className="mt-1 text-[11px] font-bold uppercase tracking-widest text-black/70">{month}</span>
    </div>
  );
}

export function ctaFor(status: ReturnType<typeof effectiveStatus>, loggedIn: boolean) {
  if (status === "LIVE") return loggedIn ? "Entrar na sala" : "Entrar para assistir";
  if (status === "RECORDED") return loggedIn ? "Assistir gravação" : "Entrar para assistir";
  return "Assistir palestra";
}

export function LectureCard({
  lecture,
  loggedIn,
  variant = "row",
}: {
  lecture: LectureWithSpeakers;
  loggedIn: boolean;
  variant?: "row" | "card";
}) {
  const status = effectiveStatus(lecture);
  const href = `/sala/${lecture.slug}`;
  const speakers = lecture.speakers.map((s) => s.speaker);

  if (variant === "card") {
    return (
      <Link
        href={href}
        className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-900 p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-soft"
      >
        <div className="flex items-start justify-between gap-3">
          <DateBlock date={lecture.date} label={lecture.dateLabel} />
          <StatusBadge status={status} />
        </div>
        <h3 className="mt-4 text-lg leading-snug text-ink-50 group-hover:text-brand-500">{lecture.title}</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {speakers.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Avatar name={s.name} src={s.photoUrl} size={32} />
              <span className="text-sm font-medium text-ink-200">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="text-ink-400">
            {longDate(lecture.date)}
            {lecture.timeLabel ? ` · ${lecture.timeLabel}` : ""}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-brand-500">
            {!loggedIn && <Icon name="lock" size={14} />}
            {ctaFor(status, loggedIn)}
            <Icon name="arrow" size={14} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-4 shadow-card transition hover:border-brand-500 hover:shadow-soft sm:flex-row sm:items-center sm:p-5"
    >
      <DateBlock date={lecture.date} label={lecture.dateLabel} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-xs text-ink-400">
            {shortDate(lecture.date, lecture.dateLabel ?? "")}
            {lecture.timeLabel ? ` · ${lecture.timeLabel}` : ""}
          </span>
        </div>
        <h3 className="mt-1.5 text-lg leading-snug text-ink-50 group-hover:text-brand-500">{lecture.title}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {speakers.map((s) => (
            <span key={s.id} className="flex items-center gap-2 text-sm text-ink-300">
              <Avatar name={s.name} src={s.photoUrl} size={26} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-ink-800 px-4 py-2 text-sm font-semibold text-brand-500 transition group-hover:bg-brand-500 group-hover:text-black sm:self-center">
        {!loggedIn && <Icon name="lock" size={14} />}
        {ctaFor(status, loggedIn)}
        <Icon name="arrow" size={14} />
      </span>
    </Link>
  );
}
