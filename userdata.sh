#!/bin/bash
rm -rf aws-reinvent-gameday/
git clone https://github.com/jbuck/aws-reinvent-gameday.git
pip install flask
pip install redis
pip install boto3
pip install requests
AWS_DEFAULT_REGION=eu-central-1 python2.7 aws-reinvent-gameday/sqs.py &
sudo python2.7 aws-reinvent-gameday/server-redis.py 2a47af0d60 https://dashboard.cash4code.net/score