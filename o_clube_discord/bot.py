# https://discord.com/api/oauth2/authorize?client_id=817794806738059334&permissions=2416143440&scope=bot
import logging
import os

from discord import Intents
from discord.ext import commands

from pkg_resources import resource_listdir
from importlib import resources

from .logger import DiscordHandler

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] <%(levelname)s> %(pathname)s in %(module)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logging.getLogger("discord").setLevel(logging.WARN)


def load_extensions(bot: commands.Bot, cogs_dir: str = "cogs"):
    cog_list = resources.files(f"{__package__}.{cogs_dir}").iterdir()
    modules = [f.name.replace(".py", "") for f in cog_list if f.suffix == ".py" and f.name != "__init__.py"]
    for extension in modules:
        try:
            bot.load_extension(f"{__package__}.{cogs_dir}.{extension}")
            logging.warn(f"Loaded extension {extension}")
        except Exception as e:
            logging.critical(f"Failed to load extension {extension}.", exc_info=e)


def create_bot(command_prefix: str = ">"):
    intents = Intents.default()
    intents.members = True
    bot = commands.Bot(command_prefix=commands.when_mentioned_or(command_prefix), intents=intents)

    @bot.event
    async def on_ready():

        try:
            webhook_url = os.getenv("LOG_WEBHOOK", None)
            if webhook_url:
                handler = DiscordHandler(os.getenv("LOG_WEBHOOK"))
                handler.setLevel(logging.WARNING)
                fmt = logging.Formatter("**[%(asctime)s] %(pathname)s:%(lineno)d**: %(message)s", "%Y-%m-%d %H:%M:%S")
                handler.setFormatter(fmt)
                logger = logging.getLogger()
                logger.addHandler(handler)

        except Exception as e:
            logging.critical("Error registering DiscordHandler.", exc_info=e)

        logging.warning("O Clube Discord Bot has been started.")

    load_extensions(bot)

    return bot
