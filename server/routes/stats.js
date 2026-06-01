const express =  require('express') ;
const router = express.Router()  ;

const statsController = require('../controllers/statsController').getStats;

router.get('/', statsController);
router.get('/stats', statsController); // backwards-compatible alias

module.exports = router ;