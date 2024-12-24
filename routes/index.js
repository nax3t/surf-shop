const express = require('express');
const router = express.Router();
const { 
    landingPage,
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    getLogout,
    getProfile
} = require('../controllers/index');
const { asyncErrorHandler } = require('../middleware/index');

/* GET home page. */
router.get('/', asyncErrorHandler(landingPage));

/* GET /register */
router.get('/register', getRegister);

/* POST /register */
router.post('/register', asyncErrorHandler(postRegister));

/* GET /login */
router.get('/login', getLogin);

/* POST /login */
router.post('/login', asyncErrorHandler(postLogin));

/* GET /logout */
router.get('/logout', getLogout);

/* GET /profile */
router.get('/profile', asyncErrorHandler(getProfile));

module.exports = router;