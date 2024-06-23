class Reply {
  constructor() {
    this.message = null;
    this.ephemeral = false;
    this.files = [];
    this.attachments = [];
    this.embeds = [];
    this.components = [];
    this.defer = false;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  setEphemeral() {
    this.ephemeral = true;
    return this;
  }

  setFiles(files) {
    this.files = files;
    return this;
  }

  setAttachments(attachments) {
    this.attachments = attachments;
    return this;
  }

  setEmbeds(embeds) {
    this.embeds = embeds;
    return this;
  }

  setComponents(components) {
    this.components = components;
    return this;
  }

  setDefer(defer) {
    this.defer = defer;
    return this;
  }

  async send(interaction) {
    if (this.defer)
      await interaction.editReply({
        content: this.message,
        ephemeral: this.ephemeral,
        files: this.files,
        attachments: this.attachments,
        embeds: this.embeds,
        components: this.components,
      });

    await interaction.reply({
      content: this.message,
      ephemeral: this.ephemeral,
      files: this.files,
      attachments: this.attachments,
      embeds: this.embeds,
      components: this.components,
    });
  }
}

module.exports = { Reply };
