'use strict';

var express = require('express');
var request = require('request');
var querystring = require('querystring');

var app = express();

var redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

app.get('/login', function (req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: 'user-read-private user-read-email user-read-playback-state',
    redirect_uri: redirect_uri
  }));
});

app.get('/callback', function (req, res) {
  var code = req.query.code || null;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    json: true
  };
  request.post(authOptions, function (error, response, body) {
    var access_token = body.access_token;
    var uri = process.env.FRONTEND_URI || 'http://localhost:3000';
    res.redirect(uri + '?access_token=' + access_token);
  });
});

var port = process.env.PORT || 8888;
console.log('Listening on port ' + port + '. Go /login to initiate authentication flow.');
app.listen(port);