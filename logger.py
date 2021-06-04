import os

from logging import StreamHandler

from discord import Embed, Color

class DiscordHandler(StreamHandler):
    def __init__(self, bot, channel_id):
        self.bot = bot
        self.level_color = {"INFO": Color.light_grey(),
                            "WARNING": Color.gold(),
                            "ERROR": Color.dark_red(),
                            "CRITICAL": Color.red(),
                            "DEBUG": Color.dark_green(),
                            "NOTSET": Color.dark_grey()
                            }
        self.channel_id = channel_id
        super(DiscordHandler, self).__init__()

    def emit(self, record):

        channel = self.bot.get_channel(self.channel_id)
        record.pathname = record.pathname.replace(os.getcwd(), "")[1:]
        embed = Embed(color=self.level_color[record.levelname],
                      description=self.format(record))
        self.bot.loop.create_task(channel.send(embed=embed))
