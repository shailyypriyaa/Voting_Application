const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidates");
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const { findById } = require("../models/user");

// check if user is admin or not

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (error) {
    return false;
  }
};

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    // check is user admin
    // u need to use await with the function as it is a async function and takes time
    if (!(await isAdmin(req.user.id))) {
      return res
        .status(404)
        .json({ message: "User is not Admin so cant post" });
    }

    const data = req.body; // Assuming the request body contains the Candidate data

    // Create a new Person document using the Mongoose model
    const newCandidate = new Candidate(data);

    // Save the new person to the database
    const response = await newCandidate.save();

    // aab us token ko send bhi karna hai to ek object send kardiya
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    //  check is user admin
    if (!(await isAdmin(req.user.id))) {
      return res
        .status(403)
        .json({ message: "User is not Admin so cant update" });
    }

    const candidateId = req.params.id; // Extract the id from token
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData
    );

    if (!response) {
      res.status(404).json({ message: "Person Not Found" });
    }

    console.log("data updated");
    res.status(200).json("Updated Password");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    //  check is user admin
    if (!(await isAdmin(req.user.id))) {
      return res
        .status(403)
        .json({ message: "User is not Admin so cant post" });
    }

    const candidateId = req.params.id; // Extract the id from token

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      res.status(404).json({ message: "candidate Not Found" });
    }

    console.log("data deleted");
    res.status(200).json("Deleted user");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

                                                                                                           // LETS START VOTING


                                                                                                           
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  // admin can not vote
  // user can vote once

  const candidateId = req.params.candidateId;
  const userId = req.body.id;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: "YOU HAVE ALREADY VOTED" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "ADMIN NOT ALLOWED" });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // update isVoted
    user.isVoted = true;
    await Usesr.save();

    res.status(200).json({ message: "VOTED" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// vote Count

router.get("/vote/count", async (req, res) => {
  try {
    // sort the vote countin descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    // map candidate to only return their name and vote count
    const record = candidate.map((data) => {
      return {
        Party: data.party,
        Count: data.voterCount,
      };
    });

    return res.status(200).json(record);
  } catch (error) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// alll candidates list
router.get("/candidate", async (req, res) => {
  try {
    // list of candidates
    // const candidates = await Candidate.find();
    // const listOf = candidate.map((data) => {
    //   return {
    //     PartyName: data.party,
    //     Contestent: data.name,
    //   };
    // });
    // return res.status(200).json(listOf);

    // OTHER WAY
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");

    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (error) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
