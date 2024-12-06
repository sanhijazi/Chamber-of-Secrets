import React from "react";
import { RouterProvider } from 'react-router-dom';
import { router } from "./router";
import styled from "styled-components";
import { NavLink } from 'react-router-dom';

function App() {
  return (
    <Container>
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </Container>
  );
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

export default App;
