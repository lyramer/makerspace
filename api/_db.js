// Connect to your database of choice here
// For now all methods just return some fake data

const fakeUserData = {
  uid: "12345",
  email: "fake-user@gmail.com",
  name: "Bob",
};

// Update an existing user
function updateUser(uid, data) {
  // Update user in database here
  const user = {
    ...fakeUserData,
    ...data,
    uid: uid,
  };

  return user;
}

// Get user by uid
function getUser(uid) {
  // Fetch user from database here
  const user = {
    ...fakeUserData,
    uid: uid,
  };

  return user;
}

// Get user by stripeCustomerId
function getUserByCustomerId(customerId) {
  // Fetch user by customerId from database here
  const user = {
    ...fakeUserData,
    customerId: customerId,
  };

  return user;
}

// Update a user by their stripeCustomerId
function updateUserByCustomerId(customerId, data) {
  // Update user by customerId in database here
  const user = {
    ...fakeUserData,
    ...data,
    customerId: customerId,
  };

  return user;
}

module.exports = {
  updateUser,
  getUser,
  getUserByCustomerId,
  updateUserByCustomerId,
};
