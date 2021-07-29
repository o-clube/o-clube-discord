from discord.ext.commands import Cog, command
import asyncio
from models import session, User
from discord.player import FFmpegPCMAudio
from datetime import datetime



def setup(bot):
    """COG Setup."""
    bot.add_cog(Welcome(bot))


class Welcome(Cog):
    def __init__(self, bot):
        self.bot = bot


    @Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        """Plays a welcome sound message when someone joins the channel."""
        if before.channel == None and after.channel != None and not member.bot and not after.self_deaf:
            user = session.query(User).filter_by(member_id=member.id).first()
            if not user:
                user = User(
                        member_id=member.id,
                        guild_id=after.channel.guild.id,
                        name=member.name,
                        last_seen=datetime.now()
                    )
                session.add(user)
            elif (datetime.now() - user.last_seen).total_seconds() < 3600 * 12:
                return
            vc = await after.channel.connect()
            audio = FFmpegPCMAudio('data/bomdia.mp3')
            vc.play(audio)
            while vc.is_playing():
                await asyncio.sleep(.1)
            await vc.disconnect()
            user.last_seen = datetime.now()
            session.commit()

                

    @command(name="bomdia")
    async def good_morning(self, ctx):
        if ctx.author.voice.channel:
            vc = await ctx.author.voice.channel.connect()
            audio = FFmpegPCMAudio('data/bomdia.mp3')
            vc.play(audio)
            while vc.is_playing():
                await asyncio.sleep(.1)
            await vc.disconnect()
