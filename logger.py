import os

import aiohttp
import asyncio
import logging
from logging import StreamHandler

from discord import AsyncWebhookAdapter, Color, Embed, Color, Webhook
import discord


class DiscordHandler(StreamHandler):
    def __init__(self, webhook):
        self.webhook = webhook
        self.level_color = {
            "INFO": Color.light_grey(),
            "WARNING": Color.gold(),
            "ERROR": Color.dark_red(),
            "CRITICAL": Color.red(),
            "DEBUG": Color.dark_green(),
            "NOTSET": Color.dark_grey(),
        }
        super(DiscordHandler, self).__init__()

    def emit(self, record):
        asyncio.create_task(self.emitting(record))

    async def emitting(self, record):

        async with aiohttp.ClientSession() as session:
            webhook = Webhook.from_url(self.webhook, adapter=AsyncWebhookAdapter(session))

            record.pathname = record.pathname.replace(os.getcwd(), "")[1:]

            description = self.format(record)

            for y in range(2000, len(description) + 2000, 2000):
                try:
                    embed = Embed(color=self.level_color[record.levelname], description=description[y - 2000 : y])

                    await webhook.send(
                        embed=embed,
                        username="O Clube",
                        avatar_url="https://cdn.discordapp.com/avatars/326107366275940362/1cc62dd7b583a7d7fa6b7698fd280404",
                    )
                except discord.errors.HTTPException as e:
                    logger = logging.getLogger('discord')
                    logger.critical("Error sending log to discord webhook.", exc_info=e)
