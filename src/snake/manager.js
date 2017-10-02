import Snake from './snake.class.js';

var neataptic = require('neataptic');
var d3 = require('d3');

/** Rename vars */
var Neat    = neataptic.Neat;
var Methods = neataptic.Methods;
var Architect = neataptic.Architect;

// Global vars
var neat;
var snakes;
var generationLog;
var generationTimeLog;
var iterationCounter;


var mutationRate = .3;

var inputSize = 6;
var startHiddenSize = 1;
var outputSize = 3;


function Manager(){
  this.started = false;
  this.paused = false;

  return this;
}

Manager.prototype = {
  start: function(){
    // this.config = newConfig;

    snakes = [];
    generationLog = [];
    generationTimeLog = [];
    iterationCounter = 0;

    neat = undefined;
    /** Construct the genetic algorithm */  
    neat = new Neat(
      inputSize,
      outputSize,
      null,
      {
        mutation: [
          Methods.Mutation.ADD_NODE,
          Methods.Mutation.SUB_NODE,
          Methods.Mutation.ADD_CONN,
          Methods.Mutation.SUB_CONN,
          Methods.Mutation.MOD_WEIGHT,
          Methods.Mutation.MOD_BIAS,
          Methods.Mutation.MOD_ACTIVATION,
          Methods.Mutation.ADD_GATE,
          Methods.Mutation.SUB_GATE,
          Methods.Mutation.ADD_SELF_CONN,
          Methods.Mutation.SUB_SELF_CONN,
          Methods.Mutation.ADD_BACK_CONN,
          Methods.Mutation.SUB_BACK_CONN
        ],
        popsize: this.config.populationSize,
        mutationRate: mutationRate,
        elitism: Math.round(this.config.elitismPercent / 100 * this.config.populationSize),
        network: new Architect.Random(
          inputSize,
          startHiddenSize,
          outputSize
        )
      }
    );

    for(var genome in neat.population){
      genome = neat.population[genome];
      snakes.push(new Snake(genome, this.config));
    }
    this.started = true;
    this.paused = false;

    setTimeout(function(){
      d3.select('#gen').html("1");  
    }, 10);
    

    this.tick();
  },

  updateSettings: function(newConfig){
    this.config = newConfig;
    for(var i in snakes){
      snakes[i].config = this.config;
    }
  },

  tick: function(){
    if(!this.started || this.paused) return;

    var that = this;
    var i;

    iterationCounter++;

    // clone snakes so we don't mess with the originals
    var t_snakes = JSON.parse(JSON.stringify(snakes));

    // store their current order
    for(i in t_snakes){
      t_snakes[i].index = i;
    }
    t_snakes.sort(function(a, b){
      if(a.firstAttemptScore > b.firstAttemptScore) return -1;
      if(a.firstAttemptScore < b.firstAttemptScore) return 1;
      return 0;
    });
    
    // check out many have never died
    // check to see if everyone is either dead or performing negatively
    var hasEveryoneDied = true;
    var areAllAliveSnakesNegative = true;

    for(i in snakes){
      if(snakes[i].deaths === 0){
        hasEveryoneDied = false;
        if(snakes[i].currentScore > 0){
          areAllAliveSnakesNegative = false;
        }
      }
    }

    if(!hasEveryoneDied){
      if(iterationCounter > 10 && areAllAliveSnakesNegative){
        hasEveryoneDied = true;
      }
    }

    if(hasEveryoneDied){

      var new_log = [];

      for(i in t_snakes){
        var top = false;
        if(i < this.config.populationSize * this.config.elitismPercent / 100){
          snakes[t_snakes[i].index].bragCanvas(document.getElementById('snake-canvas-'+ t_snakes[i].index).getContext("2d"));
          top = true;
        } else {
          snakes[t_snakes[i].index].hideCanvas(document.getElementById('snake-canvas-'+ t_snakes[i].index).getContext("2d"));
        }
        new_log.push({
          score: t_snakes[i].firstAttemptScore,
          generation: generationLog.length,
          top: top
        });
      }

      generationLog.push(new_log);
      generationTimeLog.push({
        index: generationTimeLog.length,

      })

      this.drawGraph();
    
      setTimeout(function(){
        that.breed();
      }, 1000);
    } else {
      setTimeout(function(){
        for(i in snakes){
          snakes[i].look();
          var context = document.getElementById('snake-canvas-'+ i).getContext("2d");
          snakes[i].showCanvas(context);
          snakes[i].moveCanvas(context);
        }

        that.tick();
      }, 1);
    }
  },

  breed: function(){

    neat.sort();
    var newPopulation = [];
    var i;

    // Elitism
    for(i = 0; i < neat.elitism; i++){
      newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for(i = 0; i < neat.popsize - neat.elitism; i++){
      newPopulation.push(neat.getOffspring());
    }

    // console.log(newPopulation.length);

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;

    d3.select('#gen').html(neat.generation + 1);
    
    snakes = [];
    
    for(var genome in neat.population){
      genome = neat.population[genome];
      snakes.push(new Snake(genome, this.config));
    }
    iterationCounter = 0;

    this.tick();
  },

  stop: function(){
    this.started = false;
    this.paused = true;
  },

  pause: function(){
    this.paused = true;
  },

  resume: function(){
    this.paused = false;
    this.tick();
  },

  drawGraph: function(){
    d3.select('#graph').selectAll('svg').remove();

    var width = document.getElementById('graph').clientWidth;
    var height = document.getElementById('graph').clientHeight;

    var svg = d3.select('#graph')
      .append('svg')
      .attr('height', height)
      .attr('width', width)
      ;
    
    var pad = {
      left: 35, right: 0, top: 2, bottom: 20
    }

    var x_max = generationLog.length - 1 > 10 ? generationLog.length - 1 : 10;

    var x_scale = d3.scaleLinear()
      .domain([0, x_max])
      .range([pad.left + 10, width - pad.right - 10])
      .nice()
      ;

    var min_score = d3.min(generationLog, function(d){ return d3.min(d, function(e){ return e.score; }); }) || -10;
    var max_score = d3.max(generationLog, function(d){ return d3.max(d, function(e){ return e.score; }); }) || 10;

    var y_scale = d3.scaleLinear()
      .domain([min_score, max_score])
      .range([height - pad.bottom - 10, pad.top + 10])
      .nice()
      ;

    if(y_scale(0) > pad.top && y_scale(0) < height - pad.bottom){
      svg.append('line')
        .attr('x1', pad.left - 6)
        .attr('y1', y_scale(0) + .5)
        .attr('x2', width - pad.right)
        .attr('y2', y_scale(0) + .5)
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
        .style('shape-rendering', 'crispEdges')
        ;
    }

    var gen_svg = svg.selectAll('generation')
      .data(generationLog)
      .enter()
      .append('g')
      ;

    var net_svg = gen_svg.selectAll('net')
      .data(function(d){ return d; })
      .enter()
      ;

    net_svg.append('circle')
      .attr('cx', function(d){ return x_scale(d.generation); })
      .attr('cy', function(d){ return y_scale(d.score); })
      .attr('opacity', function(d){
        if(d.top) return .8;
        return .25;
      })
      .attr('r', 2.5)
      .attr('fill', function(d){
        if(d.top) return '#3aa3e3';
        return '#000';
      })
      ;



    var medianLine = [];
    var q1Line = [];
    var q3Line = [];
    for(var i in generationLog){
      medianLine.push({
        score: calculateQ(generationLog[i], .5), 
        generation: parseInt(i, 10)
      });
      q1Line.push({
        score: calculateQ(generationLog[i], .25), 
        generation: parseInt(i, 10)
      });
      q3Line.push({
        score: calculateQ(generationLog[i], .75), 
        generation: parseInt(i, 10)
      });
    }


    var lineFunction = d3.line()
      .x(function(d){ return x_scale(d.generation); })
      .y(function(d){ return y_scale(d.score); })
      .curve(d3.curveCardinal)
      ;

    svg.append('path')
      .attr('d', lineFunction(medianLine))
      .attr('stroke', '#000')
      .attr('stroke-width', 4)
      .attr('fill', 'none')
      .attr('opacity', .25)
      ;

    svg.append('path')
      .attr('d', lineFunction(q1Line))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('fill', 'none')
      .attr('opacity', .25)
      ;

    svg.append('path')
      .attr('d', lineFunction(q3Line))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('fill', 'none')
      .attr('opacity', .25)
      ;


     // Add the x Axis
    svg.append("g")
      .attr("transform", "translate(0," + (height - pad.bottom) + ")")
      .call(d3.axisBottom(x_scale));


     // Add the x Axis
    svg.append("g")
      .attr("transform", "translate(" + pad.left + ",0)")
      .call(d3.axisLeft(y_scale));

    svg.selectAll('.domain').attr('opacity', 0)

    svg.selectAll('.tick').selectAll('line').attr('opacity', .5)
  }
}

function calculateQ(values, Q){
  values.sort(function(a,b){
    return a.score - b.score;
  });

  if(values.length === 0) return 0

  var index = Math.floor(values.length * Q);

  if(values.length % 2){
    return values[index].score;
  } else {
    if(index - 1 < 0) return 0;
    return (values[index - 1].score + values[index].score) / 2.0;
  }
}

export default Manager;