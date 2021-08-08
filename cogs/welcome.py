import arrow
import asyncio

from discord.ext.commands import Cog, command
from discord.player import FFmpegPCMAudio
from datetime import datetime



from date_utils import DayPeriod, get_day_period
from models import session, User


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
            now = arrow.now('America/Sao_Paulo')
            userList = []
            for onlineMember in after.channel.members:
                user = session.query(User).filter_by(member_id=onlineMember.id).first()
                if not user:
                    user = User(
                        member_id=onlineMember.id,
                        guild_id=after.channel.guild.id,
                        name=onlineMember.name,
                        last_seen=now
                        )
                    session.add(user)
                    userList.append(user)
                elif (now - user.last_seen).total_seconds() < 3600 * 12:
                    continue
                elif not onlineMember.voice.self_deaf:
                    userList.append(user)
                

            if userList:
                day_period = get_day_period()
                f = None
                if day_period == DayPeriod.MORNING:
                    f = 'data/welcome/mourao.mp3'
                elif now.hour >= 12 and now.hour < 13:
                    f = 'data/welcome/dilma.mp3'
                elif day_period == DayPeriod.AFTERNOON:
                    f = 'data/welcome/jornalhoje.mp3'
                else:
                    f = 'data/welcome/bonner.mp3'

                audio = FFmpegPCMAudio(f)
                vc = await after.channel.connect()
                vc.play(audio)

                while vc.is_playing():
                    await asyncio.sleep(.5)
                await vc.disconnect()
                for user in userList:
                    user.last_seen = now
                session.commit()



    @command(name="bomdia")
    async def good_morning(self, ctx):
        if ctx.author.voice.channel:
            vc = await ctx.author.voice.channel.connect()
            audio = FFmpegPCMAudio('data/welcome/mourao.mp3')
            vc.play(audio)
            while vc.is_playing():
                await asyncio.sleep(.1)
            await vc.disconnect()
