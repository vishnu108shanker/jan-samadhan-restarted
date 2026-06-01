/**
 * seedAdmin.js  — run once to create the admin user in MongoDB Atlas
 * Usage:  node seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('./models/User');

const ADMIN = {
  fullName:  'Vishnu Shanker',
  phone:     '9999999999',
  email:     'admin@jansamadhan.gov.in',
  password:  'Admin@JS#2026',
  role:      'admin',
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Remove any existing admin (clean seed)
    await User.deleteOne({ email: ADMIN.email });

    const passwordHash = await bcrypt.hash(ADMIN.password, 10);

    const admin = new User({
      fullName:     ADMIN.fullName,
      phone:        ADMIN.phone,
      email:        ADMIN.email,
      passwordHash,
      role:         ADMIN.role,
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log(`   Email   : ${ADMIN.email}`);
    console.log(`   Password: ${ADMIN.password}`);
    console.log(`   Role    : ${admin.role}`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
})();
