const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const LevelSchema = require("../../Schemas/LevelSchema");
const { LevelCard } = require("../../Structures/Classes/LevelCard");
const CalculateLevelXp = require("../../Structures/Utils/CalculateLevelXp");
const { Reply } = require("../../Structures/Classes/Reply");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Check your rank or the rank of someone else")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Check the Rank from this mentioned user.")
    ),
  async execute(interaction, client) {
    if (!interaction.inGuild()) {
      interaction.reply("You can only run this command inside a server.");
      return;
    }

    const mentionedUserId = interaction.options.getUser("user")?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await LevelSchema.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.reply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    let allLevels = await LevelSchema.find({
      guildId: interaction.guild.id,
    }).select("-_id userId level xp");

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let userPosition =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    let currentRank =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    var rank = await new LevelCard()
      .setMember(targetUserObj)
      .setCurrentXp(fetchedLevel.xp)
      .setRequiredXp(CalculateLevelXp(fetchedLevel.level))
      .setLevel(fetchedLevel.level)
      .setRank(currentRank)
      .build();

      new Reply().setFiles([rank]).setEphemeral().send(interaction);
  },
};
