import discord
import json
import markovify
import praw
from discord.ext import commands

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
    '''Generate a 280 char text from Bolsonaro\'s family tweets.'''
    await ctx.send(model.make_short_sentence(280))


bot.run(os.getenv('DISCORD_TOKEN'))

