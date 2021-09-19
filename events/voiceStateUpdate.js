const {joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
  AudioPlayerStatus} = require('@discordjs/voice');

const GuildController = require('../controllers/GuildController.js');
// eslint-disable-next-line max-len
const GuildMemberController = require('../controllers/GuildMemberController.js');
const GuildMember = require('../models/guildMember.js');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(before, after) {
    if (before.channelId === null &&
      after.channelId !== null &&
      !after.member.user.bot) {
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

      const [joinedMember, _] = res[0];

      if (now - joinedMember.last_greeting?.getTime() <= 12 * 3600 * 1000) {
        return;
      }

      // eslint-disable-next-line max-len
      await GuildMemberController.findOrCreateMany(channel.guild.id, members);

      await GuildMember.update({last_greeting: now},
          {
            where: {
              member_id: members,
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
        const resource = createAudioResource('./data/welcome/mourao.mp3', {
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
