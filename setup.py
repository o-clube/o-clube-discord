import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="o-clube-discord",
    version="0.1.0",
    author="O Clube",
    author_email="mzaglia@gmail.com",
    description="O Clube Discord bot",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/o-clube/o-clube-discord",
    project_urls={
        "Bug Tracker": "https://github.com/o-clube/o-clube-discord",
    },
    classifiers=[
        "Programming Language :: Python :: 3.9",
        "Operating System :: OS Independent",
        "License :: OSI Approved :: The Unlicense (Unlicense)"
    ],
    packages=setuptools.find_packages(),
    include_package_data=True,
    package_data={
        "": ["cogs/*.py", "data/*"],
    },
    python_requires=">=3.9",
    install_requires=[
        "discord.py[voice]==1.6",
        "sqlalchemy==1.3.23",
        "psycopg2-binary==2.8.6",
        "requests==2.25.1",
        "pytz==2021.1",
        "inflect==5.3.0",
        "aiohttp==3.7.4",
        "beautifulsoup4==4.9.3",
        "aiolimiter==1.0.0b1",
        "SQLAlchemy-Utils==0.37.8",
        "arrow==1.1.1",
        "wavelink==0.9.10",
    ],
    entry_points={
        "console_scripts": ["o_clube_discord=o_clube_discord.__main__:main"],
    },
)
