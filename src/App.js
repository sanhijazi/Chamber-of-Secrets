import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import CSVFILE1 from "./dataset/co-emissions-per-capita.csv";
import CSVFILE2 from "./dataset/co2-fossil-plus-land-use.csv";
import CSVFILE3 from "./dataset/DataSetWithRegion.csv";
import styled from "styled-components";
import VerticalBarChart from "./VerticalBarChart";
import HorizontalBarChart from "./HorizontalBarChart";
import StackedBarChart from "./StackedBarChart";
import Heatmap from "./heatMap";
import StackedBarChartSmallMultiples from "./StackedBarChartSmallMultiples";
import PercentegeStacked from "./PercentegeStacked";

function App() {
  const [barChartData, setBarChartData] = useState([]);
  const [stackedChartData, setStackedChartData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [year, setYear] = useState("1990");

  const margin = { top: 20, right: 0, bottom: 20, left: 20 };
  const width = 800;
  const height = 300;

  useEffect(() => {
    fetch(CSVFILE1)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setBarChartData(result.data);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching bar chart CSV file:", error);
      });
  }, [year]);

  useEffect(() => {
    fetch(CSVFILE3)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setStackedChartData(result.data);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching stacked chart CSV file:", error);
      });
  }, [year]);

  useEffect(() => {
    // Load data for the heatmap
    fetch(CSVFILE2)
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
                fossilEmissions: +d["Annual CO₂ emissions"],
                landUseEmissions:
                  +d["Annual CO₂ emissions from land-use change"],
              }))
              .sort((a, b) => b.fossilEmissions - a.fossilEmissions)
              .slice(0, 10);
            setHeatmapData(result.data);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching heatmap CSV file:", error);
      });
  }, []);

  return (
    <Container>
      <Header>Chamber fo Secrets - Data Visualisation</Header>
      {barChartData && (
        <VerticalBarChart
          data={barChartData}
          width={width}
          height={height}
          margin={margin}
        />
      )}
      {barChartData && (
        <HorizontalBarChart
          data={barChartData}
          width={width}
          height={height}
          margin={margin}
        />
      )}
      {stackedChartData.length > 0 && (
        <StackedBarChart
          data={stackedChartData}
          width={width}
          height={height}
          margin={margin}
        />
      )}
      {stackedChartData.length > 0 && (
        <StackedBarChartSmallMultiples
          data={stackedChartData}
          width={width}
          height={height}
          margin={{ top: 20, right: 20, bottom: 20, left: 30 }}
        />
      )}
      {stackedChartData.length > 0 && (
        <PercentegeStacked
          data={stackedChartData}
          width={width}
          height={height}
          margin={margin}
        />
      )}
      <Heatmap
        data={heatmapData}
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
  background-color: white;
  gap: 100px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  background-color: #7494f4;
  padding: 20px;
  height: 100px;
  width: 100%;
  color: white;
`;

export default App;
