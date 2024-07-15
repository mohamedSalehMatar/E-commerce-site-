const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  
  const user = await User.findByIdAndUpdate(
    req.user._id,//find the logged in user by id
    {
      $addToSet: { addresses: req.body },
      // addToSet => add address object to user addresses  array if address not exist
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Address added successfully.',
    data: user.addresses,
  });
});

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId 
// @access  Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  
  const user = await User.findByIdAndUpdate(
    req.user._id,//getting the logged in user by his id
    {
      $pull: { addresses: { _id: req.params.addressId } },
  // $pull => remove address(by id) object from user addresses array if addressId exist
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Address removed successfully.',
    data: user.addresses,
  });
});

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  //no need to write user id in req as u already logged in
  const user = await User.findById(req.user._id).populate('addresses');
                          //find the logged in user and then populate(show) adresses
  res.status(200).json({//if res is 200 ok
    status: 'success',
    results: user.addresses.length,//number of items in array of adresses
    data: user.addresses,//return adresses
  });
});
