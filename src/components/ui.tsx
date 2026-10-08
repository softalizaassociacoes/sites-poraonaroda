import { clsx } from "clsx";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={clsx("mb-1 block text-sm font-medium text-ink-200", props.className)}
    />
  );
}

const fieldBase =
  "w-full rounded-xl border border-ink-600 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-50 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 disabled:bg-ink-800 disabled:text-ink-400";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(fieldBase, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(fieldBase, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(fieldBase, "leading-relaxed", props.className)} />;
}

export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={clsx("h-4 w-4 rounded border-ink-500 bg-ink-900 accent-brand-500", props.className)}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" && "bg-brand-500 text-black shadow-soft hover:bg-brand-400",
        variant === "secondary" &&
          "border border-ink-600 bg-ink-900 text-ink-100 hover:border-brand-500 hover:text-brand-500",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        variant === "ghost" && "text-ink-200 hover:bg-ink-800",
        variant === "gold" && "bg-punk-orange text-black hover:brightness-110",
        props.className
      )}
    />
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-3.5 py-2.5 text-sm text-brand-200">
      {message}
    </p>
  );
}

export function Badge({
  color = "ink",
  children,
  className,
}: {
  color?: "ink" | "green" | "gold" | "red" | "blue" | "sand";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        color === "ink" && "bg-ink-800 text-ink-200",
        color === "green" && "bg-punk-green/20 text-punk-green",
        color === "gold" && "bg-brand-500 text-black",
        color === "red" && "bg-punk-orange/20 text-punk-orange",
        color === "blue" && "bg-punk-sky/20 text-punk-sky",
        color === "sand" && "bg-ink-800 text-ink-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag className={clsx("rounded-2xl border border-ink-700 bg-ink-900 shadow-card", className)}>
      {children}
    </Tag>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={clsx(align === "center" && "text-center", className)}>
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl text-ink-50 md:text-4xl">{title}</h2>
      {description && (
        <p className={clsx("mt-3 text-base text-ink-300", align === "center" && "mx-auto max-w-2xl")}>
          {description}
        </p>
      )}
    </div>
  );
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={clsx("prose-uc", className)}>
      {text
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}

export function Avatar({
  name,
  src,
  size = 48,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={clsx("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-black",
        className
      )}
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials}
    </span>
  );
}
