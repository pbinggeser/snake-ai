import Snake from './snake';

const neataptic = require('neataptic');
const d3 = require('d3');

const { Neat } = neataptic;
const Methods = neataptic.methods;
const Architect = neataptic.architect;

// Global vars
let neat: any;
let snakes: Snake[];
let generationLog: any;
let generationTimeLog: any;
let iterationCounter: number;
const mutationRate = 0.3;
const inputSize = 6;
const startHiddenSize = 2;
const outputSize = 3;

interface IConfig {
  populationSize: number;
  elitismPercent: number;
  displaySize: number;
  gridResolution: number;
  growWhenEating: boolean;
  canEatSelf: boolean;
  moveTowardsScore: number;
  moveAwayScore: number;
  foodScore: number;
  gameSpeedUp: boolean;
}

class Manager {
  started: boolean;
  paused: boolean;
  config: IConfig;
  constructor(config: IConfig) {
    this.started = false;
    this.paused = false;
    this.config = config;
  }
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  start() {
    snakes = [];
    generationLog = [];
    generationTimeLog = [];
    iterationCounter = 0;
    /** Construct the genetic algorithm */
    neat = new Neat(inputSize, outputSize, null, {
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
      mutationRate,
      elitism: Math.round(
        this.config.elitismPercent / 100 * this.config.populationSize
      ),
      network: new Architect.Random(inputSize, startHiddenSize, outputSize)
    });

    Object.keys(neat.population).forEach(i => {
      const genome = neat.population[i];
      snakes.push(new Snake(genome, this.config));
    });
    this.started = true;
    this.paused = false;

    document.addEventListener('click', evt => {
      if (evt.target.id.indexOf('snake-canvas') !== -1) {
        const { target } = evt;
        const selectedSnake = snakes[target.id.substr(target.id.length - 1)];
        this.drawGraph(selectedSnake.brain.graph(400, 400), '.draw');
        // console.log(selectedSnake.brain.graph(400, 400);
      }
    });

    setTimeout(() => { d3.select('#gen').html('1'); }, 10);
    this.tick();
  }

  updateSettings(newConfig: IConfig) {
    this.config = newConfig;
    if (snakes) {
      snakes.forEach(snake => Object.assign(snake.config, newConfig));
    }
  }

  async tick() {
    const sleepTime = this.config.gameSpeedUp === true ? 1 : 50;
    const that = this;
    let i;
    await this.sleep(sleepTime);
    if (!this.started || this.paused) { return; }
    iterationCounter += 1;
    // clone snakes so we don't mess with the originals
    const clonedSnakes = JSON.parse(JSON.stringify(snakes));
    clonedSnakes.forEach((clonedSnake, j) => {
      clonedSnake.index = j;
    });
    clonedSnakes.sort((a, b) => {
      if (a.firstAttemptScore > b.firstAttemptScore) { return -1; }
      if (a.firstAttemptScore < b.firstAttemptScore) { return 1; }
      return 0;
    });

    // check out many have never died
    // check to see if everyone is either dead or performing negatively
    let hasEveryoneDied = true;
    let areAllAliveSnakesNegative = true;

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
      const newLog = [];
      clonedSnakes.forEach((clonedSnake, j) => {
        let top = false;
        if (j < this.config.populationSize * this.config.elitismPercent / 100) {
          snakes[clonedSnakes[j].index].bragCanvas(
            document
              .getElementById(`snake-canvas-${clonedSnakes[j].index}`)
              .getContext('2d')
          );
          top = true;
        } else {
          snakes[clonedSnakes[j].index].hideCanvas(
            document
              .getElementById(`snake-canvas-${clonedSnakes[j].index}`)
              .getContext('2d')
          );
        }
        newLog.push({
          score: clonedSnakes[j].firstAttemptScore,
          generation: generationLog.length,
          top
        });
      });

      generationLog.push(newLog);
      generationTimeLog.push({
        index: generationTimeLog.length
      });

      this.drawHistoryGraph();

      setTimeout(() => {
        that.breed();
      }, 1000);
    } else {
      setTimeout(() => {
        snakes.forEach((snake, j) => {
          snake.look();
          const context = document
            .getElementById(`snake-canvas-${j}`)
            .getContext('2d');
          snake.showCanvas(context);
          snake.moveCanvas(context);
        });
        that.tick();
      }, 1);
    }
  }

  breed() {
    neat.sort();
    const newPopulation = [];
    let i;

    // Elitism
    for (i = 0; i < neat.elitism; i += 1) {
      newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for (i = 0; i < neat.popsize - neat.elitism; i += 1) {
      newPopulation.push(neat.getOffspring());
    }

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();
    neat.generation += 1;
    d3.select('#gen').html(neat.generation + 1);
    snakes = [];

    neat.population.forEach((genome, j) => {
      const newGenome = neat.population[j];
      snakes.push(new Snake(newGenome, this.config));
    });

    iterationCounter = 0;
    this.tick();
  }

  stop() {
    this.started = false;
    this.paused = true;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.tick();
  }

  drawHistoryGraph() {
    d3
      .select('#graph')
      .selectAll('svg')
      .remove();
    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    const svg = d3
      .select('#graph')
      .append('svg')
      .attr('height', height)
      .attr('width', width);

    const pad = {
      left: 35,
      right: 0,
      top: 2,
      bottom: 20
    };

    const xMax = generationLog.length - 1 > 10 ? generationLog.length - 1 : 10;

    const xScale = d3
      .scaleLinear()
      .domain([0, xMax])
      .range([pad.left + 10, width - pad.right - 10])
      .nice();

    const minScore = d3.min(generationLog, d => d3.min(d, e => e.score)) || -10;
    const maxScore = d3.max(generationLog, d => d3.max(d, e => e.score)) || 10;

    const yScale = d3
      .scaleLinear()
      .domain([minScore, maxScore])
      .range([height - pad.bottom - 10, pad.top + 10])
      .nice();

    if (yScale(0) > pad.top && yScale(0) < height - pad.bottom) {
      svg
        .append('line')
        .attr('x1', pad.left - 6)
        .attr('y1', yScale(0) + 0.5)
        .attr('x2', width - pad.right)
        .attr('y2', yScale(0) + 0.5)
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
        .style('shape-rendering', 'crispEdges');
    }

    const genSvg = svg
      .selectAll('generation')
      .data(generationLog)
      .enter()
      .append('g');

    const netSvg = genSvg
      .selectAll('net')
      .data(d => d)
      .enter();

    netSvg
      .append('circle')
      .attr('cx', d => xScale(d.generation))
      .attr('cy', d => yScale(d.score))
      .attr('opacity', d => {
        if (d.top) { return 0.8; }
        return 0.25;
      })
      .attr('r', 2.5)
      .attr('fill', d => {
        if (d.top) { return '#3aa3e3'; }
        return '#000';
      });

    const medianLine = [];
    const q1Line = [];
    const q3Line = [];

    for (let i = 0; i < generationLog.length; i += 1) {
      medianLine.push({
        score: calculateQ(generationLog[i], 0.5),
        generation: parseInt(String(i), 10)
      });
      q1Line.push({
        score: calculateQ(generationLog[i], 0.25),
        generation: parseInt(String(i), 10)
      });
      q3Line.push({
        score: calculateQ(generationLog[i], 0.75),
        generation: parseInt(String(i), 10)
      });
    }

    const lineFunction = d3
      .line()
      .x(d => xScale(d.generation))
      .y(d => yScale(d.score))
      .curve(d3.curveCardinal);

    svg
      .append('path')
      .attr('d', lineFunction(medianLine))
      .attr('stroke', '#000')
      .attr('stroke-width', 4)
      .attr('fill', 'none')
      .attr('opacity', 0.25);

    svg
      .append('path')
      .attr('d', lineFunction(q1Line))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('fill', 'none')
      .attr('opacity', 0.25);

    svg
      .append('path')
      .attr('d', lineFunction(q3Line))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('fill', 'none')
      .attr('opacity', 0.25);

    // Add the x Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - pad.bottom})`)
      .call(d3.axisBottom(xScale));

    // Add the x Axis
    svg
      .append('g')
      .attr('transform', `translate(${pad.left},0)`)
      .call(d3.axisLeft(yScale));

    svg.selectAll('.domain').attr('opacity', 0);

    svg
      .selectAll('.tick')
      .selectAll('line')
      .attr('opacity', 0.5);
  }

  drawGraph(graph, panel) {
    const NODE_RADIUS = 7;
    const GATE_RADIUS = 2;
    const REPEL_FORCE = 0;
    const LINK_DISTANCE = 100;
    const WIDTH = 1000;
    const HEIGHT = 500;

    const d3cola = window.cola
      .d3adaptor()
      .avoidOverlaps(true)
      .size([WIDTH, HEIGHT]);

    const svg = d3.select(panel);

    d3.selectAll(`${panel}> *`).remove();

    // define arrow markers for graph links
    svg
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    graph.nodes.forEach(v => {
      v.height = 2 * (v.name === 'GATE' ? GATE_RADIUS : NODE_RADIUS);
      v.width = v.height;
    });

    d3cola
      .nodes(graph.nodes)
      .links(graph.links)
      .constraints(graph.constraints)
      .symmetricDiffLinkLengths(REPEL_FORCE)
      .linkDistance(LINK_DISTANCE)
      .start(10, 15, 20);

    const path = svg
      .selectAll('.link')
      .data(graph.links)
      .enter()
      .append('svg:path')
      .attr('class', 'link');

    path.append('title').text(d => {
      let text = '';
      text += `Weight: ${Math.round(d.weight * 1000) / 1000}\n`;
      text += `Source: ${d.source.id}\n`;
      text += `Target: ${d.target.id}`;
      return text;
    });

    const node = svg
      .selectAll('.node')
      .data(graph.nodes)
      .enter()
      .append('circle')
      .attr('class', d => `node ${d.name}`)
      .attr('r', d => (d.name === 'GATE' ? GATE_RADIUS : NODE_RADIUS));
    // .call(d3cola.drag);

    node.append('title').text(d => {
      let text = '';
      text += `Activation: ${Math.round(d.activation * 1000) / 1000}\n`;
      text += `Bias: ${Math.round(d.bias * 1000) / 1000}\n`;
      text += `Position: ${d.id}`;
      return text;
    });

    const label = svg
      .selectAll('.label')
      .data(graph.nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => `(${d.index}) ${d.name}`);
    // .call(d3cola.drag);

    d3cola.on('tick', () => {
      // draw directed edges with proper padding from node centers
      path.attr('d', d => {
        const deltaX = d.target.x - d.source.x;
        const deltaY = d.target.y - d.source.y;
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let normX = deltaX / dist;
        let normY = deltaY / dist;

        if (isNaN(normX)) { normX = 0; }
        if (isNaN(normY)) { normY = 0; }

        const sourcePadding = d.source.width / 2;
        const targetPadding = d.target.width / 2 + 2;
        const sourceX = d.source.x + sourcePadding * normX;
        const sourceY = d.source.y + sourcePadding * normY;
        let targetX = d.target.x - targetPadding * normX;
        let targetY = d.target.y - targetPadding * normY;

        // Defaults for normal edge.
        let drx = 0;
        let dry = 0;
        let xRotation = 0; // degrees
        let largeArc = 0; // 1 or 0
        const sweep = 1; // 1 or 0

        // Self edge.
        if (d.source.x === d.target.x && d.source.y === d.target.y) {
          xRotation = -45;
          largeArc = 1;
          drx = 20;
          dry = 20;
          targetX += 1;
          targetY += 1;
        }
        return `M${sourceX},${sourceY}A${drx},${dry} ${xRotation},${largeArc},${sweep} ${targetX},${targetY}`;
      });

      node.attr('cx', d => d.x).attr('cy', d => d.y);

      label.attr('x', d => d.x + 10).attr('y', d => d.y - 10);
    });
  }
}

function calculateQ(values: any, Q: number) {
  values.sort((a: any, b: any) => a.score - b.score);

  if (values.length === 0) { return 0; }

  const index = Math.floor(values.length * Q);

  if (values.length % 2) {
    return values[index].score;
  }
  if (index - 1 < 0) { return 0; }
  return (values[index - 1].score + values[index].score) / 2.0;
}

export default Manager;
