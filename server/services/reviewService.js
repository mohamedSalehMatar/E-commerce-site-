const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
                 //to get reviews that matches productID
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = factory.getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review);

// Nested route (Create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  //if no product in req so acces it by productID given  in routes 
  if (!req.body.user) req.body.user = req.user._id;
    //if no user in req so acces it by userID when user logged in 
  next();
};
// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User    //you should be user to create review
exports.createReview = factory.createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User  //you should be user to update review
exports.updateReview = factory.updateOne(Review);//review model is taken as a parameter

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager //you should be user or admin or manger to delete review
exports.deleteReview = factory.deleteOne(Review);
