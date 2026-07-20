const NodeCache = require("node-cache");

// Contador de links (24 horas)
const cache = new NodeCache({
    stdTTL: 86400,
    checkperiod: 600
});

// Detecta links
function containsLink(text) {
    if (!text) return false;

    const regex =
        /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|discord\.gg|discord\.com\/invite)/i;

    return regex.test(text);
}

async function handleAntiLink(sock, msg) {
    console.log("AntiLink executado");

    try {

        if (!msg.key.remoteJid || !msg.key.remoteJid.endsWith("@g.us")) return;

        const sender =
    msg.key.participant ||
    msg.key.participantAlt ||
    msg.key.remoteJid;
console.log("Sender:", sender);
       const message =
    msg.message?.ephemeralMessage?.message ||
    msg.message;

const text =
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    "";
    
console.log("Tipo de mensagem:", Object.keys(msg.message));
    console.log("Texto recebido:", text);
        if (!containsLink(text)) return;

        let count = cache.get(sender) || 0;

        count++;

        cache.set(sender, count);

        console.log(`${sender} enviou ${count} link(s)`);

        // Primeiro link
        if (count === 1) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ @${sender.split("@")[0]}, o primeiro link do dia foi permitido.`,
                mentions: [sender]
            });
            return;
        }

        // Apaga mensagem
        await sock.sendMessage(msg.key.remoteJid, {
            delete: msg.key
        });

        // Segundo e terceiro link
       // Segundo e terceiro link
console.log("⚠️ Entrou na advertência, contador:", count);

if (count < 4) {

    await sock.sendMessage(msg.key.remoteJid, {
        text:
`⚠️ Usuário enviou link novamente.

Advertência: ${count - 1}/3`
    });

    console.log("✅ Mensagem de advertência enviada");

    return;
}

        // Quarto link
        await sock.groupParticipantsUpdate(
            msg.key.remoteJid,
            [sender],
            "remove"
        );

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`🚫 @${sender.split("@")[0]} foi removido por excesso de links.`,
            mentions: [sender]
        });

    } catch (err) {

        console.log("Erro AntiLink:");
        console.log(err);

    }

}

module.exports = {
    handleAntiLink
};