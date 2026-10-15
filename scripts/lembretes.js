// Roda no GitHub Actions a cada hora: avisa 24 horas antes de cada serviço agendado.
const admin = require("firebase-admin");

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(sa),
  databaseURL: process.env.DATABASE_URL
});

const ANTECEDENCIA_MS = 24 * 60 * 60 * 1000;

async function main() {
  const db = admin.database();
  const messaging = admin.messaging();
  const agora = Date.now();

  const orders = (await db.ref("orders").get()).val() || {};
  const tokenNodes = (await db.ref("fcmTokens").get()).val() || {};
  const tokens = Object.values(tokenNodes).map(t => t.token).filter(Boolean);

  if (!tokens.length) { console.log("Nenhum aparelho ativado."); return; }

  for (const [id, o] of Object.entries(orders)) {
    if (!o || o.status !== "agendado" || !o.date || !o.time) continue;

    // Horário de Brasília (UTC-3; o Brasil não usa horário de verão desde 2019)
    const inicio = Date.parse(`${o.date}T${o.time}:00-03:00`);
    if (isNaN(inicio)) continue;

    // Só avisa entre 24 horas antes e o horário do serviço
    if (agora < inicio - ANTECEDENCIA_MS || agora >= inicio) continue;

    // Não repete o aviso; se o horário for alterado, avisa de novo
    const chave = String(inicio);
    const jaEnviado = (await db.ref(`lembretes/${id}`).get()).val();
    if (jaEnviado === chave) continue;

    const [ano, mes, dia] = o.date.split("-");
    const quando = `${dia}/${mes} às ${o.time}`;

    const response = await messaging.sendEachForMulticast({
      tokens,
      data: {
        title: "Serviço em 24 horas",
        body: `${o.client || "Cliente"} · ${o.service || "Serviço"} · ${quando}`,
        orderId: id
      }
    });
    console.log(`Serviço ${id}: ${response.successCount} enviados, ${response.failureCount} falhas`);

    // Remove aparelhos que não recebem mais notificações
    response.responses.forEach((r, i) => {
      if (!r.success && r.error && r.error.code === "messaging/registration-token-not-registered") {
        const bad = tokens[i].replace(/[.#$\[\]\/]/g, "_");
        db.ref(`fcmTokens/${bad}`).remove();
      }
    });

    await db.ref(`lembretes/${id}`).set(chave);
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
