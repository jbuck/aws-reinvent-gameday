var request = require('request');
var express = require('express');
var app = express();

var api_base = process.env.API_BASE;
var api_token = process.env.API_TOKEN;

var MESSAGES = {};
var MESSAGES_LENGTH = {};
var RECIEVED = 0;
var SENT = 0;

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
  RECIEVED++;

  if (!MESSAGES[req.body.Id]) {
    MESSAGES[req.body.Id] = [];
    MESSAGES_LENGTH[req.body.Id] = req.body.TotalParts;
  }

  MESSAGES[req.body.Id][req.body.PartNumber] = req.body.Data;

  console.log(req.body.Id + " = " + MESSAGES[req.body.Id]);

  var ready_to_send = true;
  for (var i = 0; i < MESSAGES_LENGTH[req.body.Id]; i++) {
    ready_to_send = ready_to_send && !!MESSAGES[req.body.Id][i];
  }

  if (ready_to_send) {
    SENT++;

    var return_data = MESSAGES[req.body.Id].join("");
    request({
      method: "POST",
      uri: api_base + "/" + req.body.Id,
      body: return_data,
      headers: {
        'x-gameday-token': api_token
      }
    }, (err, resp, body) => {
      if (err || resp.statusCode != 200) {
        console.log(err);
      }

      console.log(api_base + "/" + req.body.Id + " with " + return_data + " returned " + resp.statusCode);
    });
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT);
