/**
 * Converte um link comum (Zoom, Vimeo, YouTube) na URL correta para embed em iframe.
 * Links já em formato de embed (ou de outros provedores) passam direto.
 */
export function toEmbedUrl(
  raw: string,
  opts?: { displayName?: string; autoplay?: boolean }
): string {
  const url = raw.trim();

  // Zoom: https://us02web.zoom.us/j/123456789?pwd=XXX  →  web client embutido
  const zoom = url.match(
    /^https?:\/\/([\w.-]*zoom\.us)\/j\/(\d+)(?:\?.*?pwd=([\w.-]+))?/i
  );
  if (zoom) {
    const [, host, meetingId, pwd] = zoom;
    const params = new URLSearchParams();
    if (pwd) params.set("pwd", pwd);
    if (opts?.displayName) {
      params.set("un", Buffer.from(opts.displayName, "utf8").toString("base64"));
    }
    const qs = params.toString();
    return `https://${host}/wc/join/${meetingId}${qs ? `?${qs}` : ""}`;
  }

  // Vimeo: https://vimeo.com/123456789 ou https://vimeo.com/123456789/abcdef (não listado)
  const vimeo = url.match(
    /^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/i
  );
  if (vimeo) {
    const params = new URLSearchParams({ autopause: "0", title: "0", byline: "0", portrait: "0" });
    if (vimeo[2]) params.set("h", vimeo[2]);
    if (opts?.autoplay) params.set("autoplay", "1");
    return `https://player.vimeo.com/video/${vimeo[1]}?${params.toString()}`;
  }
  const vimeoPlayer = url.match(/^https?:\/\/player\.vimeo\.com\/video\/(\d+)(\?.*)?$/i);
  if (vimeoPlayer) return url;

  // YouTube: watch?v=, youtu.be/ ou live/
  const yt = url.match(
    /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i
  );
  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}?rel=0${opts?.autoplay ? "&autoplay=1" : ""}`;
  }

  return url;
}

export type EmbedProvider = "zoom" | "vimeo" | "youtube" | "outro";

export function embedProvider(raw: string): EmbedProvider {
  if (/zoom\.us/i.test(raw)) return "zoom";
  if (/vimeo\.com/i.test(raw)) return "vimeo";
  if (/youtube\.com|youtu\.be/i.test(raw)) return "youtube";
  return "outro";
}
