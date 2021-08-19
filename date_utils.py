from enum import Enum
import arrow


class DayPeriod(Enum):
    MORNING = 1
    AFTERNOON = 2
    NIGHT = 3


def get_day_period():
    now = arrow.now('America/Sao_Paulo')
    return check_day_period(now)

def check_day_period(now):
    if 4 <= now.hour < 12:
        return DayPeriod.MORNING
    elif 12 <= now.hour < 18:
        return DayPeriod.AFTERNOON
    elif 0 <= now.hour < 4 or now.hour >= 18:
        return DayPeriod.NIGHT



