import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import CSVFILE2 from "./dataset/co2-fossil-plus-land-use.csv";
import styled from "styled-components";
import Alluvial from "./Alluvial";
import Nav from "./nav";

function Section2() {
    const [heatmapData, setHeatmapData] = useState([]);
  
    useEffect(() => {
      fetch(CSVFILE2)
        .then((response) => response.text())
        .then((text) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              setHeatmapData(result.data);
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching heatmap CSV file:", error);
        });
    }, []);

  return (
    <>
    <Nav />
    <Container>
      <Alluvial data={heatmapData} />
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

export default Section2;