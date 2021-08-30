const { joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    StreamType,
    AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'voiceStateUpdate',
    execute(before, after) {
        if (before.channelId === null && after.channelId !== null && !after.member.user.bot) {
            const channel = after.member.voice.channel;
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
