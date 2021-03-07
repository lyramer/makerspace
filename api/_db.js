const {dbQuery, runQuery, runTransaction} = require("./db/db-query.js");


// Connect to your database of choice here
// For now all methods just return some fake data

const fakeUserData = {
  uid: "12345",
  email: "fake-userss@gmail.com",
  name: "Bob",
};

// Update an existing user
async function updateUser(uid, data) {
  // Update user in database here
  const user = {
    ...fakeUserData,
    ...data,
    uid: uid,
  };
  //await dbQuery(uid)

  return user;
}

// Get user by uid
function getUser(uid) {
  return runQuery(`
    SELECT * FROM members AS m
    JOIN contact_info AS c
    ON c.id = m.id 
    WHERE m.external_id=${uid}`)
  .then(res => {
    if (res.status === "NoRecordsMatch") return false
    return {status: "Found", uid: uid, ...res.rows[0]}
  }).catch(res=> {
    console.log("Error!", res)
    return {status: "Error", uid: uid, ...res.rows[0]}
  })
  
}


// Get user by email
function getUserByEmail(email) {
  return runQuery(`
    SELECT *
    FROM members AS m
    JOIN contact_info AS c
    ON c.id = m.id 
    WHERE (c.email='${email}' OR c.email2='${email}');`)
  .then(res => {
    if (res.status === "NoRecordsMatch") return false
    return {status: "Found", uid:res.external_id, ...res}
  }).catch(res=> {
    console.log("Error!", res)
    return {status: "Error", uid:res.external_id,  ...res}
  })
  console.log(email)

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
  getUserByEmail,
};
