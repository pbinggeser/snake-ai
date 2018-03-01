import Snake from './snake.class.js';

var neataptic = require('neataptic');
var d3 = require('d3');
//var cola = require('webcola');

var Neat = neataptic.Neat;
//refer to https://github.com/wagenaartje/neataptic/issues/104
var Methods = neataptic.methods;
var Architect = neataptic.architect;

// Global vars
var neat;
var snakes;
var generationLog;
var generationTimeLog;
var iterationCounter;
var mutationRate = .3;
var inputSize = 6;
var startHiddenSize = 2;
var outputSize = 3;

function Manager() {
  this.started = false;
  this.paused = false;
  return this;
}

Manager.prototype = {
  sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  start: function () {
    snakes = [];
    generationLog = [];
    generationTimeLog = [];
    iterationCounter = 0;
    /** Construct the genetic algorithm */
    neat = new Neat(
      inputSize,
      outputSize,
      null,
      {
        mutation: [
          Methods.mutation.ADD_NODE,
          Methods.mutation.SUB_NODE,
          Methods.mutation.ADD_CONN,
          Methods.mutation.SUB_CONN,
          Methods.mutation.MOD_WEIGHT,
          Methods.mutation.MOD_BIAS,
          Methods.mutation.MOD_ACTIVATION,
          Methods.mutation.ADD_GATE,
          Methods.mutation.SUB_GATE,
          Methods.mutation.ADD_SELF_CONN,
          Methods.mutation.SUB_SELF_CONN,
          Methods.mutation.ADD_BACK_CONN,
          Methods.mutation.SUB_BACK_CONN
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

    for (var genome in neat.population) {
      genome = neat.population[genome];
      snakes.push(new Snake(genome, this.config));
    }
    this.started = true;
    this.paused = false;

    document.addEventListener('click', (evt) => {
      if (evt.target.id.indexOf('snake-canvas') !== -1) {
        var _this = evt.target;
        var selectedSnake = snakes[_this.id.substr(_this.id.length - 1)];
        console.log(selectedSnake);
        this.drawGraph(selectedSnake.brain.graph(400, 400), ".draw")
      }
    });

    setTimeout(function () {
      d3.select('#gen').html("1");
    }, 10);
    this.tick();
  },

  updateSettings: function (newConfig) {
    this.config = newConfig;
    for (var i in snakes) {
      snakes[i].config = this.config;
    }
  },

  tick: async function () {
    var sleepTime = this.config.gameSpeedUp === true ? 1 : 50;
    await this.sleep(sleepTime);
    if (!this.started || this.paused) return;

    var that = this;
    var i;

    iterationCounter++;

    // clone snakes so we don't mess with the originals
    var t_snakes = JSON.parse(JSON.stringify(snakes));

    // store their current order
    for (i in t_snakes) {
      t_snakes[i].index = i;
    }
    t_snakes.sort(function (a, b) {
      if (a.firstAttemptScore > b.firstAttemptScore) return -1;
      if (a.firstAttemptScore < b.firstAttemptScore) return 1;
      return 0;
    });

    // check out many have never died
    // check to see if everyone is either dead or performing negatively
    var hasEveryoneDied = true;
    var areAllAliveSnakesNegative = true;

    for (i in snakes) {
      if (snakes[i].deaths === 0) {
        hasEveryoneDied = false;
        if (snakes[i].currentScore > 0) {
          areAllAliveSnakesNegative = false;
        }
      }
    }

    if (!hasEveryoneDied) {
      if (iterationCounter > 10 && areAllAliveSnakesNegative) {
        hasEveryoneDied = true;
      }
    }

    if (hasEveryoneDied) {

      var new_log = [];

      for (i in t_snakes) {
        var top = false;
        if (i < this.config.populationSize * this.config.elitismPercent / 100) {
          snakes[t_snakes[i].index].bragCanvas(document.getElementById('snake-canvas-' + t_snakes[i].index).getContext("2d"));
          top = true;
        } else {
          snakes[t_snakes[i].index].hideCanvas(document.getElementById('snake-canvas-' + t_snakes[i].index).getContext("2d"));
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

      this.drawHistoryGraph();

      setTimeout(function () {
        that.breed();
      }, 1000);
    } else {
      setTimeout(function () {
        for (i in snakes) {
          snakes[i].look();
          var context = document.getElementById('snake-canvas-' + i).getContext("2d");
          snakes[i].showCanvas(context);
          snakes[i].moveCanvas(context);
        }

        that.tick();
      }, 1);
    }
  },

  breed: function () {

    neat.sort();
    var newPopulation = [];
    var i;

    // Elitism
    for (i = 0; i < neat.elitism; i++) {
      newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for (i = 0; i < neat.popsize - neat.elitism; i++) {
      newPopulation.push(neat.getOffspring());
    }

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;

    d3.select('#gen').html(neat.generation + 1);

    snakes = [];

    for (var genome in neat.population) {
      genome = neat.population[genome];
      snakes.push(new Snake(genome, this.config));
    }
    iterationCounter = 0;

    this.tick();
  },

  stop: function () {
    this.started = false;
    this.paused = true;
  },

  pause: function () {
    this.paused = true;
  },

  resume: function () {
    this.paused = false;
    this.tick();
  },

  drawHistoryGraph: function () {
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

    var min_score = d3.min(generationLog, function (d) { return d3.min(d, function (e) { return e.score; }); }) || -10;
    var max_score = d3.max(generationLog, function (d) { return d3.max(d, function (e) { return e.score; }); }) || 10;

    var y_scale = d3.scaleLinear()
      .domain([min_score, max_score])
      .range([height - pad.bottom - 10, pad.top + 10])
      .nice()
      ;

    if (y_scale(0) > pad.top && y_scale(0) < height - pad.bottom) {
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
      .data(function (d) { return d; })
      .enter()
      ;

    net_svg.append('circle')
      .attr('cx', function (d) { return x_scale(d.generation); })
      .attr('cy', function (d) { return y_scale(d.score); })
      .attr('opacity', function (d) {
        if (d.top) return .8;
        return .25;
      })
      .attr('r', 2.5)
      .attr('fill', function (d) {
        if (d.top) return '#3aa3e3';
        return '#000';
      })
      ;



    var medianLine = [];
    var q1Line = [];
    var q3Line = [];
    for (var i in generationLog) {
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
      .x(function (d) { return x_scale(d.generation); })
      .y(function (d) { return y_scale(d.score); })
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
  },

  drawGraph: function (graph, panel) {
    var NODE_RADIUS = 7;
    var GATE_RADIUS = 2;
    var REPEL_FORCE = 0;
    var LINK_DISTANCE = 100;
    var WIDTH = 1000;
    var HEIGHT = 500;

    //function drawGraph(graph, panel) {
      var d3cola = window.cola.d3adaptor()
        .avoidOverlaps(true)
        .size([WIDTH, HEIGHT]);

      var svg = d3.select(panel);

      d3.selectAll(panel + '> *').remove();

      // define arrow markers for graph links
      svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

      graph.nodes.forEach(function (v) {
        v.height = v.width = 2 * (v.name === 'GATE' ? GATE_RADIUS : NODE_RADIUS);
      });

      d3cola
        .nodes(graph.nodes)
        .links(graph.links)
        .constraints(graph.constraints)
        .symmetricDiffLinkLengths(REPEL_FORCE)
        .linkDistance(LINK_DISTANCE)
        .start(10, 15, 20);

      var path = svg.selectAll('.link')
        .data(graph.links)
        .enter().append('svg:path')
        .attr('class', 'link');

      path.append('title')
        .text(function (d) {
          var text = '';
          text += 'Weight: ' + Math.round(d.weight * 1000) / 1000 + '\n';
          text += 'Source: ' + d.source.id + '\n';
          text += 'Target: ' + d.target.id;
          return text;
        });

      var node = svg.selectAll('.node')
        .data(graph.nodes)
        .enter().append('circle')
        .attr('class', function (d) {
          return 'node ' + d.name;
        })
        .attr('r', function (d) {
          return d.name === 'GATE' ? GATE_RADIUS : NODE_RADIUS;
        })
        //.call(d3cola.drag);

      node.append('title')
        .text(function (d) {
          var text = '';
          text += 'Activation: ' + Math.round(d.activation * 1000) / 1000 + '\n';
          text += 'Bias: ' + Math.round(d.bias * 1000) / 1000 + '\n';
          text += 'Position: ' + d.id;
          return text;
        });

      var label = svg.selectAll('.label')
        .data(graph.nodes)
        .enter().append('text')
        .attr('class', 'label')
        .text(function (d) {
          return '(' + d.index + ') ' + d.name;
        })
        //.call(d3cola.drag);

      d3cola.on('tick', function () {
        // draw directed edges with proper padding from node centers
        path.attr('d', function (d) {
          var deltaX = d.target.x - d.source.x;
          var deltaY = d.target.y - d.source.y;
          var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          var normX = deltaX / dist;
          var normY = deltaY / dist;

          if (isNaN(normX)) normX = 0;
          if (isNaN(normY)) normY = 0;

          var sourcePadding = d.source.width / 2;
          var targetPadding = d.target.width / 2 + 2;
          var sourceX = d.source.x + (sourcePadding * normX);
          var sourceY = d.source.y + (sourcePadding * normY);
          var targetX = d.target.x - (targetPadding * normX);
          var targetY = d.target.y - (targetPadding * normY);

          // Defaults for normal edge.
          var drx = 0;
          var dry = 0;
          var xRotation = 0; // degrees
          var largeArc = 0; // 1 or 0
          var sweep = 1; // 1 or 0

          // Self edge.
          if (d.source.x === d.target.x && d.source.y === d.target.y) {
            xRotation = -45;
            largeArc = 1;
            drx = 20;
            dry = 20;
            targetX = targetX + 1;
            targetY = targetY + 1;
          }
          return 'M' + sourceX + ',' + sourceY + 'A' + drx + ',' + dry + ' ' + xRotation + ',' + largeArc + ',' + sweep + ' ' + targetX + ',' + targetY;
        });

        node
          .attr('cx', function (d) {
            return d.x;
          })
          .attr('cy', function (d) {
            return d.y;
          });

        label
          .attr('x', function (d) {
            return d.x + 10;
          })
          .attr('y', function (d) {
            return d.y - 10;
          });
      });
    }
  //}
}

function calculateQ(values, Q) {
  values.sort(function (a, b) {
    return a.score - b.score;
  });

  if (values.length === 0) return 0

  var index = Math.floor(values.length * Q);

  if (values.length % 2) {
    return values[index].score;
  } else {
    if (index - 1 < 0) return 0;
    return (values[index - 1].score + values[index].score) / 2.0;
  }
}

export default Manager;