const { validationResult}=require('express-validator');

//@desc  Finds the validation errors in this request and wraps them in an object with handy functions
const validatorMiddleware=
// middleware catch errors from rules if exists
(req, res,next) => { // need next for if there is no errors next take me to another middleware 
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
    }

    next();  // move to next middleware

    };
    module.exports= validatorMiddleware;