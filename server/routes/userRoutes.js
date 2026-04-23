const express = require('express') ;
const router = express.Router() ;

router.get('/test' , (req , res ) => {
    res.send(" User router is working fine ") ;
})





module.exports = router ;