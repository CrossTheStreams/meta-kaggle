// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/
//

$(document).ready(function() {
  l = new LeaderChart();
  l.fetchCSV(function(){
    l.init("#battle");
  }) 
})

	
// Credit to Oliver Staubli, winnder of the Leapfrogging Leaderboard contest, for comming up with the original visualization!
// http://www.kaggle.com/c/leapfrogging-leaderboards/visualization/710
// 
function LeaderChart() {
	
	var show_ranks = true;
	var max_teams = 10;
	var line_height = 20;
	var minscoredeviation_scale = 0.0018;
	var dataset = "GiveMeSomeCredit_public_leaderboard";

	var margin = {top: 40, right: 300, bottom: 10, left: 20},
		width = 960 - margin.left - margin.right,
		height = max_teams*line_height,
		height2 = 300;
	
	var parseDate = d3.time.format("%Y%m%d").parse;

	var x = d3.time.scale()
		.range([0, width]);

	var y = d3.scale.linear();

	var color = d3.scale.ordinal()
		.range(["#80b325","#00914a","#019b9c","#0081df","#7b3cd5","#e00b90","#e53517","#eb6a0a","#f49e00","#ffd500"
		]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.tickPadding(line_height)
		.tickFormat(d3.time.format("%d.%m"))
		.orient("top");

	var yAxis = d3.svg.axis()
		.scale(y)
		.tickSize(-width)
		.tickFormat("")
		.orient("left");

	var line = d3.svg.line()
		.interpolate("linear")
		.defined(function(d) { return d.score != -1; })
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.score); });
		
            teamscores = null;
	    teamranks = null;

	var svg = null,
		yAxisGroup = null,
		xAxisGroup = null;
	
	this.init = function(element)
	{
	
		svg = d3.select(element).select('svg').select('g');
		if (svg.empty()) {
			svg = d3.select(element)
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.attr('class', 'viz')
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		}	

			this.update();
	};

        this.teamNames = function () {
          var ret;
          try {
            ret = this.data[0];
          }
          catch(err) {
            ret = "dataset is undefined"
          }
          return ret
        };

        this.teamRanks = function(date) {
          var date_idx = this.dates.indexOf(date),
              team_names = this.teamNames(),
              scores = this.data[date_idx+1],
              sorted_scores = scores.sort(function(a,b){b - a}),
              ranks = {}

          for (var i = 0; i < scores.length; i += 1) {
            var score = scores[i],
            score_idx = sorted_scores.indexOf(score),
            rank = score_idx + 1, 
            team_name = team_names[i] 
            ranks[team_name] = rank
          }
          return(ranks);
        };

        this.rankify = function(data) {
           var ret = [],
               team_names = this.teamNames(),
               dates = this.dates

           for (var i = 0; i < dates.length; i += 1) {
             var date = this.dates[i],
             scores = this.data[i+1],
             row = {}
             for (var n = 0; n < scores.length ; n += 1) {
               var team_name = team_names[n],
                   score = scores[n]
               row[team_name] = score;
             } 
             row["date"] = date;
             ret.push(row);
           }
           return(ret);
        };

        this.fetchCSV = function(callback){
          this.data = [];
          this.dates = [];

          var ret = this.data,
              dates = this.dates;

          $.get($("#csv_url").val(),function(data){
            var csv_arr = d3.csv.parseRows(data);
            for(var n=0; n < csv_arr.length; n++) {
              var row = csv_arr[n],
              date = row.shift(1);
              if (date != "date"){
                dates.push(date)
              }
              if (n > 0) {
                row = row.map(function(str){return(parseFloat(str))})
              }
              console.log(row)
              ret.push(row)
            }
            callback.call()
          }) 

        };

	this.update = function() {

          var chart = this;

		if(show_ranks)
		{
			$('#switch').html('<b>Display</b>:  Ranks |  <a href="#" onclick="leaderchart.toggle_view();"style="color:blue;text-decoration:none;">Score-Diffs</a>');
		} else {
			$('#switch').html('<b>Display</b>: <a href="#" onclick="leaderchart.toggle_view();" style="color:blue;text-decoration:none;">Ranks</a> |  Score-Diffs');
		}
			
                input = "/"+dataset+"_";
                input += show_ranks ? "ranks" : "scorediffs";
                input += ".d3.csv";

		d3.csv(input, function(error, data) {

                  teamranks = chart.teamRanks(chart.dates[0]);
		  teamscores = data[1];
                  console.log(teamranks)
                  console.log(teamscores)

                  stuffs = data;

		  data.splice(0,2);
			
			color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

			data.forEach(function(d) {
			  d.date = parseDate(d.date);
			});

			scores = color.domain().map(function(name) {
				return {
				  name: name,
				  values: data.map(function(d) {
					return {date: d.date, score: +d[name]};
				  })
				};
			});
			
			d_minmax = d3.extent(data, function(d) { return d.date; });
			d_diff = (d_minmax[1].getTime()-d_minmax[0].getTime())/1000/60/60/24;
			d_vals = new Array();
			subdivisions = 1;
			if(d_diff==0)
			{
				d_minmax[0] = new Date(d_minmax[0].getTime()-1000*60*60*24);
				d_diff = 1;
			} else if(d_diff<10){
				subdivisions = d_diff;
			} else {
				subdivisions = 10;
			}
			for(i=0;i<=subdivisions;i++) {
				d_vals.push(new Date(d_minmax[0].getTime()+i*d_diff/subdivisions*1000*60*60*24));
			}

			xAxis.tickValues(d_vals);
			if(show_ranks) {
			  xAxis.tickSize(-height);		
			} else {
			  xAxis.tickSize(-height2);	
			}

			x.domain(d_minmax);
			if(!show_ranks) {
                          y.domain([0,minscoredeviation_scale]);
                          y.range([0,height2]);
                          d3.select(".viz").attr("height", height2 + margin.top + margin.bottom);
			} else {
                          y.domain([1,max_teams]);
                          y.range([0,height]);
                          d3.select(".viz").attr("height", height + margin.top + margin.bottom);
			}

			// y ticks and labels
			if (!yAxisGroup) {
			  yAxisGroup = svg.append('svg:g')
			                  .attr('class', 'yTick axis')
			                  .call(yAxis);
			}
			else {
				svg.select('.yTick').call(yAxis);
			}
			
			if (!xAxisGroup) {
				xAxisGroup = svg.append('svg:g')
					.attr('class', 'xTick axis')
					.call(xAxis);

				  svg.append("text")
					.attr("y", -line_height )
					.attr("x", width+55 )
					.style("text-anchor", "middle")
					.text("Rank");
					
				  svg.append("text")
					.attr("y", -line_height )
					.attr("x", width+115 )
					.style("text-anchor", "middle")
					.text("Score");		
					
				  svg.append("text")
					.attr("y", -line_height )
					.attr("x", width+180 )
					.style("text-anchor", "start")
					.text("Team");		
					
			}
			else {
				svg.select('.xTick').call(xAxis);
			}

			svg.selectAll(".teams").remove(); 

                        var teams = svg.selectAll(".teams").data(scores).enter().append("g")
                                       .attr("class", "teams");

			teams.append("path")
				  .attr("class", "line")
				  .attr("d", function(d) { return line(d.values); })
				  .style("stroke", function(d) { return color(d.name); })
				  .append("title").text(function(d) { return d.name; });

                        teams.append("circle")
                               .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
                                .attr("cx", function(d) { return x(d.value.date); })
                                .attr("cy", function(d) { return y(d.value.score); })
                                .attr("r", 6)
                                .style("fill", function(d) { return color(d.name); })
                                .append("title").text(function(d) { return d.name; });
					
			svg.selectAll(".legend").remove(); 

			var legend = svg.selectAll(".legend")
				.data(color.domain())
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(0," + eval(( scores.length - i-1)*(line_height*max_teams/(max_teams-1)))+ ")"; });

                        if (!show_ranks) {
                          legend.append("text")
                            .attr("x", width + 60)
                            .attr("y", -3)
                            .attr("dy", "0.6em")
                            .style("text-anchor", "end")
                            .attr("class", function(d,i) { return i==scores.length-1?"name":""; })
                            .text(function(d,i) { 
                              console.log(d);
                              return teamranks[d]+"."; 
                            });
                        } else {
                          legend.append("text")
                            .attr("x", width + 60)
                            .attr("y", -3)
                            .attr("dy", "0.6em")
                            .style("text-anchor", "end")
                            .attr("class", function(d,i) { return i==scores.length-1?"name":""; })
                            .text(function(d) { 
                              console.log(d);
                              return teamranks[d]+"."; 
                            });
                        }
                        
                        legend.append("text")
                          .attr("x", width + 140)
                          .attr("y", -3)
                          .attr("dy", "0.6em")
                          .style("text-anchor", "end")
                          .attr("class", function(d,i) { return i==scores.length-1?"name":""; })
                          .text(function(d) { return teamscores[d]; });
				  
                        legend.append("circle")
                                .attr("cx", width + 170)
                                .attr("cy",0)
                                .attr("r", 6)
                                .style("fill", color);

                        legend.append("text")
                                .attr("x", width + 180)
                                .attr("y", -3)
                                .attr("dy", "0.6em")
                                .style("text-anchor", "start")
                                .attr("class", function(d,i) { return i==scores.length-1?"name":""; })
                                .text(function(d) { return d; });

		});
		
	};
	
	this.toggle_view = function ()
	{
		show_ranks = !show_ranks;
		this.update();
	};
	
}


