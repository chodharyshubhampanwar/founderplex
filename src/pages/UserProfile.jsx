import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Bookmarks from "../components/Bookmarks";

const UserProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usernameDocRef = doc(db, "usernames", username);
        const usernameDocSnapshot = await getDoc(usernameDocRef);

        if (usernameDocSnapshot.exists()) {
          const userId = usernameDocSnapshot.data().userId;
          const userDocRef = doc(db, "users", userId);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            setUserData(userDocSnapshot.data());
          } else {
            console.log("User data not found.");
          }
        } else {
          console.log("Username not found.");
        }
      } catch (error) {
        console.log(error);
        // Handle error
      }
    };

    fetchUserData();
  }, [username]);

  return (
    <div>
      <h1>User Profile</h1>
      <p>Username: {userData?.username}</p>
      <p>Username: {userData?.title}</p>
      <p>Username: {userData?.location}</p>
      <Link to={`/${username}/bookmarks`}>Bookmarks</Link>
    </div>
  );
};

export default UserProfile;
