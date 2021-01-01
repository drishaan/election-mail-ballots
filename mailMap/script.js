/* Screen Adjustments */

var isSmallScreen = window.innerWidth < 400;

var svg = null;


/* map state */

let percentMode = true;
let curRaceObj;

let maxc = 0;
let maxd = 0;
let max = 0;
let min = 1;

let marginRadius = d3.scaleSqrt()
  .domain([0, 1e4])
  .range([0, isSmallScreen ? 60 : 80])

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildMap(mapData, data) {

  const mapGeom = mapData.objects.cb_2015_michigan_county_20m;


  let land = topojson.feature(mapData, mapGeom)
  let width = svg.attr("width") - 24
  let height = svg.attr("height") - 34

  let path = d3.geoPath()
    .projection(d3.geoMercator()
      .fitSize([width, height], land)
    )

  svg.style("padding", 12);

  svg.append("g")
    .attr("class", "counties")
    .style("display", percentMode ? null : "none")
    .selectAll("path")
    .data(land.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => {
      return getColor(d.properties.NAME.toLowerCase(), data)
    })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)

  svg.append("path")
    .attr("class", "borders county-border")
    .attr("d", path(topojson.mesh(mapData, mapGeom, function (a, b) { return a !== b; })));

  svg.append("path")
    .attr("class", "borders state-border")
    .attr("d", path(topojson.mesh(mapData, mapGeom, function (a, b) { return a === b; })))

  svg.append("path")
    .attr("class", "borders selected-border")


if(!isSmallScreen){
  var defs = svg.append("defs");
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
  // Set the color for the start (0%)
  linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#00441b"); //Red
  
  //Set the color for the end (100%)
  linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f7fcf5"); //Yello
    
  svg.append('g')
    .append("rect")
    .attr("width", 6)
    .attr("height", 120)
    .attr("x", width - 40)
    .attr("y", 10)
    .style("fill", "url(#linear-gradient)");
  
  
  svg.append('g')
  .append('text')
  .text("% of ballots accepted")
    .attr("x", width - 45)
    .attr("y", 130)
    .attr("transform", function(){
      return "rotate(-90,"+ (width - 45) +",130)"
    })
    .attr("font-size", "10px");
  
  svg.append('g')
    .append('text')
    .text(function(){
      return (min * 100).toFixed(0) + "%" //+"req"
    })
      .attr("x", width - 33)
      .attr("y", 130)
      .attr("font-size", "11px")
  
  svg.append('g')
    .append('text')
    .text(function(){
      return (max*100) .toFixed(0)+ "%" //+"req"
    })
      .attr("x", width - 33)
      .attr("y", 20)
      .attr("font-size", "11px")
}


var div = d3.select("#themap").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("font-size", isSmallScreen ? "16px" : "17px")
  .style("width", isSmallScreen ? "110px" : "140px")
  // .style("width", isSmallScreen ? "100px" : "140px");

  function handleMouseOver(e) {
    const countyPath = getCountyPath(e, mapGeom)
      d3.select(".selected-border")
        .attr("d", path(topojson.mesh(mapData, countyPath, function (a, b) { return a === b; })));


    div.transition().duration(300)
      .style("opacity", 1)
      div.html(function(){
        return "<strong>"+ e.properties.NAME+ "</strong><br>" + 
                numberWithCommas(getreq(e.properties.NAME.toLowerCase(), data)) + 
                " requested<br>" + numberWithCommas(getacc(e.properties.NAME.toLowerCase(), data)) + 
                " accepted<br>" + getpercentage(e.properties.NAME.toLowerCase(), data) + "% accepted</br>"
      })
      .style("left", isSmallScreen ? "30px" : "30px")
      .style("top", isSmallScreen ? "150px" :"220px");
    
  }

  function handleMouseOut(e) {
    d3.select(".selected-border")
      .attr("d", null);
    d3.select(".infobox p").style("display", "none")
    div.transition().duration(300)
      .style("opacity", 0);
  }
}


function clearMap() {
  svg.html("");
}

function buildViz(mapData, electionData) {

  buildMap(mapData, electionData)

  d3.select(".controlbox")
    .style("display", "initial")

}


function getColor(county, data){

    var color = d3.scaleLinear()
    .domain([min, max])
    .range(["#f7fcf5", "#00441b"])
    .interpolate(d3.interpolate);


  for (var i = 0; i < data.length; i++) {
    if(county == data[i].County.toLowerCase()){
        if(data[i].acc == 0) {
          return "#e6e7e8"
        }
        return color(data[i].acc/data[i].req);
    }
  }
  return "#e6e7e8"
}


function getSize(county, data){

  // console.log(maxt)
  for (var i = 0; i < data.length; i++) {
    // console.log(data[i].County);
    if(county == data[i].County.toLowerCase()){
      return parseInt(data[i].req);
    }
  }
  return 0
}

function getreq(county, data){

  // console.log(maxt)
  for (var i = 0; i < data.length; i++) {
    // console.log(data[i].County);
    if(county == data[i].County.toLowerCase()){
        return parseInt(data[i].req);
    }
  }
  return 0
}

function getacc(county, data){

  // console.log(maxt)
  for (var i = 0; i < data.length; i++) {
    // console.log(data[i].County);
    if(county == data[i].County.toLowerCase()){
      if(data[i].acc > 0){
        return parseInt(data[i].acc);
      }
      else{
        return 0;
      }  
    }
  }
  return 0
}

function getpercentage(county, data){

  // console.log(maxt)
  for (var i = 0; i < data.length; i++) {
    // console.log(data[i].County);
    if(county == data[i].County.toLowerCase()){
      if(data[i].acc > 0){
        return parseInt(100*data[i].acc/data[i].req).toFixed(1);
      }
      else{
        return 0;
      }  
    }
  }
  return 0
}

function getCountyPath(countyData, pathData) {
  let filteredGeometries = pathData.geometries.filter(elt => {
    return countyData.properties == elt.properties
  })
  return { type: "GeometryCollection", geometries: filteredGeometries }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

d3.json("https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/MI-26-michigan-counties.json").then(function (mich) {
    var url = "https://election-site-1.s3.us-east-2.amazonaws.com/maildata";
    d3.json(url)
        .then(function(data) {
            currDate = data.mi.date
            data = data.mi.counties;

            svg = d3.select("svg");

            svg.attr("width", isSmallScreen ? 300 : 400);
            svg.attr("height", isSmallScreen ? 300 : 400);
        
            if (isSmallScreen) {
              d3.select(".centerbox").style("width", 300);
              d3.select(".controlbox").style("left", 100);
            }
        
            d3.select(".title")
              .append(isSmallScreen ? "h4" : "h3")
              .text("Mail In Ballots in Michigan")
            
            d3.select("#creditDate")
              .text(currDate)

            tempArr = []
            for(let key in data){
                let keySave = key;
                if(key === "St Clair"){
                    keySave = "St. Clair"
                }
                else if (key === "St Joseph"){
                    keySave = "St. Joseph"
                }
                tempArr.push({
                    "County":keySave,
                    "req":data[key].req,
                    "acc":data[key].acc
                })
                if(parseInt(data[key].acc)/parseInt(data[key].req) < min){
                    min = parseInt(data[key].acc)/parseInt(data[key].req)
                  }
                if(parseInt(data[key].acc)/parseInt(data[key].req) > max){
                  max = parseInt(data[key].acc)/parseInt(data[key].req)
                }
            }

            console.log(tempArr)
            buildViz(mich, tempArr)
            var pymChild = new pym.Child();
    });

});