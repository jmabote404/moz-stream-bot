const { sendWelcome } = require("../modules/welcome");

function registerGroupEvents(sock) {

    sock.ev.on("group-participants.update", async (event) => {

        if (event.action === "add") {

            for (const participant of event.participants) {

                await sendWelcome(
                    sock,
                    event.id,
                    participant
                );

            }

        }

    });

}

module.exports = registerGroupEvents;