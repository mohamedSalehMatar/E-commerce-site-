const {check}=require('express-validator');
const validatorMiddleware=require('../../middlewares/validatorMiddleware')


exports.getCategoryValidator=[


    // rules 
    check('id').isMongoId().withMessage(`invalid category id format`),
    // check errors in rules 
    validatorMiddleware,
    
];

exports.createCategoryValidator=[

    check('name').notEmpty()
    .withMessage('must write a category name')
    .isString()
    .withMessage('category name must be a string')
    .isLength({min:3})
    .withMessage('category name must be more than 3 characters')
    .isLength({max:32})
    .withMessage('category name must be less than 32 characters'),
    

    validatorMiddleware,

];


