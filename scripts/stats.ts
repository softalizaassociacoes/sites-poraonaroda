/** Contagens rápidas do banco: npm run db:stats */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const [users, byStatus, editions, speakers, lectures, questions, faq, sponsors, views] = await Promise.all([
    db.user.count(),
    db.user.groupBy({ by: ["status"], _count: { _all: true } }),
    db.edition.count(),
    db.speaker.count(),
    db.lecture.count(),
    db.quizQuestion.count(),
    db.faqItem.count(),
    db.sponsor.count(),
    db.pageView.count(),
  ]);
  console.log({ users, byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])), editions, speakers, lectures, questions, faq, sponsors, views });
}
main().finally(() => db.$disconnect());
