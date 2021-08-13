# O Clube Discord bot

This is a really simple and buggy Discord bot made for our own Discord server, but feel free to use and modify as you want.

## Running

You can run using Docker or locally.

The enviroment variables used bellow are the bare minimum to get the bot running, some functionalities might not work.

### Docker

Using image from Dockerhub
```bash
docker run -e DISCORD_TOKEN=<your_discord_token> -e mzaglia/o-clube-discord:latest
```

Building the image locally

```bash
docker build . -t o-clube-discord
docker run -e DISCORD_TOKEN=<your_discord_token>  o-clube-discord
```

### Locally

```
pip install -e .
export DISCORD_TOKEN=<your_discord_token>
o_clube_discord
```


### Migrations

TODO

### Development

TODO
