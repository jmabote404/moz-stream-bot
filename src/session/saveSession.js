const fs = require("fs");
const path = require("path");
const supabase = require("../database/supabase");

async function saveSession() {

    const authPath = path.join(process.cwd(), "auth");

    if (!fs.existsSync(authPath)) return;

    const files = fs.readdirSync(authPath);

    for (const file of files) {

        const buffer = fs.readFileSync(path.join(authPath, file));

        const base64 = buffer.toString("base64");

        const { error } = await supabase
            .from("whatsapp_session")
            .upsert({
                id: file,
                data: base64,
                updated_at: new Date().toISOString()
            });

        if (error) {

            console.log("Erro ao salvar:", file);
            console.log(error.message);

        } else {

            console.log("✔ Arquivo salvo:", file);

        }

    }

}

module.exports = saveSession;