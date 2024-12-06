import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Dropdown } from "semantic-ui-react";
import * as d3 from 'd3';

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

function MapMarcator({ data, width, height, margin }) {
    const [selectedDecade, setSelectedDecade] = useState("2000");
    const svgRef = useRef();

    const aggregatedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        const startYear = parseInt(selectedDecade, 10);
        const endYear = startYear + 9;

        return d3.rollups(
            data.filter(d => d.Year >= startYear && d.Year <= endYear && d.region != 'Unknown'),
            v => d3.sum(v, d => d['Annual CO₂ emissions']),
            d => d.Code
        ).map(([code, totalEmissions]) => ({
            code,
            totalEmissions,
            name: data.find(d => d.Code === code)?.Entity || code,
        }));
    }, [data, selectedDecade]);

    useEffect(() => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;


        console.log(aggregatedData)

        const maxEmission = d3.max(aggregatedData, d => d.totalEmissions)


        console.log(maxEmission);
    
        const colorScale = d3.scaleSequential()
            .domain([0, maxEmission])
            .interpolator(d3.interpolateReds);

        const projection = d3.geoMercator()
            .scale(100)
            .translate([innerWidth / 2, innerHeight / 2]);

        const pathGenerator = d3.geoPath().projection(projection);

        d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(geoData => {
            const svg = d3.select(svgRef.current);

            svg.selectAll('*').remove();

            svg.attr('width', width).attr('height', height);

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('visibility', 'hidden')
                .style('background', 'rgba(255, 255, 255, 0.8)')
                .style('border', '1px solid #ccc')
                .style('border-radius', '4px')
                .style('padding', '5px')
                .style('font-size', '12px')
                .style('pointer-events', 'none');

            const geoDataWithEmissions = geoData.features.map(feature => {
                const countryData = aggregatedData.find(d => d.code === feature.id);
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        emission: countryData ? countryData.totalEmissions : 0,
                        name: countryData ? countryData.name : feature.properties.name,
                    },
                };
            });

            console.log(geoDataWithEmissions)

            g.selectAll('path')
                .data(geoDataWithEmissions)
                .join('path')
                .attr('d', pathGenerator)
                .attr('fill', d => d.properties.emission > 0 ? colorScale(d.properties.emission) : '#ccc')
                .attr('stroke', '#333')
                .attr('stroke-width', 0.5)
                .on('mouseover', (event, d) => {
                    tooltip.style('visibility', 'visible')
                        .html(`
                            <strong>${d.properties.name}</strong><br/>
                            Emissions: ${d.properties.emission.toLocaleString()} tons
                        `);
                })
                .on('mousemove', event => {
                    tooltip.style('top', `${event.pageY + 10}px`)
                        .style('left', `${event.pageX + 10}px`);
                })
                .on('mouseout', () => {
                    tooltip.style('visibility', 'hidden');
                });
        });

        return () => d3.select('.tooltip').remove();
    }, [aggregatedData, width, height, margin]);

    return (
        <Container>
            <Flex>
            <Text>Decade-wise total CO₂ Emissions by Country</Text>
            <Text style={{ fontSize: '15px', fontWeight: '300' }}>
                Discover the global pattern of CO₂ emissions per capita, displayed using the Mercator Projection. 
                This classic map projection preserves shape and direction, making it ideal for understanding geographical relationships and emissions distribution.
            </Text>                
            <svg ref={svgRef}></svg>
            </Flex>
            <LeftContainer>
                <Text>Select Decade</Text>
                <Dropdown
                    placeholder="Select Decade"
                    fluid
                    selection
                    options={decades}
                    onChange={(e, { value }) => setSelectedDecade(value)}
                    value={selectedDecade}
                />
                <SubText>Select a decade to filter CO₂ emissions data.</SubText>
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
    width: 80vw;
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
    width: 500px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0px 0px 9.7px 0px rgba(0, 0, 0, 0.25);
`;

const Text = styled.div`
    color: #000;
    font-family: Roboto;
    font-size: 32px;
    font-weight: 700;
`;

export default MapMarcator;
