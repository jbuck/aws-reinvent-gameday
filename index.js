var redis = require("redis");
var client = redis.createClient(process.env.REDIS_URL);
var request = require('request');
var express = require('express');
var app = express();

var api_base = process.env.API_BASE;
var api_token = process.env.API_TOKEN;

var MESSAGES = {};
var MESSAGES_LENGTH = {};
var RECIEVED = 0;
var SENT = 0;

app.use(require('morgan')('tiny'));
app.use(require('body-parser').json());

app.get('/', function (req, res) {
  res.send({
    recieved: RECIEVED,
    sent: SENT,
    messages: MESSAGES,
    lengths: MESSAGES_LENGTH,
  });
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.post('/', function (req, res) {
  var msg_data = req.body.Data,
      msg_id = req.body.Id,
      msg_part_number = req.body.PartNumber,
      msg_total = req.body.TotalParts,
      redis_key = msg_id + ".data"

  var time_for_redis = Date.now();

  client.multi()
    .zadd([redis_key, msg_part_number, msg_data])
    .zrange([redis_key, 0, msg_total])
    .expire([redis_key, 600])
    .exec((multi_error, replies) => {
      console.log("REDIS %s %d ms", redis_key, (Date.now() - time_for_redis));

      if (multi_error) {
        return console.log("Redis error: " + multi_error);
      }

      var returned_data = replies[1];
      var time_for_request = Date.now();

      if (returned_data.length === msg_total) {
        request({
          method: "POST",
          uri: api_base + "/" + msg_id,
          body: returned_data.join(""),
          headers: {
            'x-gameday-token': api_token
          }
        }, (err, resp, body) => {
          if (err || resp.statusCode != 200) {
            console.log(err);
          }

          console.log("POST " + api_base + "/" + req.body.Id + " " + resp.statusCode + " " + returned_data.join("") + " " + (Date.now() - time_for_request) + " ms");
        });
      }
    });

  res.sendStatus(200);
});

app.listen(process.env.PORT);
