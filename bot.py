# https://discord.com/api/oauth2/authorize?client_id=817794806738059334&permissions=2416143440&scope=bot
import logging
import traceback

from os import listdir
from os.path import isfile, join

from discord import Intents
from discord.ext import commands

logging.basicConfig(level=logging.INFO)

def load_extensions(bot: commands.Bot, cogs_dir: str = "cogs"):
    for extension in [f.replace(".py", "") for f in listdir(cogs_dir) if isfile(join(cogs_dir, f))]:
        try:
            bot.load_extension(cogs_dir + "." + extension)
        except Exception as e:
            logging.error(f"Failed to load extension {extension}.")
            traceback.print_exc()


def create_bot(command_prefix: str = ">"):
    intents = Intents.default()
    intents.members = True
    bot = commands.Bot(command_prefix=commands.when_mentioned_or(command_prefix), intents=intents)

    load_extensions(bot)

    return bot


bot = create_bot()
