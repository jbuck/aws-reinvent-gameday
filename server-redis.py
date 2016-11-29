#!/usr/bin/env python
"""
Client which receives the requests

Args:
    API Token
    API Base (https://...)

"""
from flask import Flask, request
import logging
import argparse
import urllib2
import redis
import json
import time

# logging.basicConfig(level=logging.DEBUG)

# parsing arguments
PARSER = argparse.ArgumentParser(description='Client message processor')
PARSER.add_argument('API_token', help="the individual API token given to your team")
PARSER.add_argument('API_base', help="the base URL for the game API")

ARGS = PARSER.parse_args()

# defining global vars
#MESSAGES = {} # A dictionary that contains message parts
API_BASE = ARGS.API_base
# 'https://csm45mnow5.execute-api.us-west-2.amazonaws.com/dev'

APP = Flask(__name__)

REDIS = redis.StrictRedis(host='ubercorn-v2.ehyxug.clustercfg.euc1.cache.amazonaws.com', port=6379, db=0)

@APP.route('/health')
def health():
    return "OK"

# creating flask route for type argument
@APP.route('/', methods=['GET', 'POST'])
def main_handler():
    """
    main routing for requests
    """
    if request.method == 'POST':
        return process_message(request.get_json())
    else:
        return get_message_stats()

def get_message_stats():
    """
    provides a status that players can check
    """
    msg_count = len(MESSAGES.keys())
    return "There are %d messages in the MESSAGES dictionary" % msg_count

def process_message(msg):
    """
    processes the messages by combining and appending the kind code
    """
    start = time.time()
    #print "incoming", msg
    msg_id = msg['Id'] # The unique ID for this message
    part_number = msg['PartNumber'] # Which part of the message it is
    data = msg['Data'] # The data of the message

    if 'donotreply' in msg_id or 'Hippogriff' in data:
        return 'OK'


    # Try to get the parts of the message from the MESSAGES dictionary.
    # If it's not there, create one that has None in both parts
    #parts = MESSAGES.get(msg_id, [None, None])
    p = REDIS.get(msg_id)
    if p is not None:
        parts = eval(p)
    else:
        parts = [None for i in range(msg['TotalParts'])]
    if None not in parts:
        return 'OK'

    # store this part of the message in the correct part of the list
    parts[part_number] = data
    REDIS.set(msg_id, repr(parts))

    # if both parts are filled, the message is complete
    if None not in parts and len(parts) == msg['TotalParts']:
        # We can build the final message.
        result = parts[0] + parts[1]
        # sending the response to the score calculator
        # format:
        #   url -> api_base/jFgwN4GvTB1D2QiQsQ8GHwQUbbIJBS6r7ko9RVthXCJqAiobMsLRmsuwZRQTlOEW
        #   headers -> x-gameday-token = API_token
        #   data -> EaXA2G8cVTj1LGuRgv8ZhaGMLpJN2IKBwC5eYzAPNlJwkN4Qu1DIaI3H1zyUdf1H5NITR
        url = API_BASE + '/' + msg_id
        if 'Hippogriff' in result:
            return 'OK'
        print 'outgoing', result
        print 'LATENCY pre-req:', time.time() - start
        req = urllib2.Request(url, data=result, headers={'x-gameday-token':ARGS.API_token})
        resp = urllib2.urlopen(req)
        resp.close()
    print "LATENCY:", time.time() - start

    return 'OK'

if __name__ == "__main__":

    # By default, we disable threading for "debugging" purposes.
    # This will cause the app to block requests, which means that you miss out on some points,
    # and fail ALB healthchecks, but whatever I know I'm getting fired on Friday.
    #APP.run(host="0.0.0.0", port="80")
    
    # Use this to enable threading:
    APP.run(host="0.0.0.0", port="80", threaded=True)
