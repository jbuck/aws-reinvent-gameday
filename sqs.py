
import boto3
import requests
import json

sqs = boto3.resource('sqs')

queue = sqs.get_queue_by_name(QueueName='ubercorn')

while True:
    for message in queue.receive_messages():
        r = requests.post('http://v0-1912230813.eu-central-1.elb.amazonaws.com/', data=message.body, headers={'content-type': 'application/json'})
        print message.body, r.status_code
        if r.status_code == 200:
            message.delete()
