FROM python:3.9.2-slim-buster
ENV PYTHONUNBUFFERED 1

RUN apt-get update -y \
    && apt-get install -y libpq-dev libffi-dev libnacl-dev python3-dev ffmpeg\
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app

COPY . /app

RUN pip install -e .

CMD ["o_clube_discord"]
