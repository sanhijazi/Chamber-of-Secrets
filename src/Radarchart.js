import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';
import { data } from './dataset/ridgeline_data';

function RadarChart() {
  const svgRef = useRef();
  const [selectedYears, setSelectedYears] = useState(['2018']);
  const [selectedState, setSelectedState] = useState('arizona');
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = 500 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;

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
      .attr("transform", `translate(${width/2 + margin.left},${height/2 + margin.top})`);

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("display", "none")
      .style("pointer-events", "none");

    // Scale for radius
    const rScale = d3.scaleLinear()
      .domain([
        d3.min(selectedYears, year => 
          d3.min(data[selectedState][year]["min "].map(Number))
        ),
        d3.max(selectedYears, year => 
          d3.max(data[selectedState][year]["max "].map(Number))
        )
      ])
      .range([0, radius]);

    const angleScale = d3.scaleLinear()
      .domain([0, 12])
      .range([0, 2 * Math.PI]);

    const gridCircles = [0.2, 0.4, 0.6, 0.8, 1];
    gridCircles.forEach(d => {
      svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius * d)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-dasharray", "4,4");
    });

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.forEach((month, i) => {
      const angle = angleScale(i);
      const x = radius * Math.sin(angle);
      const y = -radius * Math.cos(angle);
      
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#ddd")
        .attr("stroke-dasharray", "4,4");

      svg.append("text")
        .attr("x", 1.1 * x)
        .attr("y", 1.1 * y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(month);
    });

    selectedYears.forEach(year => {
      const yearData = data[selectedState][year];
      const baseColor = colorScale(year);

      const radarLine = d3.lineRadial()
        .angle((d, i) => angleScale(i))
        .radius(d => rScale(Number(d)))
        .curve(d3.curveLinearClosed);

      svg.append("path")
        .datum(yearData["min "])
        .attr("fill", "none")
        .attr("stroke", d3.color(baseColor).darker())
        .attr("stroke-width", 1.5)
        .attr("d", radarLine)
        .attr("fill", d3.color(baseColor).darker())
        .attr("fill-opacity", 0.1)
        .on("mouseover", (event) => {
          tooltip
            .style("display", "block")
            .html(`Year: ${year}<br>Type: Minimum Temperature`);
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
        .attr("d", radarLine)
        .attr("fill", d3.color(baseColor).brighter())
        .attr("fill-opacity", 0.1)
        .on("mouseover", (event) => {
          tooltip
            .style("display", "block")
            .html(`Year: ${year}<br>Type: Maximum Temperature`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      months.forEach(month => {
        const meanTemp = Number(yearData["mean "][month]);
        const angle = angleScale(month);
        const r = rScale(meanTemp);
        const x = r * Math.sin(angle);
        const y = -r * Math.cos(angle);

        svg.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", baseColor)
          .on("mouseover", (event) => {
            tooltip
              .style("display", "block")
              .html(`Year: ${year}<br>Month: ${months[month]}<br>Average Temperature: ${meanTemp}°C`);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("top", `${event.pageY - 10}px`)
              .style("left", `${event.pageX + 10}px`);
          })
          .on("mouseout", () => tooltip.style("display", "none"));
      });
    });

  }, [selectedYears, selectedState, width, height, radius]);

  const handleStateChange = (e, { value }) => {
    setSelectedState(value);
    setSelectedYears(['2018']);
  };

  return (
    <Container>
      <Flex>
        <Text>Temperature Radar Analysis</Text>
        <Text style={{fontSize: '15px', fontWeight: '300'}}>
          Monthly Temperature Patterns in Radar View
        </Text>
        <svg style={{overflow: "visible"}} ref={svgRef}></svg>
        <LegendContainer>
          {selectedYears.map(year => (
            <LegendItem key={year}>
              <ColorBox color={colorScale(year)} />
              <LegendText>{year}</LegendText>
            </LegendItem>
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
        <SubText>Select a state to view its temperature patterns.</SubText>
        
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
        <SubText>Compare temperature patterns across different years.</SubText>
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
  border-radius: 3px;
`;

const LegendText = styled.span`
  font-size: 14px;
  color: #333;
`;

export default RadarChart;