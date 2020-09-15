function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // set SVG wrapper dimensions to width of the box and height relative to width
  var svgWidth = parseInt(d3.select("#scatter").style("width"));
  var svgHeight = svgWidth - svgWidth / 3.5;
  var margin = {
    top: 50,
    right: 40,
    bottom: 80,
    left: 40
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .classed("chart", true);

  // append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // load data from data.csv (onto local server)
  d3.csv("./assets/data/data.csv").then(function (censusData, err) {
    if (err) throw err;

    // parse data
    censusData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.smokes = +data.smokes
    });

    // create x scale function
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d.poverty) * 0.95,
      d3.max(censusData, d => d.poverty) * 1.05
      ])
      .range([0, width]);

    // create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.healthcare) * 1.2])
      .range([height, 0]);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .classed("stateCircle", true)
      .attr("r", 12);

    // append initial circles text
    circlesGroup.select("text")
      .data(censusData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .classed("stateText", true)
      .text(function (d) { return d.abbr });

    // append x axis label
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + 40})`)
      .attr("text-anchor", "middle")
      .classed("aText", true)
      .text("In Poverty (%)");

    // append y axis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "15px")
      .classed("aText", true)
      .text("Lacks Healthcare (%)");

  }).catch(function (error) {
    console.log(error);
  });

}

// when the browser loads makeResponsive()
makeResponsive();

// when the browser window is resized responsify() is called
d3.select(window).on("resize", makeResponsive);


