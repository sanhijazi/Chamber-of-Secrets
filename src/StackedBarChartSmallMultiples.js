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

const StackedBarChartSmallMultiples = ({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef();

  const [selectedRegion, setSelectedRegion] = useState("Asia");

  const filteredData = data.filter(
    (item) => item.region === selectedRegion && item.region !== "UNKNOWN"
  );

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

  const processedData = groupedByYear.map((yearData) => {
    const year = yearData.year;
    const emissions = { year };
    yearData.countries.forEach((country) => {
      emissions[country.Entity] = parseFloat(
        country["Annual CO₂ emissions (per capita)"]
      );
    });
    emissions["Other"] = parseFloat(yearData.other.CO2);
    return emissions;
  });

  const countryKeys = Array.from(
    new Set(
      processedData.flatMap((d) =>
        Object.keys(d).filter((key) => key !== "year")
      )
    )
  );

  const xScale = scaleLinear()
    .domain([
      0,
      max(processedData, (d) =>
        countryKeys.reduce((sum, key) => sum + (d[key] || 0), 0)
      ),
    ])
    .nice()
    .range([0, width / groupedByYear.length - margin.left - margin.right]);

  const yScale = scaleBand()
    .domain(processedData.map((d) => d.year))
    .range([0, height - margin.top - margin.bottom])
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

    svg.selectAll("*").remove(); // Clear previous renders

    const tooltip = select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("display", "none")
      .style("pointer-events", "none");

    const smallMultiples = svg
      .selectAll(".chart")
      .data(groupedByYear)
      .join("g")
      .attr(
        "transform",
        (d, i) => `translate(${(width / groupedByYear.length) * i}, 0)`
      );

    smallMultiples.each(function (d) {
      const g = select(this);
      const xScaleSmall = scaleLinear()
        .domain([
          0,
          max(processedData, (d) =>
            countryKeys.reduce((sum, key) => sum + (d[key] || 0), 0)
          ),
        ])
        .nice()
        .range([0, width / groupedByYear.length - margin.left - margin.right]);

      const yScaleSmall = scaleBand()
        .domain([d.year])
        .range([0, height - margin.top - margin.bottom])
        .padding(0.1);

      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(axisBottom(xScaleSmall));

      g.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(axisLeft(yScaleSmall));

      g.selectAll(".layer")
        .data(stackGenerator([d]))
        .join("g")
        .attr("class", "layer")
        .attr("fill", (layer) => colorScale(layer.key))
        .selectAll("rect")
        .data((layer) => layer)
        .join("rect")
        .attr("y", (d) => yScaleSmall(d.data.year))
        .attr("x", (d) => xScaleSmall(d[0]))
        .attr("height", yScaleSmall.bandwidth())
        .attr("width", (d) => xScaleSmall(d[1]) - xScaleSmall(d[0]))
        .on("mouseover", (event, d) => {
          const country = layers.find((layer) => layer.indexOf(d) !== -1)?.key;
          const emissionsValue = (d[1] - d[0]).toFixed(2);

          tooltip
            .style("display", "block")
            .html(`Country: ${country}<br>Emissions: ${emissionsValue}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));
    });
  }, [layers, xScale, yScale, colorScale, groupedByYear, selectedRegion]);

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
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
      <svg width={width} height={height} ref={svgRef}></svg>
    </div>
  );
};

export default StackedBarChartSmallMultiples;
