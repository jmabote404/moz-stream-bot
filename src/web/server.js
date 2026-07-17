const express = require("express");
const path = require("path");
const fs = require("fs");

function startWebServer() {

    const app = express();

    app.use("/public", express.static(path.join(__dirname, "../../public")));

    app.get("/", (req, res) => {

        const qrExists = fs.existsSync(
            path.join(__dirname, "../../public/qr.png")
        );

        res.send(`
<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>MOZ STREAM BOT</title>

<style>

body{
    background:#0f172a;
    color:white;
    font-family:Arial;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.card{
    background:#1e293b;
    width:420px;
    border-radius:15px;
    padding:30px;
    text-align:center;
    box-shadow:0 0 25px rgba(0,0,0,.4);
}

img{
    width:300px;
    margin-top:20px;
}

h1{
    color:#22c55e;
}

.status{
    font-size:18px;
    margin-top:15px;
}

</style>

</head>

<body>

<div class="card">

<h1>🤖 MOZ STREAM BOT</h1>

${
qrExists
?
`
<p class="status">
📱 Escaneie o QR Code abaixo
</p>

<img src="/public/qr.png?${Date.now()}">
`
:
`
<p class="status">
✅ BOT CONECTADO
</p>
`
}

</div>

</body>
</html>
`);

    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {

        console.log("");
        console.log("🌐 Servidor Web iniciado");
        console.log("Porta:", PORT);

    });

}

module.exports = startWebServer;