const express = require('express');
const session = require('express-session')
const Keycloak = require('keycloak-connect');

const app = express();

const memoryStore = new session.MemoryStore()   

const keycloakConfig = {
    clientId: 'test_api',
    bearerOnly: true,
    serverUrl: 'http://localhost:8080/auth',
    realm: 'TestRealm',
    credentals: {
        secret: '1g8yovEtWbMJv0PEbi3O9s0QAeOt8Flr'
    }
}


const keycloak = new Keycloak({}, keycloakConfig);


app.use(keycloak.middleware());

app.get('/', (req, res) =>{
    res.send("Server is live")
})

app.get('/login', keycloak.protect(), (req, res) => {
    const token = jwt.sign({ sub: req.kauth.grant.access_token.content.sub }, '1g8yovEtWbMJv0PEbi3O9s0QAeOt8Flr');

    res.send({ token });
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});