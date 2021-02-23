import "./style.css";

import * as d3 from "d3";

import municipiosandalucia from "./data/municipios_energia2019_s.geojson";
import provinces from "./data/provincias_andalucia_s.geojson";

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

const municipios = d3.json(municipiosandalucia);
const provincias = d3.json(provinces);

Promise.all([municipios, provincias]).then((data) => {
  svg
    .append("g")
    .selectAll("path")
    .data(data[0].features)
    .join("path")
    .attr("class", "municipality")
    .attr("d", geopath)
    .attr("fill", "#23395b")
    .append("title")
    .text((d) => {
      return d.properties.total;
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
    .attr("stroke-width", "0.7px");
});
