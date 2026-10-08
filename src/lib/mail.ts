import "server-only";

/**
 * E-mails transacionais via SendGrid (API v3). Se SENDGRID_API_KEY / MAIL_FROM
 * não estiverem configurados, nada é enviado e a função devolve false —
 * o restante do fluxo continua funcionando (o admin pode repassar senhas manualmente).
 */
export function mailConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.MAIL_FROM);
}

export function siteUrl() {
  return (
    process.env.SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}

function parseFrom(raw: string) {
  const m = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].replace(/^"|"$/g, "").trim(), email: m[2].trim() };
  return { email: raw.trim() };
}

/** Aceita "a@x.com" ou "a@x.com, b@y.com" e devolve a lista de e-mails válidos. */
export function parseRecipients(raw: string | string[] | null | undefined): string[] {
  const list = Array.isArray(raw) ? raw : (raw ?? "").split(/[,;]+/);
  return [...new Set(list.map((e) => e.trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))];
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  if (!mailConfigured()) return false;
  const recipients = parseRecipients(opts.to);
  if (recipients.length === 0) return false;
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: recipients.map((email) => ({ email })) }],
        from: parseFrom(process.env.MAIL_FROM!),
        subject: opts.subject,
        content: [
          { type: "text/plain", value: opts.text ?? opts.html.replace(/<[^>]+>/g, "") },
          { type: "text/html", value: opts.html },
        ],
      }),
    });
    if (!res.ok) {
      console.error("SendGrid error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("SendGrid error", e);
    return false;
  }
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3eee8;font-family:Arial,Helvetica,sans-serif;color:#232322">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,63,39,.08)">
      <div style="background:#000000;padding:20px 28px;color:#fff100;font-size:20px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase">Porão na Roda</div>
      <div style="padding:28px;font-size:15px;line-height:1.6">
        <h1 style="font-size:20px;margin:0 0 12px;color:#111111">${title}</h1>
        ${body}
      </div>
      <div style="padding:16px 28px;background:#fbfaf8;color:#727271;font-size:12px">
        Festival Porão do Rock · Plataforma Softaliza
      </div>
    </div>
  </div></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${href}" style="display:inline-block;background:#fff100;color:#000;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">${label}</a></p>`;

export async function sendPasswordResetEmail(to: string, name: string, link: string) {
  return sendMail({
    to,
    subject: "Redefinição de senha — Porão na Roda",
    html: layout(
      "Redefinir sua senha",
      `<p>Olá, ${name}.</p>
       <p>Recebemos um pedido para redefinir a senha da sua conta no Porão na Roda. Clique no botão abaixo para escolher uma nova senha. O link vale por 1 hora.</p>
       ${button(link, "Criar nova senha")}
       <p style="color:#727271;font-size:13px">Se você não pediu a redefinição, ignore este e-mail — sua senha continua a mesma.</p>`
    ),
  });
}

export async function sendAccountApprovedEmail(
  to: string,
  name: string,
  opts: { password?: string }
) {
  const login = `${siteUrl()}/login`;
  return sendMail({
    to,
    subject: "Seu acesso ao Porão na Roda foi aprovado",
    html: layout(
      "Cadastro aprovado!",
      `<p>Olá, ${name}.</p>
       <p>Sua inscrição no Porão na Roda foi aprovada. Agora você já pode acessar as salas das aulas ao vivo e as gravações.</p>
       <p><strong>Login:</strong> ${to}${
         opts.password ? `<br><strong>Senha:</strong> ${opts.password}` : ""
       }</p>
       ${button(login, "Acessar a plataforma")}
       ${opts.password ? `<p style="color:#727271;font-size:13px">Recomendamos trocar a senha em “Minha conta” após o primeiro acesso.</p>` : ""}`
    ),
  });
}

export async function sendRegistrationReceivedEmail(to: string, name: string) {
  return sendMail({
    to,
    subject: "Recebemos sua inscrição — Porão na Roda",
    html: layout(
      "Solicitação recebida",
      `<p>Olá, ${name}.</p>
       <p>Recebemos sua inscrição no Porão na Roda. Ela será analisada pela organização e você receberá um e-mail assim que o acesso for liberado.</p>
       <p style="color:#727271;font-size:13px">Dúvidas? Fale com a organização do Porão na Roda.</p>`
    ),
  });
}

/** Boas-vindas de quem se cadastra com aprovação automática (já sai logado). */
export async function sendWelcomeEmail(to: string, name: string) {
  return sendMail({
    to,
    subject: "Inscrição confirmada — bem-vindo(a) ao Porão na Roda",
    html: layout(
      "Cadastro confirmado!",
      `<p>Olá, ${name.split(" ")[0]}.</p>
       <p>Sua inscrição no Porão na Roda foi concluída e o seu acesso já está liberado. Use o e-mail <strong>${to}</strong> e a senha que você criou para entrar quando quiser.</p>
       ${button(`${siteUrl()}/programacao`, "Ver a programação das lives")}
       <p style="color:#727271;font-size:13px">Dúvidas? Fale com a organização do Porão na Roda.</p>`
    ),
  });
}

export async function sendAdminNewRegistrationEmail(
  to: string | string[],
  user: { name: string; email: string; city?: string | null; state?: string | null; profession?: string | null; phone?: string | null },
  opts?: { autoApproved?: boolean }
) {
  const auto = opts?.autoApproved ?? false;
  const link = auto ? `${siteUrl()}/admin/usuarios?q=${encodeURIComponent(user.email)}` : `${siteUrl()}/admin/solicitacoes`;
  return sendMail({
    to,
    subject: auto ? `Novo cadastro no Porão na Roda: ${user.name}` : `Nova solicitação de cadastro: ${user.name}`,
    html: layout(
      auto ? "Novo cadastro na plataforma" : "Nova solicitação de cadastro",
      `<p><strong>${user.name}</strong> (${user.email}) ${auto ? "se inscreveu no Porão na Roda. O acesso foi liberado automaticamente." : "solicitou acesso ao Porão na Roda."}</p>
       <p>Telefone: ${user.phone ?? "—"}<br>Atuação: ${user.profession ?? "—"}<br>Cidade: ${[user.city, user.state].filter(Boolean).join("/") || "—"}</p>
       ${button(link, auto ? "Ver cadastro no painel" : "Analisar no painel")}`
    ),
  });
}
