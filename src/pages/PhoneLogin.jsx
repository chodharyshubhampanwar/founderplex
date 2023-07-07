import React, { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FaCheck, FaPhone } from "react-icons/fa";
import { RiLoader4Line } from "react-icons/ri";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

console.log(db);

const fade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Container = styled.div`
  padding: 1rem;
  background-color: #f2f2f2;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #333;
`;

const Alert = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: #daf1de;
  color: #28a745;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: ${({ show }) => (show ? "block" : "none")};
  animation: ${fade} 0.3s ease-in-out;
`;

const FieldGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Input = styled.input`
  width: 95%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  outline: none;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  outline: none;
`;

const Button = styled.button`
  background-color: ${({ isLoading }) => (isLoading ? "#ccc" : "#5865f2")};
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: ${({ isLoading }) => (isLoading ? "not-allowed" : "pointer")};
  outline: none;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: ${({ isLoading }) => (isLoading ? "#ccc" : "#5865f2")};
  }
`;

const Icon = styled.span`
  margin-right: 0.5rem;
`;

const LoadingIcon = styled(RiLoader4Line)`
  animation: ${keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`}
    1s linear infinite;
`;

const SuccessIcon = styled(FaCheck)`
  color: #28a745;
`;

const PhoneIcon = styled(FaPhone)`
  margin-right: 0.5rem;
`;

const PhoneLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [flag, setFlag] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const checkPhoneNumberVerification = async () => {
      const user = auth.currentUser;
      if (user && user.phoneNumber) {
        // Phone number is already verified
        navigate("/home");
      }
    };

    checkPhoneNumberVerification();
  }, []);

  const setUpRecaptcha = async () => {
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
    await recaptchaVerifier.verify();
    return recaptchaVerifier;
  };

  const getOtp = async (e) => {
    e.preventDefault();
    setError("");
    const number = `${countryCode}${phoneNumber}`;

    const isValidPhoneNumber = /^\+?\d+$/.test(number);
    if (!isValidPhoneNumber) {
      return setError("Please enter a valid phone number!");
    }

    try {
      setIsLoading(true);

      // Query the Firestore to check if the number already exists
      const docRef = doc(db, "verifiedNumbers", phoneNumber);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // If the number is found in the Firestore collection, throw an error
        throw new Error("The number is already verified.");
      }

      const recaptchaVerifier = await setUpRecaptcha();
      const response = await signInWithPhoneNumber(
        auth,
        number,
        recaptchaVerifier
      );
      setConfirmationResult(response);
      setFlag(true);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    confirmationResult
      .confirm(otp)
      .then(async () => {
        const docRef = doc(db, "verifiedNumbers", phoneNumber);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // If phone number is already verified
          navigate("/home");
        } else {
          setIsLoading(false);
          setSuccessMessage("Verification successful! Redirecting...");
          await setDoc(docRef, {
            verified: true,
          });
          setTimeout(() => {
            navigate("/home");
          }, 3000);
        }
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  const countries = [
    { code: "+91", name: "India", flag: "🇮🇳" },
    { code: "+1", name: "United States", flag: "🇺🇸" },
  ];

  return (
    <Container>
      <Title>Firebase Phone Auth</Title>
      {error && <Alert>{error}</Alert>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      <Form onSubmit={getOtp} show={!flag}>
        <FieldGroup>
          <Label htmlFor="phoneNumber">Phone Number:</Label>
          <div>
            <Select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="" disabled>
                Select Country
              </option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </Select>
            <Input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter Phone Number"
            />
          </div>
        </FieldGroup>
        <div id="recaptcha-container"></div>
        <div>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingIcon />
                Sending OTP...
              </>
            ) : (
              <>
                <Icon>
                  <PhoneIcon />
                </Icon>
                Send OTP
              </>
            )}
          </Button>
        </div>
      </Form>

      <Form onSubmit={verifyOtp} show={flag}>
        <FieldGroup>
          <Label htmlFor="otp">OTP:</Label>
          <Input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
        </FieldGroup>
        <div>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingIcon />
                Verifying...
              </>
            ) : (
              <>
                <Icon>
                  <SuccessIcon />
                </Icon>
                Verify
              </>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default PhoneLogin;
