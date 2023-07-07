import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  query,
  where,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import BookmarkCollection from "./BookmarkCollection";
import { db } from "../firebase";

const Bookmarks = () => {
  const { username } = useParams();
  const [userBookmarkCollections, setUserBookmarkCollections] = useState([]);
  const [userId, setUserId] = useState(null);

  console.log(userId, "userId===>");

  console.log(userBookmarkCollections);

  const handleRemoveCollection = async (collectionId) => {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const bookmarks = userData.bookmarks || [];
      const updatedBookmarks = bookmarks.filter(
        (collection) => collection.id !== collectionId
      );
      await updateDoc(userRef, { bookmarks: updatedBookmarks });
      setUserBookmarkCollections(updatedBookmarks); // Update the state
    }
  };

  const handleEditCollection = async (collectionId, newCollectionName) => {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const bookmarkCollections = userData.bookmarks || [];
      const collectionToUpdate = bookmarkCollections.find(
        (collection) => collection.id === collectionId
      );
      if (collectionToUpdate) {
        collectionToUpdate.name = newCollectionName;
        await updateDoc(userRef, { bookmarks: bookmarkCollections });
        setUserBookmarkCollections([...bookmarkCollections]); // Update the state
      }
    }
  };

  const handleRemoveItem = async (collectionId, itemId) => {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const bookmarkCollections = userData.bookmarks || [];
      const collectionToUpdate = bookmarkCollections.find(
        (collection) => collection.id === collectionId
      );
      if (collectionToUpdate) {
        collectionToUpdate.posts = collectionToUpdate.posts.filter(
          (postId) => postId !== itemId
        );
        await updateDoc(userRef, { bookmarks: bookmarkCollections });
        setUserBookmarkCollections([...bookmarkCollections]); // Update the state
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data(); // Assuming there's no "userData" field
          const userBookmarkCollections = userData.bookmarks || [];
          setUserId(userDoc.id); // save the user's id
          setUserBookmarkCollections(userBookmarkCollections);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUser();
  }, [username]);

  return (
    <div>
      <h2>{username}'s Bookmarks</h2>

      {userBookmarkCollections.map((collection) => (
        <BookmarkCollection
          key={collection.id}
          collection={collection}
          onRemoveItem={handleRemoveItem}
          onRemoveCollection={handleRemoveCollection}
          onEditCollection={handleEditCollection}
        />
      ))}
    </div>
  );
};

export default Bookmarks;
