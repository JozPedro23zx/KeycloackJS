const express = require('express');
const Keycloak = require('keycloak-connect');

const app = express()

app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({extended: false}))

const keycloak = new Keycloak({})

app.get('/loginpage', (req, res)=>{
    res.render('login')
})

app.post('/login', async (req, res)=>{
  const { username, password } = req.body;
  
  try{
    const response = await fetch("http://localhost:8001/authenticate", {
      method: 'POST',
      body: {
        username: username,
        password: password
      }
    })

    localStorage.setItem("token", response)

    res.redirect('http://localhost:8002/homepage')

  }catch(err){
    throw err
  }
  
})

app.get('/homepage', keycloak.protect('user'), (req, res)=>{
    res.render('profile-user')
})

const port = 8002;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});