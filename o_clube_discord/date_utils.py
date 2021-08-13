from enum import Enum
import arrow


class DayPeriod(Enum):
    MORNING = 1
    AFTERNOON = 2
    NIGHT = 3


def get_day_period():
    now = arrow.now('America/Sao_Paulo')

    if now.hour < 12:
        return DayPeriod.MORNING
    elif now.hour < 18:
        return DayPeriod.AFTERNOON
    elif now.hour < 6:
        return DayPeriod.NIGHT



