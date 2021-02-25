import React from "react";
import { Link } from "./../util/router.js";
import "./AuthFooter.scss";

function AuthFooter(props) {
  return (
    <div className="AuthFooter text-center mt-4">
      {props.type === "signup" && (
        <>
          Have an account already?
          <Link to="/auth/login">{props.typeValues.linkTextSignin}</Link>
        </>
      )}

      {props.type === "login" && (
        <>
        {/* FIXME : Option to sign up temporarily removed for billing transition */}
          {/* <Link to="/auth/signup">{props.typeValues.linkTextSignup}</Link> */}
          <Link to="/auth/forgotpass">
            {props.typeValues.linkTextForgotpass}
          </Link>
        </>
      )}
    </div>
  );
}

export default AuthFooter;
