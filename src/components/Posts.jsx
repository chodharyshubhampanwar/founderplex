import { useState, useEffect, useContext } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  addDoc,
  deleteDoc,
  where,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import styled from "styled-components";
import Skeleton from "@mui/material/Skeleton";
import { IoMdArrowDropupCircle } from "react-icons/io";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [upvoteChange, setUpvoteChange] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const userId = currentUser?.uid;

  console.log(upvoteChange);

  const handleUpvote = async (postId) => {
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
        } else {
          // The user has not yet upvoted. Add their upvote.
          upvoters.push(userId);
        }

        await updateDoc(postRef, {
          upvoters: upvoters,
        });

        // Update the user's upvotedPosts field
        if (upvoters.includes(userId)) {
          await updateDoc(userRef, {
            upvotedPosts: arrayUnion(postId),
          });
        } else {
          await updateDoc(userRef, {
            upvotedPosts: arrayRemove(postId),
          });
        }

        setUpvoteChange((prev) => !prev); // Toggle the state to trigger re-fetching posts
      }
    } catch (error) {
      console.error("Error updating upvote: ", error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "posts");
        const upvotesCollection = collection(db, "upvotes");

        const unsubscribe = onSnapshot(postsCollection, async (snapshot) => {
          const postList = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const postId = doc.id;
              const postUpvotesQuery = query(
                upvotesCollection,
                where("postId", "==", postId)
              );
              const postUpvotesSnapshot = await getDocs(postUpvotesQuery);
              const postUpvotesCount = postUpvotesSnapshot.size;
              const upvoted = postUpvotesSnapshot.docs
                .map((doc) => doc.data().userId)
                .includes(userId);
              return {
                id: postId,
                upvotes: postUpvotesCount,
                upvoted: upvoted,
                ...doc.data(),
              };
            })
          );

          postList.sort((a, b) => b.upvotes - a.upvotes);

          setPosts(postList);
          setError(null);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Error fetching posts");
      }
    };

    fetchPosts();
  }, [upvoteChange, userId]);

  console.log(posts);
  if (error) {
    return <p>{error}</p>; // Display an error message if there was an error fetching the posts
  }

  return (
    <PostsContainer>
      {posts.length > 0
        ? posts.map((post) => (
            <PostItem key={post?.id}>
              <Link to={`/posts/${post?.id}`}>
                <ImageContainer>
                  {post?.image && <Image src={post?.image} alt="Post Image" />}
                </ImageContainer>
              </Link>
              <PostDetails>
                <Link to={`/posts/${post?.id}`}>
                  <Title>{post?.title}</Title>
                </Link>
                <Tagline>{post?.tagline}</Tagline>
                <SubDetails>
                  <Sector>{post?.sector}</Sector>
                  <Stage>{post?.stage}</Stage>
                </SubDetails>
              </PostDetails>
              <Column>
                <Count>{post?.upvoters?.length || 0}</Count>
                <UpvoteIcon
                  size={24}
                  onClick={() => handleUpvote(post?.id)}
                  upvoted={post?.upvoters?.includes(userId)}
                />
              </Column>
            </PostItem>
          ))
        : Array.from({ length: 10 }).map((_, index) => (
            <PostItem key={index}>
              <ImageContainer>
                <Skeleton variant="rectangular" width={80} height={80} />
              </ImageContainer>
              <PostDetails>
                <Title>
                  <Skeleton variant="text" width={150} height={20} />
                </Title>
                <Tagline>
                  <Skeleton variant="text" width={100} height={15} />
                </Tagline>
                <SubDetails>
                  <Sector>
                    <Skeleton variant="text" width={100} height={15} />
                  </Sector>
                  <Stage>
                    <Skeleton variant="text" width={100} height={15} />
                  </Stage>
                </SubDetails>
              </PostDetails>
              <Column>
                <Count>
                  <Skeleton variant="text" width={40} height={15} />
                </Count>
                <Skeleton variant="circular" width={30} height={30} />
              </Column>
            </PostItem>
          ))}
    </PostsContainer>
  );
};

export default Posts;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PostItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 10px;
  margin-bottom: 10px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ImageContainer = styled.div`
  align-items: center;
  border-radius: 10px;
  display: flex;
  flex-shrink: 0;
  height: 80px;
  justify-content: center;
  overflow: hidden;
  width: 80px; // fixed width
  flex-basis: 80px; // add this
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px; // fixed width
  flex-shrink: 0; // add this
`;

const Image = styled.img`
  width: 100%;
`;

const PostDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
`;

const Title = styled.h3`
  margin: 0;
`;

const Tagline = styled.p`
  margin: 0;
`;

const SubDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const Sector = styled.p`
  margin: 0;
`;

const Stage = styled.p`
  margin: 0;
`;

const Count = styled.p`
  margin: 0;
`;

const UpvoteIcon = styled(IoMdArrowDropupCircle)`
  cursor: pointer;
  color: ${(props) => (props.upvoted ? "#4b59f4" : "grey")};
`;

// import { useState, useEffect, useContext } from "react";
// import {
//   collection,
//   onSnapshot,
//   query,
//   orderBy,
//   doc,
//   updateDoc,
//   arrayUnion,
//   arrayRemove,
//   getDocs,
//   addDoc,
//   deleteDoc,
//   where,
//   setDoc,
//   getDoc,
// } from "firebase/firestore";
// import { Link } from "react-router-dom";
// import { db } from "../firebase";
// import { AuthContext } from "../context/AuthContext";
// import styled from "styled-components";
// import { AiFillHeart } from "react-icons/ai";

// const Posts = () => {
//   const [posts, setPosts] = useState([]);
//   const [error, setError] = useState(null);
//   const [upvoteChange, setUpvoteChange] = useState(false);
//   const { currentUser } = useContext(AuthContext);
//   const userId = currentUser?.uid;

//   console.log(upvoteChange);

//   // const handleUpvote = async (postId) => {
//   //   const upvotesCollection = collection(db, "upvotes");
//   //   const upvoteQuery = query(
//   //     upvotesCollection,
//   //     where("userId", "==", userId),
//   //     where("postId", "==", postId)
//   //   );

//   //   const upvoteSnapshot = await getDocs(upvoteQuery);
//   //   const userHasUpvoted = !upvoteSnapshot.empty;

//   //   if (userHasUpvoted) {
//   //     // If the user has already upvoted, remove the upvote
//   //     const upvoteDocId = upvoteSnapshot.docs[0].id;
//   //     const upvoteDocRef = doc(db, "upvotes", upvoteDocId);
//   //     await deleteDoc(upvoteDocRef);
//   //   } else {
//   //     // If the user has not yet upvoted, add the upvote
//   //     await addDoc(upvotesCollection, { userId, postId });
//   //   }

//   //   setUpvoteChange((prev) => !prev); // Toggle the state to trigger re-fetching posts
//   // };

//   const handleUpvote = async (postId) => {
//     const upvotesCollection = collection(db, "upvotes");
//     const postRef = doc(db, "posts", postId);
//     const userRef = doc(db, "users", userId);

//     const upvoteQuery = query(
//       upvotesCollection,
//       where("userId", "==", userId),
//       where("postId", "==", postId)
//     );

//     const upvoteSnapshot = await getDocs(upvoteQuery);
//     const userHasUpvoted = !upvoteSnapshot.empty;

//     try {
//       // Check if the user's document exists
//       const userSnapshot = await getDoc(userRef);
//       if (!userSnapshot.exists()) {
//         // If the user's document does not exist, create it
//         await setDoc(userRef, { upvotedPosts: [] });
//       }

//       if (userHasUpvoted) {
//         // If the user has already upvoted, remove the upvote
//         const upvoteDocId = upvoteSnapshot.docs[0].id;
//         const upvoteDocRef = doc(db, "upvotes", upvoteDocId);
//         await deleteDoc(upvoteDocRef);

//         // Also remove the post from the user's upvotedPosts
//         await updateDoc(userRef, {
//           upvotedPosts: arrayRemove(postId),
//         });
//       } else {
//         // If the user has not yet upvoted, add the upvote
//         await addDoc(upvotesCollection, { userId, postId });

//         // Also add the post to the user's upvotedPosts
//         await updateDoc(userRef, {
//           upvotedPosts: arrayUnion(postId),
//         });
//       }

//       setUpvoteChange((prev) => !prev); // Toggle the state to trigger re-fetching posts
//     } catch (error) {
//       console.error("Error updating upvote: ", error);
//     }
//   };

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const postsCollection = collection(db, "posts");
//         const upvotesCollection = collection(db, "upvotes");

//         const unsubscribe = onSnapshot(postsCollection, async (snapshot) => {
//           const postList = await Promise.all(
//             snapshot.docs.map(async (doc) => {
//               const postId = doc.id;
//               const postUpvotesQuery = query(
//                 upvotesCollection,
//                 where("postId", "==", postId)
//               );
//               const postUpvotesSnapshot = await getDocs(postUpvotesQuery);
//               const postUpvotesCount = postUpvotesSnapshot.size;
//               return {
//                 id: postId,
//                 upvotes: postUpvotesCount,
//                 ...doc.data(),
//               };
//             })
//           );

//           postList.sort((a, b) => b.upvotes - a.upvotes);

//           setPosts(postList);
//           setError(null);
//         });

//         return unsubscribe;
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//         setError("Error fetching posts");
//       }
//     };

//     const fetchUser = async () => {
//       try {
//         const userRef = doc(db, "users", userId);
//         const userSnapshot = await getDoc(userRef);
//         if (userSnapshot.exists()) {
//           const userData = userSnapshot.data();
//           // Now check for the existence of the postId in the user's upvotedPosts
//           if (userData.upvotedPosts && userData.upvotedPosts.includes(postId)) {
//             // Update the 'upvoted' property of the post object
//             setPost((prevPost) => ({
//               ...prevPost,
//               upvoted: true,
//             }));
//           } else {
//             // Update the 'upvoted' property of the post object
//             setPost((prevPost) => ({
//               ...prevPost,
//               upvoted: false,
//             }));
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching user data: ", error);
//       }
//     };

//     fetchUser();
//     fetchPosts();
//   }, []);

//   console.log(posts);
//   if (error) {
//     return <p>{error}</p>; // Display an error message if there was an error fetching the posts
//   }

//   return (
//     <PostsContainer>
//       {posts.map((post) => (
//         <PostItem key={post?.id}>
//           <Link to={`/posts/${post?.id}`}>
//             <ImageContainer>
//               {post?.image && <Image src={post?.image} alt="Post Image" />}
//             </ImageContainer>
//           </Link>
//           <PostDetails>
//             <Link to={`/posts/${post?.id}`}>
//               <Title>{post?.title}</Title>
//             </Link>
//             <Tagline>{post?.tagline}</Tagline>
//             <SubDetails>
//               <Sector>{post?.sector}</Sector>
//               <Stage>{post?.stage}</Stage>
//             </SubDetails>
//           </PostDetails>
//           <Column>
//             <Count>{post?.upvoters?.length || 0}</Count>
//             <UpvoteIcon onClick={() => handleUpvote(post?.id)} />
//           </Column>
//         </PostItem>
//       ))}
//     </PostsContainer>
//   );
// };

// export default Posts;

// const PostsContainer = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const PostItem = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: flex-start;
//   gap: 10px;
//   padding: 10px;
//   margin-bottom: 10px;
//   width: 100%;

//   @media (max-width: 768px) {
//     flex-direction: column;
//     align-items: flex-start;
//   }
// `;

// const ImageContainer = styled.div`
//   align-items: center;
//   border-radius: 10px;
//   display: flex;
//   flex-shrink: 0;
//   height: 80px;
//   justify-content: center;
//   overflow: hidden;
//   width: 80px; // fixed width
//   flex-basis: 80px; // add this
// `;

// const Column = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 80px; // fixed width
//   flex-shrink: 0; // add this
// `;

// const Image = styled.img`
//   width: 100%;
// `;

// const PostDetails = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   flex-grow: 1;
// `;

// const Title = styled.h3`
//   margin: 0;
// `;

// const Tagline = styled.p`
//   margin: 0;
// `;

// const SubDetails = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 10px;
//   margin: 0;
// `;

// const Sector = styled.p`
//   margin: 0;
// `;

// const Stage = styled.p`
//   margin: 0;
// `;

// const Count = styled.p`
//   margin: 0;
// `;

// const UpvoteIcon = styled(AiFillHeart)`
//   cursor: pointer;
// `;

// const handleUpvote = async (postId) => {
//   const postRef = doc(db, "posts", postId);

//   try {
//     const postSnapshot = await getDoc(postRef);
//     if (postSnapshot.exists()) {
//       const postData = postSnapshot.data();
//       const upvoters = postData.upvoters || [];

//       await updateDoc(postRef, {
//         upvotes: upvoters.includes(userId)
//           ? postData.upvotes - 1
//           : postData.upvotes + 1,
//         upvoters: upvoters.includes(userId)
//           ? arrayRemove(userId)
//           : arrayUnion(userId),
//       });
//     }
//   } catch (error) {
//     console.error("Error updating upvote: ", error);
//   }
// };

// const fetchPosts = async () => {
//   try {
//     const postsCollection = collection(db, "posts");
//     const sortedPostsQuery = query(
//       postsCollection,
//       orderBy("upvotes", "desc")
//     );
//     const unsubscribe = onSnapshot(sortedPostsQuery, (snapshot) => {
//       const postList = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setPosts(postList);
//       setError(null);
//     });

//     return unsubscribe;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     setError("Error fetching posts");
//   }
// };

// const fetchPosts = async () => {
//   try {
//     const postsCollection = collection(db, "posts");
//     const upvotesCollection = collection(db, "upvotes");

//     const unsubscribe = onSnapshot(postsCollection, async (snapshot) => {
//       const postList = await Promise.all(
//         snapshot.docs.map(async (doc) => {
//           const postId = doc.id;
//           const postUpvotesQuery = query(
//             upvotesCollection,
//             where("postId", "==", postId),
//             where("userId", "==", userId)
//           );
//           const postUpvotesSnapshot = await getDocs(postUpvotesQuery);
//           const postUpvotesCount = postUpvotesSnapshot.size;
//           const upvoted = postUpvotesCount > 0;
//           return {
//             id: postId,
//             upvotes: postUpvotesCount,
//             upvoted: upvoted,
//             ...doc.data(),
//           };
//         })
//       );

//       postList.sort((a, b) => b.upvotes - a.upvotes);

//       setPosts(postList);
//       setError(null);
//     });

//     return unsubscribe;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     setError("Error fetching posts");
//   }
// };

// const handleUpvote = async (postId) => {
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
//   } else {
//     // If the user has not yet upvoted, add the upvote
//     await addDoc(upvotesCollection, { userId, postId });
//   }

//   const updatedUpvoteSnapshot = await getDocs(upvoteQuery);
//   const updatedUserHasUpvoted = !updatedUpvoteSnapshot.empty;

//   setUpvoteChange((prev) => !prev); // Toggle the state to trigger re-fetching posts
//   setUpvoted(updatedUserHasUpvoted); // Update the upvoted state based on the updated upvote status
// };

// const handleUpvote = async (postId) => {
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
//   } else {
//     // If the user has not yet upvoted, add the upvote
//     await addDoc(upvotesCollection, { userId, postId });
//   }

//   setUpvoteChange((prev) => !prev); // Toggle the state to trigger re-fetching posts
// };
