import "./style.css";

import * as d3 from "d3";

import municipiosandalucia from "./data/municipios_energia2019.geojson";
import provinces from "./data/provincias_andalucia.geojson";

const width = 1000;
const height = 350;

const svg = d3
  .select("div#map")
  .append("svg")
  .attr("viewBox", [0, 0, width, height]);

const projection = d3
  .geoMercator()
  .scale(5500)
  .center([-4.556, 37.333])
  .translate([width / 1.95, height / 2]);

const geopath = d3.geoPath(projection);

const colorScale = d3
  .scaleThreshold()
  .domain([0.1, 45000, 175000, 575000, 130, 1300000, 2500000])
  .range(d3.schemePuBuGn[7]);

const municipios = d3.json(municipiosandalucia);
const provincias = d3.json(provinces);

function roundDecimal(number) {
  const castString = parseFloat(number).toFixed(2);
  return Intl.NumberFormat("es-ES").format(castString);
}

Promise.all([municipios, provincias]).then((data) => {
  svg
    .append("g")
    .selectAll("path")
    .data(data[0].features)
    .join("path")
    .attr("class", "municipality")
    .attr("d", geopath)
    .attr("stroke", "#808080")
    .attr("stroke-width", "0.1px")
    .attr("fill", (d) => {
      return colorScale(d.properties.total);
    })
    .append("title")
    .text((d) => {
      let infoTitle = `${d.properties.municipio} ${roundDecimal(
        d.properties.total
      )} Mwh`;
      return infoTitle;
    });
  svg
    .append("g")
    .selectAll("path")
    .data(data[1].features)
    .join("path")
    .attr("class", "provinces")
    .attr("d", geopath)
    .attr("fill", "none")
    .attr("stroke", "#FFF")
    .attr("stroke-width", "0.8px");
});
