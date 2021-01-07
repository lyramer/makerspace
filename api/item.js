const express = require("express");
const requireAuth = require("./_require-auth.js");
const router = express.Router();

router.get("/:id", (req, res) => {
  const { id } = req.params;

  // Fetch item from database here
  // For now we'll just return a fake item
  const item = {
    id: id,
    name: "Fake Item",
  };

  res.send({
    status: "success",
    data: item,
  });
});

router.patch("/:id", requireAuth, (req, res) => {
  const authUser = req.user;
  const body = req.body;
  const { id } = req.params;

  // First fetch item from database here
  // For now we'll hard-code the item
  const fetchedItem = {
    id: id,
    owner: authUser.uid,
    name: "Fake Item",
    // Or uncomment this line so owner is different then logged in user.
    // This will cause the request to fail due to owner check farther below.
    // owner: '12345',
  };

  // Make sure authenticated user is the item owner
  if (fetchedItem.owner !== authUser.uid) {
    return res.send({
      status: "error",
      message: "Cannot update an item that you don't own",
    });
  }

  // Update item in database here
  // For now we'll return a fake item containing data we passed in request
  const item = {
    id: id,
    ...body,
  };

  res.send({
    status: "success",
    data: item,
  });
});

router.post("/", requireAuth, (req, res) => {
  const authUser = req.user;
  const body = req.body;

  // Make sure authenticated user is not setting someone else as the owner
  if (body.owner !== authUser.uid) {
    return res.send({
      status: "error",
      message: "You can only set yourself as the item owner",
    });
  }

  // Create item in database here
  // For now we'll return a fake item containing data we passed in request
  const item = body;

  res.send({
    status: "success",
    data: item,
  });
});

module.exports = router;
