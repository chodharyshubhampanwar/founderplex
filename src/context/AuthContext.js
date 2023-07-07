import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, onAuthStateChanged, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  console.log(username, "username====>");

  const fetchUsernameFromDatabase = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.username;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      throw new Error("Error fetching username: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    if (currentUser) {
      const fetchUsername = async () => {
        try {
          const username = await fetchUsernameFromDatabase(currentUser.uid);
          setUsername(username);
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      };

      fetchUsername();
    }

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, username }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
