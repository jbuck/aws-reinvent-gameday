
import boto3
import requests
import json

sqs = boto3.resource('sqs')

queue = sqs.get_queue_by_name(QueueName='ubercorn-v2')

while True:
    for message in queue.receive_messages():
        if 'donotreplytothis' in message.body:
            message.delete()
            continue
        r = requests.post('http://ubercorn-v2-1123155696.eu-central-1.elb.amazonaws.com/', data=message.body, headers={'content-type': 'application/json'})
        print message.body, r.status_code
        message.delete()
