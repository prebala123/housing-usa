function assignment8(){
    var filePath="housing.csv";
    question0(filePath);
	question1(filePath);
	question2(filePath);
	question21(filePath);
	question3(filePath);
	question4(filePath);
	question5(filePath);
}

var stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    };

var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        console.log(data)
    });
}

var question1=function(filePath){
    d3.csv(filePath).then(function(data){
		
		var houses = data.map(function(d){d.price = Math.round(d.price/10)*10; d.sqfeet = Math.round(d.sqfeet/10)*10; return d})
		var cleaned = d3.flatRollup(houses, v=>v.length, d=>d.price, d=>d.sqfeet)
		houses = cleaned.map(function(d){return {'price': d[0], 'sqfeet': d[1]}})
		
        var width = 1000
		var height = 1000
		var padding = 150
		var offset = 10
		
		var svg = d3.select("#plot1")
			.append('svg')
			.attr("width", width)
			.attr("height", height)
		
		var xScale = d3.scaleLog()
			.domain([1, d3.max(houses, d=>+d.sqfeet)+1])
			.range([padding, width-padding]).nice().clamp(true)		
		svg.append("g")
			.attr("class", "x_axis")
			.attr("transform", "translate(0,"+(height-padding)+")")
			.call(d3.axisBottom(xScale))
			//.selectAll("text").attr("transform", "rotate(45),translate(0,0)").attr("text-anchor", "start")
		
		var yScale = d3.scaleLog()
			.domain([1, d3.max(houses, d=>+d.price)+1])
			.range([height-padding, padding]).nice().clamp(true)
		svg.append("g")
			.attr("class", "y_axis")
			.attr("transform", "translate("+padding+",0)")
			.call(d3.axisLeft(yScale));
		
		svg.selectAll("circle")
			.data(houses)
			.enter()
			.append("circle")
			.attr("cx", function(d){return xScale(d.sqfeet)})
			.attr("cy", function(d){return yScale(d.price)})
			.attr("r", 1)
			.style("fill", "#40b860")
		
		var labels = [
            {title: "Price and Size of Houses"}, 
            {xaxis: "Size (Log Square Feet)"}, 
            {yaxis: "Price (Log Dollars per Month)"}];
        svg.selectAll(".title").data(labels).enter().append("text")
            .attr("class", "title")
            .attr("x", padding * 3)
			.attr("y", padding / 2)
            .attr("font-size", 30)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(labels).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height - padding / 2)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(labels).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", padding / 2)
            .text(function(d) { return d.yaxis; });
    });
}

var question2=function(filePath){
    d3.csv(filePath).then(function(data){
        //console.log(data)
		var states = d3.flatRollup(data, v=>d3.mean(v, d=>d.electric_vehicle_charge), d=>d.state)
		states.map(function(d){d[0] = stateSym[d[0].toUpperCase()]; return d})
		
		var width = 1000
		var height = 1000
		var padding = 100;
		var paddingInner = 0.1;
		var barPadding = 25;
		var offset = 10
		
		var svg = d3.select("#plot2")
			.append('svg')
			.attr("width", width)
			.attr("height", height)
		
		var sorted = states.sort((a,b)=>d3.descending(a[1], b[1]))
		
		var yScale = d3.scaleBand()
						.domain(sorted.map(d=>d[0]))
						.range([padding, height-padding])
						.paddingInner(paddingInner);
		svg.append("g")
			.attr("transform", "translate(" + padding + ",0)")
			.call(d3.axisLeft(yScale).tickSizeOuter(0));
						
		var xScale = d3.scaleLinear()
						.domain([0, d3.max(states, function(d){return (+d[1]);})])
						.range([padding, width-padding]).nice();
		svg.append("g")
			.attr("transform", "translate(0," + (height-padding) + ")")
			.call(d3.axisBottom(xScale));
		
		var tooltip = d3.select("#plot2")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "2px")
			.style("border-radius", "5px")
			.style("padding", "5px")

		var mouseover = function (e, d) {
				tooltip.transition().duration(50).style("opacity", 0.9);
				//console.log(e)
				d3.select(e.target)
					.attr('stroke', 'yellow')
					.attr('stroke-width', '3px')
			}
		var mousemove = function (e, d) {
				tooltip
					.html("State: " + d[0] + "<br> Chargers: "+ (d[1]*100).toFixed(2) + "%")
					.style("position", "absolute")
					.style("left", (e.pageX + 20) + "px")
					.style("top", (e.pageY) + "px")
			}
		var mouseleave = function (e, d) {
				tooltip.transition().duration(50).style("opacity", 0);
				d3.select(e.target)
					.attr('stroke', 'none')
			}
		
		svg.selectAll("plot")
			.data(states).enter()
			.append("rect")
			.attr("class", "plot")
			.attr("x", function(d){return padding;})
			.attr("y", function(d){return yScale(d[0]);})
			.attr("width", function(d){return xScale(+d[1])-padding;})
			.attr("height", function(d){return yScale.bandwidth()})
			.style("fill", "#40b860")
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseout", mouseleave)
		
		var labels = [
            {title: "Houses with Electric Vehicle Chargers by State"}, 
            {xaxis: "Proportion of Houses With Chargers"}, 
            {yaxis: "State"}];
        svg.selectAll(".title").data(labels).enter().append("text")
            .attr("class", "title")
            .attr("x", padding * 3)
			.attr("y", padding / 2)
            .attr("font-size", 30)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(labels).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height - padding / 2)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(labels).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", offset)
            .text(function(d) { return d.yaxis; });
    });
}

var question21=function(filePath){
    d3.csv(filePath).then(function(data){
        //console.log(data)
		var states = d3.flatRollup(data, v=>d3.mean(v, d=>d.electric_vehicle_charge), d=>d.state)
		states.map(function(d){d[0] = stateSym[d[0].toUpperCase()]; return d})
		
		var width = 1000
		var height = 1000
		var padding = 100;
		var paddingInner = 0.1;
		var barPadding = 25;
		var offset = 10
		
		var svg = d3.select("#plot21")
			.append('svg')
			.attr("width", width)
			.attr("height", height)
		
		var sorted = states.sort((a,b)=>d3.descending(a[1], b[1]))
		sorted = sorted.slice(0,10)
		
		var yScale = d3.scaleBand()
						.domain(sorted.map(d=>d[0]))
						.range([padding, height-padding])
						.paddingInner(paddingInner);
		svg.append("g")
			.attr("transform", "translate(" + padding + ",0)")
			.call(d3.axisLeft(yScale).tickSizeOuter(0));
						
		var xScale = d3.scaleLinear()
						.domain([0, d3.max(states, function(d){return (+d[1]);})])
						.range([padding, width-padding]).nice();
		svg.append("g")
			.attr("transform", "translate(0," + (height-padding) + ")")
			.call(d3.axisBottom(xScale));
		
		var tooltip = d3.select("#plot21")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "2px")
			.style("border-radius", "5px")
			.style("padding", "5px")

		var mouseover = function (e, d) {
				tooltip.transition().duration(50).style("opacity", 0.9);
				//console.log(e)
				d3.select(e.target)
					.attr('stroke', 'yellow')
					.attr('stroke-width', '3px')
			}
		var mousemove = function (e, d) {
				tooltip
					.html("State: " + d[0] + "<br> Chargers: "+ (d[1]*100).toFixed(2) + "%")
					.style("position", "absolute")
					.style("left", (e.pageX + 20) + "px")
					.style("top", (e.pageY) + "px")
			}
		var mouseleave = function (e, d) {
				tooltip.transition().duration(50).style("opacity", 0);
				d3.select(e.target)
					.attr('stroke', 'none')
			}
		
		svg.selectAll("plot")
			.data(sorted).enter()
			.append("svg:image")
			.attr("xlink:href", "car.png")
			.attr("class", "plot")
			.attr("x", function(d){return padding;})
			.attr("y", function(d){return yScale(d[0]);})
			.attr("width", function(d){return (xScale(+d[1])-padding)*2;})
			.attr("height", function(d){return yScale.bandwidth()})
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseout", mouseleave)
		
		var labels = [
            {title: "Houses with Electric Vehicle Chargers by Top 10 States"}, 
            {xaxis: "Proportion of Houses With Chargers"}, 
            {yaxis: "State"}];
        svg.selectAll(".title").data(labels).enter().append("text")
            .attr("class", "title")
            .attr("x", padding * 3)
			.attr("y", padding / 2)
            .attr("font-size", 30)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(labels).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height - padding / 2)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(labels).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", offset)
            .text(function(d) { return d.yaxis; });
    });
}

var question3=function(filePath){
    d3.csv(filePath).then(function(data){
		
		var houses = data.filter(function(d){return d.type != "assisted living" && d.type != "land"})
        //console.log(houses)
		
		var columnsToSum = ['beds', 'baths']
		var colors = ['orange', 'blue']
		
		houses = d3.rollup(houses,
                  v => Object.fromEntries(columnsToSum.map(col => [col, d3.mean(v, d => +d[col])])),
                  d => d.type)
		
		houses = Array.from(houses, ([type, rooms]) => {
			const result = {type, ...rooms};
			result.total = result.beds + result.baths
			return result;
		})
		//console.log(houses)
		
		var sorted = houses.sort((a,b)=>d3.descending(a.total, b.total))
		//console.log(sorted)
		
		
		var subgroups = ['baths', 'beds'];
		var groups = houses.map(d=>d.type)
		var stackedData = d3.stack()
			.keys(subgroups)
			(houses)
		
		
		var width = 1000
		var height = 1000
		var padding = 100
		var paddingInner = 0.05
		var paddingOuter = 0.05
		var barPadding = 25
		var offset = 10
		
		var svg = d3.select("#plot3")
			.append('svg')
			.attr("width", width)
			.attr("height", height)
		
		var xScale = d3.scaleBand()
			.domain(groups)
			.range([padding, width-padding])
			.paddingInner(paddingInner)
			.paddingOuter(paddingOuter)
		svg.append("g")
			.attr("class", "x_axis")
			.attr("transform", "translate(0," + (height-padding) + ")")
			.call(d3.axisBottom(xScale).tickSizeOuter(0));
						
		var yScale = d3.scaleLinear()
			.domain([d3.max(houses, function(d){return (+d.beds)+(+d.baths);}), 0])
			.range([padding, height-padding]).nice();
		svg.append("g")
			.attr("transform", "translate(" + padding + ",0)")
			.call(d3.axisLeft(yScale));
		
		var colorScale = d3.scaleOrdinal()
							 .domain(subgroups)
							 .range(colors);
		
		svg.append("g")
			.attr("class", "r")
			.selectAll("g")
			.data(stackedData)
			.enter().append("g")
			  .attr("fill", function(d) { return colorScale(d.key); })
			  .selectAll("rect")
			  .data(function(d) { return d; })
			  .enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return xScale(d.data.type); })
				.attr("y", function(d) { return yScale(d[1]); })
				.attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
				.attr("width",xScale.bandwidth())
		
		var labels = [
            {title: "Number Of Rooms for Types of Houses"}, 
            {xaxis: "House Type"}, 
            {yaxis: "Number of Rooms"},
			{legend: "Legend"}];
        svg.selectAll(".title").data(labels).enter().append("text")
            .attr("class", "title")
            .attr("x", padding*3)
			.attr("y", padding - offset*2)
            .attr("font-size", 30)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(labels).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height - padding/2 + offset)
			.attr("font-size", 20)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(labels).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", offset*3)
			.attr("font-size", 20)
            .text(function(d) { return d.yaxis; });
		svg.selectAll(".legend").data(labels).enter().append("text")
            .attr("class", "legend")
            .attr("x", width - padding * 1.5)
            .attr("y", padding*2)
			.attr("font-size", 20)
            .text(function(d) { return d.legend; });
		
		var labelWidth = 10;
			
		var legendData = [
            {color: "blue", label: "Bathrooms"}, 
            {color: "orange", label: "Bedrooms"}];
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate("+(0)+","+padding*2+")");
        var l = legend.selectAll(".legend").data(legendData).enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        l.append("rect")
            .attr("x", width-padding*1.5)
            .attr("y", offset*3)
            .attr("width", labelWidth)
            .attr("height", labelWidth)
            .attr("fill", function(d) { return d.color; });
        l.append("text")
            .attr("x", width-padding*1.5+offset*2)
            .attr("y", labelWidth+offset*3)
            .text(function(d) { return d.label; });
		
		var radio = d3.select("#radio_plot3")
			.attr('name', 'value')
			.on('change', function(d) {
				
				var sorted = houses.sort((a,b)=>d3.descending(a[d.target.value], b[d.target.value]))
				
				var groups = houses.map(d=>d.type)
				var stackedData = d3.stack()
					.keys(subgroups)
					(houses)
				
				var xScale = d3.scaleBand()
					.domain(groups)
					.range([padding, width-padding])
					.paddingInner(paddingInner)
					.paddingOuter(paddingOuter)
				y_axis = d3.axisLeft(yScale);
				
				
				d3.selectAll("g.x_axis")
					.transition()
					.attr("transform", "translate(0," + (height-padding) + ")")
					.call(d3.axisBottom(xScale).tickSizeOuter(0));
					
											
				d3.selectAll("g.r")
					.data(stackedData)
					  .selectAll("g")
					  .attr("fill", function(d) { return colorScale(d.key); })
					  .selectAll("rect")
					  .data(function(d) { return d; })
					  .transition()
						.attr("class", "bar")
						.attr("x", function(d) { return xScale(d.data.type); })
						.attr("y", function(d) { return yScale(d[1]); })
						.attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
						.attr("width",xScale.bandwidth())
				
			})
    });
}

var question4=function(filePath){
	
	
    d3.csv(filePath).then(function(data){
        //console.log(data)
		
		var prices = data.filter(function(d){return d.lat != 'None'})
		//prices = prices.slice(0, 100000)
		//console.log(prices)
		
		var prices = prices.filter(function(d){return d.state != 'ak' & d.state != 'hi'})
		prices.map(function(d){d.lat = Math.round(d.lat*10)/10; d.long = Math.round(d.long*10)/10; return d})
		
		var cleaned = d3.flatRollup(prices, v=>d3.median(v, d=>d.price), d=>d.lat, d=>d.long)
		cleaned = cleaned.map(function(d){return {'lat': d[0], 'long': d[1], 'price': d[2]}})
		//console.log(cleaned)
		//console.log(prices)
		var avgs = d3.rollup(prices, v=>d3.median(v, d=>d.price), d=>d.state)
		var avgs2 = d3.flatRollup(prices, v=>d3.median(v, d=>d.price), d=>d.state)
		
		var width = 1000
		var height = 800
		var padding = 50;
		
		var svg = d3.select("#plot4")
			.append('svg')
			.attr("width", width)
			.attr("height", height)
		
		const scale = 1000;
        const projection = d3.geoAlbersUsa().scale(scale).translate([width / 2, height / 2 - padding]);
        const path = d3.geoPath().projection(projection);
		
		const statesmap = d3.json('us-states.json');
        statesmap.then(function (map) {
			var logScale = d3.scaleLinear()
			  //.domain([1, d3.max(prices, d=>d.price)])
			  .domain([1, 3000])
			  .range([0, 1]).clamp(true)
			
            var colorScale = d3.scaleSequential()
                .domain([0, 1])
                .interpolator(d3.interpolateBlues);
			var circleScale = d3.scaleSequential()
                .domain([0, 1])
                .interpolator(d3.interpolatePuRd);
			
			var tooltip = d3.select("#plot4")
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip")
				.style("background-color", "white")
				.style("border", "solid")
				.style("border-width", "2px")
				.style("border-radius", "5px")
				.style("padding", "5px")

			var mouseover = function (e, d) {
					tooltip.transition().duration(50).style("opacity", 0.9);
					//console.log(e)
					d3.select(e.target)
						.attr('stroke', 'yellow')
						.attr('stroke-width', '3px')
				}
			var mousemove = function (e, d) {
					tooltip
						.html("State: " + stateSym[d.properties.name] + "<br>Median Price: $" + avgs.get(d.properties.name.toLowerCase()))
						.style("position", "absolute")
						.style("left", (e.pageX + 20) + "px")
						.style("top", (e.pageY) + "px")
				}
			var mouseleave = function (e, d) {
					tooltip.transition().duration(50).style("opacity", 0);
					d3.select(e.target)
						.attr('stroke', 'black')
						.attr('stroke-width', '1px')
				}
			            
            svg.selectAll('path.bottom')
				.data(map.features).enter()
                .append('path')
				.attr('class', 'bottom')
                .attr('d', path)
                .attr('fill', 'lightblue')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
			
			var proj = function(d){
				try {
					return projection([+d.long, +d.lat])[0] + ", " + projection([+d.long, +d.lat])[1]
				} catch {
					return "0,0"
				}
			}
			
			svg.selectAll('.circles').data(cleaned).enter()
				.append('circle')
				.attr('class', 'circles')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 1)
				.attr("transform", function(d) {return "translate(" + proj(d) + ")";})
				.style('fill', function(d){return circleScale(logScale(d.price))})
			
			svg.selectAll('path.top')
				.attr('class', 'top')
				.data(map.features).enter()
                .append('path')
                .attr('d', path)
                .attr('fill', 'transparent')
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseout", mouseleave)
			
			let labels = d3.range(0, 2001, 400)
			let labels2 = d3.range(0, 3001, 600)
			var nums = d3.range(0, 1.05, 0.05)
			let rsize = 30
			let lwidth = 3;
			let xlegend = 100;
			let ylegend = 500;
			let padding2 = 15;
			let offset = 10
			
			var l = [
				{title: "House Prices Across America"},
				{legend1: "House Price"},
				{legend2: "State Median Price"}];
			svg.selectAll(".title").data(l).enter().append("text")
				.attr("class", "title")
				.attr("x", width/2 - padding*2)
				.attr("y", padding*2)
				.attr("font-size", 30)
				.text(function(d) { return d.title; });
			svg.selectAll(".legend1").data(l).enter().append("text")
				.attr("class", "legend1")
				.attr("x", padding/2)
				.attr("y", height-padding*4-offset)
				.attr("font-size", 20)
				.text(function(d) { return d.legend1; });
			svg.selectAll(".legend2").data(l).enter().append("text")
				.attr("class", "legend2")
				.attr("x", padding/2)
				.attr("y", height-padding*2-offset)
				.attr("font-size", 20)
				.attr("opacity", 0)
				.text(function(d) { return d.legend2; });
			
			svg.selectAll(".color")
				.data(labels).enter()
				.append("rect")
                .attr('class', 'color')
                .attr("x", function(d, i) { return xlegend + i*(rsize*4) })
                .attr("y", height-padding*2)
                .attr("width", lwidth)
                .attr("height", padding2*2)
                .style("fill", function(d) { return colorScale((d/2000)) })
				.style('opacity', 0)
			svg.selectAll(".values")
				.data(nums).enter()
				.append("rect")
                .attr('class', 'values')
                .attr("x", function(d, i) { return xlegend + i*(rsize) })
                .attr("y", height-padding*2)
                .attr("width", rsize)
                .attr("height", padding2)
                .style("fill", function(d) { return colorScale((d)) })
				.style('opacity', 0)
			svg.selectAll(".label")
				.data(labels).enter()
				.append("text")
                .attr('class', 'label')
                .attr("x", function(d, i) { return xlegend + i*(rsize*4) })
                .attr("y", height-padding)
                .text(function(d) { return d })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
				.style('opacity', 0)
			
			svg.selectAll(".color2")
				.data(labels2).enter()
				.append("rect")
                .attr('class', 'color2')
                .attr("x", function(d, i) { return xlegend + i*(rsize*4) })
                .attr("y", height-padding*4)
                .attr("width", lwidth)
                .attr("height", padding2*2)
                .style("fill", function(d) { return circleScale((d/2000)) })
			svg.selectAll(".values2")
				.data(nums).enter()
				.append("rect")
                .attr('class', 'values2')
                .attr("x", function(d, i) { return xlegend + i*(rsize) })
                .attr("y", height-padding*4)
                .attr("width", rsize)
                .attr("height", padding2)
                .style("fill", function(d) { return circleScale((d)) })
			svg.selectAll(".label2")
				.data(labels2).enter()
				.append("text")
                .attr('class', 'label2')
                .attr("x", function(d, i) { return xlegend + i*(rsize*4) })
                .attr("y", height-padding*3)
                .text(function(d) { return d })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
				
				
			
			var radio = d3.select("#radio_plot4")
			.attr('name', 'value')
			.on('change', function(d) {
				var overlay = d.target.value
				var opac = +(overlay == 'on')
				var avgs = d3.rollup(prices, v=>d3.median(v, d=>d.price), d=>d.state)
				var avgs2 = d3.flatRollup(prices, v=>d3.median(v, d=>d.price), d=>d.state)
				//console.log(avgs2)
				var linearScale = d3.scaleLinear()
				  .domain([0, d3.max(avgs2, d=>d[1])])
				  .range([0, 1]);
				
				//console.log(linearScale(1700))
				
				var colors = {
					'on': function(d){return colorScale(linearScale(avgs.get(d.properties.name.toLowerCase())))},
					'off': function(d){return 'lightblue'}
				}
				
				d3.selectAll('path.bottom')
					.data(map.features)
					.transition()
					.attr('fill', d=>colors[overlay](d))
					.attr('stroke', 'black')
					.attr('stroke-width', 1)
				
				d3.selectAll('.values')
					.style('opacity', opac)
				d3.selectAll('.color')
					.style('opacity', opac)
				d3.selectAll('.label')
					.style('opacity', opac)
				d3.selectAll('.legend2')
					.style('opacity', opac)
			})
			
			var radio = d3.select("#radio2_plot4")
			.attr('name', 'value')
			.on('change', function(d) {
				var overlay = d.target.value
				var opac = +(overlay == 'on')
				d3.selectAll('.circles')
					.style('opacity', opac)
				d3.selectAll('.values2')
					.style('opacity', opac)
				d3.selectAll('.color2')
					.style('opacity', opac)
				d3.selectAll('.label2')
					.style('opacity', opac)
				d3.selectAll('.legend1')
					.style('opacity', opac)
			})
        });
	
		
		
    });
}

var question5=function(filePath){
    d3.csv(filePath).then(function(data){
        //console.log(data)
		
		var pets = data.map(function(d){
			if (d.cats_allowed == "1" & d.dogs_allowed == "1")
				d.pet = "Cats and Dogs";
			if (d.cats_allowed == "0" & d.dogs_allowed == "1")
				d.pet = "Only Dogs";
			if (d.cats_allowed == "1" & d.dogs_allowed == "0")
				d.pet = "Only Cats";
			if (d.cats_allowed == "0" & d.dogs_allowed == "0")
				d.pet = "No Pets";			
			return d;
		})
		//console.log(pets)
		
		var stat = function(d) {
			  q1 = d3.quantile(d.map(function(g) { return g.price;}).sort(d3.ascending),.25)
			  median = d3.quantile(d.map(function(g) { return g.price;}).sort(d3.ascending),.5)
			  q3 = d3.quantile(d.map(function(g) { return g.price;}).sort(d3.ascending),.75)
			  interQuantileRange = q3 - q1
			  min = d3.max([q1 - 1.5 * interQuantileRange, d3.min(d, d=>d.price)])
			  max = q3 + 1.5 * interQuantileRange
			  return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
			}
		
		var sumstat = d3.rollup(pets, v=>stat(v), d=>d.pet)
		
		var maxPrice = 0
		var minPrice = 0
		
		sumstat.forEach((values, keys)=>{
			if (values.max > maxPrice)
				maxPrice = values.max
			if (values.min < minPrice)
				minPrice = values.min
		})
		
		var width = 1000
		var height = 1000
		var padding = 100;
		var paddingInner = 1
		var paddingOuter = 0.5
		var offset = 10
		
		var svg = d3.select("#plot5")
			.append('svg')
			.attr("width", width)
			.attr("height", height)
		
		var xScale = d3.scaleBand()
			.range([padding, width-padding])
			.domain(["Cats and Dogs", "Only Dogs", "Only Cats", "No Pets"])
			.paddingInner(paddingInner)
			.paddingOuter(paddingOuter)
		svg.append("g")
			.attr("transform", "translate(0," + (height-padding) + ")")
			.call(d3.axisBottom(xScale))

		var yScale = d3.scaleLinear()
			.domain([minPrice,maxPrice+padding])
			.range([height-padding, padding])
			.nice()
		svg.append("g")
			.attr("transform", "translate(" + padding + ",0)")
			.call(d3.axisLeft(yScale))
				
		svg.selectAll("vertLines")
			.data(sumstat)
			.enter()
			.append("line")
			  .attr("x1", function(d){return(xScale(d[0]))})
			  .attr("x2", function(d){return(xScale(d[0]))})
			  .attr("y1", function(d){return(yScale(d[1].min))})
			  .attr("y2", function(d){return(yScale(d[1].max))})
			  .attr("stroke", "black")
			  .style("width", 40)
		
		var boxWidth = 100
		svg.selectAll("boxes")
			.data(sumstat)
			.enter()
			.append("rect")
				.attr("x", function(d){return(xScale(d[0])-boxWidth/2)})
				.attr("y", function(d){return(yScale(d[1].q3))})
				.attr("height", function(d){return(yScale(d[1].q1)-yScale(d[1].q3))})
				.attr("width", boxWidth )
				.attr("stroke", "black")
				.style("fill", "lightblue")
		
		svg.selectAll("medianLines")
			.data(sumstat)
			.enter()
			.append("line")
			  .attr("x1", function(d){return(xScale(d[0])-boxWidth/2) })
			  .attr("x2", function(d){return(xScale(d[0])+boxWidth/2) })
			  .attr("y1", function(d){return(yScale(d[1].median))})
			  .attr("y2", function(d){return(yScale(d[1].median))})
			  .attr("stroke", "black")
			  .style("width", 80)
		
		let labels = [
            {title: "Prices for Houses with Different Pet Rules"}, 
            {xaxis: "Pets Allowed"}, 
            {yaxis: "Price (Dollars per Month)"}];
        svg.selectAll(".title").data(labels).enter().append("text")
            .attr("class", "title")
            .attr("x", padding*3)
			.attr("y", padding - offset*2)
            .attr("font-size", 30)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(labels).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height - padding/2 + offset)
			.attr("font-size", 20)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(labels).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", offset*3)
			.attr("font-size", 20)
            .text(function(d) { return d.yaxis; });
    });
}