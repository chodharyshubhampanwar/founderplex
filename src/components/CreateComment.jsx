import React, { useState, useContext } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const CreateComment = ({ postId, parentCommentId, onReply }) => {
  const [comment, setComment] = useState("");
  const { currentUser, username } = useContext(AuthContext);

  const userId = currentUser?.uid;

  console.log(username, "username====>");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        postId: postId,
        userId: userId,
        parentCommentId: parentCommentId || null,
        text: comment,
        upvotes: 0,
        replies: [],
        upvoters: [],
        username: username,
      });
      console.log("Document written with ID: ", docRef.id);
      setComment("");
      onReply(); // Call the onReply function to reset the reply state in the parent component
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateComment;
