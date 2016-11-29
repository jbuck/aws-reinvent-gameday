from __future__ import print_function

import base64
import json
import urllib2

print('Loading function')

url = 'http://UberCorn-ELB-503246632.eu-central-1.elb.amazonaws.com/'

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))
    for record in event['Records']:
        # Kinesis data is base64 encoded so decode here
        payload = base64.b64decode(record['kinesis']['data'])
        print("Decoded payload: " + payload)
        req = urllib2.Request(url, data=payload, headers={'content-type': 'application/json'})
        resp = urllib2.urlopen(req)
        print(resp)
    return 'Successfully processed {} records.'.format(len(event['Records']))
