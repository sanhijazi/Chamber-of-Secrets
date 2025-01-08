import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';
import { data } from './dataset/ridgeline_data';

function LineChart() {
  const svgRef = useRef();
  const [selectedYears, setSelectedYears] = useState(['2018']);
  console.log(selectedYears)
  const [selectedState, setSelectedState] = useState('arizona');
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const stateOptions = Object.keys(data).map(state => ({
    key: state,
    text: state.charAt(0).toUpperCase() + state.slice(1),
    value: state
  }));

  const yearOptions = Object.keys(data[selectedState]).map(year => ({
    key: year,
    text: year,
    value: year
  }));

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    if (!selectedYears.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("display", "none")
      .style("pointer-events", "none");

    const xScale = d3.scaleLinear()
      .domain([0, 11])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(selectedYears, year => 
          d3.min(data[selectedState][year]["min "].map(Number))
        ),
        d3.max(selectedYears, year => 
          d3.max(data[selectedState][year]["max "].map(Number))
        )
      ])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(12)
        .tickFormat(d => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[d];
        }));

    svg.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}°C`));

    const minLine = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(Number(d)));

    const maxLine = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(Number(d)));

    selectedYears.forEach(year => {
      const yearData = data[selectedState][year];
      const baseColor = colorScale(year);

      svg.append("path")
        .datum(yearData["min "])
        .attr("fill", "none")
        .attr("stroke", d3.color(baseColor).darker())
        .attr("stroke-width", 1.5)
        .attr("d", minLine)
        .on("mouseover", (event) => {
          tooltip
            .style("display", "block")
            .html(`Year: ${year}<br>Type: Minimum Temperature<br>Month: ${event.target.__data__}°C`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      svg.append("path")
        .datum(yearData["max "])
        .attr("fill", "none")
        .attr("stroke", d3.color(baseColor).brighter())
        .attr("stroke-width", 1.5)
        .attr("d", maxLine)
        .on("mouseover", (event) => {
          tooltip
            .style("display", "block")
            .html(`Year: ${year}<br>Type: Maximum Temperature<br>Month: ${event.target.__data__}°C`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      svg.selectAll(`.mean-${year}`)
        .data(yearData["mean "])
        .enter()
        .append("circle")
        .attr("cx", (d, i) => xScale(i))
        .attr("cy", d => yScale(Number(d)))
        .attr("r", 4)
        .attr("fill", baseColor)
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(`Year: ${year}<br>Type: Average Temperature<br>Value: ${d}°C`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));
    });

  }, [selectedYears, selectedState, width, height]);

  const handleStateChange = (e, { value }) => {
    setSelectedState(value);
    setSelectedYears([]);
  };

  return (
    <Container>
      <Flex>
        <Text>Temperature Variations Across Years</Text>
        <Text style={{fontSize: '15px', fontWeight: '300'}}>
          Analyzing Minimum, Maximum, and Average Temperatures - Line Chart
        </Text>
        <svg style={{overflow: "visible"}} ref={svgRef}></svg>
        <LegendContainer>
          {selectedYears.map(year => (
            <YearLegend key={year}>
              <LegendTitle>{year}</LegendTitle>
              <LegendItem>
                <ColorBox color={d3.color(colorScale(year)).darker()} />
                <LegendText>Min Temp</LegendText>
              </LegendItem>
              <LegendItem>
                <ColorBox color={d3.color(colorScale(year)).brighter()} />
                <LegendText>Max Temp</LegendText>
              </LegendItem>
              <LegendItem>
                <ColorDot color={colorScale(year)} />
                <LegendText>Avg Temp</LegendText>
              </LegendItem>
            </YearLegend>
          ))}
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
          onChange={handleStateChange}
        />
        <SubText>Select a state to view its temperature data.</SubText>
        
        <Text>Select Years</Text>
        <Dropdown
          placeholder="Select Years"
          fluid
          multiple
          selection
          options={yearOptions}
          value={selectedYears}
          onChange={(e, { value }) => setSelectedYears(value)}
        />
        <SubText>Select multiple years to compare temperature patterns.</SubText>
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
  gap: 30px;
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
  width: 20px;
  height: 2px;
  background-color: ${props => props.color};
`;

const ColorDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const LegendText = styled.span`
  font-size: 12px;
  color: #333;
`;

export default LineChart;