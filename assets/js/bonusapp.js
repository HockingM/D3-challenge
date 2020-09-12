function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // set SVG wrapper dimensions to width of the box and height relative to width
  var svgWidth = parseInt(d3.select("#scatter").style("width"));
  var svgHeight = svgWidth - svgWidth / 3.5;  // confirm 3.5

  var margin = {
    top: 50,
    right: 40,
    bottom: 80,
    left: 40
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .classed("chart", true);

  // append an SVG group
  var scatterGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // set Params
  var chosenXAxis = "poverty";

  // function used for updating x-scale var upon click on axis label
  function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
  }

  // // function used for updating circles group with new tooltip
  // function updateToolTip(chosenXAxis, circlesGroup) {

  //   var toolTip = d3.tip()
  //     .attr("class", "tooltip")
  //     .offset([80, -60])
  //     .html(function (d) {
  //       return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
  //     });

  //   circlesGroup.call(toolTip);

  //   circlesGroup.on("mouseover", function (data) {
  //     toolTip.show(data);
  //   })
  //     // onmouseout event
  //     .on("mouseout", function (data, index) {
  //       toolTip.hide(data);
  //     });

  //   return circlesGroup;
  // }

  // load data from data.csv (onto local server)
  d3.csv("./assets/data/data.csv").then(function (censusData, err) {
    if (err) throw err;

    // parse data
    censusData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity
    });

    // Create x scale function
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData,
        d => d.healthcare)])
      .range([height, 0]);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = scatterGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    scatterGroup.append("g")
      .call(leftAxis);


    // append initial circles
    var circlesGroup = scatterGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .classed("stateCircle", true)
      .attr("r", 20);


    // append circles text
    circlesGroup.select("text")
      .data(censusData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.healthcare))
      .classed("stateText", true)
      .text(function (d) { return d.abbr });

    // Create group for three x-axis labels
    var xAxisGroup = scatterGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var xAxisPoverty = xAxisGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%))");

    var xAxisAge = xAxisGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var xAxisIncome = xAxisGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // append y axis
    scatterGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "15px")
      .classed("axis-text", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    //  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    xAxisGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "num_albums") {
            xAxisPoverty
              .classed("active", true)
              .classed("inactive", false);
            numRecordsLabel
              .classed("active", false)
              .classed("inactive", true);
            xAxisIncome
              .classed("active", false)
              .classed("inactive", true);
          }

          else if (chosenXAxis === "num_albums") {
            xAxisPoverty
              .classed("active", false)
              .classed("inactive", true);
            xAxisAge
              .classed("active", true)
              .classed("inactive", false);
            xAxisIncome
              .classed("active", false)
              .classed("inactive", true);
          }


          else {
            xAxisPoverty
              .classed("active", false)
              .classed("inactive", true);
            xAxisAge
              .classed("active", true)
              .classed("inactive", false);
            xAxisIncome
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

  }).catch(function (error) {
    console.log(error);
  });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);


