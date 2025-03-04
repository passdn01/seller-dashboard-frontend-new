import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const SankeyChart = ({ data, width = 1000, height = 400 }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodeNames = Array.from(new Set(data.flatMap(d => [d.source, d.target])));
    const nodes = nodeNames.map(name => ({ name }));
    const links = data.map(d => ({
      source: nodeNames.indexOf(d.source),
      target: nodeNames.indexOf(d.target),
      value: d.value
    }));

    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[50, 10], [width - 50, height - 10]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map(d => Object.assign({}, d)),
      links: links.map(d => Object.assign({}, d))
    });

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(nodeNames);

    const linkGroup = svg.append("g").selectAll("path")
      .data(sankeyLinks)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.source.name))
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("opacity", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke-width", d => Math.max(1, d.width + 2));

        showTooltip(event, d);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("opacity", 0.5)
          .attr("stroke-width", d => Math.max(1, d.width));

        hideTooltip();
      });

    svg.append("g").selectAll("rect")
      .data(sankeyNodes)
      .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", sankeyGenerator.nodeWidth())
      .attr("fill", d => colorScale(d.name))
      .attr("opacity", 0.8);

    svg.append("g").selectAll("text")
      .data(sankeyNodes)
      .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => `${d.name} (${d.value.toLocaleString()})`)
      .attr("font-size", "12px")
      .attr("fill", "#4B5563");

    function showTooltip(event, d) {
      const tooltip = d3.select(tooltipRef.current);
      const tooltipWidth = 200;
      const tooltipHeight = 100;
    
      // Get the SVG container's bounding box
      const svgBounds = svgRef.current.getBoundingClientRect();
    
      // Set tooltip at bottom-right of the SVG container
      const left = svgBounds.right - tooltipWidth - 10; // 10px padding from right
      const top = svgBounds.bottom - tooltipHeight - 10; // 10px padding from bottom
    
      // Display the tooltip in a fixed position
      tooltip
        .style("visibility", "visible")
        .style("left", `${left}px`)
        .style("top", `${top}px`)
        .html(`
          <div style="
              background-color: white;
              padding: 16px;
              border-radius: 8px;
              width: ${tooltipWidth}px;
              font-size: 14px;
              border: 1px solid #e0e0e0;
              color: #333;
              font-family: 'Arial', sans-serif;
          ">
            <p style="font-weight: 600; font-size: 14px; margin: 0; color: #555;">${d.source.name} → ${d.target.name}</p>
            <p style="font-size: 20px; margin: 8px 0 0 0; font-weight: 500; color: #007BFF;">Value: ${d.value.toLocaleString()}</p>
          </div>

        `);
    }
      
      

    function hideTooltip() {
      d3.select(tooltipRef.current).style("visibility", "hidden");
    }
  }, [data, width, height]);

  return (
    <div className="relative flex justify-start items-start">
      <svg ref={svgRef} width={width} height={height} className="w-[1100px] h-[400]" />
      <div
        ref={tooltipRef}
        className="tooltip"
        style={{
          zIndex: 10,
          marginBottom: "10px", // Spacing from top
          marginRight: "10px", // Spacing from left
        }}
      />
    </div>

  );
};

export default SankeyChart;
