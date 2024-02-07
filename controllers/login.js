const User = require('../models/signup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

function generateAccessToken(id, name){
    return jwt.sign({userId: id, name: name}, process.env.JWT_ACCESS_TOKEN)
}

exports.postLogInUser = async (req, res, next) => {
    try {
        const useremail = req.body.useremail;
        const existingUser = await User.findOne({ where: { useremail: useremail } });
        if (!existingUser) {
            console.log("User Doesn't exist!");
            return res.status(404).json({ error: "User Doesn't exist" });
        }
        const isPasswordValid = await bcrypt.compare(req.body.userpassword, existingUser.userpassword);

        if (!isPasswordValid) {
            console.log("Password doesn't match!");
            return res.status(401).json({ error: "User Password Doesn't Match!" });
        }

        const data = {
            useremail: useremail,
        };

        console.log(data);
        res.status(200).json({ loggedInUser: data, token: generateAccessToken(existingUser.id, existingUser.username) });
        console.log('Logged In');
    } catch (err) {
        console.error('Error in postLogInUser:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
