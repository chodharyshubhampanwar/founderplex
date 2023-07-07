import React from "react";
import styled from "styled-components";
import Posts from "../components/Posts";

const Container = styled.div`
  display: grid;

  grid-template-rows: 100px 1fr;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-areas: "left feed right";
  transition: all 0.5s ease-in-out;
  grid-template-areas:
    "nav nav nav"
    "leftPanel feed rightPanel";
  height: 100vh;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 100px 1fr 200px;
    grid-template-areas:
      "nav"
      "feed"
      "leftPanel"
      "rightPanel";
  }
`;

const Nav = styled.nav`
  grid-area: nav;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LeftPanel = styled.div`
  grid-area: leftPanel;
  background-color: #f2f2f2;
  padding: 20px;

  @media (max-width: 768px) {
    order: 3;
  }
`;

const Center = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 20px;
  grid-area: feed;
  background-color: #f2f2f2;

  @media (max-width: 768px) {
    order: 1;
  }
`;

const RightPanel = styled.div`
  grid-area: rightPanel;
  background-color: #f2f2f2;
  padding: 20px;

  @media (max-width: 768px) {
    order: 2;
  }
`;

const Feed = () => {
  return (
    <Container>
      <LeftPanel>
        <h2>Left Panel</h2>
        <p>This is the left panel content.</p>
      </LeftPanel>
      <Center>
        <h2>Center Scroll Feed</h2>
        <Posts />
      </Center>
      <RightPanel>
        <h2>Right Panel</h2>
        <p>This is the right panel content.</p>
      </RightPanel>
    </Container>
  );
};

export default Feed;
