import React, { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { Dropdown } from "semantic-ui-react";

function Heatmap({ data, width, height, margin }) {
  const svgRef = useRef();

  const [selectedDecade, setSelectedDecade] = useState("2000");

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

  const processedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    const decadeStart = parseInt(selectedDecade);
    const decadeEnd = decadeStart + 9;
    
    return data
      .filter(d => {
        const year = parseInt(d.Year);
        return d.Year && 
          d.Entity && 
          d.region !== "Unknown" && 
          !isNaN(d['Annual CO₂ emissions']) && 
          !isNaN(d['Annual CO₂ emissions from land-use change']) &&
          year >= decadeStart && 
          year <= decadeEnd;
      })
      .map(d => ({
        name: d.Entity,
        fossilEmissions: Math.abs(parseFloat(d['Annual CO₂ emissions']) || 0),
        landUseEmissions: Math.abs(parseFloat(d['Annual CO₂ emissions from land-use change']) || 0),
        year: parseInt(d.Year)
      }));
  }, [data, selectedDecade]);

  const latestData = useMemo(() => {
    const dataByCountry = {};
    processedData.forEach(d => {
      if (!dataByCountry[d.name] || dataByCountry[d.name].year < d.year) {
        dataByCountry[d.name] = d;
      }
    });
    return Object.values(dataByCountry);
  }, [processedData]);

  const topCountries = useMemo(() => {
    return latestData
      .sort((a, b) => 
        (b.fossilEmissions + b.landUseEmissions) - 
        (a.fossilEmissions + a.landUseEmissions)
      )
      .slice(0, 10);
  }, [latestData]);

  useEffect(() => {
    if (!topCountries.length || !width || !height) {
      console.log("Missing required data:", { 
        countriesLength: topCountries.length, 
        width, 
        height 
      });
      return;
    }

    const adjustedHeight = height * (10/20);

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", adjustedHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const emissionTypes = ["Fossil Emissions", "Land-Use Emissions"];

    const xScale = d3.scaleBand()
      .domain(emissionTypes)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(topCountries.map(d => d.name))
      .range([0, adjustedHeight])
      .padding(0.1);

    const maxEmission = d3.max(topCountries, d => 
      Math.max(d.fossilEmissions, d.landUseEmissions)
    );

    console.log("Scale info:", {
      xDomain: xScale.domain(),
      yDomain: yScale.domain(),
      maxEmission,
      bandwidth: {
        x: xScale.bandwidth(),
        y: yScale.bandwidth()
      }
    });

    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain([0, maxEmission]);

    topCountries.forEach(d => {
      svg.append("rect")
        .attr("x", xScale("Fossil Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.fossilEmissions))
        .attr("opacity", 0.8);

      svg.append("rect")
        .attr("x", xScale("Land-Use Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.landUseEmissions))
        .attr("opacity", 0.8);
    });

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${adjustedHeight})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    const legendHeight = 200;
    const legendWidth = 40;
    const legendMargin = 20;

    const legendScale = d3.scaleLinear()
      .domain([maxEmission, 0]) 
      .range([0, legendHeight]);

    const legendAxis = d3.axisRight()
      .scale(legendScale)
      .ticks(5)
      .tickFormat(d => d3.format(".1s")(d) + " tons");

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + legendMargin}, 0)`);

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    const numStops = 10;
    for (let i = 0; i < numStops; i++) {
      const offset = (i / (numStops - 1)) * 100;
      const value = (i / (numStops - 1)) * maxEmission;
      gradient.append("stop")
        .attr("offset", `${offset}%`)
        .attr("stop-color", colorScale(value));
    }

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);

    legend.append("text")
      .attr("transform", `translate(${legendWidth / 2}, ${legendHeight + 40})`)
      .style("text-anchor", "middle")
      .text("CO₂ Emissions");

  }, [topCountries, width, height, margin]);

  return (
    <Container>
      <Flex>
        <Text>CO₂ Emissions Heatmap</Text>
        <Dropdown
          placeholder="Select Decade"
          fluid
          selection
          options={decades}
          onChange={(e, { value }) => setSelectedDecade(value)}
          value={selectedDecade}
        />
        <svg style={{
          overflow: 'visible',
          display: 'block'
        }} ref={svgRef}></svg>
      </Flex>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
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

const Text = styled.div`
  color: #000;
  font-family: Roboto;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

export default Heatmap;
