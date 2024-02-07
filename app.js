const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const sequelize = require('./util/database');

const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/signup');
const userLogInRoutes = require('./routes/login');
const User = require('./models/signup');

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(express.json());


app.use('/user', userRoutes)
app.use('/user', userLogInRoutes)

sequelize.sync()
    .then(() => {
        app.listen(3000)
    })
    .catch((err) => {
        console.log(err)
})