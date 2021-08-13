from discord.ext.commands import Cog, command, group
import logging
from datetime import datetime
from discord import Color, Embed
import aiohttp


def setup(bot):
    """COG Setup."""
    bot.add_cog(Pet(bot))


class Pet(Cog):
    def __init__(self, bot):
        self.bot = bot

    @command(name="pet")
    async def pet(self, ctx, animal):
        """Random image and facts of a given animal
        
        Args:
            animal: one of the following: dog, cat, panda, fox, red_panda, koala, birb, racoon, kangaroo
        """
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://some-random-api.ml/animal/{animal}") as jsondata:
                if not (300 > jsondata.status >= 200):
                    await ctx.reply(f"Animal não encontrado.")
                    logging.error(f"Error finding an animal: {jsondata.status}.")
                else:
                    data = await jsondata.json()
                    embed = Embed(
                        color=Color.random(),
                        description=data["fact"]
                    )
                    embed.set_image(url=data["image"])
                    await session.close()
                    await ctx.reply(embed=embed)
