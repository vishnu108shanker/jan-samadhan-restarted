const isAdmin = (req, res , next ) => {
    if(req.user.role !== 'admin'){
        return res.status(403).json({message: 'Forbidden, Admins Access only'})
    }
    next();
}

module.exports = isAdmin ;