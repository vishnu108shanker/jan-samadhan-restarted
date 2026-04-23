const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        let { fullName, phone, email, password } = req.body;
// chatgpt edit suggestedd to trim 
        // Normalize input
        fullName = fullName?.trim();
        phone = phone?.trim();
        email = email?.toLowerCase().trim();
// dekh idhar user se hm passsword variable collect karenge fir use passwordHash me convert karke model me insert kar denge
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
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

exports.getallUsers = async (req, res) => {
    try {
        // exclude sensitive fields
        // gpt edit suggest to exclude passwordHash and __v (version key) from the results
        const users = await User.find().select('-passwordHash -__v');
        return res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        let { phone, email, password } = req.body;

        // Normalize input
        phone = phone?.trim();
        email = email?.toLowerCase().trim();

        if ((!phone && !email) || !password) {
            return res.status(400).json({ message: 'Credentials and password are required.' });
        }

        // Build query dynamically (important fix)
        const query = phone ? { phone } : { email };

        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({ message: 'No Such User Exists' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // IDHAR HAM JWT TOKKEN SIGN KARENGE , 
        // YAANI TOKEN PAAS BNAYENGE , FIR MIDDLEWARES ME TOKEN VERIFIER LAGAYENGE JO HAR PROTECTED ROUTE PE TOKEN CHECK KAREGA 
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not defined in environment variables');
        }

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




// Oauth ka dekh le na , baad me
//  abbe dekh token tujhe login pe milega abhi ke liye , baad me register route pe hi auto logi laga dena to get t oken