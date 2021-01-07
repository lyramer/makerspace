const express = require("express");
const requireAuth = require("./_require-auth.js");
const router = express.Router();

router.get("/:uid", requireAuth, (req, res) => {
  const authUser = req.user;
  const { uid } = req.params;

  // Prevent access to user other than yourself
  // Note: You may want to remove this depending on your needs
  if (uid !== authUser.uid) {
    return res.send({
      status: "error",
      message: "Cannot access user other than yourself",
    });
  }

  // Fetch user from database here
  // For now we'll just return a fake user
  const user = {
    uid: uid,
    email: "fake-user@gmail.com",
    name: "Bob",
  };

  res.send({
    status: "success",
    data: user,
  });
});

router.patch("/:uid", requireAuth, (req, res) => {
  const authUser = req.user;
  const body = req.body;
  const { uid } = req.params;

  // Make sure authenticated user can only update themself
  if (uid !== authUser.uid) {
    return res.send({
      status: "error",
      message: "Cannot update user other than yourself",
    });
  }

  // Update user in database here
  // For now we'll return a fake user containing data we passed in request
  const user = {
    uid: uid,
    ...body,
  };

  res.send({
    status: "success",
    data: user,
  });
});

router.post("/", requireAuth, (req, res) => {
  const authUser = req.user;
  const body = req.body;

  // Make sure authenticated user can only create themself in the database
  if (body.uid !== authUser.uid) {
    return res.send({
      status: "error",
      message: "Created user must have the same uid as authenticated user",
    });
  }

  // Create user in database here
  // For now we'll return a fake user containing data we passed in request
  const user = body;

  res.send({
    status: "success",
    data: user,
  });
});

module.exports = router;
