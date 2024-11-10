import React, { useEffect, useRef, useState } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  stack,
  axisBottom,
  axisLeft,
  max,
} from "d3";

const PercentegeStacked = ({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef();

  // State for selected year and region
  const [selectedYear, setSelectedYear] = useState("2000");
  const [selectedRegion, setSelectedRegion] = useState("Asia");

  // Filter data based on selected year and region
  const filteredData = data.filter(
    (item) => item.region === selectedRegion && item.region !== "UNKNOWN"
  );

  // Group data by year, sort and select the top 5 countries, adding "Other"
  const groupedByYear = ["2000", "2001", "2002"].map((year) => {
    const countriesForYear = filteredData
      .filter((item) => item.Year === year)
      .sort(
        (a, b) =>
          b["Annual CO₂ emissions (per capita)"] -
          a["Annual CO₂ emissions (per capita)"]
      );

    const topCountries = countriesForYear.slice(0, 5);
    const otherEmissions = countriesForYear
      .slice(5)
      .reduce(
        (sum, item) => sum + item["Annual CO₂ emissions (per capita)"],
        0
      );

    return {
      year,
      countries: topCountries,
      other: { Entity: "Other", CO2: otherEmissions },
    };
  });

  // Format data for 100% stacked bar chart by normalizing emissions to sum to 100
  const processedData = groupedByYear.map((yearData) => {
    const year = yearData.year;
    const emissions = { year };
    const totalEmissions = yearData.countries.reduce(
      (sum, country) =>
        sum + parseFloat(country["Annual CO₂ emissions (per capita)"]),
      parseFloat(yearData.other.CO2)
    );

    yearData.countries.forEach((country) => {
      emissions[country.Entity] =
        (parseFloat(country["Annual CO₂ emissions (per capita)"]) /
          totalEmissions) *
        100;
    });
    emissions["Other"] =
      (parseFloat(yearData.other.CO2) / totalEmissions) * 100;
    return emissions;
  });

  // Get unique country names, including "Other"
  const countryKeys = Array.from(
    new Set(
      processedData.flatMap((d) =>
        Object.keys(d).filter((key) => key !== "year")
      )
    )
  );

  // Scales
  const xScale = scaleLinear()
    .domain([0, 100])
    .range([margin.left, width - margin.right]);

  const yScale = scaleBand()
    .domain(processedData.map((d) => d.year))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const colorScale = scaleOrdinal()
    .domain(countryKeys)
    .range([
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
    ]);

  const stackGenerator = stack().keys(countryKeys);
  const layers = stackGenerator(processedData);

  useEffect(() => {
    const svg = select(svgRef.current);

    const tooltip = select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("display", "none")
      .style("pointer-events", "none");

    svg
      .select(".x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .transition()
      .duration(1000)
      .call(axisBottom(xScale));

    svg
      .select(".y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .transition()
      .duration(1000)
      .call(axisLeft(yScale));

    svg
      .selectAll(".layer")
      .data(layers)
      .join("g")
      .attr("class", "layer")
      .attr("fill", (layer) => colorScale(layer.key))
      .selectAll("rect")
      .data((layer) => layer)
      .join("rect")
      .attr("y", (d) => yScale(d.data.year))
      .attr("x", (d) => xScale(d[0]))
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
      .on("mouseover", (event, d) => {
        const country = layers.find((layer) => layer.includes(d))?.key;
        const emissionsValue = (d[1] - d[0]).toFixed(2);

        tooltip
          .style("display", "block")
          .html(`Country: ${country}<br>Emissions: ${emissionsValue}%`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"))
      .transition()
      .duration(1000)
      .attr("x", (d) => xScale(d[0]))
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]));
  }, [layers, xScale, yScale, colorScale]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <div>
      <div>
        <label>
          Select Region:
          <select value={selectedRegion} onChange={handleRegionChange}>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="Africa">Africa</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Oceania">Oceania</option>
          </select>
        </label>
      </div>
      <svg width={width} height={height} ref={svgRef}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
};

export default PercentegeStacked;
