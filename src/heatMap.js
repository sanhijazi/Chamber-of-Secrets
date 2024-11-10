import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Heatmap({ data, width, height, margin }) {
  const svgRef = useRef();

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(["Fossil Emissions", "Land-Use Emissions"])
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([0, d3.max(data, d => Math.max(d.fossilEmissions, d.landUseEmissions))]);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    data.forEach((d) => {
      svg.append("rect")
        .attr("x", xScale("Fossil Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.fossilEmissions))
        .append("title") // Tooltip
        .text(`Fossil Emissions: ${d.fossilEmissions}`);

      svg.append("rect")
        .attr("x", xScale("Land-Use Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.landUseEmissions))
        .append("title") // Tooltip
        .text(`Land-Use Emissions: ${d.landUseEmissions}`);
    });
  }, [data, width, height, margin]);

  return <svg ref={svgRef}></svg>;
}

export default Heatmap;
