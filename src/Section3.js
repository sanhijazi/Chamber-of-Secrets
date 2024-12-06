import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import CSVFILE2 from "./dataset/co2-fossil-plus-land-use.csv";
import styled from "styled-components";
import Nav from "./nav";
import MapMarcator from "./MapMarcator";
import MapAzimuthal from "./MapAzimuthal";

function Section3() {
    const [mapData, setMapData] = useState([]);
  
    const margin = { top: 20, right: 0, bottom: 20, left: 20 };
    const width = 800;
    const height = 800;
  
    useEffect(() => {
      fetch(CSVFILE2)
        .then((response) => response.text())
        .then((text) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setMapData(result.data);
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
      <MapMarcator
        data={mapData}
        width={width}
        height={height}
        margin={margin}
      />
      <MapAzimuthal
        data={mapData}
        width={width}
        height={height}
        margin={margin}
      />
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

export default Section3