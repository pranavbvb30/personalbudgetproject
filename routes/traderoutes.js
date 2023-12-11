const express = require('express');
const router = express.Router();
const controller = require('../controller/tradecontroller');
const {isLoggedIn, isVendor} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validator')
//GET


router.get('/new',isLoggedIn,controller.new);



router.post('/',isLoggedIn,controller.create);





module.exports = router;



