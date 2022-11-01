const {joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
  AudioPlayerStatus} = require("@discordjs/voice");

const _ = require("lodash");

const {readdir} = require("fs/promises");

const GuildController = require("../controllers/GuildController.js");
// eslint-disable-next-line max-len
const GuildMemberController = require("../controllers/GuildMemberController.js");
const db = require("../models");

module.exports = {
  name: "voiceStateUpdate",
  async execute(before, after) {
    if (before.channelId === null &&
      after.channelId !== null &&
      !after.member.user.bot &&
      !after.deaf) {
      const channel = after.member.voice.channel;
      const members = [...channel.members.keys()];

      let res = await GuildController.find(channel.guild.id);

      if (!res.greetings) {
        return;
      }

      // eslint-disable-next-line max-len
      res = await GuildMemberController.findOrCreateMany(channel.guild.id,
          [after.member.id]);

      const now = Date.now();

      const joinedMember = res[0];

      if (now - joinedMember.last_greeting?.getTime() <= 12 * 3600 * 1000) {
        return;
      }

      // eslint-disable-next-line max-len
      await GuildMemberController.findOrCreateMany(channel.guild.id, members);

      await db.guild_member.update({last_greeting: now},
          {
            where: {
              member_id: members,
              guild_id: channel.guild.id,
            },
          });

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      try {
        const hour = new Date().getHours();

        let folder = "night";
        if (4 <= hour && hour < 12) {
          folder = "morning";
        } else if ( 12 <= hour && hour < 13) {
          folder = "special";
        } else if ( 13 <= hour && hour < 18) {
          folder = "evening";
        }

        const folderPath = `./data/welcome/${folder}`;
        const fileList = await readdir(folderPath);
        const file = _.sample(fileList);

        const resource = createAudioResource(`${folderPath}/${file}`, {
          inputType: StreamType.Arbitrary,
        });

        player.play(resource);

        const subscription = connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
          player.stop();
          subscription.unsubscribe();
          connection.destroy();
        });
      } catch (error) {
        connection.destroy();
        console.log(error);
      }
    }
  },
};
