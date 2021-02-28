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

const colorScaleResidencial = d3
  .scaleThreshold()
  .domain([21184, 83302, 205668, 559702, 1078192])
  .range(d3.schemeYlOrBr[5]);

const municipios = d3.json(municipiosandalucia);
const provincias = d3.json(provinces);

function roundDecimal(number) {
  const castString = parseFloat(number).toFixed(2);
  return Intl.NumberFormat("es-ES").format(castString);
}

Promise.all([municipios, provincias]).then((data) => {
  let all_municipios = data[0].features;
  let filter_municipios = all_municipios.filter((m) => m.properties.total > 0);
  let filter_nodata_municipios = all_municipios.filter(
    (m) => m.properties.total == 0
  );

  svg
    .append("g")
    .selectAll("path")
    .data(filter_municipios)
    .join("path")
    .attr("class", "municipality")
    .attr("d", geopath)
    .attr("stroke", "#808080")
    .attr("stroke-width", "0.2px")
    .attr("fill", (d) => {
      return colorScaleResidencial(d.properties.residencial);
    })
    .append("title")
    .text((d) => {
      let infoTitle = `${d.properties.municipio} ${roundDecimal(
        d.properties.total
      )} Mwh `;
      return infoTitle;
    });

  svg
    .append("g")
    .selectAll("path")
    .data(filter_nodata_municipios)
    .join("path")
    .attr("class", "municipality_nodata")
    .attr("d", geopath)
    .attr("fill", "#8ea8c3")
    .attr("stroke", "#FFF")
    .attr("stroke-width", "0.2px")
    .append("title")
    .text((d) => {
      return `${d.properties.municipio} (Sin datos)`;
    });
  svg
    .append("g")
    .selectAll("path")
    .data(data[1].features)
    .join("path")
    .attr("class", "provinces")
    .attr("d", geopath)
    .attr("fill", "none")
    .attr("stroke", "#808080")
    .attr("stroke-width", "0.9px");
});
