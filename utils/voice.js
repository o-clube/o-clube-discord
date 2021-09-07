
class AudioPlayer {
    constructor(channel) {
        this.channel = channel
    }

    connect() {
        const connection = joinVoiceChannel({
            channelId: this.channel.id,
            guildId: this.channel.guild.id,
            adapterCreator: createDiscordJSAdapter(this.channel),
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
            return connection;
        } catch (error) {
            connection.destroy();
            throw error;
        }
    }
    play(path) {
        const resource = createAudioResource(path, {
            inputType: StreamType.Arbitrary,
        });

        const player = createAudioPlayer();

        player.play(resource);

        return entersState(player, AudioPlayerStatus.Playing, 5e3);
    }
}