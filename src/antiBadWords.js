const NodeCache = require("node-cache");

const cache = new NodeCache({
    stdTTL: 86400, // 24 horas
    checkperiod: 600
});

// Lista de palavras proibidas
const badWords = [
    "fdp",
    "filho da puta",
    "puta",
    "caralho",
    "merda",
    "porra",
    "cu",
    "bosta",
    "foda-se",
    "fodase"
];

function containsBadWord(text) {

    if (!text) return false;

    text = text.toLowerCase();

    return badWords.some(word => text.includes(word));

}

async function handleBadWords(sock, msg) {

    try {

        if (!msg.key.remoteJid.endsWith("@g.us")) return;

        const sender = msg.key.participant;

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        if (!containsBadWord(text)) return;

        let warns = cache.get(sender) || 0;

        warns++;

        cache.set(sender, warns);

        // Apaga a mensagem
        await sock.sendMessage(msg.key.remoteJid, {
            delete: msg.key
        });

        if (warns < 3) {

            await sock.sendMessage(msg.key.remoteJid, {
                text:
`⚠️ @${sender.split("@")[0]}

Evite utilizar palavrões neste grupo.

Advertência: ${warns}/3`,
                mentions: [sender]
            });

            return;

        }

        // Remove o membro
        await sock.groupParticipantsUpdate(
            msg.key.remoteJid,
            [sender],
            "remove"
        );

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`🚫 @${sender.split("@")[0]} foi removido por excesso de palavrões.`,
            mentions: [sender]
        });

    } catch (err) {

        console.log(err);

    }

}

module.exports = {
    handleBadWords
};