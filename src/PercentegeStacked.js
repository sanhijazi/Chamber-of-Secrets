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

const PercentageStacked = ({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef();

  const [selectedRegion, setSelectedRegion] = useState("Asia");

  const filteredData = data.filter(
    (item) => item.region === selectedRegion && item.region !== "UNKNOWN"
  );

  const groupedByYear = ["2000", "2001", "2002"].map((year) => {
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
  );

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
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
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

  return (
    <Container>
      <Flex>
        <Text>Percentege Stached Bar Chart - CO2 emissions</Text>
        <svg width={width} height={height} ref={svgRef}>
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
  gap: 30px;
  height: 140px;
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
