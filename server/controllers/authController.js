const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { fullName, phone, email, password } = req.body;

        if (!fullName || !phone || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Phone or Email already registered.' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            phone,
            email,
            passwordHash
        });

        await user.save();

        return res.status(201).json({ 
            message: 'Registration successful.', 
            user: { id: user._id, fullName: user.fullName, email: user.email } // Best practice: don't send the hash back
        });    
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getallUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { phone, email, password } = req.body;

         if ((!phone && !email) || !password) {
            return res.status(400).json({ message: 'Credentials and password are required.' });
        }

        const user = await User.findOne({ $or: [{ phone }, { email }] });
        if (!user) {
            return res.status(401).json({ message: 'No Such User Exists' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // IDHAR HAM JWT TOKKEN SIGN KARENGE , 
        // YAANI TOKEN PAAS BNAYENGE , FIR MIDDLEWARES ME TOKEN VERIFIER LAGAYENGE JO HAR PROTECTED ROUTE PE TOKEN CHECK KAREGA 
        const token = jwt.sign(
            // idhar payload me hum user ka id aur role rakh rahe hain
            // to be reviewed later for best possible payload structure
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return res.status(200).json({ 
            message: "Login successful", 
            token 
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
}