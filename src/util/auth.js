import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  createContext,
} from "react";
import queryString from "query-string";
import fakeAuth from "fake-auth";
import discourse from "./discourse"
import { useUser, createUser, updateUser, getUserByEmail} from "./db";
import { history, useRouter } from "./router";
import PageLoader from "./../components/PageLoader";
import SectionHeader from "./../components/SectionHeader";

import { getFriendlyPlanId } from "./prices";
import analytics from "./analytics";

// Whether to merge extra user data from database into auth.user
const MERGE_DB_USER = true;

// Whether to connect analytics session to user.uid
const ANALYTICS_IDENTIFY = true;

const authContext = createContext();

// Context Provider component that wraps your app and makes auth object
// available to any child component that calls the useAuth() hook.
export function AuthProvider({ children }) {
  const auth = useAuthProvider();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook that enables any component to subscribe to auth state
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useAuthProvider() {
  console.log("useAuthProvider")

  // Store auth user object
  const [user, setUser] = useState(null);
  
  // Format final user object and merge extra data from database
  // which retrieves info from db
  // note that this appears to be garbage data until usePrepareUser calls setUser
  const finalUser = usePrepareUser(user);
  
  // Connect analytics session to user
  useIdentifyUser(finalUser);
  
  // Handle response from authentication functions
  const passUserInfoToState = async (user) => {
    console.log("passUserInfoToState for ", user)

    // Create the user in the database
    // fake-auth doesn't indicate if they are new so we attempt to create user every time
    // await createUser(user.uid, { email: user.email });
    // await getUserByEmail(user)
    //user = await getUser(user)
    // Update user in state
    setUser(user);  
    return user;
  };

  const signup = (email, password) => {
    console.log("signup")
    return fakeAuth
      .signup(email, password)
      .then((res) => passUserInfoToState(res.user));
  };

  const login = () => {
    return discourse.login().then(passUserInfoToState)
  };

  const cookieCheck = () => {
    return discourse.cookieCheck().then(passUserInfoToState)
  }


  // FIXME: Strip this I think? We aren't using login thru FB, Gmail, etc
  // const signinWithProvider = (name) => {
  //   console.log("signinWithProvider")
  //   return fakeAuth
  //     .signinWithProvider(name)
  //     .then((res) => passUserInfoToState(res.user));
  // };

  const signout = () => {
    console.log("signout")
    return fakeAuth.signout();
  };

  const sendPasswordResetEmail = (email) => {
    console.log("sendPasswordResetEmail")
    return fakeAuth.sendPasswordResetEmail(email);
  };

  const confirmPasswordReset = (password, code) => {
    // [INTEGRATING AN AUTH SERVICE]: If not passing in "code" as the second
    // arg above then make sure getFromQueryString() below has the correct
    // url parameter name (it might not be "code").

    console.log("confirmPasswordReset")

    // Get code from query string object
    const resetCode = code || getFromQueryString("code");
    return fakeAuth.confirmPasswordReset(password, resetCode);
  };

  const updateEmail = (email) => {
    console.log("updateEmail")
    return fakeAuth.updateEmail(email).then((rawUser) => {
      setUser(rawUser);
    });
  };

  const updatePassword = (password) => {
    console.log("updatePassword")
    return fakeAuth.updatePassword(password);
  };

  // Update auth user and persist to database (including any custom values in data)
  // Forms can call this function instead of multiple auth/db update functions
  const updateProfile = async (data) => {
    console.log("updateProfile")

    const { email, name, picture } = data;

    // Update auth email
    if (email) {
      await fakeAuth.updateEmail(email);
    }

    // Update auth profile fields
    if (name || picture) {
      let fields = {};
      if (name) fields.name = name;
      if (picture) fields.picture = picture;
      await fakeAuth.updateProfile(fields);
    }

    // Persist all data to the database
    await updateUser(user.uid, data);

    // Update user in state
    const currentUser = await discourse.getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    // Subscribe to user on mount

    const unsubscribe = discourse.onChange(async (res) => {
      if (res && res.user) {
        console.log("useEffect unsubscribe called")
        // setUser(res.user);
      } else {
        // FIXME: change back to false but changing to null for now...
        console.log("no user object found in res")
        // setUser(null);
      }
    });

    // Unsubscribe on cleanup
    return () => unsubscribe();
  }, []);

  return {
    user: finalUser,
    signup,
    login,
    //signinWithProvider,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updateEmail,
    updatePassword,
    updateProfile,
  };
}

// Format final user object and merge extra data from database
function usePrepareUser(user) {
  console.log("usePrepareUser for:", user);

  if (user) console.log("user has been found")

  // Fetch extra data from database (if enabled and auth user has been fetched)
  const userDbQuery = useUser(MERGE_DB_USER && user && user.uid)
  console.log(userDbQuery)
  
  // Memoize so we only create a new object if user or userDbQuery changes
  return useMemo(() => {

    // Return if auth user is null (loading) or false (not authenticated)
    if (!user) return user;

    // Data we want to include from auth user object
    let finalUser = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };

    // Include an array of user's auth providers, such as ["password", "google", etc]
    // Components can read this to prompt user to re-auth with the correct provider
    finalUser.providers = [user.provider];

    // If merging user data from database is enabled ...
    if (MERGE_DB_USER) {
      switch (userDbQuery.status) {
        case "idle":
          // Return null user until we have db data to merge
          return null;
        case "loading":
          return null;
        case "error":
          // Log query error to console
          console.error(userDbQuery.error);
          return null;
        case "success":
          // If user data doesn't exist we assume this means user just signed up and the createUser
          // function just hasn't completed. We return null to indicate a loading state.
          if (userDbQuery.data === null) return null;

          // Merge user data from database into finalUser object
          Object.assign(finalUser, userDbQuery.data);

          // Get values we need for setting up some custom fields below
          const { stripePriceId, stripeSubscriptionStatus } = userDbQuery.data;

          // Add planId field (such as "basic", "premium", etc) based on stripePriceId
          if (stripePriceId) {
            finalUser.planId = getFriendlyPlanId(stripePriceId);
          }

          // Add planIsActive field and set to true if subscription status is "active" or "trialing"
          finalUser.planIsActive = ["active", "trialing"].includes(
            stripeSubscriptionStatus
          );

        // no default
      }
    }

    return finalUser;
  }, [user, userDbQuery]);
}

// A Higher Order Component for requiring authentication
export const requireAuth = (Component) => {


  console.log("requireAuth being called by ", Component)

  // this only gets returned (I think) when useAuth is called
  // from the child component
  return (props) => {
    // Get authenticated user
    const auth = useAuth();

    // new stuff --------------
    const router = useRouter();
    const loginUid = router.query.uid ? router.query.uid : null;
    const prevPage = router.query.prevPage ? router.query.prevPage : null;
    let discourseInfo = null;

    console.log("if statement in requireAuth")
    if (auth.user == null) {
      console.log("no user object found")
      auth.login()
      .then((user) => {
        discourseInfo = {...user}
        console.log("cookie found! user is ", user.name)
        history.replace("dashboard");
      }).catch(err => {
        console.log("Error in login:", err)
      })
    }
  

    // --------------

    useEffect(() => {
      // Redirect if not signed in
      if (auth.user === false) {
        console.log("error! user is not logged in.")
        history.replace("/auth/login/discourse");
      }
    }, [auth]);

    // Show loading indicator
    // We're either loading (user is null) or we're about to redirect (user is false)
    if (!auth.user) {
      return <PageLoader children={
                <SectionHeader
                  title="Redirecting to talk forum for login"
                  spaced={true}
                />
              }/>;
    }

    // Render component now that we have user
    return <Component {...props} />;
  };
};

// Connect analytics session to current user.uid
function useIdentifyUser(user) {
  useEffect(() => {
    if (ANALYTICS_IDENTIFY && user) {
      analytics.identify(user.uid);
    }
  }, [user]);
}

const getFromQueryString = (key) => {
  return queryString.parse(window.location.search)[key];
};
