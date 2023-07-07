import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase";
import SocialLogin from "./SocialLogin";
import styled, { keyframes } from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineLoading } from "react-icons/ai";

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return false;
    }
    return true;
  };

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (validateForm()) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(userCredential);
        setLoading(false);
        if (userCredential.user.emailVerified) {
          navigate("/");
        } else {
          setError("Please verify your email before logging in.");
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/user-not-found") {
        setError("User not found. Please sign up.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");
      setError("Password reset email sent. Please check your email.");
    } catch (error) {
      console.log(error);
      setError("An error occurred. Please try again.");
    }
  };
  return (
    <Container>
      <Form onSubmit={signIn}>
        <h1>Log In to Your Account</h1>
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
        <Button disabled={loading} type="submit">
          {loading ? <LoadingIcon /> : "Log In"}
        </Button>
        <Button type="button" onClick={resetPassword}>
          Reset Password
        </Button>

        {error && <ErrorText>{error}</ErrorText>}
        {error === "User not found. Please sign up." && (
          <SignupLink to="/signup">Sign up</SignupLink>
        )}
      </Form>
      <SocialLoginContainer>
        <SocialLogin />
      </SocialLoginContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  height: 40px;
  padding: 8px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  background-color: #5865f2;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingIcon = styled(AiOutlineLoading)`
  animation: ${spinAnimation} 1s linear infinite;
`;

const ErrorText = styled.p`
  color: red;
  margin-bottom: 10px;
`;

const SignupLink = styled(Link)`
  color: #5865f2;
  text-decoration: underline;
  margin-top: 10px;
`;

const SocialLoginContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

export default Login;
