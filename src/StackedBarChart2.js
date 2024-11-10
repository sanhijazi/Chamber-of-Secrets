import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("padding", "5px")
      .style("border-radius", "3px")
      .style("visibility", "hidden")
      .text("");

    data.forEach((d) => {
      const total = d.fossilEmissions + d.landUseEmissions;
      d.fossilEmissionsPercent = d.fossilEmissions / total;
      d.landUseEmissionsPercent = d.landUseEmissions / total;
    });

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, height])
      .padding(0.1);

    svg
      .selectAll(".bar-fossil")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-fossil")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.name))
      .attr("width", (d) => xScale(d.fossilEmissionsPercent))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#ff7f0e")
      .attr("transform", `translate(${margin.left}, 0)`)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(`Fossil Emissions: ${d.fossilEmissions}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    svg
      .selectAll(".bar-landuse")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-landuse")
      .attr("x", (d) => xScale(d.fossilEmissionsPercent))
      .attr("y", (d) => yScale(d.name))
      .attr("width", (d) => xScale(d.landUseEmissionsPercent))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#2ca02c")
      .attr("transform", `translate(${margin.left}, 0)`)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(`Land Use Emissions: ${d.landUseEmissions}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".0%"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${height})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));
  }, [data]);

  return (
    <svg
      ref={svgRef}
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
      style={{ overflow: "visible" }}
    ></svg>
  );
};

export default StackedBarChart;
