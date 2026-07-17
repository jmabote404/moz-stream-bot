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

        const statusCode = lastDisconnect?.error?.output?.statusCode;

        console.log("=================================");
        console.log("⚠️ CONEXÃO ENCERRADA");
        console.log("Status Code:", statusCode);
        console.dir(lastDisconnect, { depth: null });
        console.log("=================================");

        const shouldReconnect =
            (lastDisconnect?.error instanceof Boom)
                ? statusCode !== DisconnectReason.loggedOut
                : true;

        if (shouldReconnect) {

            console.log("🔄 Reconectando em 5 segundos...");

            setTimeout(() => {
                startBot();
            }, 5000);

        } else {

            console.log("❌ Sessão desconectada. Escaneie o QR novamente.");

        }

    }

});