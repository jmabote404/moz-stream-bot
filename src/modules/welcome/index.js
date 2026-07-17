
async function sendWelcome(sock, groupId, participant) {
    try {
        const text =
`👋 Olá @${participant.split("@")[0]}!

Seja bem-vindo ao grupo oficial da *MOZ STREAM* 🎮

📜 Leia as regras usando:
/regras

🏆 Desejamos boa sorte no campeonato!`;

        await sock.sendMessage(groupId, {
            text,
            mentions: [participant]
        });

    } catch (error) {
        console.log("Erro ao enviar boas-vindas:", error);
    }
}

module.exports = {
    sendWelcome
};