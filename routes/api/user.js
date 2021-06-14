const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../model/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const config = require('config');

//@Route        GET api/user
//@description  Test route
//@access       public
router.get("/", (req, res) => {
  res.send("User Route");
});

//@Route        POST api/user
//@description  Create user
//@access       Private
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include valid email").isEmail(),
    check("password", "Password must be more than 6 character").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    //check user exits or not
    const { name, email, password } = req.body;
    try {
      let user =await User.findOne({ email });
      if (user) {
        return res
          .status(401)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      //create new instance for user
      user = new User({
        name,
        email,
        password,
      });

      //Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //Save new user with new email ,name, password.
      await user.save();
     const payload={
      id:user.id,
      };

      //Return JWT
      jwt.sign(payload ,
        config.get("jwtSecret"),
        {expiresIn:360000} ,
        (err ,token)=>{
     if(err) throw err;
    res.json({token});
      }); 
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
