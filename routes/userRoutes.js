const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

// POST route to add a person
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // Assuming the request body contains the person data

    // Create a new Person document using the Mongoose model
    const newPerson = new User(data);

    // Save the new person to the database
    const response = await newPerson.save();

    // generating token
    // const token = generateToken(response.username) //username is token
    // console.log("JWT token is " , token);

    // now we are deciding what all we want to send in payload
    const payload = {
      id: response.id,
      username: response.username,
    };
    const token = generateToken(payload); //sending complete payload as token and not just username like above
    console.log("JWT token is ", token);

    console.log("data saved");
    // aab us token ko send bhi karna hai to ek object send kardiya
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// login route to again assign JWT token
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    //   find username
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //   checking password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid username or password " });
    }

    //   GENERATE TOKENS
    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);

    //   return token
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    // jwtAuthMiddleware na aapne aandar verify karne ke bad jo decoded msg hota hai use user me bhej rha hai...see jwt.js file
    const userData = req.user;


    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extract the id from token
     const {currentPassword , newPassword} = req.body;

    //  find new user
    const user = await User.findById(userId);

    //   checking password
    if ( !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ error: "invalid username or password " });
      }

    // update the user password 
    user.password = newPassword;
    await user.save();
    

    console.log("password updated");
    res.status(200).json("Updated Password");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
