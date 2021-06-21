import asyncio
from pyppeteer import launch, chromium_downloader
import jinja2
import os
import random


# chromium_downloader.download_chromium()
templateLoader = jinja2.FileSystemLoader(searchpath=os.path.dirname(os.path.realpath(__file__)))

templateEnv = jinja2.Environment(loader=templateLoader)
TEMPLATE_FILE = "index.html"
template = templateEnv.get_template(TEMPLATE_FILE)

styles =     ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
              "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",  "eighteen", "nineteen", "twenty", "twentyone",
              "twentytwo", "twentythree"]
outputText = template.render(value="vein", style=random.choice(styles))

async def main():
    browser = await launch({ "args": ['--no-sandbox'] })
    page = await browser.newPage()
    await page.setContent(outputText)
    await page.addStyleTag(path="./cogs/style.css")
    element = await page.querySelector('h1')
    bbox = await element.boundingBox()
    await page.screenshot({'path': 'wordart.png', 'omitBackground': True, "clip": bbox})

    await browser.close()

asyncio.get_event_loop().run_until_complete(main())
