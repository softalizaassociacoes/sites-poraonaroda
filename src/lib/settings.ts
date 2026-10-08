import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const SETTING_DEFAULTS: Record<string, string> = {
  site_name: "Porão na Roda",
  home_headline: "Conheça a programação dos cursos",
  home_about:
    "O ciclo formativo “Porão na Roda” é uma iniciativa do Festival Porão do Rock voltada ao fortalecimento de trajetórias no campo da música e da produção cultural. A proposta reúne profissionais atuantes no mercado em uma série de encontros dedicados à troca prática e estratégica com artistas e agentes do setor.\nA iniciativa busca ampliar o repertório técnico e a circulação de conhecimento em áreas como curadoria de festivais, gestão de carreira artística e economia da música, internacionalização, com atenção especial à profissionalização de artistas independentes. Ao longo da programação, pretendemos fortalecer capacidades criativas e estratégicas, fomentar redes de colaboração e promover o encontro entre profissionais experientes e artistas em desenvolvimento.",
  home_kicker: "Venha conhecer nossos convidados para o Porão na Roda online 2026",
  free_note: "Tudo isso na faixa, 0800, free, gratuito, por conta da casa!",
  speakers_headline: "Um line up de grandes nomes do mercado",
  passo_a_passo:
    "Para assistir às aulas do Porão na Roda você precisa de um login. Se já tem, basta entrar com o e-mail cadastrado e a senha na área de login.\nEsqueceu a senha? Clique em “Esqueci minha senha” na área de login para redefinir pelo e-mail cadastrado.\nAinda não tem cadastro? Clique em “Inscreva-se”, preencha seus dados e crie sua senha. O acesso é liberado na hora.\nQualquer dúvida sobre o seu login, fale com a gente pelo e-mail de contato.",
  contact_email: "contato@poraodorock.com.br",
  notify_email: "",
  auto_approve: "1",
  live_time_default: "19h (horário de Brasília)",
  footer_note: "© 2026 Porão na Roda — Todos os direitos reservados",
  social_facebook: "https://www.facebook.com/FestivalPoraoDoRock",
  social_instagram: "https://www.instagram.com/poraodorock/",
  social_x: "https://x.com/poraooficial",
  social_youtube: "https://www.youtube.com/@poraodorockoficial",
  social_spotify: "https://open.spotify.com/playlist/2KvRyNhvRtn21qwk8UvPFg",
  social_tiktok: "https://www.tiktok.com/@festivalporaodorock",
};

export const getSettings = cache(async () => {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = { ...SETTING_DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
});

export async function getSetting(key: string) {
  const all = await getSettings();
  return all[key] ?? "";
}
