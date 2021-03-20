"""Warzone COG module."""

import logging
from datetime import datetime, timedelta
from os import getenv

import pytz
import requests
from discord import Color, Embed
from discord.ext import tasks
from discord.ext.commands import Cog, group

from models import Warzone as wz_model
from models import session


class Warzone(Cog):
    """Warzone COG."""

    def __init__(self, bot):
        """COG Initilization."""
        self.bot = bot
        self.fetch_track.start()

    @group(name="wz", pass_context=True)
    async def wz(self, ctx):
        """Warzone player tracking and stats."""
        if ctx.invoked_subcommand is None:
            await ctx.reply(f"A subcommand is required. Type `{ctx.prefix}help wz` for help.")

    @wz.command(name="register")
    async def register(self, ctx, battletag):
        """Register your battletag.

        Args:
            battletag: Your Battle.Net battletag.
        """
        member = ctx.message.author
        result = session.query(wz_model).filter_by(member_id=member.id).first()
        if not result:
            session.add(wz_model(member_id=member.id, battletag=battletag))
            session.commit()
            return await ctx.reply(f"{battletag} registered.")
        return await ctx.reply(f"User already registered with {result.battletag}.")

    @wz.command(name="track")
    async def track(self, ctx):
        """Track your Warzone matches."""
        member = ctx.message.author
        result = session.query(wz_model).filter_by(member_id=member.id).first()
        if result:
            result.track = True
            result.channel_id = ctx.channel.id
            session.commit()
            return await ctx.reply(f"Track enabled for {result.battletag}.")
        return await ctx.reply(f"{ctx.message.author} not registered. Use 'register' first.")

    @wz.command(name="untrack")
    async def untrack(self, ctx):
        """Stop tracking your Warzone matches."""
        member = ctx.message.author
        result = session.query(wz_model).filter_by(member_id=member.id).first()
        if result:
            result.track = False
            session.commit()
            return await ctx.reply(f"Track disabled for {result.battletag}.")
        await ctx.reply(f"{ctx.message.author} not registered. Use 'register' first.")

    @wz.command(name="stats")
    async def stats(self, ctx, battletag=None):
        """Get your Warzone stats or someone else if you pass a battletag.

        Args:
            battletag: Battletag used in the stats checking.
            Will try to use your register battletag if none is informed.
        """
        member = ctx.message.author

        if not battletag:
            result = session.query(wz_model).filter_by(member_id=member.id).first()
            if result:
                battletag = result.battletag
            else:
                return await ctx.reply("Please give a battletag or register your user.")

        battletag = requests.utils.quote(battletag)
        url = f"https://my.callofduty.com/api/papi-client/stats/cod/v1/title/mw/platform/battle/gamer/{battletag}/profile/type/wz"

        s = self._get_cod_session()
        data = s.get(url).json()["data"]
        br_data = data["lifetime"]["mode"]["br"]["properties"]
        seconds = timedelta(seconds=br_data["timePlayed"])
        played = datetime(1, 1, 1) + seconds
        time_played = []
        if played.day - 1:
            time_played.append(f"{played.day - 1} days")
        if played.hour:
            time_played.append(f"{played.hour} hours")
        if played.minute:
            time_played.append(f"{played.minute} minutes")

        embed = Embed(
            title=f"{data['username'].split('#')[0]} Warzone stats.",
            color=Color.random(),
        )

        embed.add_field(name="Time played", value=", ".join(time_played), inline=False)
        embed.add_field(name="Games played", value=int(br_data["gamesPlayed"]), inline=True)
        embed.add_field(
            name="Win percentage",
            value=f"{round(br_data['wins']/br_data['gamesPlayed']*100, 2)}%",
            inline=True,
        )
        embed.add_field(name=chr(173), value=chr(173), inline=True)  # field skip

        embed.add_field(name="Total wins", value=int(br_data["wins"]), inline=True)
        embed.add_field(name="Top fives", value=int(br_data["topFive"]), inline=True)
        embed.add_field(name="Top tens", value=int(br_data["topTen"]), inline=True)

        embed.add_field(name="KDR", value=round(br_data["kdRatio"], 2), inline=True)
        embed.add_field(name="Kills", value=int(br_data["kills"]), inline=True)
        embed.add_field(name="Deaths", value=int(br_data["deaths"]), inline=True)

        embed.add_field(name="Downs", value=int(br_data["downs"]), inline=True)
        embed.add_field(name="Revives", value=int(br_data["revives"]), inline=True)
        embed.add_field(name="Contracts", value=int(br_data["contracts"]), inline=True)

        return await ctx.reply(embed=embed)

    @tasks.loop(minutes=int(getenv("COD_TRACK_TIME", 10)), reconnect=True)
    async def fetch_track(self):
        """Task for fetching warzone matches of tracked users."""
        logging.info("Starting warzone tracking...")
        tracked = session.query(wz_model).filter_by(track=True).all()

        if not len(tracked):
            return

        try:
            s = self._get_cod_session()
        except Exception as e:
            logging.error("Could not acquire session for warzone tracking")
            return

        embed_color = [Color.gold(), Color.light_grey(), Color.dark_orange(), Color.dark_red()]

        for t in tracked:
            try:
                battletag = requests.utils.quote(t.battletag)
                url = f"https://my.callofduty.com/api/papi-client/crm/cod/v2/title/mw/platform/battle/gamer/{battletag}/matches/wz/start/0/end/0/details?limit=1"

                match = s.get(url).json()["data"]["matches"][0]

                now = int(datetime.utcnow().strftime("%s"))

                if t.last_match == match["matchID"] or now - match["utcEndSeconds"] > 30 * 60:
                    continue

                t.last_match = match["matchID"]

                channel = self.bot.get_channel(t.channel_id)
                member = self.bot.get_user(t.member_id)

                ordinal = lambda n: f'{n}{"tsnrhtdd"[(n//10%10!=1)*(n%10<4)*n%10::4]}'

                placement = int(match["playerStats"]["teamPlacement"])
                placement_color = placement - 1 if placement < 4 else -1

                embed = Embed(
                    title=f"{member.name}'s team finished in __{ordinal(placement)}__ against {match['teamCount']} teams.",
                    color=embed_color[placement_color],
                )

                embed.add_field(name="Match duration", value=f"{int(match['duration'] // 60000)} minutes", inline=True)
                embed.add_field(
                    name="Team survived",
                    value=f"{int(match['playerStats']['teamSurvivalTime']) // 60000} minutes",
                    inline=True,
                )
                embed.add_field(name=chr(173), value=chr(173), inline=True)  # field skip

                embed.add_field(name="KDR", value=round(match["playerStats"]["kdRatio"], 2), inline=True)
                embed.add_field(name="Kills", value=int(match["playerStats"]["kills"]), inline=True)
                embed.add_field(name="Deaths", value=int(match["playerStats"]["deaths"]), inline=True)

                embed.add_field(name="Damage done", value=int(match["playerStats"]["damageDone"]), inline=True)
                embed.add_field(name="Damage taken", value=int(match["playerStats"]["damageTaken"]), inline=True)
                embed.add_field(name=chr(173), value=chr(173), inline=True)  # field skip
                started = datetime.fromtimestamp(match["utcStartSeconds"], pytz.timezone("America/Sao_Paulo")).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
                ended = datetime.fromtimestamp(match["utcEndSeconds"], pytz.timezone("America/Sao_Paulo")).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
                embed.set_footer(text=f"Started at: {started}\nEnded at: {ended}")
                await channel.send(embed=embed)

            except Exception as e:
                logging.exception(e)

        session.commit()

    @fetch_track.before_loop
    async def before_fetch_track(self):
        """Fetch task needs to wait to the bot to be ready."""
        await self.bot.wait_until_ready()

    def _get_cod_session(self) -> requests.Session:
        """Get session on callofduty website."""
        s = requests.Session()

        response = s.get("https://profile.callofduty.com/cod/login")

        params = {
            "username": getenv("COD_USERNAME"),
            "password": getenv("COD_PASSWORD"),
            "remember_me": "true",
            "_csrf": response.cookies["XSRF-TOKEN"],
        }

        s.post("https://profile.callofduty.com/do_login?new_SiteId=cod", params=params, allow_redirects=False)

        return s


def setup(bot):
    """COG Setup."""
    bot.add_cog(Warzone(bot))
