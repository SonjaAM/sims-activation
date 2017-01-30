
//IMPORTING DATA from CSV

d3.csv("SIMS Activation Log.csv", function (error, rawData) {

    // PRINT_FILTER FUNCTION ------------------------------------------------------------------------------------------------------------------

    function print_filter(filter) {
        'use strict';
        var f = eval(filter);
        if (typeof (f.top) != "undefined") {f = f.top(Infinity); }
        if (typeof (f.dimension) != "undefined")
        { f = f.dimension(function (d) { return ""; }).top(Infinity); }
        console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
    }

    // BEGINNING GRAPH JAVASCRIPT --------------------------------------------------------------------------------------------------------------
  
    //cleaning data

    rawData.forEach(function (a) {
        a.Year = new Date(a.Year);
        a.Significance = +a["Significance (1-5; 5 as most significant activations)"];
        delete a["Significance (1-5; 5 as most significant activations)"];
        a["Start Date"] = new Date(a["Start Date"]);
        a["End Date"] = new Date(a["End Date"]);
    });
    
    //var jsonObject = JSON.stringify(rawData);
    var data = crossfilter(rawData);
    var countryDim = data.dimension(function (a) { return a.Code });
    var countryGroup = countryDim.group().reduceCount();

    //print_filter("countryGroup");
    var maxValue = 3;  /// To DO: NEED TO AUTOMATE THIS VALUE
    var minValue = 1;
    // create color palette function
    var paletteScale = d3.scale.linear()
            .domain([minValue, maxValue])
            .range(["#ff4d4d", "#000000"]); // blue color
    console.log(paletteScale(10));
    console.log(countryDim.bottom(1)[0].value);
    var dataset = {};
    // Datamaps expect data in format:
    // { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
    //   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }

    console.log(countryGroup.all());

    countryGroup.all().forEach(function (a) {
        try {
            var code = a[Object.keys(a)[0]];
            var val = a[Object.keys(a)[1]];
            dataset[code] = { totalActivations: val, fillColor: paletteScale(val) }
        }
        catch (e) {
            console.log(e.message);
        }
    });
    console.log(dataset);

    try {
        var choropleth = new Datamap({
            element: document.getElementById("map"),
            projection: 'mercator',
            fills: { defaultFill: '#d9d9d9' },
            data: dataset,
            geographyConfig: {
                highlightBorderColor: '#ffffff',
                popupTemplate: function (geography, data) {
                    return '<div class="hoverinfo"><span style="font-weight: bold;">'
                        + geography.properties.name + '</span>, Number of Activations: ' + data.totalActivations;
                },
                highlightBorderWidth: 3
            }
        });
        choropleth.legend();
    }
    catch (e) {
        console.log(e.message);
    }

}); //END of D3.csv import