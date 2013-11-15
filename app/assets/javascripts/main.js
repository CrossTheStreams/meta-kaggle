// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/
//

var error_based;

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
  var max_teams = 50;
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

      color = d3.scale.ordinal()
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
  
  this.init = function(element) {	
    l.ranked_data = l.rankify(l.data)
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

  // data : String : a string representing a date in the dataset
  this.teamNames = function (date) {
    var ret;
    if (typeof(date) == 'undefined') {
      try {
        ret = this.data[0];
      }
      catch(err) {
        ret = "dataset is undefined"
      }
      return ret 
    } else {
      console.log(l.ranked_data[3])
      var date_idx = this.dates.indexOf(date),
      ts_pairs = l.teamRankPairs(date),
      //ts_pairs = this.teamScorePairs(date),
      ts_arr = []

      for (var team in ts_pairs) {
        ts_arr.push([team, ts_pairs[team]]);
      }
      // this competition scores low to high, based on error
      ts_arr.sort(function(a,b){ return b[1] - a[1] });
      
      ret = ts_arr.map(function(a){ return(a[0]) });

      return(ret)
    }

  };
        

  this.teamRankPairs = function(date) {
    var date_idx = this.dates.indexOf(date),
        tr_pairs = l.ranked_data[date_idx],
        ret_obj = {}

    for (team in tr_pairs) {
      if (team != 'date') {
        ret_obj[team] = tr_pairs[team];
      }
    }

    return(ret_obj)
  }

  this.teamScorePairs = function(date) {
    var date_idx = this.dates.indexOf(date),
        team_names = this.teamNames(),
        scores = this.data[date_idx+1],
        ts_pairs = {};

    for (var i = 0; i < scores.length; i += 1) {
      var score = scores[i],
      team_name = team_names[i] 

      ts_pairs[team_name] = score;
    }
    ts_pairs["date"] = date;
    return(ts_pairs);  
  };

  this.rankify = function(data) {
     var ret = [],
         team_names = this.teamNames(),
         dates = this.dates,
         score_cache = {} 

     // dates, our observations
     for (var idx = 0; idx < dates.length; idx += 1) {

       var date = dates[idx],
       scores = data[idx + 1],
       unique_scores = scores.getUnique().sort(function(a, b) {return a - b; }),
       row = {},
       rank = 1,
       // teams we've already ranked for a date
       ranked_teams = []

       if (error_based) {
         rank = scores.filter(function(n){ return n != -1}).length
       }

       // iterate scores in order to reference team name by score
       for (var n = 0; n < scores.length ; n += 1) {

         var team_name = team_names[n],
             score = scores[n],
             score_str = score.toString()

         // need to cache team with a given score so we can sort
         if (score_cache[score_str] == undefined) {
           score_cache[score_str] = []
         }
         if (score_cache[score_str].indexOf(team_name) == -1) {
           score_cache[score_str].push(team_name) 
         }

       } 

       //console.log(unique_scores)
       // iterate unique scores
       // use cache to order teams with same scores and get a rank
       for (var i = (unique_scores.length - 1); i >= 0; i -= 1) {
         var us = unique_scores[i],
             us_str = us.toString(),
             cache_names = score_cache[us_str]
             rank_diff = 0

         //console.log(cache_names)
         // team names should already be sub-ordered in alphabetical order
         // if two teams get a score in the same day, for now we can't know who got there first
         for (var n = 0; n < cache_names.length; n += 1) {
           var team_name = cache_names[n]

           // team doesn't have a score yet.
           if (us == -1 ) { 
             row[team_name] = -1; 
           } else {
             //console.log(team_name)
             //console.log(rank)
             //console.log(us_str)
             if (ranked_teams.indexOf(team_name) == -1) {
               row[team_name] = rank; 
               ranked_teams.push(team_name) 
               if (error_based) {
                 rank -= 1 
                 console.log(rank)
               }
               else {
                 rank += 1 
               }
             }
           }   
         }   
       }   

       row["date"] = date;
       // establish rank row here
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
        //console.log(row)
        ret.push(row)
      }
      callback.call()
    }) 
  };

  this.update = function() {

    if (show_ranks) {
      $('#switch').html('<b>Display</b>:  Ranks |  <a href="#" onclick="leaderchart.toggle_view();"style="color:blue;text-decoration:none;">Score-Diffs</a>');
    } else {
      $('#switch').html('<b>Display</b>: <a href="#" onclick="leaderchart.toggle_view();" style="color:blue;text-decoration:none;">Ranks</a> |  Score-Diffs');
    }
                  
    //d3.csv(input, function(error, data) {
    var date_idx = (this.dates.length - 1)

    data = this.ranked_data;
    teamranks = this.ranked_data[date_idx];
    teamscores = this.teamScorePairs(this.dates[date_idx]);

    //console.log(teamranks)
    //console.log(teamscores)
    color.domain(l.teamNames(l.dates[date_idx]));

    data.forEach(function(d) {
      console.log(d);
      d.date = parseDate(d.date);
    });

    scores = color.domain().map(function(name) {
      //console.log(name);
      return {
        name: name,
        values: data.map(function(d) {
          //console.log(d[name]);
          var ret = {date: d.date, score: + d[name]};
          //console.log(ret)
          return(ret)
        })
      };
    });

    d_minmax = d3.extent(data, function(d) { return d.date; });
    d_diff = (d_minmax[1].getTime()-d_minmax[0].getTime())/1000/60/60/24;
    d_vals = new Array();
    subdivisions = 1;

    if (d_diff==0) {
      d_minmax[0] = new Date(d_minmax[0].getTime()-1000*60*60*24);
      d_diff = 1;
    } else if (d_diff<10) {
      subdivisions = d_diff;
    } else {
      subdivisions = 10;
    }
    for (i=0;i<=subdivisions;i++) {
      d_vals.push(new Date(d_minmax[0].getTime()+i*d_diff/subdivisions*1000*60*60*24));
    }

    // x axis
    xAxis.tickValues(d_vals);
    if (show_ranks) {
      xAxis.tickSize(-height);		
    } else {
      xAxis.tickSize(-height2);	
    }

    x.domain(d_minmax);
    if (!show_ranks) {
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

    var teams = svg.selectAll(".teams")
                   .data(scores)
                   .enter()
                   .append("g")
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

    legend = svg.selectAll(".legend")
                .data(color.domain())
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { 
                  return "translate(0," + eval(( scores.length - i-1)*(line_height*max_teams/(max_teams-1)))+ ")"; 
                });

    if (!show_ranks) {
      legend.append("text")
        .attr("x", width + 60)
        .attr("y", -3)
        .attr("dy", "0.6em")
        .style("text-anchor", "end")
        .attr("class", function(d,i) { return i==scores.length-1?"name":""; })
        .text(function(d,i) { 
          //console.log(d);
          return teamranks[d]+"."; 
        });
    }
    else {
      legend.append("text")
            .attr("x", width + 60)
            .attr("y", -3)
            .attr("dy", "0.6em")
            .style("text-anchor", "end")
            .attr("class", function(d,i) { return i==scores.length-1?"name":""; })
            .text(function(d) { 
              //console.log(d);
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
    
    $("#battle").fadeIn();
          
  };
  
  this.toggle_view = function () {
    show_ranks = !show_ranks;
    this.update();
  };
	
}


