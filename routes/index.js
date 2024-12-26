const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { 
    landingPage,
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    getLogout,
    getProfile,
    updateProfile,
    getForgotPw,
    putForgotPw,
    getReset,
    putReset
} = require('../controllers/index');
const { asyncErrorHandler, isLoggedIn, isValidPassword } = require('../middleware/index');

/* GET home page. */
router.get('/', asyncErrorHandler(landingPage));

/* GET /register */
router.get('/register', getRegister);

/* POST /register */
router.post('/register', upload.single('image'), asyncErrorHandler(postRegister));

/* GET /login */
router.get('/login', getLogin);

/* POST /login */
router.post('/login', asyncErrorHandler(postLogin));

/* GET /logout */
router.get('/logout', getLogout);

/* GET /profile */
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));

/* PUT /profile */
router.put('/profile', 
  isLoggedIn,
  upload.single('image'),
  asyncErrorHandler(isValidPassword),
  asyncErrorHandler(updateProfile)
);

/* GET /forgot-password */
router.get('/forgot-password', getForgotPw);

/* PUT /forgot-password */
router.put('/forgot-password', asyncErrorHandler(putForgotPw));

/* GET /reset/:token */
router.get('/reset/:token', asyncErrorHandler(getReset));

/* PUT /reset/:token */
router.put('/reset/:token', asyncErrorHandler(putReset));

module.exports = router;