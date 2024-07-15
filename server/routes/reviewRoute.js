const express = require('express');

const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require('../services/reviewService');//require review services

const authService = require('../services/authService');

const router = express.Router({ mergeParams: true });
                              //to access params al gaya mn al parent route (productID)
router
//CRUD operations
  .route('/')
  .get(createFilterObj, getReviews)

  .post(//create review   (adding all middlewares)
    authService.protect,//user should have an account in the app and he make login to create review
    authService.allowedTo('user'),//user only can create review 
//(include 2 middlewares methods created in 'auth service".)
    setProductIdAndUserIdToBody,//validate if user has created review on same product before
    createReviewValidator,//adding review validator middlware
    createReview
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)//anyone can get the review
  // no authentication on getting review cause anyone is allowed to get the review
  .put(
    authService.protect,//user should have an account in the app and make login to update review
    authService.allowedTo('user'),//user only allowed to update review
    updateReviewValidator,//adding middlware function that check if this user is the same one who make the review
    updateReview
  )
  .delete(//delete review (adding all middlewares)
    authService.protect,//user should have an account in the app and make login to delete review
    authService.allowedTo('user', 'manager', 'admin'),//manager,admin,user only allowed to delete review
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
