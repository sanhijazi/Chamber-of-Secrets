import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Picture from './pics/HomePic.svg';
import Nav from './nav';

function Home() {
  return (
    <>
    <Nav />
    <Container>
      <LeftSide>
        <Title>Global CO₂ Emissions</Title>
        <Subtitle>Understanding the Impact of Human Activity</Subtitle>
      </LeftSide>
      <Pic src={Picture} />
      <BottomSection>
        <Card>
          <NavLinkStyled to="/Section1">
            <CardTitle>Section 1</CardTitle>
            <CardDescription>An overview of global emissions, with different charts</CardDescription>
          </NavLinkStyled>
        </Card>
        <Card>
          <NavLinkStyled to="/Section2">
            <CardTitle>Section 2</CardTitle>
            <CardDescription>See how CO2 emissions is distributed between contents and countries using Alluvial</CardDescription>
          </NavLinkStyled>
        </Card>
        <Card>
          <NavLinkStyled to="/Section3">
          <CardTitle>Section 3</CardTitle>
          <CardDescription>Explore CO₂ emissions across the globe with interactive maps. Visualize emissions by country using various map projections and custom visualizations.</CardDescription>
          </NavLinkStyled>
        </Card>
      </BottomSection>
    </Container>
    </>

  );
}

const Container = styled.div`
  display: grid;
  width: 100%;
  height: 60vh;
  padding: 0px 10vw;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`;

const LeftSide = styled.div`
  text-align: left;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 50px;
`;

const Subtitle = styled.h2`
  margin: 0;
  font-weight: 200;
`;

const Pic = styled.img`
  display: block;
  margin: 0 auto;
`;

const BottomSection = styled.div`
  grid-column: span 2;
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 30px;
  padding: 20px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 400px;
  height: 200px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const CardTitle = styled.div`
  font-size: 18px;
  width: 100%;
  padding: 10px 0px;
  background-color: #7494f4;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
`;

const CardDescription = styled.div`
  font-size: 14px;
  color: #555;
`;

const NavLinkStyled = styled(NavLink)`
  text-decoration: none;
  color: inherit;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Home;