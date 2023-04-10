const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const Keycloak = require('keycloak-connect');

const app = express();

// Set up Keycloak middleware
const memoryStore = new session.MemoryStore();   

const keycloak = new Keycloak({
  store: memoryStore
});

app.use(session({
  secret: '1g8yovEtWbMJv0PEbi3O9s0QAeOt8Flr',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

app.use(keycloak.middleware({
  logout: '/logout'
}));

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.post('/authenticate', (req, res) => {
  const message = ''
  if (req.kauth && req.kauth.grant) {
    message = "User is already authenticated"
    return;
  }
  
  const { username, password } = req.body;

  keycloak.grantManager.obtainDirectly(username, password)
    .then(grant => {
      const accessToken = grant.access_token.token;
      const refreshToken = grant.refresh_token.token;
      const idToken = grant.id_token.token
      const token = jwt.sign({ accessToken, idToken }, '1g8yovEtWbMJv0PEbi3O9s0QAeOt8Flr');

      
      res.status(200).send(token);
    })
    .catch(error => {
      console.error(error);
      message = "Authentication failed"
    });

    console.log(message)
    res.redirect('http://localhost:8002/homepage')
  });
  
  app.get('/homepage', keycloak.protect('user'), (req, res)=>{
    res.send("Hello, user")
    // console.log(req.kauth)
    keycloak.getGrant(req, res).then(grant =>{
      console.log(grant)
    })
})

app.get('/adminpage', keycloak.protect('admin'), (req, res)=>{
  res.send("Hello, admin")
})


// Define protected endpoint
app.get('/protected', (req, res) => {
  // Verify JWT token
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, 'your-secret-here', (err, decoded) => {
    if (err) {
      console.error(err);
      res.status(401).send({ message: 'Invalid token' });
      return;
    }

    // Check if token is still valid
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      res.status(401).send({ message: 'Token has expired' });
      return;
    }

    // Set Keycloak session using access token and refresh token from token payload
    const { accessToken, refreshToken } = decoded;
    req.kauth.grant = {
      access_token: { token: accessToken },
      refresh_token: { token: refreshToken }
    };

    // Call protected resource
    keycloak.protect()(req, res, () => {
      res.status(200).send({ message: 'Protected resource' });
    });
  });
});

// Start server
app.listen(8001, () => {
  console.log('Server listening on port 8001');
});
