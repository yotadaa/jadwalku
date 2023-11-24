const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateRandomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    while (result.length < length) {
        const randomChar = charset.charAt(Math.floor(Math.random() * charset.length));

        // Ensure the character is unique in the result
        if (result.indexOf(randomChar) === -1) {
            result += randomChar;
        }
    }

    return result;
}



function getCurrentTimeInSeconds() {
    const currentDate = new Date();
    const currentTimestampInSeconds = Math.floor(currentDate.getTime() / 1000);
    return currentTimestampInSeconds;
}


let User = require('../models/user.model');
// const { getCurrentTimeInSeconds } = require('../../src/component/data');
const expirationDate = new Date('2023-11-10T21:01:59Z');
const expires = '1h';

router.route('/add').post(async (req, res) => {
    try {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const password = req.body.password;
        const email = req.body.email;
        const profile = 'male1'
        const lastLogin = req.body.lastLogin;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        var uniqueId = generateRandomString(20);
        const sharedTugas = [];

        const checkUniqueId = User.findOne({ uniqueId });
        // while (checkUniqueId) {
        //     console.log(checkUniqueId)
        //     uniqueId = generateRandomString(20);
        // }

        const newUser = new User({
            firstName,
            lastName, email,
            password: hashedPassword,
            profile: profile,
            lastLogin: lastLogin,
            uniqueId: uniqueId,
            sharedTugas: [],
        });

        newUser.save()
            .then(() => res.json(true))
            .catch(err => res.status(400).json('Error: ' + err));
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        user.lastLogin = getCurrentTimeInSeconds();
        await user.save();

        const secretKey = crypto.randomBytes(64).toString('hex');
        const token = jwt.sign(Object.assign({}, user), secretKey, {
            expiresIn: expires, // Set the expiration time for the token (e.g., 1 hour)
        });

        res.json({ success: true, token, user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

router.post('/check-session', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const passwordMatch = password === user.password ? true : false;

        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (getCurrentTimeInSeconds() > user.lastLogin + 3600) {
            return res.status(401).json({ success: false, error: 'Session expired' });
        }


        const secretKey = crypto.randomBytes(64).toString('hex');
        const token = jwt.sign(Object.assign({}, user), secretKey, {
            expiresIn: expires, // Set the expiration time for the token (e.g., 1 hour)
        });

        res.json({ success: true, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

router.route('/update-profile').post(async (req, res) => {
    try {
        const user = req.body.user;
        const toChange = req.body.toChange;
        const updatedUser = await User.findOneAndUpdate({ email: user.email }, { $set: { profile: toChange } }, { upsert: true });

        res.json({ success: true })

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});


module.exports = router;
