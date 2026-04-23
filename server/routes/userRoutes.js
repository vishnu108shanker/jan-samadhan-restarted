const express = require('express') ;
const verifyJWT = require('../middlewares/verifyJWT');
const router = express.Router() ;

router.get('/test' , verifyJWT, (req , res ) => {
    res.send(" User router is working fine ") ;
})





module.exports = router ;