import React, { useEffect, useRef, useState } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  stack,
  axisBottom,
  axisLeft,
  max,
} from "d3";
import { Dropdown } from "semantic-ui-react";
import styled from "styled-components";

const regions = [
  { key: "Asia", text: "Asia", value: "Asia" },
  { key: "Europe", text: "Europe", value: "Europe" },
  { key: "Africa", text: "Africa", value: "Africa" },
  { key: "North America", text: "North America", value: "North America" },
  { key: "South America", text: "South America", value: "South America" },
  { key: "Oceania", text: "Oceania", value: "Oceania" },
];

const decades = [
  { key: "1900s", text: "1900-1909", value: "1900" },
  { key: "1910s", text: "1910-1919", value: "1910" },
  { key: "1920s", text: "1920-1929", value: "1920" },
  { key: "1930s", text: "1930-1939", value: "1930" },
  { key: "1940s", text: "1940-1949", value: "1940" },
  { key: "1950s", text: "1950-1959", value: "1950" },
  { key: "1960s", text: "1960-1969", value: "1960" },
  { key: "1970s", text: "1970-1979", value: "1970" },
  { key: "1980s", text: "1980-1989", value: "1980" },
  { key: "1990s", text: "1990-1999", value: "1990" },
  { key: "2000s", text: "2000-2009", value: "2000" },
  { key: "2010s", text: "2010-2019", value: "2010" },
  { key: "2020s", text: "2020-2029", value: "2020" },
];

const StackedBarChartSmallMultiples = ({
  data,
  width,
  height,
  margin = { top: 40, right: 120, bottom: 40, left: 120 },
}) => {
  const svgRef = useRef();
  const [selectedRegion, setSelectedRegion] = useState("Asia");
  const [selectedDecade, setSelectedDecade] = useState("2000");

  const filteredData = data.filter(
    (item) => item.region === selectedRegion && item.region !== "UNKNOWN"
  );

  const getDecadeYears = (startYear) => {
    return Array.from({ length: 10 }, (_, i) => String(Number(startYear) + i));
  };

  const yearlyData = getDecadeYears(selectedDecade).map((year) => {
    const yearData = filteredData
      .filter((item) => item.Year === year)
      .sort((a, b) => b["Annual CO₂ emissions (per capita)"] - a["Annual CO₂ emissions (per capita)"])
      .slice(0, 5);

    return {
      year,
      data: yearData.map(item => ({
        country: item.Entity,
        emissions: parseFloat(item["Annual CO₂ emissions (per capita)"]) || 0
      }))
    };
  });

  const countries = Array.from(new Set(
    yearlyData.flatMap(year => year.data.map(d => d.country))
  ));

  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const smallWidth = (width - margin.left - margin.right) / 5;
    const smallHeight = (height - margin.top - margin.bottom) / 2;
    
    const totalWidth = smallWidth * 5;
    const totalHeight = smallHeight * 2;
    
    const xOffset = (width - totalWidth) / 2;
    const yOffset = (height - totalHeight) / 2;
    
    const smallMultiples = svg
      .selectAll(".chart")
      .data(yearlyData)
      .join("g")
      .attr("class", "chart")
      .attr("transform", (d, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return `translate(${col * smallWidth + xOffset}, ${row * smallHeight + yOffset})`;
      });

    const xScale = scaleLinear()
      .domain([0, max(yearlyData, d => max(d.data, c => c.emissions))])
      .nice()
      .range([0, smallWidth - margin.left]);

    const yScale = scaleBand()
      .domain(countries)
      .range([0, smallHeight - margin.top - margin.bottom])
      .padding(0.1);

      const colorScale = scaleOrdinal()
      .domain(countries)
      .range([
        "#2D82B7",  // Blue
        "#42A5B3",  // Teal
        "#63B179",  // Green
        "#EC8F4A",  // Orange
        "#E1575A",  // Red
        "#A352A3",  // Purple
        "#888888"   // Gray (for "Other")
      ]);

    smallMultiples.each(function(yearData) {
      const g = select(this);
      
      g.append("text")
        .attr("x", smallWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(yearData.year);

      g.selectAll(".bar")
        .data(yearData.data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.country))
        .attr("width", d => xScale(d.emissions))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.country));

      if (yearData === yearlyData[0] || yearData === yearlyData[5]) {
        g.append("g")
          .attr("class", "y-axis")
          .call(axisLeft(yScale));
      }

      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${smallHeight - margin.top - margin.bottom})`)
        .call(axisBottom(xScale).ticks(5));

      g.selectAll(".value-label")
        .data(yearData.data)
        .join("text")
        .attr("class", "value-label")
        .attr("x", d => xScale(d.emissions) + 5)
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "10px")
        .text(d => d.emissions);
    });

  }, [yearlyData, width, height, selectedRegion, selectedDecade]);

  return (
    <Container>
      <Flex>
        <Text>Small Multiples - CO₂ emissions (per capita)</Text>
        <svg width={width} style={{ 
        overflow: "visible",  // Make overflow visible
        display: "block"      // Ensure proper positioning
      }} height={height} ref={svgRef}></svg>
      </Flex>
      <LeftContainer>
        <Text>Select Region</Text>
        <Dropdown
          placeholder="Select Region"
          fluid
          selection
          options={regions}
          onChange={(e, { value }) => setSelectedRegion(value)}
          value={selectedRegion}
        />
        <Text>Select Decade</Text>
        <Dropdown
          placeholder="Select Decade"
          fluid
          selection
          options={decades}
          onChange={(e, { value }) => setSelectedDecade(value)}
          value={selectedDecade}
        />
      </LeftContainer>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 80px 100px;
  background: #fff;
  align-items: center;
  box-shadow: 0px 0px 19.1px 0px rgba(0, 0, 0, 0.25);
  width: 100%;
  gap: 140px;
`;
const Flex = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  height: 220px;
  justify-content: center;
  align-items: center;
  width: 300px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0px 0px 9.7px 0px rgba(0, 0, 0, 0.25);
`;
const Text = styled.div`
  color: #000;
  font-family: Roboto;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

export default StackedBarChartSmallMultiples;
