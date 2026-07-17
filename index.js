const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const { Boom } = require("@hapi/boom");
const P = require("pino");
const QRCodeTerminal = require("qrcode-terminal");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const startWebServer = require("./src/web/server");

// Módulos
const { handleAntiLink } = require("./src/antiLink");
const { handleBadWords } = require("./src/antiBadWords");

async function startBot() {

    // Inicia o servidor Web
   

    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false
    });

    // ==========================
    // SALVA A SESSÃO
    // ==========================
    sock.ev.on("creds.update", saveCreds);

    // ==========================
    // BOAS-VINDAS
    // ==========================
    sock.ev.on("group-participants.update", async (event) => {

        if (event.action !== "add") return;

        for (const participant of event.participants) {

            const jid = participant.phoneNumber || participant.id;

            if (!jid) continue;

            const numero = jid.split("@")[0];

            try {

                await sock.sendMessage(event.id, {

                    text:
`👋 Olá @${numero}!

Seja bem-vindo ao grupo oficial da *MOZ STREAM* 🎮

📜 Leia as regras usando:

/regras

🏆 Boa sorte no campeonato!`,

                    mentions: [jid]

                });

            } catch (err) {

                console.log("Erro ao enviar boas-vindas:");
                console.error(err);

            }

        }

    });

    // ==========================
    // MENSAGENS
    // ==========================
    sock.ev.on("messages.upsert", async ({ messages }) => {

        try {

            const msg = messages[0];

            if (!msg) return;
            if (!msg.message) return;
            if (msg.key.fromMe) return;

            await handleAntiLink(sock, msg);
            await handleBadWords(sock, msg);

        } catch (err) {

            console.log("Erro ao processar mensagem:");
            console.error(err);

        }

    });

    // ==========================
    // CONEXÃO
    // ==========================
    sock.ev.on("connection.update", async (update) => {

        const { connection, lastDisconnect, qr } = update;

        // QR RECEBIDO
        if (qr) {

            console.clear();

            console.log("📱 Escaneie o QR Code abaixo:\n");

            QRCodeTerminal.generate(qr, {
                small: true
            });

            try {

                await QRCode.toFile(
                    path.join(__dirname, "public", "qr.png"),
                    qr
                );

                console.log("✅ QR salvo em public/qr.png");

            } catch (err) {

                console.log("Erro ao gerar QR PNG:");
                console.error(err);

            }

        }

        // CONECTOU
        if (connection === "open") {

            console.clear();

            console.log("=================================");
            console.log("✅ MOZ STREAM BOT CONECTADO");
            console.log("=================================");

            const qrPath = path.join(__dirname, "public", "qr.png");

            if (fs.existsSync(qrPath)) {

                fs.unlinkSync(qrPath);

            }

        }

        // DESCONECTOU
        if (connection === "close") {

            const shouldReconnect =
                (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    : true;

            console.log("⚠️ Conexão encerrada.");

            if (shouldReconnect) {

                console.log("🔄 Reconectando...");
                startBot();

            } else {

                console.log("❌ Sessão desconectada.");

            }

        }

    });

}

// Inicia o servidor Web apenas uma vez
startWebServer();

// Inicia o Bot
startBot();