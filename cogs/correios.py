
import discord
from discord.ext.commands import Cog, group
import logging
from discord.ext import tasks
from models import Correios as correios_model, Package, session
from datetime import datetime

import re
import aiohttp
from bs4 import BeautifulSoup as bs4


def setup(bot):
    """COG Setup."""
    bot.add_cog(Correios(bot))


class Correios(Cog):
    def __init__(self, bot):
        self.bot = bot
        self.fetch_track.start()
        self.fetch_track.add_exception_type(Exception)

    @group(name="correios", pass_context=True)
    async def correios(self, ctx):
        """Correios tracking

        Args:
            cod: Correios tracking number.
        """
        if ctx.invoked_subcommand is None:
            cod = ctx.subcommand_passed
            if cod:
                result = await self.get_correios(cod)
                if result:
                    resp_msg = "```diff"
                    for status in result:
                        resp_msg += f"\n+ {status['data']} - {status['hora']}  -  {status['local']} \n- {status['mensagem']} \n"

                    resp_msg += "```"
                    return await ctx.reply(f"{resp_msg}")

                return await ctx.reply(f"Objeto não encontrado ou ainda não postado.")

            await ctx.reply(f"A subcommand is required. Type `{ctx.prefix}help correios` for help.")

    @correios.command(name="enable")
    async def enable(self, ctx):
        """Enable Correios messages on the current channel.

        Note: Only one channel per server, using in another channel will update
        the channel to be used.
        """
        result = session.query(correios_model).filter_by(guild_id=ctx.guild.id).first()
        if result:
            result.channel_id = ctx.channel.id
            return await ctx.reply(f"Correios notification channel Correios changed to {ctx.channel.mention}.")
        session.add(correios_model(guild_id=ctx.guild.id, channel_id=ctx.channel.id))
        session.commit()
        return await ctx.reply(f"Correios notification channel Correios enabled to {ctx.channel.mention}.")

    @correios.command(name="disable")
    async def disable(self, ctx):
        """Disable Correios messages on the current channel."""
        result = session.query(correios_model).filter_by(guild_id=ctx.guild.id).first()
        if result:
            session.delete(result)
            session.commit()
            return await ctx.reply(f"Correios notification disabled.")
        return await ctx.reply(f"Correios isn't enabled.")

    @correios.command(name="track")
    async def track(self, ctx, cod, *, tag = ""):
        """Register a track to a correios package

        Args:
            cod: Correios tracking code
            tag (optional): Tag to identify your package. Defaults to ""
        """
        member = ctx.message.author

        result = session.query(Package).filter_by(id=cod).first()

        if not result:
            res = await self.get_correios(cod)
            if res:
                session.add(Package(
                    id = cod,
                    user_id = member.id,
                    guild_id = ctx.guild.id,
                    tag = tag
                ))
                session.commit()
                logging.info(f"Successfully added tracking for package {cod}.")
                return await ctx.reply(f"Objeto cadastrado com sucesso.")
            logging.info(f"Package {cod} not found in database.")
            return await ctx.reply(f"Não encontramos esse objeto.")

        logging.info(f"Package {cod} was already in database.")
        return await ctx.reply(f"Objeto já cadastrado.")

    @correios.command(name="untrack")
    async def untrack(self, ctx, cod):
        """Disable a track to a correios package
        Args:
            cod: Correios tracking code
        """
        result = session.query(Package).filter_by(id=cod).first()
        if result:
            session.delete(result)
            session.commit()
            logging.info(f"Successfully deleted tracking for package {cod}.")
            return await ctx.reply(f"Objeto removido com sucesso.")

        logging.info(f"Package {cod} not found in database.")
        return await ctx.reply(f"Objeto não estava cadastrado.")

    @tasks.loop(minutes=30, reconnect=True)
    async def fetch_track(self):
        """Task for fetching correios packages of tracked users."""
        logging.info("Starting correios tracking.")

        try:
            servers = session.query(correios_model).all()
        except Exception as e:
            logging.error("Could not get servers", exc_info=e)

        for server in servers:
                results = session.query(Package).filter_by(guild_id=server.guild_id).all()
                channel = self.bot.get_channel(server.channel_id)
                for res in results:
                    try:
                        cod = res.id
                        package = await self.get_correios(cod)

                        if not package:
                            logging.info(f"No events for package {cod}. Skipping.")
                            continue

                        logging.info(f"Fetching data from correios, package: {cod}.")
                        package_datetime = datetime.strptime(f"{package[0]['data']} {package[0]['hora']}", "%d/%m/%Y %H:%M")
                        if not res.last_update or package_datetime != res.last_update:
                            res.last_update = package_datetime
                            resp_msg = f"```diff\n+ ORDER: {cod}"
                            for status in package:
                                resp_msg += f"\n+ {status['data']} - {status['hora']} - {status['local']}\n- {status['mensagem']}\n"

                            resp_msg += "```"
                            user = self.bot.get_user(res.user_id)

                            logging.info(f"Sending message to user: {user.display_name} package: {cod}.")

                            if res.latest_message_id:
                                await channel.delete_messages([discord.Object(res.latest_message_id)])

                            message = await channel.send(f"{user.mention} {res.tag} \n{resp_msg}")
                            res.latest_message_id = message.id
                            session.commit()


                        if package[0]["mensagem"] == "Objeto entregue ao destinatário":
                            logging.info(f"Deleting package {cod}, package already delivered.")
                            session.delete(res)
                            session.commit()
                    except Exception as e:
                        logging.error(f"The following error occured while processing package: {cod}", exc_info=e)

        logging.info("Correios tracking finished.")

    async def get_correios(self, tracking_code):
        headers = {'Referer': 'https://www2.correios.com.br/sistemas/rastreamento/'}  # noqa
        url = 'https://www2.correios.com.br/sistemas/rastreamento/ctrl/ctrlRastreamento.cfm?' # noqa
        data = {'objetos': tracking_code, 'btnPesq': 'Buscar', 'acao': 'track'}

        async with aiohttp.ClientSession() as aiosession:
            res = await aiosession.post(url, data=data, headers=headers)

            if res.status != 200:
                await aiosession.close()
                return None

            parser = bs4(await res.text(), 'html.parser')
            dt_events = parser.find_all('td', {'class': 'sroDtEvent'})
            lb_events = parser.find_all('td', {'class': 'sroLbEvent'})
            regex = re.compile(r'[\n\r\t]')
            eventos = []
            for dt, lb in zip(dt_events, lb_events):
                event = {}
                dt_info = regex.sub(' ', dt.text).split()
                event['data'], event['hora'] = dt_info[:2]
                event['local'] = ' '.join(dt_info[2:])
                event['mensagem'] = ' '.join(regex.sub(' ', lb.text).split())
                eventos.append(event)
            return eventos

    @fetch_track.before_loop
    async def before_fetch_track(self):
        """Fetch task needs to wait to the bot to be ready."""
        await self.bot.wait_until_ready()
