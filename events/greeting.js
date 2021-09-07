const { joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    StreamType,
    AudioPlayerStatus } = require('@discordjs/voice');

const guildSchema = require("../database/models/guild.js");

module.exports = {
    name: 'voiceStateUpdate',
    async execute(before, after) {
        if (before.channelId === null && after.channelId !== null && !after.member.user.bot) {
            const channel = after.member.voice.channel;
            const members = channel.members;
            res = await guildSchema.findOne({
                id: after.guild.id
            });

            const now = Date.now()

            for (r of res.members) {
                m = members.get(r.id)
                if (m) {
                    console.log(now)
                    r.last_seen = now
                }
            }

            await res.save().catch(err => console.log(err));

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
                    player.stop()
                    subscription.unsubscribe();
                    connection.destroy();
                })
            } catch (error) {
                connection.destroy();
                console.log(error);
            }
        }
    },
};
