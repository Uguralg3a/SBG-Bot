const LevelSchema = require("../../Schemas/LevelSchema");
const CalculateLevelXp = require("../../Structures/Utils/CalculateLevelXp");

const cooldowns = new Set();

function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
      if (
        !message.inGuild() ||
        message.author.bot ||
        cooldowns.has(message.author.id)
      )
        return;

      const xpToGive = getRandomXp(5, 25);

      const xpNeededForNextLevel = CalculateLevelXp(20); // Assuming this function returns the XP needed for the next level

      const query = {
        userId: message.author.id,

        guildId: message.guild.id,
      };

      try {
        let level = await LevelSchema.findOne(query);

        if (level) {
          level.xp += xpToGive;

          // Check if the user has reached level 20

          if (level.xp >= xpNeededForNextLevel && level.level < 20) {
            level.level = 20;

            // Add the role to the user

            const role = message.guild.roles.cache.find(
              (role) => role.name === "Level 20"
            );

            if (role) {
              //await message.member.roles.add(role);

              message.channel.send(
                `${message.member} has been awarded the role **${role.name}** for reaching level 20!`
              );
            }
          } else {
            // Check if the user has enough XP to level up

            while (level.xp >= CalculateLevelXp(level.level)) {
              level.xp -= CalculateLevelXp(level.level); // Subtract the XP needed for the current level

              level.level += 1; // Increase the level
              message.channel.send(
                `${message.member} you have leveled up to **level ${level.level}**.`
              );
            }
          }

          await level.save();
        } else {
          // Create a new level entry

          const newLevel = new LevelSchema({
            userId: message.author.id,

            guildId: message.guild.id,

            xp: xpToGive,

            level: 1,
          });

          await newLevel.save();
        }

        cooldowns.add(message.author.id);

        setTimeout(() => {
          cooldowns.delete(message.author.id);
        }, 60000);
      } catch (error) {
        console.log(`Error giving xp: ${error}`);
      
    }
  },
};
