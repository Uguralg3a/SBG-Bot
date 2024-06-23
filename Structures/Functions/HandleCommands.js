const { REST, Routes } = require("discord.js");
const fs = require("fs");
require('dotenv').config();

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync('./Commands');
        for (const folder of commandFolders) {
            const commandFiles = fs
            .readdirSync(`./Commands/${folder}`)
            .filter((file) => file.endsWith(".js"));

            const {commands, commandArray} = client;
            for (const file of commandFiles) {
                const command = require(`../../Commands/${folder}/${file}`);
                commands.set(command.data.name, command); 
                commandArray.push(command.data.toJSON());
                console.log(`Command: ${command.data.name} has passed through the handler!`)
            }
        }
        const clientId = process.env.CLIENTID;
        const rest = new REST({version: '9'}).setToken(process.env.TOKEN);
        try {
            console.log("Started refreshing application {/} commands.");

            await rest.put(Routes.applicationCommands(clientId), {
                body: client.commandArray,
            });

            console.log("Succesfully reloaded application {/} commands.");
        } catch (error) {
            console.error(error);
        }
    };
};