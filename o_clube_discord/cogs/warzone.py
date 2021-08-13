"""Warzone COG module."""

import inspect
import logging
from datetime import datetime, timedelta
from os import getenv

import aiohttp
import pytz
import requests

from discord import Color, Embed
from discord.ext import tasks
from discord.ext.commands import Cog, group

from ..models import session, Warzone as wz_model


def setup(bot):
    """COG Setup."""
    pass
    # bot.add_cog(Warzone(bot))


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

    @wz.command(name="add")
    async def add(self, ctx, battletag):
        """Add your battletag.

        Args:
            battletag: Your Battle.Net battletag.
        """
        member = ctx.message.author
        result = session.query(wz_model).filter_by(member_id=member.id).first()
        if not result:
            session.add(wz_model(member_id=member.id, battletag=battletag))
            session.commit()
            return await ctx.reply(f"{battletag} registered.")

        result.battletag = battletag
        session.commit()
        return await ctx.reply(f"Battle tag updated to {battletag}.")

    @wz.command(name="rm")
    async def rm(self, ctx, battletag):
        """Remove your battletag.

        Args:
            battletag: Your Battle.Net battletag.
        """
        member = ctx.message.author
        result = session.query(wz_model).filter_by(member_id=member.id).first()
        if result:
            session.delete(result)
            session.commit()
            return await ctx.reply(f"{result.battletag} removed.")

        return await ctx.reply(f"{battletag} not registerd.")

    @wz.command(name="track")
    async def track(self, ctx):
        """Track your Warzone matches.

        Make sure you have data visible in your activision account:

        1. Log In into your account here - https://s.activision.com/activision/login

        2. Enter your profile settings here - https://s.activision.com/activision/profile

        3. Change your privacy options in "Searchable" and "Data Visible" on "ALL".

        4. If it is already set to "ALL" then set it to "None" and change it back to "ALL" so it can properly update
        """
        member = ctx.message.author
        result = session.query(wz_model).filter_by(member_id=member.id).first()
        if result:
            result.track = True
            result.channel_id = ctx.channel.id
            session.commit()
            return await ctx.reply(
                inspect.cleandoc(
                    f"""Track enabled for {result.battletag}.
                    ```
                    Make sure you have data visible in your activision account:

                    1. Log In into your account here - https://s.activision.com/activision/login

                    2. Enter your profile settings here - https://s.activision.com/activision/profile

                    3. Change your privacy options in "Searchable" and "Data Visible" on "ALL".

                    4. If it is already set to "ALL" then set it to "None" and change it back to "ALL" so it can properly update```"""
                )
            )

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


        async with aiohttp.ClientSession() as aiosession:
            try:
                await aiosession.get("https://profile.callofduty.com/cod/login")

                cookies = aiosession.cookie_jar.filter_cookies("https://callofduty.com")

                params = {
                    "username": getenv("COD_USERNAME"),
                    "password": getenv("COD_PASSWORD"),
                    "remember_me": "true",
                    "_csrf": cookies["XSRF-TOKEN"].value,
                }

                await aiosession.post(
                    "https://profile.callofduty.com/do_login?new_SiteId=cod", params=params, allow_redirects=False
                )

            except Exception as e:
                logging.error("Could not acquire session for warzone stats")
                return

            battletag = requests.utils.quote(battletag)
            url = f"https://my.callofduty.com/api/papi-client/stats/cod/v1/title/mw/platform/battle/gamer/{battletag}/profile/type/wz"

            async with aiosession.get(url) as resp:

                if resp.status != 200:
                    logging.warn(f"Error while retrieving warzone stats: {resp.status}\n URL: {url}")
                    return await ctx.reply("Could not retrieve warzone stats.")

                response = await resp.json()
                data = response["data"]
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
                embed.add_field(name="Total wins", value=int(br_data["wins"]), inline=True)

                embed.add_field(name="KDR", value=round(br_data["kdRatio"], 2), inline=True)
                embed.add_field(name="Kills", value=int(br_data["kills"]), inline=True)
                embed.add_field(name="Deaths", value=int(br_data["deaths"]), inline=True)

                embed.add_field(name="Weekly KD", value=round(data['weekly']['all']['properties']['kdRatio'], 2), inline=True)

                return await ctx.reply(embed=embed)

    @tasks.loop(minutes=int(getenv("COD_TRACK_TIME", 10)), reconnect=True)
    async def fetch_track(self):
        """Task for fetching warzone matches of tracked users."""
        logging.info("Starting warzone tracking...")
        tracked = session.query(wz_model).filter_by(track=True).all()

        if not len(tracked):
            return

        embed_color = [Color.gold(), Color.light_grey(), Color.dark_orange(), Color.dark_red()]

        matches = dict()

        async with aiohttp.ClientSession() as aiosession:
            try:
                await aiosession.get("https://profile.callofduty.com/cod/login")

                cookies = aiosession.cookie_jar.filter_cookies("https://callofduty.com")

                params = {
                    "username": getenv("COD_USERNAME"),
                    "password": getenv("COD_PASSWORD"),
                    "remember_me": "true",
                    "_csrf": cookies["XSRF-TOKEN"].value,
                }

                await aiosession.post(
                    "https://profile.callofduty.com/do_login?new_SiteId=cod", params=params, allow_redirects=False
                )

            except Exception as e:
                logging.error("Could not acquire session for warzone tracking")
                return

            for t in tracked:
                try:
                    battletag = requests.utils.quote(t.battletag)

                    url = f"https://my.callofduty.com/api/papi-client/crm/cod/v2/title/mw/platform/battle/gamer/{battletag}/matches/wz/start/0/end/0/details?limit=1"

                    async with aiosession.get(url) as resp:
                        response = await resp.json()

                    player_match = response["data"]["matches"][0]
                    player_match["channel_id"] = t.channel_id

                    now = int(datetime.utcnow().strftime("%s"))

                    # if t.last_match == player_match["matchID"] or now - player_match["utcEndSeconds"] > 30 * 60:
                    #     continue

                    matches.setdefault(player_match["matchID"], dict()).setdefault(
                        player_match["player"]["team"], list()
                    ).append(player_match)

                    t.last_match = player_match["matchID"]

                except Exception as e:
                    logging.error(f"Could not retrieve warzone history for {t.battletag}", exc_info=e)

        for match in matches.values():
            for team in match.values():
                try:
                    p0 = team[0]

                    channel = self.bot.get_channel(p0["channel_id"])

                    ordinal = lambda n: f'{n}{"tsnrhtdd"[(n//10%10!=1)*(n%10<4)*n%10::4]}'

                    placement = int(p0["playerStats"]["teamPlacement"])
                    placement_color = placement - 1 if placement < 4 else -1

                    embed = Embed(
                        title=f"{p0['player']['username']}'s team finished in __{ordinal(placement)}__ against {p0['teamCount']} teams.",
                        color=embed_color[placement_color],
                        timestamp=datetime.fromtimestamp(p0["utcStartSeconds"]),
                    )

                    embed.add_field(name="Match duration", value=f"{int(p0['duration'] // 60000)} minutes", inline=True)
                    embed.add_field(
                        name="Team survived",
                        value=f"{int(p0['playerStats']['teamSurvivalTime']) // 60000} minutes",
                        inline=True,
                    )
                    embed.add_field(name=chr(173), value=chr(173), inline=True)  # field skip

                    for player in team:
                        stats = f"""**KDA:** {round(player["playerStats"]["kdRatio"], 2)}
                        **Kills:** {int(player["playerStats"]["kills"])} **Deaths:** {int(player["playerStats"]["deaths"])}
                        **Damage:** {int(player["playerStats"]["damageDone"])}
                        """
                        embed.add_field(name=player["player"]["username"], value=inspect.cleandoc(stats), inline=True)

                    await channel.send(embed=embed)
                except Exception as e:
                    logging.warn(f"Could not retrieve data for team: {team}")
        session.commit()
        logging.info("Warzone tracking finished.")

    @fetch_track.before_loop
    async def before_fetch_track(self):
        """Fetch task needs to wait to the bot to be ready."""
        await self.bot.wait_until_ready()
