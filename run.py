from os import getenv

from bot import bot

bot.run(getenv("DISCORD_TOKEN"))
