
from discord.ext.commands import Cog
import asyncio

from discord.player import FFmpegPCMAudio

def setup(bot):
    """COG Setup."""
    bot.add_cog(Welcome(bot))


class Welcome(Cog):
    def __init__(self, bot):
        self.bot = bot

    @Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        """Plays a welcome sound message when someone joins the channel."""
        if after.channel != None and not member.bot:
            vc = await after.channel.connect()
            audio = FFmpegPCMAudio('bomdia.mp3')
            vc.play(audio)

            while  vc.is_playing():
                await asyncio.sleep(.1)
            await vc.disconnect()
