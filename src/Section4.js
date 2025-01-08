import React from "react";
import styled from "styled-components";
import Nav from "./nav";
import RadarChart from "./Radarchart";
import LineChart from "./LineChart";
import Ridgeline from "./Ridgeline";

function Section4() {

  return (
    <>
    <Nav />
    <Container>
      <LineChart />
      <RadarChart />
      <Ridgeline />
    </Container>
    </>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  background-color: white;
  padding-bottom: 200px;
  gap: 100px;
`;

export default Section4