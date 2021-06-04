FROM python:3.9.2-slim-buster
ENV PYTHONUNBUFFERED 1

RUN apt-get update -y \
    && apt-get install -y libpq-dev\
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY . /app

CMD ["python", "run.py"]
