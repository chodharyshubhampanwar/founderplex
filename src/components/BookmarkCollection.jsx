import React, { useContext } from "react";
import styled from "styled-components";
import { AuthContext } from "../context/AuthContext";

const CollectionContainer = styled.div`
  margin-bottom: 20px;
`;

const CollectionTitle = styled.h3`
  margin-bottom: 10px;
`;

const PostItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const PostId = styled.div`
  margin-right: 10px;
`;

const Button = styled.button`
  background-color: #5865f2;
  color: #fff;
  margin-right: 10px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #3f4dbb;
  }
`;

const BookmarkCollection = ({
  collection,
  onRemoveCollection,
  onEditCollection,
  onRemoveItem,
}) => {
  const { currentUser, username } = useContext(AuthContext);

  const user = currentUser?.uid;

  console.log(user, "usernId====>");

  const handleEditButtonClick = () => {
    const newCollectionName = prompt("Enter the new collection name");
    if (newCollectionName) {
      onEditCollection(collection.id, newCollectionName);
    }
  };

  const handleRemoveButtonClick = () => {
    if (window.confirm("Are you sure you want to remove this collection?")) {
      onRemoveCollection(collection.id);
    }
  };

  const handleRemoveItemButtonClick = (postId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      onRemoveItem(collection.id, postId);
    }
  };

  const isOwner = user && user.id === collection.ownerId;

  return (
    <CollectionContainer>
      <CollectionTitle>{collection.name}</CollectionTitle>
      {collection.posts.map((postId) => (
        <PostItem key={postId}>
          <PostId>{postId}</PostId>
          {isOwner && (
            <Button onClick={() => handleRemoveItemButtonClick(postId)}>
              Remove Item
            </Button>
          )}
        </PostItem>
      ))}
      {isOwner && (
        <>
          <Button onClick={handleEditButtonClick}>Edit Collection Name</Button>
          <Button onClick={handleRemoveButtonClick}>Remove Collection</Button>
        </>
      )}
    </CollectionContainer>
  );
};

export default BookmarkCollection;
