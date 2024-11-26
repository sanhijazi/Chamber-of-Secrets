import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

function Nav() {
  return (
    <Flex>
        <Header>
        <NavLinkStyled to="/">Chamber of Secrets - Data Visualisation</NavLinkStyled>
        </Header>
        <Header>Hussein Hijazi - Mohammad Abdlaal</Header>
    </Flex>
  )
}

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  height: 100px;
  color: white;
`;

const Flex = styled.div`
  display: flex;
  width: 100%;
  padding: 0px 10vw;
  justify-content: space-between;
  background-color: #7494f4;
`;

const NavLinkStyled = styled(NavLink)`
  text-decoration: none;
  color: white; // Change to your preferred color
  &:hover {
    text-decoration: underline; // Optional: Add hover effect
  }
  &.active {
    font-weight: bold; // Style for active link
  }
`;

export default Nav