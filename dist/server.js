'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _spotifyConnectWs = require('spotify-connect-ws');

var _spotifyConnectWs2 = _interopRequireDefault(_spotifyConnectWs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
var CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
var REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8888/callback';
var FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:3000/auth';
var PORT = process.env.PORT || '8888';

var app = (0, _express2.default)();

app.get('/login', function (req, res) {
  var qs = _querystring2.default.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-private user-read-email user-read-playback-state user-modify-playback-state',
    redirect_uri: REDIRECT_URI
  });
  res.redirect('https://accounts.spotify.com/authorize?' + qs);
});

app.get('/callback', function (req, res) {
  var code = req.query.code || null;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    json: true
  };
  _request2.default.post(authOptions, function (error, response, body) {
    var access_token = body.access_token;
    res.redirect(FRONTEND_URI + '?access_token=' + access_token);
  });
});

console.log('Listening on port ' + PORT + '. Go /login to initiate authentication flow.');
var server = app.listen(PORT);
var io = (0, _socket2.default)(server);
io.of('connect').on('connection', _spotifyConnectWs2.default);

exports.default = server;