function wrapper(){

var boundary;

var svg = d3.select("div.map")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

var w = $("div.map").width();
var h = $("div.map").height();

const albersGlacier = d3.geoConicEqualArea()
                    .parallels([48.4,48.8])
                    .rotate([113.5,0,0])
                    .scale(35000)
                    .center([0,48.6])
                    .translate([w/2,h/2]);
  
const path = d3.geoPath()
               .projection(albersGlacier);

const pathPoint = d3.geoPath();


//load boundary file
$.getJSON("data/boundary.geojson",
  function(d){
          boundary=d.features;

        svg.selectAll(".boundary")
                  .data(boundary)
                  .enter()
                  .append("path")
                      .attr("d", path)
                      .attr("fill", "#111")
                      .attr("stroke", "#ddd");

        });

console.log(w);
//hexbin generator
var hexbin = d3.hexbin()
    .extent([[0, 0], [w, h]])
    .x(function x(d){
      return d.properties.x;
    })
    .y(function y(d){
      return d.properties.y;
    })
    .radius(2);


var radiusScale = d3.scaleSqrt()
    .range([0, 2]);

var colorScale = d3.scaleSequential(d3.interpolateMagma);

var logScale = d3.scaleLog()
          .range([.25,1]);


$.getJSON("data/photos.geojson",function(d){
  photos=d.features;


  for(photo of photos){
    point=albersGlacier(photo.geometry.coordinates);
      photo.properties["x"]= point[0];
      photo.properties["y"]= point[1];
    }

  console.log(photos);
  console.log(hexbin(photos));
  console.log(d3.extent(hexbin(photos),bin => bin.length));


  radiusScale.domain(d3.extent(hexbin(photos),bin => bin.length));
  logScale.domain(d3.extent(hexbin(photos),bin => bin.length));

//add points

  svg.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", function(d){
        if(d.properties["100m"]){
  
          return "#253494";
        } else if (d.properties["500m"]) {
     
          return "#259458";
        } else if (d.properties["1000m"]) {
      
          return "#259458";
        } 
        else if (d.properties["6000m"]) {
        
          return "#259458";
        }else {
      
          return "#929425";
        }
      })
            .attr("opacity", .5)
            .attr("d", path.pointRadius(.5));


svg.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", "white")
            .attr("opacity", 1)
            .attr("d", path.pointRadius(.15));


/*
  svg.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          return hexbin.hexagon(radiusScale(700));
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("fill", function(d){
          return colorScale(logScale(d.length));
        })
        .attr("opacity", 1);
*/
/*
        svg.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          return hexbin.hexagon(radiusScale(200));
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("opacity", function(d){
          return logScale(d.length);
        })
        .attr("fill", "white");
*/

});





}
window.onload = wrapper();
