import discord
import io
from discord.ext.commands import Cog, command
from discord import utils

import aiohttp


def setup(bot):
    """COG Setup."""
    bot.add_cog(Filter(bot))


class Filter(Cog):
    def __init__(self, bot):
        self.bot = bot

    @command(name="filter")
    async def filter(self, ctx, filter, name=None):
        """Apply a filter to the given image

        Args:
            filter: one of the following: gay, glass, wasted, jail, triggered, greyscale, invert, brightness, threshold, sepia, red, green, blue, blurple, blurple2, pixelate, blur, simpcard, horny, lolice.

        """
        member = (
            ctx.message.author
            if not name
            else utils.find(lambda m: m.name == name or m.nick == name or str(m.id) in name, ctx.message.guild.members)
        )

        file_url = None

        if len(ctx.message.attachments):
            for file in ctx.message.attachments:
                for ext in (".jpg", ".png", ".jpeg"):
                    if file.filename.endswith(ext):
                        file_url = file.url
        else:
            file_url = member.avatar_url_as(format="png", size=1024)

        async with aiohttp.ClientSession() as session:
            # get users avatar as png with 1024 size
            async with session.get(f'https://some-random-api.ml/canvas/{filter}?avatar={file_url}') as img:
                # read the image/bytes
                imageData = io.BytesIO(await img.read())

                await session.close()  # closing the session and;

                # sending the file
                await ctx.reply(file=discord.File(imageData, f"filtered.{'gif' if filter == 'triggered' else 'png' }"))
