const { v4: uuidv4 } = require('uuid');

const guestIdMiddleware = (req, res, next) =>{
    if (!req.cookies.guest_id) {
        const guest_id = uuidv4();
        res.cookie('guest_id', guest_id, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true,
            sameSite: 'lax'
        });
        req.guest_id = guest_id;
    } else{
        req.guest_id = req.cookies.guest_id;
    }
    next();
};

module.exports = guestIdMiddleware;