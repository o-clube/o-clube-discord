# https://discord.com/api/oauth2/authorize?client_id=817794806738059334&permissions=2416143440&scope=bot
import logging
import os
import traceback

from os import listdir
from os.path import isfile, join

from discord import Intents
from discord.ext import commands

from logger import DiscordHandler

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] <%(levelname)s> %(pathname)s in %(module)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logging.getLogger("discord").setLevel(logging.WARN)


def load_extensions(bot: commands.Bot, cogs_dir: str = "cogs"):
    for extension in [f.replace(".py", "") for f in listdir(cogs_dir) if isfile(join(cogs_dir, f))]:
        try:
            bot.load_extension(cogs_dir + "." + extension)
        except Exception as e:
            logging.critical(f"Failed to load extension {extension}.", exc_info=e)


def create_bot(command_prefix: str = ">"):
    intents = Intents.default()
    intents.members = True
    bot = commands.Bot(command_prefix=commands.when_mentioned_or(command_prefix), intents=intents)

    load_extensions(bot)

    return bot


bot = create_bot()


@bot.event
async def on_ready():
    try:
        handler = DiscordHandler(os.getenv("LOG_WEBHOOK"))
        handler.setLevel(logging.WARNING)
        fmt = logging.Formatter("**[%(asctime)s] %(pathname)s:%(lineno)d**: %(message)s", "%Y-%m-%d %H:%M:%S")
        handler.setFormatter(fmt)
        logger = logging.getLogger()
        logger.addHandler(handler)

    except Exception as e:
        logging.critical("Error registering DiscordHandler.", exc_info=e)

    logging.warning("O Clube Discord Bot has been started.")
