const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const sequelize = require('./util/database');

const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/signup');
const userLogInRoutes = require('./routes/login');
const messagesRoutes = require('./routes/index');
const User = require('./models/signup');
const Messages = require('./models/messages');

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(express.json());

app.use('/user', userRoutes)
app.use('/user', userLogInRoutes)
app.use('/messages', messagesRoutes)

app.use((req, res) => {
    console.log('URL: ', req.url);
    res.sendFile(path.join(__dirname, `public/${req.url}`))
})

//Association of user with messages
User.hasMany(Messages)
Messages.belongsTo(User)

sequelize.sync()
    .then(() => {
        app.listen(3000)
    })
    .catch((err) => {
        console.log(err)
})
