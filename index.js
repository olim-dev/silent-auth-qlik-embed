
import https from 'https';
import fs from 'fs';
import { auth } from 'express-openid-connect';
import express from 'express';
import { join } from 'path';
import 'dotenv/config';

const port = 3000;
const __dirname = import.meta.dirname;


const Auth0config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.sessionSecret,
    baseURL: `https://${process.env.HOST}`,
    clientID: process.env.clientId,
    clientSecret: process.env.clientSecret,
    issuerBaseURL: `https://${process.env.idpUri}`,
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email'
    },
    attemptSilentLogin: true,
};


const app = express();
app.use(express.static("public"));

// express-openid-connect middleware (attaches /login, /logout, and /callback routes to the baseURL)
app.use(auth(Auth0config));

app.get('/', (req, res) => {
    if(req.oidc.isAuthenticated()) {
      res.sendFile(join(__dirname, '/public/index.html'))
      return
    }
    res.oidc.login({ returnTo: '/' })
});
  
app.get('/callback', (req, res) => {
    res.sendFile(join(__dirname, '/public/oauth-callback.html'))
});

const httpsOptions = {
    key: fs.readFileSync(join(__dirname, '/certs/cert.key')),
    cert: fs.readFileSync(join(__dirname, '/certs/cert.crt')),
};

https.createServer(httpsOptions, app).listen(port, () => {
   console.log(`Server started on https://localhost:${port}`);
});
