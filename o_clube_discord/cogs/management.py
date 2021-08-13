# https://gist.github.com/EvieePy/7822af90858ef65012ea500bcecf1612#file-error_handler-py-L2
"""ErrorHandler COG module."""
import logging
import os

from discord.ext.commands import Cog

from ..logger import DiscordHandler


def setup(bot):
    """COG Setup."""
    pass
    # bot.add_cog(Management(bot))


class Management(Cog):
    """User management COG"""
    def __init__(self, bot):
        self.bot = bot

    @Cog.listener()
    async def on_ready(self):
        print('Ready!')
        print('Logged in as ---->', self.bot.user)
        print('ID:', self.bot.user.id)
        try:
            webhook_url = os.getenv("LOG_WEBHOOK", None)
            print("webhook:", webhook_url)
            if webhook_url:
                handler = DiscordHandler()
                handler.setLevel(logging.WARNING)
                fmt = logging.Formatter("**[%(asctime)s] %(pathname)s:%(lineno)d**: %(message)s", "%Y-%m-%d %H:%M:%S")
                handler.setFormatter(fmt)
                logger = logging.getLogger()
                logger.addHandler(handler)

        except Exception as e:
            logging.critical("Error registering DiscordHandler.", exc_info=e)

        logging.warning("O Clube Discord Bot has been started.")

    # @Cog.listener()
    # async def on_guild
