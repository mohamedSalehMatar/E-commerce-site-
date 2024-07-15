const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

exports.createReviewValidator = [
  check('title').optional(),//review comment is optional
  check('ratings')//ratings shouldnt be empty
    .notEmpty()
    .withMessage('ratings value required')
    .isFloat({ min: 1, max: 5 })//rating can be in decimal point but it has min and max value
    .withMessage('Ratings value must be between 1 to 5'),
  check('user').isMongoId().withMessage('Invalid Review id format'),
  check('product')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom((val, { req }) =>
     
      Review.findOne({ user: req.user._id, product: req.body.product }).then(
         // Check if logged user create review before on same product
        (review) => {//cb function
          console.log(review);
          if (review) {//if review method returned true it means that user make review on this product before
            return Promise.reject(//refuse this review 
              new Error('You already created a review before')
            );
          }
        }
      )
    ),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  // function that check if this user is the same one who make the review
  check('id')// Check if 'id' parameter is present
    .isMongoId()// Validate if it's a valid MongoDB ObjectId
    .withMessage('Invalid Review id format')
    .custom((val, { req }) =>
      // Check review ownership before update
      Review.findById(val).then((review) => {//finding review by id
        if (!review) {//if no review matches this id
          return Promise.reject(new Error(`There is no review with id ${val}`));
        }

        if (review.user._id.toString() !== req.user._id.toString()) {
          //check if the user who wants to update review is the same one who created
          return Promise.reject(//if he is not the who created the review
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')// Check if 'id' parameter is present

    .isMongoId()// Validate if it's a valid MongoDB ObjectId

    .withMessage('Invalid Review id format')

    .custom((val, { req }) => {// Custom validation function
      // Check review ownership before update
      if (req.user.role === 'user') {//if u are a user(if u are an admin or manager u can delete any review)
        return Review.findById(val).then((review) => {//finding review by id ,'find' return user as object that has name and id as it work  in 'pre'  function in review model file
          if (!review) {//if no review matches this id
            return Promise.reject(//reject review
              new Error(`There is no review with id ${val}`)
            );
          }
          //user is an object have name and id that returned from 'pre' in reviewModel.js
          if (review.user._id.toString() !== req.user._id.toString()) {
            //check if the user who wants to delete review is the same one who created
            return Promise.reject(//reject if he is not the same user
              new Error(`Your are not allowed to perform this action`)
            );
          }
        });
      }
      return true;//like next() it happen if he didnt enter the if condition(if he is an admin or manager)
    }),
  validatorMiddleware,
];
