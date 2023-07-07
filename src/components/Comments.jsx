import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import CreateComment from "./CreateComment";
import styled from "styled-components";
import { BiMessageRoundedDots } from "react-icons/bi";
import { AuthContext } from "../context/AuthContext";

const CommentContainer = styled.div`
  margin-left: ${(props) => (props.depth > 0 ? `${props.depth * 20}px` : "0")};
  position: relative;
`;

const CommentContent = styled.div`
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
`;

const CommentText = styled.p`
  margin: 0;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
`;

const ReplyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 0.8em;
  display: flex;
  align-items: center;
`;

const ReplyIcon = styled(BiMessageRoundedDots)`
  margin-right: 5px;
`;

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentLine = styled.div`
  position: absolute;
  background-color: #ddd;
  width: 1px;
  top: -10px;
  bottom: 0;
  left: -10px;
  margin-left: ${(props) => (props.depth > 0 ? `${props.depth * 20}px` : "0")};
`;

const ReplyContainer = styled.div`
  margin-left: 40px;
`;

const SortDropdown = styled.select`
  margin-top: 10px;
`;

const Comments = ({ postId, parentCommentId = null, depth = 0 }) => {
  const [comments, setComments] = useState([]);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [sortOption, setSortOption] = useState("upvotes");

  const { username, currentUser } = useContext(AuthContext);

  const userId = currentUser?.uid;

  console.log(username, userId, "fgfgfg===");

  const handleUpvote = async (commentId, userId) => {
    const commentRef = doc(db, "comments", commentId);

    try {
      const commentSnapshot = await getDoc(commentRef);
      if (commentSnapshot.exists()) {
        const commentData = commentSnapshot.data();

        await updateDoc(commentRef, {
          upvotes: commentData.upvoters.includes(userId)
            ? commentData.upvotes - 1
            : commentData.upvotes + 1,
          upvoters: commentData.upvoters.includes(userId)
            ? arrayRemove(userId)
            : arrayUnion(userId),
        });
      }
    } catch (error) {
      console.error("Error updating upvote: ", error);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      where("parentCommentId", "==", parentCommentId),
      orderBy(sortOption, "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      setComments(comments);
    });

    return () => unsubscribe();
  }, [postId, parentCommentId, sortOption]);

  const handleReply = (commentId) => {
    setReplyToCommentId(commentId);
  };

  const resetReply = () => {
    // Function to reset the reply state when a reply is submitted or cancelled
    setReplyToCommentId(null);
  };

  const handleSortChange = (e) => {
    // Function to handle changing the sort option
    setSortOption(e.target.value);
  };

  return (
    <CommentsContainer>
      {parentCommentId === null && (
        <SortDropdown value={sortOption} onChange={handleSortChange}>
          <option value="upvotes">Sort by Upvotes</option>
          <option value="timestamp">Sort by Most Recent</option>
        </SortDropdown>
      )}
      {comments.map((comment) => (
        <CommentContainer key={comment.id} depth={depth}>
          {depth > 0 && <CommentLine depth={depth} />}
          <CommentContent>
            <CommentText>{comment.text}</CommentText>
            <CommentMeta>
              <p>Username: {comment.username}</p> {/* Display the username */}
              <p>Upvotes: {comment.upvotes}</p>
              <button onClick={() => handleUpvote(comment.id, userId)}>
                {comment.upvoters.includes(userId) ? "Un-Upvote" : "Upvote"}
              </button>
              {userId === comment.userId && (
                <button onClick={() => handleDelete(comment.id)}>Delete</button>
              )}
              <ReplyButton onClick={() => handleReply(comment.id)}>
                <ReplyIcon />
                Reply
              </ReplyButton>
            </CommentMeta>
            {replyToCommentId === comment.id && (
              <ReplyContainer>
                <CreateComment
                  postId={postId}
                  userId={userId}
                  parentCommentId={comment.id}
                  onReply={resetReply}
                />
              </ReplyContainer>
            )}
          </CommentContent>
          <Comments
            postId={postId}
            userId={userId}
            parentCommentId={comment.id}
            depth={depth + 1}
          />
        </CommentContainer>
      ))}
      {depth === 0 && parentCommentId === null && (
        <CommentContainer depth={depth}>
          <div>
            <CreateComment
              postId={postId}
              userId={userId}
              parentCommentId={parentCommentId}
              onReply={resetReply}
            />
          </div>
        </CommentContainer>
      )}
    </CommentsContainer>
  );
};

export default Comments;
