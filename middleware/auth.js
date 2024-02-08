const jwt = require('jsonwebtoken')
const User = require('../models/signup')
const dotenv = require('dotenv');
dotenv.config();

//middleware to authenticate the incoming request
const Authenticate = (req, res, next)  => {
    try {
        const token = req.header('Authorization')
        console.log(token);
        const user = jwt.verify(token, process.env.JWT_ACCESS_TOKEN)
        console.log('userID=', user.userId)
        User.findByPk(user.userId).then(user=>{
            
            req.user = user // set req.user to user
            next();
        }).catch(err=>console.log(err))
    } catch(err){
        console.log(err)
        return res.status(401).json({success: false})
    }
}

module.exports = {
    Authenticate
}