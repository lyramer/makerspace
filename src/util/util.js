import fakeAuth from "fake-auth";

export function apiRequest(path, method = "GET", data) {

  // FIXME: I don't think we're doing this with access tokens because
  // we are storing the JWT token in a cookie which automagically
  // gets sent in the headers in any api request?
  // askDerek
  const accessToken = fakeAuth.getAccessToken();

  // note that the cookie called 'session' which contains
  // the user's jwt token is automatically sent.
  return fetch(`/api/${path}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${accessToken}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  })
    .then((response) => response.json())
    .then((response) => {
      console.log("response from server:", response)
      if (response.status === "error") {
        console.log("Error found in malformed API Request")
        // Automatically signout user if accessToken is no longer valid
        if (response.code === "auth/invalid-user-token") {
          fakeAuth.signout();
        }
        throw new CustomError(response.code, response.message);
      } else {
        console.log("found user: ", response.username)
        return response;
      }
    });
}

// Create an Error with custom message and code
export function CustomError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
