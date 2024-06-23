const { Client } = require('discord.js');
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const db = true;

class Aiden extends Client {
    start() {
        this.login(process.env.TOKEN)
            .then(() => {
                if (!db) return;
                mongoose.set("strictQuery", false);
                mongoose
                    .connect(process.env.MONGODB)
                    .then((data) => {
                        console.log(`Connected to: ${data.connection.name}`);
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));

    }
}
module.exports = { Aiden }

