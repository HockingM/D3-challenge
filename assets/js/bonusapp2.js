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
        left: 80
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
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(censusData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.95,
            d3.max(censusData, d => d[chosenXAxis] * 1.05)
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(censusData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
            d3.max(censusData, d => d[chosenYAxis] * 1.2)
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));


        return circlesGroup;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }

    // function used for updating circles group text with a transition to
    // new circles
    function renderXLabels(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("class", "stateText")
            .attr("x", d => newXScale(d[chosenXAxis]));

        return circlesGroup;
    }

    // function used for updating circles group text with a transition to
    // new circles
    function renderYLabels(circlesGroup, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("class", "stateText")
            .attr("y", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

        var xLabel;

        if (chosenXAxis === "poverty") {
            xLabel = "Poverty:"
            
        }
        else if (chosenXAxis === "age") {
            xLabel = "Age:";
        }

        else {
            xLabel = "Household Income:";
        }

        var yLabel;

        if (chosenYAxis === "healthcare") {
            yLabel = "Healthcare:"
            
        }
        else if (chosenYAxis === "smokes") {
            yLabel = "Smokes:";
        }

        else {
            yLabel = "Obese:";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function (data) {
            toolTip.show(data);
        })
            // onmouseout event
            .on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }

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
        var yLinearScale = yScale(censusData, chosenYAxis);


        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = scatterGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = scatterGroup.append("g")
            .attr("class", "y axis")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = scatterGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .classed("stateCircle", true)
            .attr("r", 12);

        // create group for initial circles text
        var labelsGroup = circlesGroup.select("circle")
            .data(censusData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("class", "stateText")
            .text(function (d) { return d.abbr });

        // create group for three x-axis labels
        var xAxisGroup = scatterGroup.append("g")
            .attr("class", "xLabel")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var xAxisPoverty = xAxisGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("valueX", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%))");

        var xAxisAge = xAxisGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("valueX", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var xAxisIncome = xAxisGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("valueX", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // create group for three y-axis labels
        var yAxisGroup = scatterGroup.append("g")
            .attr("class", "yLabel")
            //   .attr("transform", "rotate(-90)")
            .attr("transform", `translate(${0 - margin.left} , ${height / 2 - 40}) rotate(-90)`);

        var yAxisHealthcare = yAxisGroup.append("text")
            .attr("dy", "45px")
            .attr("valueY", "healthcare") // value to grab for event listener
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var yAxisSmokes = yAxisGroup.append("text")
            .attr("dy", "30px")
            .attr("valueY", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var yAxisObesity = yAxisGroup.append("text")
            .attr("dy", "15px")
            .attr("valueY", "obesity") // value to grab for event listener
            .classed("inactive", true)
            .text("Obese (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

        // x axis labels event listener
        xAxisGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var valueX = d3.select(this).attr("valueX");
                if (valueX !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = valueX;

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(censusData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                    // updates circles text with new x values
                    labelsGroup = renderXLabels(labelsGroup, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        xAxisPoverty
                            .classed("active", true)
                            .classed("inactive", false);
                        xAxisAge
                            .classed("active", false)
                            .classed("inactive", true);
                        xAxisIncome
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenXAxis === "age") {
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
                            .classed("active", false)
                            .classed("inactive", true);
                        xAxisIncome
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });

        /// y axis labels event listener
        yAxisGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var valueY = d3.select(this).attr("valueY");
                if (valueY !== chosenYAxis) {

                    // replaces chosenXAxis with value
                    chosenYAxis = valueY;

                    // functions here found above csv import
                    // updates x scale for new data
                    yLinearScale = yScale(censusData, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new x values
                    circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                    // updates circles text with new y values
                    labelsGroup = renderYLabels(labelsGroup, yLinearScale, chosenYAxis);
                    
                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

                    // changes classes to change bold text
                    if (chosenYAxis === "healthcare") {
                        yAxisHealthcare
                            .classed("active", true)
                            .classed("inactive", false);
                        yAxisSmokes
                            .classed("active", false)
                            .classed("inactive", true);
                        yAxisObesity
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenYAxis === "smokes") {
                        yAxisHealthcare
                            .classed("active", false)
                            .classed("inactive", true);
                        yAxisSmokes
                            .classed("active", true)
                            .classed("inactive", false);
                        yAxisObesity
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        yAxisHealthcare
                            .classed("active", false)
                            .classed("inactive", true);
                        yAxisSmokes
                            .classed("active", false)
                            .classed("inactive", true);
                        yAxisObesity
                            .classed("active", true)
                            .classed("inactive", false);
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



