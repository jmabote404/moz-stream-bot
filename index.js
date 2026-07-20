require("dotenv").config();

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");


const P = require("pino");
const QRCodeTerminal = require("qrcode-terminal");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");





// Servidor Web
const startWebServer = require("./src/web/server");


// Funções do bot
const { handleAntiLink } = require("./src/antiLink");
const { handleBadWords } = require("./src/antiBadWords");

let reconnecting = false;
let botStarted = false;
async function startBot() {
async function startBot() {

    if (botStarted) {
        console.log("⚠️ Bot já iniciado, cancelando nova inicialização.");
        return;
    }

    botStarted = true;

   const { state, saveCreds } = await useMultiFileAuthState("./auth");


    const { version } = await fetchLatestBaileysVersion();



    const sock = makeWASocket({

        version,

        auth: state,

        logger: P({
            level: "silent"
        }),

        printQRInTerminal: false

    });
    // Salva a sessão
sock.ev.on("creds.update", async () => {
    await saveCreds();
    console.log("✅ Sessão salva.");
});



  



    // ==========================
    // BOAS VINDAS
    // ==========================

    sock.ev.on(
        "group-participants.update",
        async (event) => {


            if (event.action !== "add")
                return;



            for (const participant of event.participants) {


                const jid =
                    participant.phoneNumber ||
                    participant.id;



                if (!jid)
                    continue;



                const numero =
                    jid.split("@")[0];



                await sock.sendMessage(
                    event.id,
                    {

                        text:
`👋 Olá @${numero}!

Seja bem-vindo ao grupo oficial da *MOZ STREAM* 🎮

📜 Leia as regras usando:

/regras

🏆 Boa sorte!`,

                        mentions:[
                            jid
                        ]

                    }
                );


            }


        }
    );




    // ==========================
    // MENSAGENS
    // ==========================

   sock.ev.on("messages.upsert", async ({ messages }) => {

    try {

        console.log("📩 Evento recebido");

        const msg = messages[0];

        if (!msg) return;
        if (!msg.message) return;
        if (msg.key.fromMe) return;

        console.log("Mensagem recebida.");

        await handleAntiLink(sock, msg);

        await handleBadWords(sock, msg);

    } catch (err) {

        console.log("Erro messages.upsert");
        console.error(err);

    }

});




    // ==========================
    // CONEXÃO
    // ==========================


    sock.ev.on(
        "connection.update",
        async(update)=>{


            const {
                connection,
                lastDisconnect,
                qr
            } = update;

console.log("Estado:", connection);


            if(qr){


                console.log(
                    "📱 Escaneie o QR:"
                );


                QRCodeTerminal.generate(
                    qr,
                    {
                        small:true
                    }
                );



                try{


                    await QRCode.toFile(

                        path.join(
                            __dirname,
                            "public",
                            "qr.png"
                        ),

                        qr

                    );


                    console.log(
                        "✅ QR criado"
                    );



                }catch(err){

                    console.log(err);

                }


            }




            if(connection==="open"){


                console.log(
                    "================================="
                );

                console.log(
                    "✅ MOZ STREAM BOT CONECTADO"
                );


                console.log(
                    "================================="
                );



                const qrPath =
                    path.join(
                        __dirname,
                        "public",
                        "qr.png"
                    );



                if(fs.existsSync(qrPath)){

                    fs.unlinkSync(qrPath);

                }


            }





            if(connection==="close"){



                const statusCode =
                    lastDisconnect
                    ?.error
                    ?.output
                    ?.statusCode;



           console.log("=================================");
console.log("Conexão:", connection);
console.log("Status:", statusCode);
console.dir(lastDisconnect, { depth: null });
console.log("=================================");


                const reconnect =
                    statusCode !==
                    DisconnectReason.loggedOut;



           if (reconnect && !reconnecting) {

    reconnecting = true;

    console.log("🔄 Reconectando em 5 segundos...");

    setTimeout(async () => {

        reconnecting = false;

        await startBot();

    }, 5000);

}else{


                    console.log(
                        "❌ Sessão encerrada."
                    );


                }


            }


        }
    );



}




// inicia servidor web
startWebServer();


// inicia bot
startBot();