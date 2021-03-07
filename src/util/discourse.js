import { apiRequest, CustomError } from "./util.js";
import { useQuery, queryCache } from "react-query";



// Now lets wrap our methods with extra logic, such as including a "connection" value
// and ensuring human readable errors are thrown for our UI to catch and display.
// We make these custom methods available within an auth.extended object.

let onChangeCallback = () => null;

const discourse = {
  getCurrentUser: () => {
    console.log("discourse getCurrentUser")
    return apiRequest(`auth/current-session`)
    // .then(handleAuth)
    .catch(handleError)
  },

  signupAndAuthorize: (options) => {
    console.log("discourse signupAndAuthorize")
    return apiRequest(`auth/new`, options)
      // .then(handleAuth)
      .catch(handleError)
  },

  // FIXME: Finish implementing this so it is called when requireAuth is 
  // used (aka rendered) as a HOC wrapper.
  cookieCheck: () => {
    console.log("discourse cookieCheck")
    return apiRequest(`auth/current-session`)
     // .then(handleAuth)
      .catch(handleError);
  },
  // not passing in login uid because we are authing through
  // cookies and backend stuff.
  login: () => {
    console.log("discourse login")
    return apiRequest(`auth/current-session`)
      //.then(handleAuth)
      .catch(handleError);
  },

  // Send email so user can reset password
  changePassword: (options) => {
    console.log("discourse changePassword")
    // return changePassword({
    //   // connection: auth0Realm,
    //   ...options,
    // })
    return apiRequest(`auth/reset-pwd`, options)
    .catch((error) => handleError(error, true));
  },

  updateEmail: (email) => {
    console.log("discourse updateEmail")
    return apiRequest("auth-user", "PATCH", { email });
  },

  // Update password of authenticated user
  updatePassword: (password) => {
    console.log("discourse updatePassword")
    return apiRequest("auth-user", "PATCH", { password });
  },

  updateProfile: (data) => {
    console.log("discourse updateProfile")
    return apiRequest("auth-user", "PATCH", data);
  },

  logout: () => {
    console.log("discourse logout")
    handleLogout();
  },

  // A method for listening to to auth changes and receiving user data in passed callback
  onChange: function (cb) {
    // Store passed callback function
    onChangeCallback = cb;

    const handleOnChange = (accessToken) => {
      console.log("discourse handleOnChange")
      if (accessToken) {
        // FIXME (no access tokens..right?)
        console.log("do something here")
        // return apiRequest(`auth/current-session`)
        //   .then(onChangeCallback)
        //   .catch((error) => handleError(error, true));
      } else {
        onChangeCallback(false);
      }
    };

    // FIXME: I think we're going with cookies rather than local storage?
    // for security reasons (local storage vulnerable to XSS)

    
    // Local Storage listener
    // This is ONLY called when storage is changed by another tab so we
    // must manually call onChangeCallback after any user triggered changes.
    // // const listener = window.addEventListener(
    // //   "storage",
    // //   ({ key, newValue }) => {
    // //     if (key === TOKEN_STORAGE_KEY) {
    // //       handleOnChange(newValue);
    // //     }
    // //   },
    // //   false
    // // );

    // // Get accessToken from storage and call handleOnChange.
    // const accessToken = getAccessToken();
    // handleOnChange(accessToken);

    // // Return an unsubscribe function so calling function can
    // // call unsubscribe when needed (such as when a component unmounts).
    // return () => {
    //   window.removeEventListener("storage", listener);
    // };
  },

  // getAccessToken: () => getAccessToken(),
};

// FIXME: without access tokens I'm not sure we need this?
// Gets passed auth response, stores accessToken, returns user data.
const handleAuth = (response) => {
  if (response) { // ie it is a real json object, not just 'false'
    // response.accessToken = "";
    // setAccessToken(response.accessToken);
    // onChangeCallback(response);
  }

  return response;
};

const handleLogout = () => {
  // FIXME: need to change this to removeCookie
  //removeAccessToken();
  onChangeCallback(false);
};

const handleError = (error, autoLogout = false) => {
  // If error code indicates user is unauthorized then log them out.
  // We only do this if autoLogout is enabled so we can skip in instances
  // where it's not possible its due to token expiration (such as right after login)
  // and we'd rather throw an error that can be displayed by the UI.
  if (error.code === 401 && autoLogout) {
    handleLogout();
  }

  // Find a human readable error message in an Auth0 error object and throw.
  // Unfortunately, it's not always in the same location :/
  let message;
  if (error.code === "invalid_password") {
    message = `Your password must be: ${error.policy}`;
  } else if (typeof error.message === "string") {
    message = error.message;
  } else if (typeof error.description === "string") {
    message = error.description;
  } else if (typeof error.original === "string") {
    message = error.original;
  } else if (error.original && typeof error.original.message === "string") {
    message = error.original.message;
  } else {
    message = error.code; // Use error.code if no better option
  }
  console.log("CustomError!", error)
  throw new CustomError(error.code, message);
};

// Local Storage methods
// const TOKEN_STORAGE_KEY = "auth0_access_token";
// const getAccessToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
// const setAccessToken = (accessToken) =>
//   localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
// const removeAccessToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

export default discourse;
