import path from "path";
import type { NextConfig } from "next";

/** Páginas das aulas de 2025 no WordPress (filhas de /programacao-2025) → salas novas */
const SALAS_2025: Record<string, string> = {
  "dani-ribas": "remuneracao-no-streaming-2025",
  "anita-carvalho": "gestao-de-carreira-e-planejamento-estrategico-2025",
  "marina-mattoso": "marketing-digital-para-artistas-2025",
  "arthur-fitzgibbon": "carreira-sustentavel-na-musica-independente-2025",
  "guta-braga": "direito-autoral-na-era-digital-2025",
};

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      // URLs antigas do WordPress → novas rotas
      ...Object.entries(SALAS_2025).flatMap(([from, to]) => [
        { source: `/programacao-2025/${from}`, destination: `/sala/${to}`, permanent: true },
        { source: `/${from}`, destination: `/sala/${to}`, permanent: true },
      ]),
      { source: "/programacao-2025", destination: "/programacao/2025", permanent: true },
      { source: "/palestrantes-2025", destination: "/palestrantes/2025", permanent: true },
      // salas de 2026 ficavam em /programacao/salaNN
      { source: "/programacao/sala:n(\\d+)", destination: "/sala/sala:n", permanent: true },
      { source: "/formulario-de-cadastro", destination: "/cadastro", permanent: true },
      { source: "/password-reset", destination: "/esqueci-senha", permanent: true },
      { source: "/minha-credencial", destination: "/credencial", permanent: true },
      { source: "/minha-conta", destination: "/conta", permanent: true },
      { source: "/user", destination: "/conta", permanent: true },
      { source: "/mebros", destination: "/conta", permanent: true },
      { source: "/hall", destination: "/programacao", permanent: true },
      { source: "/politica-de-cookies-br", destination: "/politica-de-cookies", permanent: true },
      { source: "/wp-login.php", destination: "/login", permanent: true },
    ];
  },
};

export default nextConfig;
