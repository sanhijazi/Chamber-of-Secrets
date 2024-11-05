import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import CSVFILE from "./dataset/co-emissions-per-capita.csv";
import styled from "styled-components";
import VerticalBarChart from "./VerticalBarChart";
import HorizontalBarChart from "./HorizontalBarChart";
import { Dropdown } from "semantic-ui-react";
import "./style.css";

function App() {
  const yesrs = [];

  for (let year = 1880; year <= 2025; year++) {
    yesrs.push({
      key: year.toString(),
      value: year.toString(),
      text: year.toString(),
    });
  }

  const [data, setData] = useState([]);
  const [year, setYear] = useState("1990");

  const margin = { top: 0, right: 0, bottom: 150, left: 100 };
  const width = 800;
  const height = 300;

  useEffect(() => {
    fetch(CSVFILE)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const filteredData = result.data
              .filter((d) => d.Year === year)
              .map((d) => ({
                name: d.Entity,
                value: +d["Annual CO₂ emissions (per capita)"],
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 10);
            setData(filteredData);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching the CSV file:", error);
      });
  }, [year]);

  const handleDropdownChange = (e, { value }) => {
    setYear(value); // Update state with the selected year
    console.log(value); // Log the selected year
  };
  return (
    <Container>
      <Dropdown
        placeholder="Select Year"
        fluid
        search
        selection
        onChange={handleDropdownChange} // Pass the handler here
        options={yesrs}
      />
      <VerticalBarChart
        data={data}
        width={width}
        height={height}
        margin={margin}
      />
      <HorizontalBarChart
        data={data}
        width={width}
        height={height}
        margin={margin}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 100px;
`;

export default App;
