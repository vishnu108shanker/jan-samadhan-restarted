const express = require('express') ;
const router = express.Router() ;
const authController  = require('../controllers/authController') ;


router.get('/register' , authController.register) ;
router.get('/getallUsers' , authController.getallUsers) ;
router.get('/login' , authController.login) ;


module.exports = router ;