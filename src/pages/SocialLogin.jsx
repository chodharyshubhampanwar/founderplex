import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { AiOutlineLoading } from "react-icons/ai";
import { RiGoogleFill } from "react-icons/ri";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SocialLogin = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLoginClick = async () => {
    const googleAuthProvider = new GoogleAuthProvider();

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const userData = result.user;
      setUser(userData);
      console.log("User logged in:", userData);
      navigate("/"); // Redirect to home component
    } catch (error) {
      setError("An error occurred. Please try again later.");
      console.log("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {error && <ErrorText>{error}</ErrorText>}
      <Button disabled={loading} onClick={handleGoogleLoginClick}>
        {loading ? (
          <LoadingIcon />
        ) : (
          <>
            <GoogleIcon />
            <ButtonText>Sign in with Google</ButtonText>
          </>
        )}
      </Button>
      {user && <p>{user.email}</p>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 20px; */
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ErrorText = styled.p`
  color: red;
  margin-bottom: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 40px;
  padding: 10px;

  border: none;
  border-radius: 4px;
  background-color: #db4437;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingIcon = styled(AiOutlineLoading)`
  animation: ${spinAnimation} 1s linear infinite;
`;

const GoogleIcon = styled(RiGoogleFill)`
  font-size: 20px;
  margin-right: 10px;
`;

const ButtonText = styled.span`
  font-size: 16px;
`;

export default SocialLogin;
