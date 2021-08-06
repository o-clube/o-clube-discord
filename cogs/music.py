import discord
from discord.channel import VoiceChannel
from discord.ext import commands
from discord.ext.commands import Cog, command
from discord.player import FFmpegOpusAudio
import youtube_dl


def setup(bot):
    """COG Setup."""
    bot.add_cog(Music(bot))

class Music(Cog):
    def __init__(self, bot):
        self.bot =  bot

        @command()
        async def join(self, ctx):
            if ctx.author.voice is None:
                await ctx.send("Você não está em um canal de voz")
            voice_channel = ctx.author.voice.channel
            if ctx.voice_client is None:
                await voice_channel.connect
            else:
                await ctx.voice_client.move_to(VoiceChannel)

        @command()
        async def disconnect(self,ctx):
            await ctx.voice_client.disconnect()

        @command()
        async def play(self,ctx,url):
            ctx.voice_client.stop()
            FFMPEG_OPTIONS= {'before_options':'-reconnect 1 - reconnect_streamed 1 - reconnect_delay_max 5','options':'-vn'}
            YDL_OPTIONS = {'format':"bestaudio"}
            vc = ctx.voice_client

            with youtube_dl.YoutubeDL(YDL_OPTIONS) as ydl:
                info = ydl.extract_info(url, download=False)
                url2 = info['formats'][0]['url']
                source = await discord.FFmpegOpusAudio.from_probe(url2,**FFMPEG_OPTIONS)
                vc.play(source)

        @command()
        async def pause(self,ctx):
            await ctx.voice_client.pause()
            await ctx.send("Pausado <:GWnoneAngryPing:432577942388736000>")

        @command()
        async def resume(self,ctx):
            await ctx.voice_client.resume()


