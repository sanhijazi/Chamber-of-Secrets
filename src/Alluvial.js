import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { Dropdown } from "semantic-ui-react";

const Container = styled.div`
  width: 100%;
  height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SVGContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 0;
  color: #2c3e50;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 20px;
  font-size: 0.9em;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  font-size: 0.8em;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

const Controls = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
`;

const DropdownContainer = styled.div`
  width: 200px;
`;

const DropdownLabel = styled.div`
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 5px;
`;

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

function Alluvial({ data }) {
  const svgRef = useRef();
  const [selectedYear, setSelectedYear] = useState("2020");

  useEffect(() => {
    if (!data) return;

    const processData = () => {
      const yearData = data.filter(d => 
        d.Year === selectedYear && 
        d.region !== 'Unknown' &&
        d.region !== undefined &&
        d.region !== null
      );

      const TOP_N_COUNTRIES = 20;
      
      const topCountries = Array.from(d3.group(yearData, d => d.Entity))
        .map(([country, values]) => ({
          country,
          totalEmissions: d3.sum(values, d => d['Annual CO₂ emissions including land-use change'] || 0)
        }))
        .sort((a, b) => b.totalEmissions - a.totalEmissions)
        .slice(0, TOP_N_COUNTRIES)
        .map(d => d.country);

      const filteredData = yearData.filter(d => topCountries.includes(d.Entity));

      const nodes = [];
      const links = [];

      const continents = [...new Set(filteredData.map(d => d.region))].filter(Boolean);
      continents.forEach(continent => {
        nodes.push({ id: `continent-${continent}`, name: continent });
      });

      topCountries.forEach(country => {
        nodes.push({ id: `country-${country}`, name: country });
      });

      nodes.push({ id: 'fossil', name: 'Fossil Emissions' });
      nodes.push({ id: 'land', name: 'Land-use Change' });

      filteredData.forEach(d => {
        if (d['Annual CO₂ emissions including land-use change'] > 0) {
          links.push({
            source: `continent-${d.region}`,
            target: `country-${d.Entity}`,
            value: d['Annual CO₂ emissions including land-use change'] || 0
          });

          if (d['Annual CO₂ emissions'] > 0) {
            links.push({
              source: `country-${d.Entity}`,
              target: 'fossil',
              value: d['Annual CO₂ emissions'] || 0
            });
          }
          
          if (d['Annual CO₂ emissions from land-use change'] > 0) {
            links.push({
              source: `country-${d.Entity}`,
              target: 'land',
              value: d['Annual CO₂ emissions from land-use change'] || 0
            });
          }
        }
      });

      return { nodes, links };
    };

    const MARGIN = { top: 20, right: 0, bottom: 20, left: 20 };
    const width = 1000;
    const height = 600;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const sankeyGenerator = sankey()
      .nodeWidth(26)
      .nodePadding(20)
      .extent([
        [MARGIN.left, MARGIN.top],
        [width - MARGIN.right, height - MARGIN.bottom]
      ])
      .nodeId(d => d.id);

    const { nodes, links } = processData();
    const sankeyData = sankeyGenerator({
      nodes: nodes,
      links: links
    });

    const linkSelection = svg.append('g')
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', '#a53253')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 0);

    linkSelection.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', d => Math.max(1, d.width));

    linkSelection
      .style('transition', 'stroke-opacity 0.2s')
      .on('mouseover', function() {
        d3.select(this)
          .attr('stroke-opacity', 0.5);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-opacity', 0.2);
      })
      .append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} tonnes CO₂`);

    const nodeSelection = svg.append('g')
      .selectAll('rect')
      .data(sankeyData.nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', 0)
      .attr('fill', d => {
        if (d.id.startsWith('continent-')) return '#69b3a2';
        if (d.id.startsWith('country-')) return '#404080';
        return '#a53253';
      })
      .attr('opacity', 0);

    nodeSelection.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr('width', d => d.x1 - d.x0)
      .attr('opacity', 0.8);

    nodeSelection
      .style('transition', 'opacity 0.2s')
      .on('mouseover', function() {
        d3.select(this)
          .attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8);
      })
      .append('title')
      .text(d => `${d.name}\nTotal: ${d.value.toLocaleString()} tonnes CO₂`);

    const textSelection = svg.append('g')
      .selectAll('text')
      .data(sankeyData.nodes)
      .join('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', '12px')
      .attr('font-family', 'Arial')
      .text(d => d.name)
      .style('opacity', 0);

    textSelection.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .style('opacity', 1);

    textSelection
      .style('pointer-events', 'none')
      .style('user-select', 'none');
  }, [data, selectedYear]);

  const handleYearChange = (e, { value }) => {
    setSelectedYear(value);
  };

  return (
    <Container>
      <Title>Global CO₂ Emissions Flow</Title>
      <Subtitle>
        Visualization of CO₂ emissions flow from continents through countries to emission types.
        Shows top 20 emitting countries based on total emissions.
      </Subtitle>
      <Controls>
        <DropdownContainer>
          <DropdownLabel>Select Decade</DropdownLabel>
          <Dropdown
            placeholder="Select Decade"
            fluid
            selection
            options={decades}
            onChange={handleYearChange}
            value={selectedYear}
          />
        </DropdownContainer>
      </Controls>
      <SVGContainer>
        <svg 
          ref={svgRef} 
          width="1000" 
          height="600"
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </SVGContainer>
      <Legend>
        <LegendItem>
          <LegendColor color="#69b3a2" />
          <span>Continents</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#404080" />
          <span>Countries</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#a53253" />
          <span>Emission Types</span>
        </LegendItem>
      </Legend>
    </Container>
  );
}

export default Alluvial;