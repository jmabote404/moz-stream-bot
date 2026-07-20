const fs = require("fs");
const path = require("path");
const supabase = require("../database/supabase");

async function loadSession() {

    const authPath = path.join(process.cwd(), "auth");

    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { data, error } = await supabase
        .from("whatsapp_session")
        .select("*");

    if (error) {

        console.log("Nenhuma sessão encontrada.");
        return;

    }

    for (const file of data) {

        fs.writeFileSync(
            path.join(authPath, file.id),
            Buffer.from(file.data, "base64")
        );

    }

    console.log("✅ Sessão restaurada do Supabase.");

}

module.exports = loadSession;