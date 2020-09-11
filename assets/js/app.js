var censusData // will default to undefined

// load data from data.csv (onto local server)
d3.csv("./assets/data/data.csv").then(function(censusData) {

  console.log(censusData);

  // log a list of states
  var state = censusData.map(data => data.state); // for list of names
  console.log("state", state);
  
});

