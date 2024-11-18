import React, { useEffect, useRef, useState } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  stack,
  axisBottom,
  axisLeft,
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

const PercentageStacked = ({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef();

  const [selectedDecade, setSelectedDecade] = useState("2000");
  const [selectedRegion, setSelectedRegion] = useState("Asia");

  const filteredData = data.filter(
    (item) => item.region === selectedRegion && item.region !== "UNKNOWN"
  );

  const getDecadeYears = (startYear) => {
    return Array.from({ length: 10 }, (_, i) => String(Number(startYear) + i));
  };

  const groupedByYear = getDecadeYears(selectedDecade).map((year) => {
    const countriesForYear = filteredData
      .filter((item) => item.Year === year)
      .sort(
        (a, b) =>
          b["Annual CO₂ emissions (per capita)"] -
          a["Annual CO₂ emissions (per capita)"]
      );

    const topCountries = countriesForYear.slice(0, 5);
    const otherEmissions = countriesForYear
      .slice(5)
      .reduce(
        (sum, item) => sum + item["Annual CO₂ emissions (per capita)"],
        0
      );

    return {
      year,
      countries: topCountries,
      other: { Entity: "Other", CO2: otherEmissions },
    };
  });

  const processedData = groupedByYear.map((yearData) => {
    const year = yearData.year;
    const emissions = { year };
    const totalEmissions = yearData.countries.reduce(
      (sum, country) =>
        sum + parseFloat(country["Annual CO₂ emissions (per capita)"]),
      parseFloat(yearData.other.CO2)
    );

    yearData.countries.forEach((country) => {
      emissions[country.Entity] =
        (parseFloat(country["Annual CO₂ emissions (per capita)"]) /
          totalEmissions) *
        100;
    });
    emissions["Other"] =
      (parseFloat(yearData.other.CO2) / totalEmissions) * 100;
    return emissions;
  });

  const countryKeys = Array.from(
    new Set(
      processedData.flatMap((d) =>
        Object.keys(d).filter((key) => key !== "year")
      )
    )
  ).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const xScale = scaleLinear()
    .domain([0, 100])
    .range([margin.left, width - margin.right]);

  const yScale = scaleBand()
    .domain(processedData.map((d) => d.year))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

    const colorScale = scaleOrdinal()
    .domain(countryKeys)
    .range([
      "#2D82B7",  // Blue
      "#42A5B3",  // Teal
      "#63B179",  // Green
      "#EC8F4A",  // Orange
      "#E1575A",  // Red
      "#A352A3",  // Purple
      "#888888"   // Gray (for "Other")
    ]);

  const stackGenerator = stack().keys(countryKeys);
  const layers = stackGenerator(processedData);

  useEffect(() => {
    const svg = select(svgRef.current);

    const tooltip = select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("display", "none")
      .style("pointer-events", "none");

    svg
      .select(".x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .transition()
      .duration(1000)
      .call(axisBottom(xScale));

    svg
      .select(".y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .transition()
      .duration(1000)
      .call(axisLeft(yScale));

    svg
      .selectAll(".layer")
      .data(layers)
      .join("g")
      .attr("class", "layer")
      .attr("fill", (layer) => colorScale(layer.key))
      .selectAll("rect")
      .data((layer) => layer)
      .join("rect")
      .attr("y", (d) => yScale(d.data.year))
      .attr("x", (d) => xScale(d[0]))
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
      .on("mouseover", (event, d) => {
        const country = layers.find((layer) => layer.includes(d))?.key;
        const emissionsValue = (d[1] - d[0]).toFixed(2);

        tooltip
          .style("display", "block")
          .html(`Country: ${country}<br>Emissions: ${emissionsValue}%`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"))
      .transition()
      .duration(1000)
      .attr("x", (d) => xScale(d[0]))
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]));
  }, [layers, xScale, yScale, colorScale]);

  const handleRegionChange = (event, { value }) => {
    setSelectedRegion(value);
  };

  const handleDecadeChange = (e, { value }) => setSelectedDecade(value);

  return (
    <Container>
      <Flex>
        <Text>Percentage Stacked Bar Chart - CO₂ emissions (per capita)</Text>
        <svg width={width} height={height} ref={svgRef} style={{ 
          overflow: "visible",
          display: "block"
        }}>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
      </Flex>
      <LeftContainer>
        <Text>Select Region</Text>
        <Dropdown
          placeholder="Select Region"
          fluid
          selection
          options={regions}
          onChange={handleRegionChange}
          value={selectedRegion}
        />
        <Text>Select Decade</Text>
        <Dropdown
          placeholder="Select Decade"
          fluid
          selection
          options={decades}
          onChange={handleDecadeChange}
          value={selectedDecade}
        />
      </LeftContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 140px 200px;
  background: #fff;
  align-items: center;
  box-shadow: 0px 0px 19.1px 0px rgba(0, 0, 0, 0.25);
  width: 100%;
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

export default PercentageStacked;
