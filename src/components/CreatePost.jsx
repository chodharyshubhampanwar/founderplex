import React, { useState } from "react";
import styled from "styled-components";
import { db, storage, FieldValue, auth } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RiLoader4Line } from "react-icons/ri";
import { AiOutlineCloseCircle } from "react-icons/ai";

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [sector, setSector] = useState("");
  const [image, setImage] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [stage, setStage] = useState("");
  const [isFullTime, setIsFullTime] = useState(false);
  const [website, setWebsite] = useState("");
  const [pitchPresentation, setPitchPresentation] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [teamInput, setTeamInput] = useState("");
  const [investorsInput, setInvestorsInput] = useState("");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const storage = getStorage();
    const storageRef = ref(storage, file.name);

    if (file.size > 1024 * 1024) {
      console.error("File size should not exceed 1MB");
      return;
    }

    try {
      // Upload file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      // Set the image URL in the component state
      setIsImageLoading(true);
      setImage(downloadURL);
      setIsImageLoading(false);

      console.log("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const handleTeamInput = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      if (event.target.value.trim() !== "" && team.length < 5) {
        setTeam((prevTeam) => [...prevTeam, event.target.value.trim()]);
        setTeamInput("");
      }
    }
  };

  const handleInvestorsInput = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      if (event.target.value.trim() !== "" && investors.length < 5) {
        setInvestors((prevInvestors) => [
          ...prevInvestors,
          event.target.value.trim(),
        ]);
        setInvestorsInput("");
      }
    }
  };

  const removeTeamMember = (index) => {
    setTeam((prevTeam) => {
      const updatedTeam = [...prevTeam];
      updatedTeam.splice(index, 1);
      return updatedTeam;
    });
  };

  const removeInvestor = (index) => {
    setInvestors((prevInvestors) => {
      const updatedInvestors = [...prevInvestors];
      updatedInvestors.splice(index, 1);
      return updatedInvestors;
    });
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (isImageLoading) {
      console.error("Image is still uploading. Please wait and try again.");
      return;
    }

    const newPost = {
      title,
      tagline,
      elevatorPitch,
      sector,
      image,
      team,
      investors,
      stage,
      isFullTime,
      website,
      pitchPresentation,
      videoLink,
      author: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      upvotes: 0,
      upvoters: [],
    };

    const postsCollection = collection(db, "posts");

    if (
      !title ||
      !tagline ||
      !elevatorPitch ||
      !sector ||
      !image ||
      team.length === 0 ||
      investors.length === 0 ||
      !stage ||
      !isFullTime ||
      !website ||
      !pitchPresentation
    ) {
      console.error("All fields are required!");
      return;
    }

    // Additional check for empty values in team and investors arrays
    if (team.some((member) => member.trim() === "")) {
      console.error("Team members cannot be empty!");
      return;
    }

    if (investors.some((investor) => investor.trim() === "")) {
      console.error("Investors cannot be empty!");
      return;
    }

    try {
      setIsLoading(true);
      const docRef = await addDoc(postsCollection, newPost);
      console.log("Document written with ID: ", docRef.id);
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (e) {
      console.error("Error adding document: ", e);
      setIsLoading(false);
    }
  };

  const SECTORS = [
    "AI",
    "Consumer Tech",
    "Finance",
    "EdTech" /* Other sectors... */,
  ];

  return (
    <Form onSubmit={createPost}>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        maxLength={40}
        required
      />
      <Input
        type="text"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Tagline"
        maxLength={60}
        required
      />
      <Textarea
        value={elevatorPitch}
        onChange={(e) => setElevatorPitch(e.target.value)}
        placeholder="Elevator Pitch"
        maxLength={150}
        required
      />
      <Select
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        required
      >
        <option value="">Select a sector</option>
        {SECTORS.map((sector) => (
          <option value={sector} key={sector}>
            {sector}
          </option>
        ))}
      </Select>
      <ImageUpload
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        required
      />
      <TeamInput
        type="text"
        value={teamInput}
        onChange={(e) => setTeamInput(e.target.value)}
        onKeyDown={handleTeamInput}
        placeholder="Team"
        maxLength={40}
      />

      {team.map((member, index) => (
        <TeamMember key={index}>
          {member}
          <AiOutlineCloseCircle onClick={() => removeTeamMember(index)} />{" "}
          {/* Use the AiOutlineCloseCircle icon */}
        </TeamMember>
      ))}
      <InvestorsInput
        type="text"
        value={investorsInput}
        onChange={(e) => setInvestorsInput(e.target.value)}
        onKeyDown={handleInvestorsInput}
        placeholder="Investors"
        maxLength={40}
      />
      {investors.map((investor, index) => (
        <Investor key={index}>
          {investor}
          <AiOutlineCloseCircle onClick={() => removeInvestor(index)} />{" "}
        </Investor>
      ))}
      <Input
        type="text"
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        placeholder="Stage"
        required
      />
      <Input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Website"
        required
      />
      <Input
        type="text"
        value={pitchPresentation}
        onChange={(e) => setPitchPresentation(e.target.value)}
        placeholder="Pitch Presentation (Link)"
        required
      />
      <Input
        type="text"
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        placeholder="Video Link (Optional)"
      />
      <SmallText>Video link is highly recommended</SmallText>
      <label>
        Are you looking for a co-founder?
        <Select
          value={isFullTime ? "yes" : "no"}
          onChange={(e) => setIsFullTime(e.target.value === "yes")}
          required
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </Select>
      </label>

      <Button type="submit" disabled={isLoading || isImageLoading}>
        {isLoading ? <Spinner /> : "Create Post"}
      </Button>
      {showSuccess && (
        <Popup>
          <SuccessMessage>Post created successfully!</SuccessMessage>
        </Popup>
      )}
    </Form>
  );
};

const Form = styled.form`
  display: grid;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
`;

const ImageUpload = styled.input`
  width: 100%;
  padding: 0.5rem;
`;

const TeamInput = styled.input`
  width: 100%;
  padding: 0.5rem;
`;

const TeamMember = styled.div`
  /* Style for team members */
`;

const InvestorsInput = styled.input`
  width: 100%;
  padding: 0.5rem;
`;

const Investor = styled.div`
  /* Style for investors */
`;

const Checkbox = styled.input`
  margin-left: 0.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled(RiLoader4Line)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Popup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessMessage = styled.p`
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 4px;
`;

const SmallText = styled.p`
  font-size: 12px;
  color: #888;
`;

export default PostForm;
