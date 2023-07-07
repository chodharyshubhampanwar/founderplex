import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import styled from "styled-components";

const Navigation = styled.nav`
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  max-height: 64px;
  min-height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  background-color: #fff; /* Adjust the background color with some transparency */
  font-family: "Arial", sans-serif;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
  backdrop-filter: blur(4px); /* Add a blur effect */
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
  /* Add a subtle box shadow */

  @media (max-width: 768px) {
    padding: 16px 8px;
  }

  &.scrolled {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(6px);
  }
`;

const Logo = styled.div`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
`;

const Menu = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-grow: 1;
  margin-left: 32px;

  @media (max-width: 768px) {
    display: ${({ open }) => (open ? "flex" : "none")};
    flex-direction: column;
    align-items: center;
    position: absolute;
    margin-left: 0;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #5865f2;
    padding: 16px;
  }
`;

const MenuItem = styled(NavLink)`
  color: #15141a; /* Updated color */
  font-size: 16px;
  text-decoration: none;
  margin-right: 16px;
  letter-spacing: -0.02em;
  line-height: 19px;
  padding: 30px 10px;
  transition: color 0.15s;
  position: relative;

  &:hover {
    .hover-box {
      opacity: 1;
      pointer-events: auto;
    }
  } /* Add transition effect */

  &:last-child {
    margin-right: 0;
  }

  &.active {
    font-weight: normal; /* Remove font-weight: bold */
  }

  &:hover {
    color: #5b5b66; /* Updated color on hover */
  }

  @media (max-width: 768px) {
    margin: 8px 0;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }

  &:hover {
    background-color: #6975ff;
  }
`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Navigation>
      <Logo>Your Logo</Logo>
      <Menu open={menuOpen}>
        <MenuItem exact to="/home" activeClassName="active">
          Home
        </MenuItem>
        <MenuItem exact to="/posts" activeClassName="active">
          Start Here
        </MenuItem>
        <MenuItem exact to="/signin" activeClassName="active">
          Sign In
        </MenuItem>
        <MenuItem exact to="/signup" activeClassName="active">
          Sign Up
        </MenuItem>
      </Menu>
      <MobileMenuButton onClick={toggleMenu}>
        {menuOpen ? <RiCloseLine /> : <RiMenuLine />}
      </MobileMenuButton>
    </Navigation>
  );
};

export default Navbar;
