Vamos a continuar con la serie de entradas dedicadas a la creación visualizaciones web de datos espaciales con la librería D3. 

En la primera de ellas vimos [cómo crear una estructura básica de ficheros para nuestra página y añadimos de archivos GeoJSON con D3](http://sigdeletras.com/2021/desarrollo-web-de-visor-de-mapas-con-la-libreria-d3/).

Ahora toca usar los atributos de las capas que almacenan el consumo anual de energía eléctrica por municipios de Andalucía en 2019. La información procede del [Sistema de Información Multiterritorial de Andalucía](https://www.juntadeandalucia.es/institutodeestadisticaycartografia/badea/informe/anual?CodOper=b3_151&idNode=23204) del IECA. 

Mi objetivo es **crear un mapa donde quede reflejado en agrupaciones que reflejen áreas, en este caso municipios, con un consumo energético anual similar**.

## Mapa de coropletas

Dentro del ámbito del diseño cartográfico este tipo de representaciones se denomina **mapa de coropletas**, es decir un mapa temático que representa una variable estadística.

Para este tipo de representaciones es importante elegir correctamente el método que vamos a usar para clasificar los datos. Los métodos más usados son: **intervalo manual, intervalo definido, equivalente, basado en cuantiles, rupturas naturales de Jenks o desviación estándar**. La mayoría de los Sistemas de Información Geográfica cuenta con opciones para aplicarlos.

![02_01_QGIS](img/02_01_QGIS.png)

Usaremos el método de **rupturas naturales** creado por el cartógrafo George F. Jenks. En esta clasificación las clases se crean de manera que los valores similares se agrupan mejor y se maximizan las diferencias entre las clases. Las rupturas marcan diferencias considerables entre los valores de los datos.

## Filtrado de datos para consumo residencial

He decidido cambiar la variable a representar. En vez de mostrar el valor total, los datos van a representar solo el consumo residencial. En valor total contenía la suma de los consumos de todos los sectores (residencial, industrial, servicios...) y a fines didácticos y de análisis creo que la información residencial da más juego.

Otra decisión ha sido separar los datos en dos capas. La primera con los municipios con datos y la segunda, con el grupo de municipios de los que el IECA no ofrece información. 

Según he podido ver D3 tiene la opción de filtros, pero he preferido hacerlo directamente con JavaScript mediante el método [filter()](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

```JavaScript
Promise.all([municipios, provincias]).then((data) => {
  let all_municipios = data[0].features;

  let filter_municipios = all_municipios.filter((m) => m.properties.total > 0);
  let filter_nodata_municipios = all_municipios.filter(
    (m) => m.properties.total == 0
  );


```

## Creando un esquema de color con D3

Para crear nuestro mapa temático con D3 usamos las **escalas**. Gracias a este tipo de objetos podremos representar una dimensión de datos abstractos en una representación visual (píxeles). Los valores estarán definidos por un dominio (*domain*) que es usado como elemento de entrada. Los datos de salida, o representación visual se hace mediante un rango (*range*). 

Para nuestro proyecto definimos un tipo de escala basada en límites o umbrales (*scaleThreshold*). El dominio serán los valores de las rupturas naturales, obtenidas con QGIS. Y para el rango, usaremos los esquemas cromáticos de D3 definiendo a partir de 5 clases.

```JavaScript
//main.js
...
const colorScaleResidencial = d3
  .scaleThreshold()
  .domain([21184, 83302, 205668, 559702, 1078192])
  .range(d3.schemeYlOrBr[5]);
...
```
--------------------------

Para aplicar nuestra escala definida en la variable *colorScaleResidencial* cambiaremos el atributo de relleno del *path* de municipios por una función que aplique el valor de la variable para cada dato del total de consumo.

Hemos mejorado el resultado a nivel visual añadiendo un color gris a la delimitación de los municipios.

```javascript
//main.js
...
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
    .attr("stroke", "#C0C0C0")
    .attr("stroke-width", "0.2px")
    .attr("fill", (d) => {
      return colorScale(d.properties.total);
    })
    .append("title")
    .text((d) => {
      return d.properties.total;
    });
...
```
![02_02_coropletas.png](img/02_02_coropletas.png)

Gracias a estos cambios ya podemos obtener los primeros análisis de los datos. Destacan las capitales de provincia como Sevilla, Málaga o Córdoba en una primera categoría, seguido de otras capitales como Granada y Almería y los municipios de Marbella y Jerez. 

En la tercera agrupación están otras capitales y municipios cercanos a capitales provinciales donde vive parte de su población (Roquetas, Torremolinos, Alcalá de Guadaira, El Puerto, San Fernando...)

Un cuarto grupo con consumos entre 80.000 y 210.000 Mwh, está concentrado en el litoral andaluz y a lo largo de la vega del Guadalquivir.

Y para terminar, casi el 84% de los municipios poseen un consumo inferior a 210.000 Mwh. Por ejemplo, en el caso de la provincia de Córdoba, estos municipios se sitúan al norte de la capital en zona de Sierra Morena.

Como vemos, el valor de un mapa correctamente simbolizado es alto y su análisis puede ayudarnos correctamente a comprender y analizar las variables representadas. 

## Información adicional mediante etiquetas

Mejorado el aspecto visual, podemos completar la información ofrecida al usuario mediante etiquetas.

Lo primero que haremos es crear una función para que formatee el valor numérico del total. La función redondea a dos decimales y añade comas para diferenciar los millares.

```JavaScript
//main.js
...
function roundDecimal(number) {
  const castString = parseFloat(number).toFixed(2);
  return Intl.NumberFormat("es-ES").format(castString);
}
```

Y para finalizar, vamos a usarla como valor de *title* para añadir el nombre del municipio y la unidad de medida (Megavatios/hora).

```javascript
//main.js
...
    .text((d) => {
      let infoTitle = `${d.properties.municipio} ${roundDecimal(
        d.properties.total
      )} Mwh `;
      return infoTitle;
...
```
Solo un último detalle. Nuestros elementos tienen clases asignadas. Con unas pocas de código en el CSS, añadimos un efecto de resalte cuando pasamos el curso.

```CSS
/*style.css*/

.municipality {
  cursor: pointer;
}

.municipality:hover {
  stroke: red;
  stroke-width: 2px;
  size: 3em;
}
```
## Resultado final

Este sería el resultado final con los nuevos cambios y modificaciones.

![02_v2_final.gif](img/02_v2_final_hover.gif)

# Próximos pasos

Queda ya poco para terminar nuestro proyecto. Espero poder dedicarle un tiempo para mejorar los datos ofrecidos al usuario y poder añadir algún recurso más usando D3.

# Recursos

- Repositorio GitHub [https://github.com/sigdeletras/d3-energy-map/](https://github.com/sigdeletras/d3-energy-map/)
- Página del ["Visor de consumo anual de energía eléctrica de los municipios de Andalucía 2019 v2"](http://sigdeletras.com/d3-energy-map/public/v2/index.html)

