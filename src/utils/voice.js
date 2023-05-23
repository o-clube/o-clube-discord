const {joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
  AudioPlayerStatus} = require("@discordjs/voice");

function playSound(filePath, channel) {
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
    const resource = createAudioResource(filePath, {
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

module.exports = {playSound};
