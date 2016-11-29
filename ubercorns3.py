from __future__ import print_function

import json
import urllib
import urllib2
import boto3

print('Loading function')
url = 'http://UberCorn-ELB-503246632.eu-central-1.elb.amazonaws.com/'

s3 = boto3.client('s3')


def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        payload = response['Body'].read()
        print("CONTENT TYPE: " + response['ContentType'])
        req = urllib2.Request(url, data=payload, headers={'content-type': 'application/json'})
        resp = urllib2.urlopen(req)
        return response['ContentType']
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
