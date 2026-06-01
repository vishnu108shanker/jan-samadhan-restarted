const express =  require('express') ;
const router = express.Router()  ;

const statsController = require('../controllers/statsController').getStats;

router.get('/', statsController);

module.exports = router ;