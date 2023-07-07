import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Comments from "./Comments";
import { AuthContext } from "../context/AuthContext";
import styled from "styled-components";
import Modal from "react-modal";
import { IoMdArrowDropupCircle } from "react-icons/io";

const PostContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PostTitle = styled.h3`
  margin-top: 20px;
`;

const PostImage = styled.img`
  max-width: 100%;
  margin-top: 20px;
`;

const UpvoteIcon = styled(IoMdArrowDropupCircle)`
  cursor: pointer;
  color: ${(props) => (props.upvoted ? "#4b59f4" : "grey")};
`;

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false); // Track the upvote status
  const [userBookmarkCollections, setUserBookmarkCollections] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  console.log(upvoted);

  const userId = currentUser?.uid;

  const handleBookmark = async (collectionId, postId) => {
    console.log(collectionId);
    try {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        let bookmarks = userData.bookmarks || [];

        const collectionIndex = bookmarks.findIndex(
          (collection) => collection.id === collectionId
        );
        if (collectionIndex !== -1) {
          // Collection already exists. Update the posts array in the collection.
          const collection = bookmarks[collectionIndex];
          if (!collection.posts.includes(postId)) {
            collection.posts.push(postId);
            await updateDoc(userRef, { bookmarks: bookmarks });
          } else {
            alert("This post is already bookmarked in this collection.");
          }
        } else {
          // Collection does not exist. Create a new collection.
          const newCollection = {
            id: collectionId,
            name: "New Collection", // Change this as per your requirement
            posts: [postId],
          };
          await updateDoc(userRef, { bookmarks: arrayUnion(newCollection) });
        }
      }
    } catch (error) {
      console.error("Error updating bookmark: ", error);
    }
  };

  const handleNewCollection = async () => {
    const collectionName = newCollectionName.trim();

    if (collectionName === "") {
      alert("Collection name cannot be empty.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        let bookmarks = userData.bookmarks || [];

        const existingCollection = bookmarks.find(
          (collection) => collection.name === collectionName
        );
        if (existingCollection) {
          alert(
            "A collection with this name already exists. Please choose a different name."
          );
          return;
        }

        const newCollection = {
          id: Date.now().toString(), // Use current timestamp as ID
          name: collectionName,
          posts: [postId],
        };
        await updateDoc(userRef, { bookmarks: arrayUnion(newCollection) });
        setUserBookmarkCollections([...bookmarks, newCollection]);
        setNewCollectionName(""); // Clear the input field after creating the collection
      }
    } catch (error) {
      console.error("Error creating new collection: ", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpvote = async () => {
    const postRef = doc(db, "posts", postId);
    const userRef = doc(db, "users", userId);

    try {
      const postSnapshot = await getDoc(postRef);
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        let upvoters = postData.upvoters || [];

        if (upvoters.includes(userId)) {
          // The user has already upvoted. Undo the upvote.
          upvoters = upvoters.filter((uid) => uid !== userId);
          setUpvoted(false);
          // Also remove the post from the user's upvotedPosts
          await updateDoc(userRef, {
            upvotedPosts: arrayRemove(postId),
          });
        } else {
          // The user has not yet upvoted. Add their upvote.
          upvoters.push(userId);
          setUpvoted(true);
          // Also add the post to the user's upvotedPosts
          await updateDoc(userRef, {
            upvotedPosts: arrayUnion(postId),
          });
        }

        await updateDoc(postRef, {
          upvoters: upvoters,
        });

        setPost((prevPost) => ({
          ...prevPost,
          upvoters: upvoters,
        }));
      }
    } catch (error) {
      console.error("Error updating upvote: ", error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = doc(db, "posts", postId);
        const snapshot = await getDoc(postDoc);
        if (snapshot.exists()) {
          const postData = snapshot.data();

          // Fetch the upvotes for this post
          const upvotesCollection = collection(db, "upvotes");
          const postUpvotesQuery = query(
            upvotesCollection,
            where("postId", "==", postId)
          );
          const postUpvotesSnapshot = await getDocs(postUpvotesQuery);
          const postUpvotesCount = postUpvotesSnapshot.size;

          setPost({ id: snapshot.id, upvotes: postUpvotesCount, ...postData });
          setLoading(false);

          // Update the upvoted state based on the current user's upvote status
          const userUpvoteQuery = query(
            upvotesCollection,
            where("userId", "==", userId),
            where("postId", "==", postId)
          );
          const userUpvoteSnapshot = await getDocs(userUpvoteQuery);
          const userHasUpvoted = !userUpvoteSnapshot.empty;
          setUpvoted(userHasUpvoted);
        } else {
          console.log("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const userBookmarkCollections = userData.bookmarks || [];
          setUserBookmarkCollections(userBookmarkCollections);
          // Now check for the existence of the postId in the user's upvotedPosts
          if (userData.upvotedPosts && userData.upvotedPosts.includes(postId)) {
            setUpvoted(true);
          } else {
            setUpvoted(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUser();
    fetchPost();
  }, [postId, userId]);

  if (loading) {
    return <div>Loading...</div>; // Or your custom loader
  }

  return (
    <PostContainer>
      <h2>Post Details</h2>
      {post && (
        <>
          <PostTitle>{post?.team}</PostTitle>
          <p>{post?.title}</p>
          {post?.image && <PostImage src={post.image} alt="Post Image" />}
          <p>Upvotes: {post?.upvoters?.length || 0}</p>
          <UpvoteIcon
            size={24}
            onClick={() => handleUpvote(post?.id)}
            upvoted={post?.upvoters?.includes(userId)}
          />

          <button onClick={handleOpenModal}>Bookmark</button>

          <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal}>
            <h2>Select a Collection</h2>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
            >
              {userBookmarkCollections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleBookmark(selectedCollectionId, postId)}
            >
              Add to selected collection
            </button>

            <h2>Or create a new Collection</h2>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Enter new collection name"
            />
            <button onClick={handleNewCollection}>Create new collection</button>
          </Modal>
        </>
      )}

      <Comments postId={postId} userId={userId} />
    </PostContainer>
  );
};

export default PostDetails;

// const fetchPost = async () => {
//   try {
//     const postDoc = doc(db, "posts", postId);
//     const snapshot = await getDoc(postDoc);
//     if (snapshot.exists()) {
//       const postData = snapshot.data();
//       setPost({ id: snapshot.id, ...postData });
//       setLoading(false);

//       // Update the upvoted state based on the current user's upvote status
//       if (postData.upvoters && postData.upvoters.includes(userId)) {
//         setUpvoted(true);
//       } else {
//         setUpvoted(false);
//       }
//     } else {
//       console.log("Post not found");
//     }
//   } catch (error) {
//     console.error("Error fetching post:", error);
//   }
// };

// const fetchUser = async () => {
//   try {
//     const userRef = doc(db, "users", userId);
//     const userSnapshot = await getDoc(userRef);
//     if (userSnapshot.exists()) {
//       const userData = userSnapshot.data();
//       const userBookmarkCollections = userData.bookmarks || [];
//       setUserBookmarkCollections(userBookmarkCollections);
//     }
//   } catch (error) {
//     console.error("Error fetching user data: ", error);
//   }
// };

// const handleUpvote = async () => {
//   const postRef = doc(db, "posts", postId);

//   try {
//     const postSnapshot = await getDoc(postRef);
//     if (postSnapshot.exists()) {
//       const postData = postSnapshot.data();
//       const upvoters = postData.upvoters || [];

//       const updatedUpvotes = postData.upvotes + (upvoted ? -1 : 1);
//       const updatedUpvoters = upvoted
//         ? arrayRemove(userId)
//         : arrayUnion(userId);

//       await updateDoc(postRef, {
//         upvotes: updatedUpvotes,
//         upvoters: updatedUpvoters,
//       });

//       setPost((prevPost) => ({
//         ...prevPost,
//         upvotes: updatedUpvotes,
//       }));

//       setUpvoted(!upvoted); // Toggle the upvoted state
//     }
//   } catch (error) {
//     console.error("Error updating upvote: ", error);
//   }
// };

// const handleUpvote = async () => {
//   const postRef = doc(db, "posts", postId);

//   try {
//     const postSnapshot = await getDoc(postRef);
//     if (postSnapshot.exists()) {
//       const postData = postSnapshot.data();
//       let upvoters = postData.upvoters || [];

//       if (upvoters.includes(userId)) {
//         // The user has already upvoted. Undo the upvote.
//         upvoters = upvoters.filter((uid) => uid !== userId);
//         setUpvoted(false);
//       } else {
//         // The user has not yet upvoted. Add their upvote.
//         upvoters.push(userId);
//         setUpvoted(true);
//       }

//       await updateDoc(postRef, {
//         upvoters: upvoters,
//       });

//       setPost((prevPost) => ({
//         ...prevPost,
//         upvoters: upvoters,
//       }));
//     }
//   } catch (error) {
//     console.error("Error updating upvote: ", error);
//   }
// };

// const handleUpvote = async () => {
//   const upvotesCollection = collection(db, "upvotes");
//   const upvoteQuery = query(
//     upvotesCollection,
//     where("userId", "==", userId),
//     where("postId", "==", postId)
//   );

//   const upvoteSnapshot = await getDocs(upvoteQuery);
//   const userHasUpvoted = !upvoteSnapshot.empty;

//   if (userHasUpvoted) {
//     // If the user has already upvoted, remove the upvote
//     const upvoteDocId = upvoteSnapshot.docs[0].id;
//     const upvoteDocRef = doc(db, "upvotes", upvoteDocId);
//     await deleteDoc(upvoteDocRef);
//     setUpvoted(false);
//   } else {
//     // If the user has not yet upvoted, add the upvote
//     await addDoc(upvotesCollection, { userId, postId });
//     setUpvoted(true);
//   }

//   // Fetch the updated post data
//   const postRef = doc(db, "posts", postId);
//   const postSnapshot = await getDoc(postRef);
//   const postData = postSnapshot.data();
//   const postUpvotesQuery = query(
//     upvotesCollection,
//     where("postId", "==", postId)
//   );
//   const postUpvotesSnapshot = await getDocs(postUpvotesQuery);
//   const postUpvotesCount = postUpvotesSnapshot.size;

//   setPost({
//     ...postData,
//     upvotes: postUpvotesCount,
//   });
// };
