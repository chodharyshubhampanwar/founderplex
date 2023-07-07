import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { AiOutlineLoading } from "react-icons/ai";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import SocialLogin from "./SocialLogin";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const signUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if the username is taken
    const usernameTaken = await checkUsernameAvailability(username);
    if (usernameTaken) {
      setError(
        "The username is already taken. Please choose a different username."
      );
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential);

      if (userCredential.user) {
        // Create the user profile with the chosen username
        await createUserProfile(userCredential.user, username);

        sendEmailVerification(userCredential.user)
          .then(() => {
            setShowPopup(true);

            setTimeout(() => {
              navigate("/signin");
            }, 5000); // wait for 5 seconds then navigate to login
          })
          .catch((error) => {
            console.log(error);
            setError("An error occurred. Please try again.");
          });
      }
    } catch (error) {
      console.log(error.message);
      if (error.code === "auth/email-already-in-use") {
        setError("The email is already in use. Please use a different email."); // Custom error message
      } else {
        setError("Something went wrong. Please try again."); // General error message
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const usernameRef = doc(db, "usernames", username);
      const usernameDoc = await getDoc(usernameRef);
      return usernameDoc.exists();
    } catch (error) {
      console.log(error);
      // Handle error
      return false;
    }
  };

  const createUserProfile = async (user, username) => {
    try {
      const userProfileRef = doc(db, "users", user.uid);
      const usernameRef = doc(db, "usernames", username);

      const usernameAvailability = await checkUsernameAvailability(username);

      if (usernameAvailability) {
        throw new Error("Username is already taken.");
      }

      await setDoc(userProfileRef, { username });
      await setDoc(usernameRef, { userId: user.uid });
    } catch (error) {
      console.error("Failed to create user profile:", error);
      throw error; // Rethrow the error to handle it further up the call stack
    }
  };

  return (
    <GridContainer>
      <ImageContainer />
      <Container>
        <Form onSubmit={signUp}>
          <h1>Create Account</h1>
          {error && <ErrorText>{error}</ErrorText>}

          <OrLine>OR</OrLine>

          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <CheckboxContainer>
            <Checkbox required />
            <span>I agree to all terms and privacy policy</span>
          </CheckboxContainer>

          <Button disabled={loading} type="submit">
            {loading ? <LoadingIcon /> : "Sign Up"}
          </Button>

          <p>
            Already a member?{" "}
            <Link to="/signin" style={{ color: "#5865f2" }}>
              Sign In
            </Link>
          </p>
        </Form>

        {showPopup && (
          <Popup>
            <PopupMessage>
              Account created successfully. A verification email has been sent,
              please check your email.
            </PopupMessage>
          </Popup>
        )}
        <SocialLogin />
      </Container>
    </GridContainer>
  );
};

const Popup = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); // semi-transparent background
`;

const PopupMessage = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  font-size: 20px;
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #4d4dff;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingIcon = styled(AiOutlineLoading)`
  animation: ${spinAnimation} 1s linear infinite;
`;

const ErrorText = styled.div`
  color: red;
  margin-bottom: 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageContainer = styled.div`
  background: url("your_image_url") no-repeat center center;
  background-size: cover;
  @media (max-width: 768px) {
    display: none;
  }
`;

const OrLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  &:before,
  &:after {
    content: "";
    flex: 1;
    border-bottom: 1px dashed #ccc;
  }

  &:before {
    margin-right: 0.5em;
  }

  &:after {
    margin-left: 0.5em;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  margin-right: 5px;
`;

export default SignUp;
