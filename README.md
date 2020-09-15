# D3-challenge
Wk16 D3 Dabbler

# D3-challenge
Wk16 D3 Dabbler

## About the Project
This project consists of 3 different solutions to generating a scatter plot graphic, each with increased functionality.  In each solution, the graphic is created between two data variables and uses both html and a Javascript file, with SVG and d3js plugins.  The scatter plot pulls off a single dataset, data.csv using the d3.csv function.  The dataset itself is based on the 2014 ACS 1-year US census estimates: [https://factfinder.census.gov/faces/nav/jsf/pages/searchresults.xhtml](https://factfinder.census.gov/faces/nav/jsf/pages/searchresults.xhtml) and includes data on rates of income, obesity, poverty, etc. by US state.


The first solution, [app.js](/assets/js/app.js ), generates a static scatterplot between two variables Healthcare vs. Poverty.  In the second solution, interactivity is introduced with users given the option of 3 X-axis and 3 Y-axis choices.  On selecting an option, the corresponding axis is re-scaled to fit the new data range and the circle locations and text on the plot the transition to new locations and values respectively.  In the final solution, d3 tool tips are added, using the d3-tip.js plugin developed by [Justin Palmer]()) and include the name of the state, as well as the name of each X and Y axis selected, with their corresponding values.


Note: testing was done using python -m http.server to run the visualization. This hosted the page at localhost:8000 in my web browser.






## Built With

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/javascript)
* [d3js](https://d3js.org/)


## Acknowledgements


