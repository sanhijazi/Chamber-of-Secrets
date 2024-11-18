import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

function Heatmap({ data, width, height, margin }) {
  const svgRef = useRef();

  // Memoize processed data
  const processedData = useMemo(() => {
    return data
      .filter(d => d.Year && d['Annual CO₂ emissions'] && d['Annual CO₂ emissions from land-use change'])
      .map(d => ({
        name: d.Entity,
        fossilEmissions: +d['Annual CO₂ emissions'],
        landUseEmissions: +d['Annual CO₂ emissions from land-use change'],
        year: d.Year
      }))
      // Get latest year for each country
      .reduce((acc, curr) => {
        if (!acc[curr.name] || acc[curr.name].year < curr.year) {
          acc[curr.name] = curr;
        }
        return acc;
      }, {});
  }, [data]);

  // Convert to array and sort by total emissions
  const topCountries = useMemo(() => {
    return Object.values(processedData)
      .sort((a, b) => 
        (b.fossilEmissions + b.landUseEmissions) - 
        (a.fossilEmissions + a.landUseEmissions)
      )
      .slice(0, 20);
  }, [processedData]);

  useEffect(() => {
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(["Fossil Emissions", "Land-Use Emissions"])
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(topCountries.map(d => d.name))
      .range([0, height])
      .padding(0.05);

    // Use sequential sqrt scale for better distribution visualization
    const colorScale = d3.scaleSequentialSqrt()
      .interpolator(d3.interpolateInferno)
      .domain([0, d3.max(topCountries, d => 
        Math.max(d.fossilEmissions, d.landUseEmissions)
      )]);

    // Add axes
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "start")
      .attr("dx", "0.5em")
      .attr("dy", "0.5em")
      .attr("transform", "rotate(45)");

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("CO₂ Emissions Comparison: Fossil vs Land-Use");

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "5px");

    // Add rectangles for the heatmap
    topCountries.forEach((d) => {
      // Helper function for tooltip
      const showTooltip = (event, value, type) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`
          <strong>${d.name}</strong><br/>
          ${type}: ${d3.format(".3s")(value)} tons<br/>
          Year: ${d.year}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      };

      const hideTooltip = () => {
        tooltip.transition().duration(500).style("opacity", 0);
      };

      // Fossil Emissions rectangle
      svg.append("rect")
        .attr("x", xScale("Fossil Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.fossilEmissions))
        .on("mouseover", (e) => showTooltip(e, d.fossilEmissions, "Fossil Emissions"))
        .on("mouseout", hideTooltip);

      // Land-Use Emissions rectangle
      svg.append("rect")
        .attr("x", xScale("Land-Use Emissions"))
        .attr("y", yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.landUseEmissions))
        .on("mouseover", (e) => showTooltip(e, d.landUseEmissions, "Land-Use Emissions"))
        .on("mouseout", hideTooltip);
    });

  }, [data, width, height, margin, topCountries]);

  return <svg ref={svgRef}></svg>;
}

export default Heatmap;
