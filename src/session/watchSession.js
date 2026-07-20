const fs = require("fs");
const path = require("path");
const saveSession = require("./saveSession");

let timeout;

function watchSession() {

    const authPath = path.join(process.cwd(), "auth");

    if (!fs.existsSync(authPath)) return;

    fs.watch(authPath, () => {

        clearTimeout(timeout);

        timeout = setTimeout(async () => {

            console.log("💾 Salvando sessão no Supabase...");

            await saveSession();

        }, 1000);

    });

}

module.exports = watchSession;