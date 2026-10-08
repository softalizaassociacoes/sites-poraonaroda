import Link from "next/link";
import type { Speaker } from "@prisma/client";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { shortDate } from "@/lib/format";

export function SpeakerCard({
  speaker,
  lecture,
}: {
  speaker: Speaker;
  lecture?: { title: string; slug: string; date: Date | null; dateLabel: string | null } | null;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-card transition hover:border-brand-500">
      <div className="flex items-center gap-4">
        <Avatar name={speaker.name} src={speaker.photoUrl} size={88} className="ring-4 ring-ink-700" />
        <div className="min-w-0">
          <h3 className="text-lg leading-snug text-ink-50">
            {speaker.title ? `${speaker.title} ` : ""}
            {speaker.name}
          </h3>
          {lecture && (
            <Link
              href={`/sala/${lecture.slug}`}
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline"
            >
              <Icon name="calendar" size={14} />
              {shortDate(lecture.date, lecture.dateLabel ?? "")} · {lecture.title}
            </Link>
          )}
        </div>
      </div>
      {speaker.bio && (
        <details className="group mt-4">
          <summary className="cursor-pointer list-none text-sm leading-relaxed text-ink-300 [&::-webkit-details-marker]:hidden">
            <span className="line-clamp-3 group-open:hidden">{speaker.bio}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 group-open:hidden">
              Ver currículo completo <Icon name="chevron" size={12} />
            </span>
          </summary>
          <p className="text-sm leading-relaxed text-ink-300">{speaker.bio}</p>
        </details>
      )}
    </article>
  );
}
