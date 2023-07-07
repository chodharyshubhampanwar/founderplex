import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import PrivateRoute from "../routes/PrivatesRoute";
import {
  HOME,
  POSTS,
  POST_DETAILS,
  POST_FORM,
  SIGNIN,
  SIGNUP,
  START,
  USER_PROFILE,
  BOOKMARKS,
} from "../routes/routes";

import Login from "./Login";
import SignUp from "./SignUp";
import PostForm from "../components/CreatePost";
import Posts from "../components/Posts";
import PostDetails from "../components/PostDetails";
import UserProfile from "./UserProfile";
import Navbar from "../components/Navbar";
import AuthProvider from "../context/AuthContext";
import Bookmarks from "../components/Bookmarks";
import Feed from "./Feed";

const SignOutButton = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    setShowConfirmation(true);
  };

  const confirmSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out.");
        navigate("/");
      })
      .catch((error) => {
        console.log("An error occurred while signing out:", error);
      });
  };

  const cancelSignOut = () => {
    setShowConfirmation(false);
  };

  return (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>
      {showConfirmation && (
        <div>
          <p>Are you sure you want to sign out?</p>
          <button onClick={confirmSignOut}>Yes</button>
          <button onClick={cancelSignOut}>No</button>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  return (
    <Router>
      <AuthProvider>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="HOME" element={<Feed />} />

          <Route
            path="POSTS"
            element={
              <PrivateRoute>
                <Posts />
              </PrivateRoute>
            }
          />
          <Route
            path="/posts/:postId"
            element={
              <PrivateRoute>
                <PostDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/postForm"
            element={
              <PrivateRoute>
                <PostForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/start"
            element={
              <PrivateRoute>
                <SignOutButton />
              </PrivateRoute>
            }
          />
          <Route
            path="/:username"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/:username/bookmarks"
            element={
              <PrivateRoute>
                <Bookmarks />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default Home;
