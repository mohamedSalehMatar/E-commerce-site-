const asyncHandler = require('express-async-handler');
//no need to wrap asynchronous functions in a try-catch block or pass the error to the next function manually.
const User = require('../models/userModel');

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User //user only  can add item to wishlist
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {

  const user = await User.findByIdAndUpdate(
    req.user._id,//find the logged in user
    {  // addToSet => add productId to wishlist array if productId not exist(in mongodb)
      $addToSet: { wishlist: req.body.productId },
      
    },
    { new: true }
  );

  res.status(200).json({//if product added successfully
    status: 'success',
    message: 'Product added successfully to your wishlist.',
    data: user.wishlist,//return the wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/User //user only  can remove item to wishlist
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {

  const user = await User.findByIdAndUpdate(
    req.user._id,//find the logged in user
    {
      $pull: { wishlist: req.params.productId },
        // $pull => remove productId from wishlist array if productId exist
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product removed successfully from your wishlist.',
    data: user.wishlist,
  });
});

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('wishlist');
                          //find the logged in user by id then populate(show) wishlist
  res.status(200).json({//if response is 200 ok
    status: 'success',
    results: user.wishlist.length,//return no of items in wishlist array in "results"
    data: user.wishlist,//show the wishlist
  });
});
