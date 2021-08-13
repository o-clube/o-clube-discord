"""Birthday COG module."""

from datetime import datetime

import inflect
from discord import Color, Embed, utils
from discord.ext import tasks
from discord.ext.commands import Cog, group
from sqlalchemy import extract, or_, func
from psycopg2 import OperationalError
from ..models import BDay, User, session


def setup(bot):
    """COG Setup."""
    bot.add_cog(Birthday(bot))


class Birthday(Cog):
    def __init__(self, bot):
        self.bot = bot
        self.happy_bday.add_exception_type(OperationalError)
        self.happy_bday.start()
        self.inflect = inflect.engine()

    @group(name="bday", pass_context=True)
    async def bday(self, ctx):
        """Birthday wishing"""
        if ctx.invoked_subcommand is None:
            await ctx.reply(f"A subcommand is required. Type `{ctx.prefix}help bday` for help.")

    @bday.command(name="enable")
    async def enable(self, ctx):
        """Enable birthday messages on the current channel.

        Note: Only one channel per server, using in another channel will update
        the channel to be used.
        """
        result = session.query(BDay).filter_by(guild_id=ctx.guild.id).first()
        if result:
            result.channel_id = ctx.channel.id
            return await ctx.reply(f"Birthday notification channel birthday changed to {ctx.channel.mention}.")
        session.add(BDay(guild_id=ctx.guild.id, channel_id=ctx.channel.id))
        session.commit()
        return await ctx.reply(f"Birthday notification channel birthday enabled to {ctx.channel.mention}.")

    @bday.command(name="disable")
    async def disable(self, ctx):
        """Disable birthday messages on the current channel."""
        result = session.query(BDay).filter_by(guild_id=ctx.guild.id).first()
        if result:
            session.delete(result)
            session.commit()
            return await ctx.reply(f"Birthday notification disabled.")
        return await ctx.reply(f"Birthday isn't enabled.")

    @bday.command(name="add")
    async def add(self, ctx, bday_date, name=None):
        """Add a birthday.

        Args:
            bday_date: Birthday of the member (dd/mm/yyyy).
            name: Member tag or nickname. If arg is not informed, the message author will be used.
        """
        member = (
            ctx.message.author
            if not name
            else utils.find(lambda m: m.name == name or m.nick == name or str(m.id) in name, ctx.message.guild.members)
        )

        result = session.query(User).filter_by(member_id=member.id).first()
        if not result:
            session.add(
                User(
                    member_id=member.id,
                    guild_id=ctx.guild.id,
                    birthday=datetime.strptime(bday_date, "%d/%m/%Y").date(),
                    name=member.name,
                )
            )
            session.commit()
            return await ctx.reply(f"{member.nick} birthday registered.")
        return await ctx.reply(f"User already registered with {result.birthday} as birthday.")

    @bday.command(name="rm")
    async def rm(self, ctx, name=None):
        """Remove a birthday.

        Args:
            name: Member tag or nickname. If arg is not informed, the message author will be used.
        """
        member = (
            ctx.message.author
            if not name
            else utils.find(lambda m: m.name == name or m.nick == name or m.mention == name, ctx.message.guild.members)
        )

        result = session.query(User).filter_by(member_id=member.id).first()
        if result:
            session.delete(result)
            session.commit()
            return await ctx.reply(f"{member.nick} birthday removed.")
        return await ctx.reply(f"{name} birthday is not registered.")

    @tasks.loop(minutes=60, reconnect=True)
    async def happy_bday(self):
        """Task for birthday celebration."""
        servers = (
            session.query(BDay)
            .filter(or_(BDay.last_notify != func.date(datetime.today()), BDay.last_notify == None))
            .all()
        )
        current_year = datetime.today().year
        for s in servers:
            users = (
                session.query(User)
                .filter(
                    extract("month", User.birthday) == datetime.today().month,
                    extract("day", User.birthday) == datetime.today().day,
                    User.guild_id == s.guild_id,
                )
                .all()
            )
            if len(users):
                channel = self.bot.get_channel(s.channel_id)
                embed = Embed(
                    title=self.inflect.inflect(
                        f"Today there plural('is', {len(users)}) number_to_words({len(users)}) plural('member', {len(users)}) celebrating plural('its', {len(users)}) birthday!\n \U0001F382 \U0001F388 \U0001F389"
                    ),
                    color=Color.random(),
                    description=f"{channel.guild.default_role}",
                )
                bday_user = [f"<@!{u.member_id}> ({current_year - u.birthday.year})" for u in users]
                embed.add_field(name=f"Let's all wish a happy birthday to:", value=self.inflect.join(bday_user))

                await channel.send(embed=embed)
                s.last_notify = datetime.today()
                session.commit()

    @happy_bday.before_loop
    async def before_bday_loop(self):
        """BDay needs to wait to the bot to be ready."""
        await self.bot.wait_until_ready()
