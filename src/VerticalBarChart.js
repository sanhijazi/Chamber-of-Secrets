import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Input } from "semantic-ui-react";
import * as d3 from "d3";

const VerticalBarChart = ({ data, width, height, margin }) => {
  const svgRef = useRef();
  const [year, setYear] = useState("1950");

  useEffect(() => {
    data = data
      .filter((d) => d.Year === year)
      .map((d) => ({
        name: d.Entity,
        value: +d["Annual CO₂ emissions (per capita)"],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("padding", "10px")
      .style("border-radius", "3px")
      .style("visibility", "hidden")
      .text("");

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, width])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([height, 0]);

    svg
      .selectAll(".bar")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d.name))
            .attr("y", height) // Start from the bottom for animation effect
            .attr("width", xScale.bandwidth())
            .attr("height", 0) // Start with height 0 for animation
            .attr("fill", "steelblue")
            .attr("transform", `translate(${margin.left}, 10)`)
            .call((enter) =>
              enter
                .transition()
                .duration(750)
                .attr("y", (d) => yScale(d.value))
                .attr("height", (d) => height - yScale(d.value))
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(750)
              .attr("y", (d) => yScale(d.value))
              .attr("height", (d) => height - yScale(d.value))
              .attr("width", xScale.bandwidth())
          ),
        (exit) => exit.remove()
      )
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").text(`Value: ${d.value}`);
        svg.selectAll(".bar").style("fill", "#cbcbcb"); // Set all bars to gray
        d3.select(event.currentTarget).style("fill", "steelblue"); // Highlight hovered bar
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        svg.selectAll(".bar").style("fill", "steelblue"); // Reset all bars to blue
      });

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},${height + 10})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .attr("dx", "-.9em") // Fine-tune horizontal position
      .attr("dy", "-0.6em"); // Fine-tune vertical position

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 10)`)
      .call(d3.axisLeft(yScale));
  }, [year, data]);

  return (
    <Container>
      <Flex>
        <Text>BarChart - CO₂ emissions (per capita)</Text>
        <svg
          ref={svgRef}
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
          style={{ overflow: "visible" }}
        ></svg>
      </Flex>
      <LeftContainer>
        <Text>Select Year</Text>
        <Input
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          type="number"
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
export default VerticalBarChart;
