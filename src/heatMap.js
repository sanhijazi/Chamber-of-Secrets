import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import styled from "styled-components";

function Heatmap({ data, width, height, margin }) {
  const svgRef = useRef();

  const processedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    console.log("Raw data sample:", data[0]); // Debug first row
    return data
      .filter(d => d.Year && d.Entity && 
        !isNaN(d['Annual CO₂ emissions']) && 
        !isNaN(d['Annual CO₂ emissions from land-use change']))
      .map(d => ({
        name: d.Entity,
        fossilEmissions: Math.abs(parseFloat(d['Annual CO₂ emissions']) || 0),
        landUseEmissions: Math.abs(parseFloat(d['Annual CO₂ emissions from land-use change']) || 0),
        year: parseInt(d.Year)
      }));
  }, [data]);

  // Get latest year data for each country
  const latestData = useMemo(() => {
    const dataByCountry = {};
    processedData.forEach(d => {
      if (!dataByCountry[d.name] || dataByCountry[d.name].year < d.year) {
        dataByCountry[d.name] = d;
      }
    });
    return Object.values(dataByCountry);
  }, [processedData]);

  // Get top 20 countries by total emissions
  const topCountries = useMemo(() => {
    return latestData
      .sort((a, b) => 
        (b.fossilEmissions + b.landUseEmissions) - 
        (a.fossilEmissions + a.landUseEmissions)
      )
      .slice(0, 20);
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

    // Clear previous content
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define emission types
    const emissionTypes = ["Fossil Emissions", "Land-Use Emissions"];

    // Create scales
    const xScale = d3.scaleBand()
      .domain(emissionTypes)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(topCountries.map(d => d.name))
      .range([0, height])
      .padding(0.1);

    // Calculate max emission for color scale
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

    // Add rectangles
    topCountries.forEach(d => {
      // Fossil Emissions
      svg.append("rect")
        .attr("x", xScale("Fossil Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.fossilEmissions))
        .attr("opacity", 0.8);

      // Land-Use Emissions
      svg.append("rect")
        .attr("x", xScale("Land-Use Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.landUseEmissions))
        .attr("opacity", 0.8);
    });

    // Add axes
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    // Add color legend
    const legendHeight = 200;
    const legendWidth = 40;
    const legendMargin = 20;

    const legendScale = d3.scaleLinear()
      .domain([maxEmission, 0])  // Reversed domain to show high values at top
      .range([0, legendHeight]);

    const legendAxis = d3.axisRight()
      .scale(legendScale)
      .ticks(5)
      .tickFormat(d => d3.format(".1s")(d) + " tons");

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + legendMargin}, 0)`);

    // Create gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    // Add color stops
    const numStops = 10;
    for (let i = 0; i < numStops; i++) {
      const offset = (i / (numStops - 1)) * 100;
      const value = (i / (numStops - 1)) * maxEmission;
      gradient.append("stop")
        .attr("offset", `${offset}%`)
        .attr("stop-color", colorScale(value));
    }

    // Add gradient rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    // Add legend axis
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis);

    // Add legend title
    legend.append("text")
      .attr("transform", `translate(${legendWidth / 2}, ${legendHeight + 40})`)
      .style("text-anchor", "middle")
      .text("CO₂ Emissions");

  }, [topCountries, width, height, margin]);

  return (
    <Container>
     <svg style={{
        overflow: 'visible',
        display: 'block'
      }} ref={svgRef}></svg>
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

export default Heatmap;
