const express= require('express');
const router = express.Router();
const auth =require('../../middleware/auth');
const User = require('../../model/user');
const {check , validationResult}  =require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@Route        GET api/auth
//@description  Test route
//@access       public
router.get('/' , auth, async (req,res)=>{
try {
    const userr = await User.findOne({id:User.id}).select('-password');
    res.json(userr);
} catch (err) {
    console.log(err.message);
    res.status(401).send('Server Error');
}}
);
//@Route        POST api/auth
//@description  Auth user
//@access       public
router.post('/',[
  check("email" , "Please enter valid email").isEmail(),
  check("password" , "Please enter valid password").exists(),
] ,async (req, res)=>{
   //check valid credentials
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(401).json({errors : errors.array()});
    }
    //check for user credentials exists in db
    const {email, password} = req.body;
    try {
        //get user from db with email
        let user = await User.findOne({email});
        //check if user exist
        if(!user){
            res.status(400).json({msg : "Invalid credetials"});
        }
        //compare the password to check is matching 
        const isMatching = await bcrypt.compare(password, user.password);
        if(!isMatching){
            res.status(400).json({msg : "Invalid credetials"});
        }
      //get jwt
       const payload ={
           id:user.id,
       }
      jwt.sign(payload, config.get('jwtSecret'),{expiresIn:36000} , (err, token)=>{
          if(err) throw err;
          res.json({token});
      } )

    } catch (err) {
        console.log(err.message);
        res.status(400).send('Server Error')
    }

} )


module.exports= router;