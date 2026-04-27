const express =  require('express') ;
const router = express.Router()  ;

const verifyJWT = require('../middlewares/verifyJWT') ;
const isAdmin = require('../middlewares/isAdmin') ;
const issueController = require('../controllers/issueController');

// login required route
router.post('/create', verifyJWT, issueController.createIssue) ;

// admin protected routes
router.get('/all', verifyJWT , isAdmin, issueController.getAllIssues) ;
router.patch('/:id/status' , verifyJWT , isAdmin , issueController.updateIssueStatus) ;


// public route to get issue status by token
router.get('/:token', issueController.trackIssueByToken) ;







module.exports = router;
