import discord
import json
import markovify
import praw
import requests
from discord.ext import commands
from beautifultable import BeautifulTable

import os

dirname = os.path.dirname(__file__)

json_file = open(dirname + '/model.json', 'r')

model_json = json.loads(json_file.read())

model = markovify.Text.from_json(model_json)

reddit = praw.Reddit(client_id=os.getenv('REDDIT_CLIENT_ID'),
                     client_secret=os.getenv('REDDIT_TOKEN'),
                     username=os.getenv('REDDIT_USER'),
                     password=os.getenv('REDDIT_PASS'),
                     user_agent="'<reddit-discord> accessAPI:v0.0.1 (by /u/<magu1La>)")


bot = commands.Bot(command_prefix='>')

@bot.command()
async def random(ctx, arg):
    '''Get a random post from a given subreddit.'''
    try:
        post = reddit.subreddit(arg).random()
        if  'v.redd.it' in post.url:
            post.url += '/DASH_360?source=fallback'
        await ctx.send(post.url)
    except Exception as e:
        await ctx.send('Cai da borda e não consegui achar o que você pediu!')

@bot.command()
async def bozo(ctx):
    '''Generate a 280 char text from Bolsonaro\'s tweets.'''
    await ctx.send(model.make_short_sentence(280))

@bot.command()
async def rito(ctx, *, summoner):
    '''Searchs for a live match in the RIOT API.'''
    riot_url = 'https://br1.api.riotgames.com'
    summoner_api = f'/lol/summoner/v4/summoners/by-name/{summoner}'
    headers={'X-Riot-Token':os.getenv('RIOT_TOKEN')}

    summoner_resp = requests.get(riot_url+summoner_api, headers=headers)

    if summoner_resp.status_code == 404:
        await ctx.send('''```
                       Invocador não encontrado!```''')

    summoner_resp = summoner_resp.json()

    account_id = summoner_resp['id']
    spec_api=f'/lol/spectator/v4/active-games/by-summoner/{account_id}'

    spec_resp = requests.get(riot_url+spec_api, headers=headers)

    if spec_resp.status_code == 404:
        await ctx.send('''```
                       Partida não encontrada!```''')
    spec_resp = spec_resp.json()
    players = spec_resp['participants']
    elos = list()
    queue_type = 'RANKED_SOLO_5x5'

    if spec_resp['gameQueueConfigId'] == 440:
        queue_type = 'RANKED_FLEX_SR'

    for player in players:
        ranked_stats = f'/lol/league/v4/entries/by-summoner/{player["summonerId"]}'
        resp = requests.get(riot_url+ranked_stats, headers=headers).json()
        has_elo = False

        for i in resp:
            if i['queueType'] == queue_type:
                has_elo = True
                elos.append(f'{i["tier"]} {i["rank"]}')
                break

        if not has_elo:
            elos.append('UNRANKED')

    t = BeautifulTable()
    t.set_style(BeautifulTable.STYLE_NONE)
    t.append_row([elos[0], players[0]['summonerName'], 'x', players[5]['summonerName'], elos[5]])
    t.append_row([elos[1], players[1]['summonerName'], 'x', players[6]['summonerName'], elos[6]])
    t.append_row([elos[2], players[2]['summonerName'], 'x', players[7]['summonerName'], elos[7]])
    t.append_row([elos[3], players[3]['summonerName'], 'x', players[8]['summonerName'], elos[8]])
    t.append_row([elos[4], players[4]['summonerName'], 'x', players[9]['summonerName'], elos[9]])

    await ctx.send(f'''```\n{t}```''')

bot.run(os.getenv('DISCORD_TOKEN'))

