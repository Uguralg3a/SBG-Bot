const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");

class LevelCard {
  constructor() {
    this.canvas = Canvas.createCanvas(1000, 250);
    this.ctx = this.canvas.getContext("2d");
    this.member = null;
    this.currentXp = 0;
    this.requiredXp = 100;
    this.level = 0;
    this.rank = 0;
  }

  setMember(member) {
    this.member = member;
    return this;
  }

  setCurrentXp(currentXp) {
    this.currentXp = currentXp;
    return this;
  }

  setRequiredXp(requiredXp) {
    this.requiredXp = requiredXp;
    return this;
  }

  setLevel(level) {
    this.level = level;
    return this;
  }

  setRank(rank) {
    this.rank = rank;
    return this;
  }

  async build() {
    if (!this.member) throw new Error("Member not set!");

    const user = this.member.user;

    //Background color
    this.ctx.fillStyle = "#302f33";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //Draw user's profile picture
    const avatar = await Canvas.loadImage(
      user.displayAvatarURL({ format: "jpg" })
    );
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.clip();
    this.ctx.drawImage(avatar, 25, 25, 200, 200);
    this.ctx.restore();

    //Draw user's activity status
    let statusText = "";
    if (this.member.presence) {
      statusText += this.member.presence.activities[0]
        ? this.member.presence.activities[0].name
        : "No activity";
    } else {
      statusText += "Offline";
    }
    this.ctx.font = "28px sans-serif";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(statusText, 250, 100);

    //Draw the XP bar background
    this.ctx.fillStyle = "#ffffff";
    this.roundRect(this.ctx, 250, 150, 550, 50, 25).fill();

    //Draw the XP bar foreground
    const progress = Math.min(this.currentXp / this.requiredXp, 1);
    this.ctx.fillStyle = "#00ff00";
    this.roundRect(this.ctx, 250, 150, 300 * progress, 50, 25).fill();

    //Draw the XP text
    const xpText = `XP: ${this.currentXp} / ${this.requiredXp}`;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(xpText, 253, 240);

    //Draw the Level text
    const levelText = `Level: ${this.level}`;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(levelText, 500, 240);

    //Draw the Rank text
    const rankText = `#${this.rank}`;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(rankText, 770, 50);

    return new AttachmentBuilder(this.canvas.toBuffer(), "profile-image.png");
  }
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    return ctx;
  }
}

module.exports = { LevelCard };
