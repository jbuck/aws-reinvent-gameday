var express = require('express');
var app = express();

app.use((req, res, next) => {
  var buf = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function() {
    req.rawBody = buf;

    process.nextTick(next);
  });
});

var MESSAGES = {
  "I4qVD5A4psllEqU2ReWpSg3cbJBWiNgm5Ssdbb87L1RAPwUSr5qFNXbiMJ9eggJrQigFFWYOZ6yyVntLLgsqmZ8vBM2o0Jza2hV6zxZLaTzEQu18xte0Y73CqheRmLYT": "9qqj7ntkyuxh"
};

app.post('/score/:id', function(req, res) {
  if (MESSAGES[req.params.id] === req.rawBody) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.listen(process.env.PORT);
