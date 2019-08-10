//sources/inspo
//http://bl.ocks.org/eyaler/10586116
/*globals d3*/
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};


var svg = d3.select("svg"),
    svgdom= document.getElementById('graph'),
    width = (window.getComputedStyle(svgdom).getPropertyValue('width')) ,
    height = window.getComputedStyle(svgdom).getPropertyValue('height')
width=~~(width.substr(0, width.length-3))
height=~~(height.substr(0, height.length-3))

console.log('width',width,'height',height);
  
     var color = d3.scaleOrdinal(d3.schemeCategory20);
    
     var simulation;
   
   function drawGraph(graph){
         simulation = d3.forceSimulation()

     simulation.nodes(graph.nodes)
     .force("link", d3.forceLink().id(function(d) { return d.id; })
     )
         .force("center_force", d3.forceCenter(width / 2, height / 2));

     //simulation.alphaTarget(0.1).restart();
     //if (error) throw error;
     var g = svg.append("g")
    .attr("class", "everything");
     
     var link = g.append("g")
     .attr("class", "links")
     .selectAll("line")
     .data(graph.links)
     .enter().append("line")
     .attr("stroke-width", 2 );
     
     var node = g.append("g")
     .attr("class", "nodes")
     .selectAll("circle")
     .data(graph.nodes)
     .enter().append("circle")
     .attr("r", 7)
     .attr("fill", function(d) { return color(d.group); })
     .call(d3.drag()
       .on("start", dragstarted)
       .on("drag", dragged)
       .on("end", dragended));
 //var g = svg.append("g");
     
     
 var texts = g.append("g")
 .attr("class","labels")
 .selectAll("text.label")
 .data(graph.nodes)
 .enter().append("text")
 .attr("class", "label")
 .attr("fill", "black")
 .attr("dx", function(d){return 9})
 .text(function(d) {  return d.name;  });
     
var k =1;
     var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);

zoom_handler(svg);  
     
     function zoom_actions(){
        k = d3.event.transform.k;
       console.log(k)
    g.attr("transform", d3.event.transform)
        let textSize= (12/k).clamp(6,20);
       let nodeSize= (7/k).clamp(4,10)
       texts.style("font-size", textSize+ "px");
       node.attr("r", nodeSize )
       simulation.restart()
}
//  simulation
//  .nodes(graph.nodes)
//  .force("charge", d3.forceManyBody().strength(function(d) {
//   d.weight = link.filter(function(l) {
//     console.log(l.source == d.id)
//   return l.source == d.id || l.target.index == d.index
//   }).size();
//   console.log(d.index+":"+d.weight);
//   return (d.weight*-150)-100; 
// }).distanceMax(300))
//  .force("collide", d3.forceCollide().radius(function(d) { return 10; }))
//  .on("tick", ticked);
     
      simulation
 .nodes(graph.nodes)
 .force("charge", d3.forceManyBody().strength(-100/k).distanceMax(300))
 .force("collide", d3.forceCollide().radius(function(d) { return 10; }))
 .on("tick", ticked);
     
 simulation.force("link")
 .links(graph.links)
    
 function ticked() {
   link
   .attr("x1", function(d) { return d.source.x; })
   .attr("y1", function(d) { return d.source.y; })
   .attr("x2", function(d) { return d.target.x; })
   .attr("y2", function(d) { return d.target.y; });
   node
   .attr("cx", function(d) { return d.x; })
   .attr("cy", function(d) { return d.y; });
   texts.attr("transform", function(d) {
     return "translate(" + d.x+10 + "," + d.y+10 + ")";
   });
 }
}

$(window).resize(function(){
  console.log('resize')
      width = (window.getComputedStyle(svgdom).getPropertyValue('width')) ,
    height = window.getComputedStyle(svgdom).getPropertyValue('height')
width=~~(width.substr(0, width.length-3))
height=~~(height.substr(0, height.length-3))
console.log('width',width,'height',height);
  
});


function dragstarted(d) {
  d3.select(".def")
  .attr("visibility","hidden")
  ;
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
  if(d.group!=3){
    if(d.group!=1){
      d3.select(".frame")
      .attr("src",d.src)
      ;
    }
  }
}
function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}
function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

