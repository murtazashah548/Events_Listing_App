const express = require("express");
const router = express.Router();
const fs = require("fs");

router.post("/", async (req, res) => {
  const { email } = req.body;
  if (email) {
    fs.appendFileSync("subscribers.txt", email + "\n");
    res.status(200).json({ message: "Email saved!" });
  } else {
    res.status(400).json({ error: "Email required" });
  }
});

module.exports = router;