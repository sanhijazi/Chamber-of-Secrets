import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { Input } from "semantic-ui-react";

const HorizontalBarChart = ({ data, width, height, margin }) => {
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
      .style("border-radius", "2px")
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
            .attr("width", 0)
            .attr("fill", "orange")
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr("height", yScale.bandwidth())
            .call(
              (enter) =>
                enter
                  .transition()
                  .duration(750)
                  .attr("width", (d) => xScale(d.value))
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(750)
              .attr("y", (d) => yScale(d.name))
              .attr("width", (d) => xScale(d.value))
              .attr("height", yScale.bandwidth())
          ),
        (exit) => exit.remove()
      )
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").text(`Value: ${d.value}`);
        svg.selectAll(".bar").style("fill", "#cbcbcb");
        d3.select(event.currentTarget).style("fill", "orange");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        svg.selectAll(".bar").style("fill", "orange");
      });
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => `${d} tons CO₂`));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));
  }, [data, year]);

  return (
    <Container>
      <Flex>
        <Text>Horizontal BarChart - CO₂ emissions (per capita)</Text>
        <Text style={{fontSize: '15px', fontWeight: '300'}}>Visualizing the Leading Contributors by Year - Horizontal BarChart</Text>
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
        <SubText>Select a year to filter CO₂ emissions data. Data will be displayed for the selected year.</SubText>
      </LeftContainer>
    </Container>
  );
};

const SubText = styled.div`
  opacity: 0.5;
`;

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
  min-height: 140px;
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
  align-self: flex-start;
`;

export default HorizontalBarChart;
