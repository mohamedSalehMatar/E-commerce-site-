const express = require('express');

const authService = require('../services/authService');

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require('../services/wishlistService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));
// logged in user only is allowed to add product to  wishlist

router.route('/').post(addProductToWishlist).get(getLoggedUserWishlist);

router.delete('/:productId', removeProductFromWishlist);
//delete by product id 
module.exports = router;
