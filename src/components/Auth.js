import React, { useState } from "react";
import FormAlert from "./FormAlert";
import AuthForm from "./AuthForm";
import AuthSocial from "./AuthSocial";
import AuthFooter from "./AuthFooter";
import { useRouter } from "./../util/router.js";
import { Redirect } from "react-router-dom";

function Auth(props) {


  const router = useRouter();
  const [formAlert, setFormAlert] = useState(null);

  const handleAuth = (user) => {
    router.push(props.afterAuthPath);
  };

  const handleFormAlert = (data) => {
    setFormAlert(data);
  };


  // Trying to redirect to backend via proxy for redirect to the 
  // discourse auth page. However, Router will just try to render this
  // and as we don't have this route defined in ROUTER (we do have it 
  // defined in Express.), we get the default 'Not Found' page.
  //if (props.type == "login") return <Redirect to="/api/auth/discourse_sso"/>

  return (
    <>
      {formAlert && (
        <FormAlert type={formAlert.type} message={formAlert.message} />
      )}
      <AuthForm
        type={props.type}
        typeValues={props.typeValues}
        onAuth={handleAuth}
        onFormAlert={handleFormAlert}
      />

      {/* if user wants to sign up via social media  */}
      {/* {["signup", "login"].includes(props.type) && (
        <>
          {props.providers && props.providers.length && (
            <>
              <small className="text-center d-block my-3">OR</small>
              <AuthSocial
                type={props.type}
                buttonText={props.typeValues.buttonText}
                providers={props.providers}
                showLastUsed={true}
                onAuth={handleAuth}
                onError={(message) => {
                  handleFormAlert({
                    type: "error",
                    message: message,
                  });
                }}
              />
            </>
          )}

          <AuthFooter type={props.type} typeValues={props.typeValues} />
        </>
      )} */}
    </>
  );
}

export default Auth;
