import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HorizontalBarChart = ({ data, width, height, margin }) => {
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

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, height])
      .padding(0.5);

    svg
      .selectAll(".bar")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", (d) => yScale(d.name))
            .attr("width", 0) // Start with width 0 for animation
            .attr("fill", "orange")
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr("height", yScale.bandwidth())
            .call(
              (enter) =>
                enter
                  .transition()
                  .duration(750)
                  .attr("width", (d) => xScale(d.value)) // Animate to final width
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(750)
              .attr("y", (d) => yScale(d.name))
              .attr("width", (d) => xScale(d.value)) // Smooth width update
              .attr("height", yScale.bandwidth())
          ),
        (exit) => exit.remove()
      )
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").text(`Value: ${d.value}`);
        svg.selectAll(".bar").style("fill", "#cbcbcb"); // Set other bars to gray
        d3.select(event.currentTarget).style("fill", "orange"); // Highlight hovered bar
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        svg.selectAll(".bar").style("fill", "orange"); // Reset all bars to orange
      });
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${height})`)
      .call(d3.axisBottom(xScale));

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

export default HorizontalBarChart;
