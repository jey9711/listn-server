import express from 'express'
import request from 'request'
import querystring from 'querystring'

import socketio from 'socket.io'
import connectSocket from 'spotify-connect-ws'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8888/callback'
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:3000'
const PORT = process.env.PORT || '8888'

const app = express()

app.get('/login', (req, res) => {
  const qs = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-private user-read-email user-read-playback-state',
    redirect_uri: REDIRECT_URI,
  })
  res.redirect(`https://accounts.spotify.com/authorize?${qs}`)
})

app.get('/callback', (req, res) => {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, (error, response, body) => {
    var access_token = body.access_token
    res.redirect(`${FRONTEND_URI}?access_token=${access_token}`)
  })
})

console.log(`Listening on port ${PORT}. Go /login to initiate authentication flow.`)
const server = app.listen(PORT)
const io = socketio(server)
io.of('connect').on('connection', connectSocket)

export default server