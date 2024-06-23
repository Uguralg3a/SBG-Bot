const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const LevelSchema = require("../../Schemas/LevelSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Get the Leaderboard"),
  async execute(interaction, client) {
    await interaction.deferReply();

    const data = await LevelSchema.find({
      guildId: interaction.guild.id,
    }).select("-_id userId level xp");
    data.sort((a, b) => b.level - a.level || b.xp - a.xp);

    const pageSize = 10;
    let page = 0;

    const generatedEmbed = async (page) => {
        const start = page * pageSize;
      const current = data.slice(start, start + pageSize);
      const embed = new EmbedBuilder()
        .setTitle("Leaderboard")
        .setColor("Green");

      const levelGroups = current.reduce((acc, user) => {
        acc[user.level] = acc[user.level] || [];
        acc[user.level].push(user);
        return acc;
      }, {});

      //Sort levels in descending order
      const sortedLevels = Object.keys(levelGroups).sort((a, b) => b - a);

      for (const level of sortedLevels) {
        const userAtLevel = levelGroups[level];
        let userText = "";
        for (const user of userAtLevel) {
          let member;
          try {
            member = await interaction.guild.members.fetch(user.userId);
          } catch (error) {
            console.log(error);
          }
          const userName = member?.user.username || "Unknown";
          userText += `${userName}: ${user.xp}\n`;
        }

        embed.addFields({
          name: `Level ${level}`,
          value: userText,
          inline: false,
        });
      }
      return embed;
    };

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("before")
        .setLabel("Before")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled((page + 1) * pageSize >= data.length)
    );

    await interaction.editReply({
      embeds: [await generatedEmbed(0)],
      components: [buttons],
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "next") {
        page++;
      } else if (i.customId === "before") {
        page--;
      }

      //Update the disabled state of the buttons
      const newButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("before")
          .setLabel("Before")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled((page + 1) * pageSize >= data.length)
      );

      await i.update({
        embeds: [await generatedEmbed(page * pageSize)],
        components: [newButtons],
      });
    });
  },
};
