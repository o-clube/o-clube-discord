from datetime import datetime
import pytz

def is_time_between(begin_time, end_time, check_time=None):
    check_time = check_time or (datetime.now(pytz.timezone("America/Sao_Paulo")).time())
    if begin_time < end_time:
        return check_time >= begin_time and check_time <= end_time
    else: # crosses midnight
        return check_time >= begin_time or check_time <= end_time
