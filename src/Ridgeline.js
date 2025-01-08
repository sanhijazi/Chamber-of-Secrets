import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';
import { data } from './dataset/ridgeline_data';

function Ridgeline() {
  const svgRef = useRef();
  const [selectedState, setSelectedState] = useState('arizona');
  const margin = { top: 40, right: 30, bottom: 30, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const MIN_TEMP_COLOR = "#2171b5";
  const MAX_TEMP_COLOR = "#6baed6";

  const stateOptions = Object.keys(data).map(state => ({
    key: state,
    text: state.charAt(0).toUpperCase() + state.slice(1),
    value: state
  }));

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = Object.keys(data[selectedState]).sort();
    const overlap = 0.7;
    const cellHeight = height / years.length;

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "10px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 0 10px rgba(0,0,0,0.25)")
      .style("display", "none")
      .style("pointer-events", "none");

    const allTemps = years.flatMap(year => [
      ...data[selectedState][year]["min "].map(Number),
      ...data[selectedState][year]["max "].map(Number)
    ]);
    const minTemp = d3.min(allTemps);
    const maxTemp = d3.max(allTemps);

    const xScale = d3.scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, width]);

    const yScale = d3.scalePoint()
      .domain(years)
      .range([0, height])
      .padding(0.5);

    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}°C`));
    svg.append("g")
      .call(d3.axisLeft(yScale));

    const MIN_TEMP_COLOR = "#2171b5";
    const MAX_TEMP_COLOR = "#6baed6";

    years.forEach((year) => {
      const yearData = data[selectedState][year];
      const minData = yearData["min "].map(Number);
      const maxData = yearData["max "].map(Number);
      
      const kde = kernelDensityEstimator(kernelEpanechnikov(7), xScale.ticks(50));
      const minDensity = kde(minData);
      const maxDensity = kde(maxData);
      
      const densityScale = d3.scaleLinear()
        .domain([0, Math.max(
          d3.max(minDensity, d => d[1]),
          d3.max(maxDensity, d => d[1])
        )])
        .range([0, cellHeight * 0.8]); 

      const area = d3.area()
        .x(d => xScale(d[0]))
        .y0(0)
        .y1(d => -densityScale(d[1]));

      const g = svg.append("g")
        .attr("transform", `translate(0,${yScale(year)})`);

      g.append("path")
        .datum(minDensity)
        .attr("fill", MIN_TEMP_COLOR)
        .attr("fill-opacity", 0.7)
        .attr("stroke", "none")
        .attr("d", area)
        .on("mouseover", (event) => {
          tooltip
            .style("display", "block")
            .html(`
              <div style="font-weight: bold; margin-bottom: 5px;">Year: ${year}</div>
            `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      g.append("path")
        .datum(maxDensity)
        .attr("fill", MAX_TEMP_COLOR)
        .attr("fill-opacity", 0.7)
        .attr("stroke", "none")
        .attr("d", area)
        .on("mouseover", (event) => {
          tooltip
            .style("display", "block")
            .html(`
              <div style="font-weight: bold; margin-bottom: 5px;">Year: ${year}</div>
            `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));
    });

    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Year");

    svg.append("text")
      .attr("transform", `translate(${width/2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text("Temperature (°C)");

  }, [selectedState, width, height]);

  
  function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
    };
  }

  function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }

  return (
    <Container>
      <Flex>
        <Text>Temperature Distribution Across Years</Text>
        <Text style={{fontSize: '15px', fontWeight: '300'}}>
          Analyzing Temperature Patterns Using Ridgeline Plot
        </Text>
        <svg style={{overflow: "visible"}} ref={svgRef}></svg>
        <LegendContainer>
          <LegendItem>
            <ColorBox color={MIN_TEMP_COLOR} />
            <LegendText>Minimum Temperature</LegendText>
          </LegendItem>
          <LegendItem>
            <ColorBox color={MAX_TEMP_COLOR} />
            <LegendText>Maximum Temperature</LegendText>
          </LegendItem>
        </LegendContainer>
      </Flex>
      <LeftContainer>
        <Text>Select State</Text>
        <Dropdown
          placeholder="Select State"
          fluid
          selection
          options={stateOptions}
          value={selectedState}
          onChange={(e, { value }) => setSelectedState(value)}
        />
        <SubText>Select a state to view its temperature distribution across years.</SubText>
      </LeftContainer>
    </Container>
  );
}


const SubText = styled.div`
  opacity: 0.5;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 140px 100px;
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
  min-height: 220px;
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

const LegendContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const YearLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 5px;
  background: #f5f5f5;
`;

const LegendTitle = styled.div`
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorBox = styled.div`
  width: 15px;
  height: 15px;
  background-color: ${props => props.color};
  opacity: 0.7;
  border-radius: 3px;
`;

const LegendText = styled.span`
  font-size: 12px;
  color: #333;
`;

export default Ridgeline;