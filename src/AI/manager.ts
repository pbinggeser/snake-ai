import Snake, { ISnake } from './snake';
import * as d3 from 'd3';
import * as cola from 'webcola';
import { calculateQ, sleep, atoi } from './utilities';
import { IStoreState } from '../types';
const neataptic = require('neataptic');
const { Neat, architect, methods } = neataptic;

interface IGraphLineItem {
  score: number;
  generation: number;
}

export interface IGenerationLogItem {
  score: number;
  generation: number;
  top: boolean;
}

class Manager {
  started: boolean;
  paused: boolean;
  config: IStoreState;
  neat: any;
  snakes: Snake[];
  generationLog: IGenerationLogItem[][];
  generationTimeLog: any;
  iterationCounter: number;
  mutationRate: number;
  inputLayerSize: number;
  hiddenLayerSize: number;
  outputLayerSize: number;
  subscriber: any;

  constructor(config: IStoreState) {
    this.started = false;
    this.paused = false;
    this.config = config;
    this.snakes = [];
    this.generationLog = [];
    this.generationTimeLog = [];
    this.iterationCounter = 0;
    this.inputLayerSize = 6;
    this.hiddenLayerSize = 1;
    this.outputLayerSize = 3;
    this.mutationRate = 0.3;
  }

  start() {    
    this.initNN();
    this.neat.population.forEach((genome: any, i: number) => {
      this.snakes.push(new Snake(genome, this.config, i));
    });
    this.started = true;
    this.paused = false;
    this.handleSnakeClick();
    setTimeout(() => { d3.select('#gen').html('1'); }, 10);
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

  updateSettings(newConfig: IStoreState) {    
    this.config = newConfig;
    if (this.snakes) {
      this.snakes.forEach(snake => snake.updateSettings(newConfig));
    }
  }

  private initNN() {
    const elitismPercent = atoi(this.config.elitismPercentReducer.value);
    this.neat = new Neat(this.inputLayerSize, this.outputLayerSize, null, {
      mutation: [
        methods.mutation.ADD_NODE,
        methods.mutation.SUB_NODE,
        methods.mutation.ADD_CONN,
        methods.mutation.SUB_CONN,
        methods.mutation.MOD_WEIGHT,
        methods.mutation.MOD_BIAS,
        methods.mutation.MOD_ACTIVATION,
        methods.mutation.ADD_GATE,
        methods.mutation.SUB_GATE,
        methods.mutation.ADD_SELF_CONN,
        methods.mutation.SUB_SELF_CONN,
        methods.mutation.ADD_BACK_CONN,
        methods.mutation.SUB_BACK_CONN
      ],
      popsize: this.config.populationReducer.value,
      murationRate: this.mutationRate,
      elitism: Math.round(elitismPercent / 100 * atoi(this.config.populationReducer.value)),
      network: new architect.Random(this.inputLayerSize, this.hiddenLayerSize, this.outputLayerSize)
    });
  }

  private async tick() {
    if (!this.started || this.paused) { return; }

    const sleepTime = this.config.highSpeedReducer.value === true ? 1 : 50;    
    await sleep(sleepTime);
    const that = this;
    let hasEveryoneDied = true;
    let areAllAliveSnakesNegative = true;
    
    this.iterationCounter++;
    // clone snakes so we don't mess with the originals
    const clonedSnakes = JSON.parse(JSON.stringify(this.snakes));
    this.sortSnakes(clonedSnakes);

    ({ hasEveryoneDied, areAllAliveSnakesNegative } = 
      this.checkHasEveryoneDied(hasEveryoneDied, areAllAliveSnakesNegative));

    if (hasEveryoneDied) {
      const newLog: IGenerationLogItem[] = this.getCurrentGenerationLog(clonedSnakes);
      this.generationLog.push(newLog);
      this.generationTimeLog.push({
        index: this.generationTimeLog.length
      });
      this.drawHistoryGraph();
      setTimeout(() => { that.breed(); }, 200);
    } else {
      setTimeout(() => {
        this.snakes.forEach((snake, _j) => {
          snake.look();
          snake.showCanvas();
          snake.moveCanvas();
        }); // tslint:disable-next-line:align
        that.tick(); }, 1);
    }
  }

  private getCurrentGenerationLog(clonedSnakes: any) {
    let generationLog: IGenerationLogItem[] = [];
    clonedSnakes.forEach((clonedSnake: ISnake, j: number) => {
      let top = false;
      if (j < atoi(this.config.populationReducer.value) * atoi(this.config.elitismPercentReducer.value) / 100) {
        this.snakes[clonedSnake.index].bragCanvas();
        top = true;
      } else {
        this.snakes[clonedSnake.index].hideCanvas();
      }
      generationLog.push({
        score: clonedSnake.firstAttemptScore,
        generation: this.generationLog.length,
        top
      });
    });
    return generationLog;
  }

  private checkHasEveryoneDied(hasEveryoneDied: boolean, areAllAliveSnakesNegative: boolean) {
    for (let i in this.snakes) {
      if (this.snakes[i].deaths === 0) {
        hasEveryoneDied = false;
        if (this.snakes[i].currentScore > 0) {
          areAllAliveSnakesNegative = false;
        }
      }
    }
    if (!hasEveryoneDied) {
      if (this.iterationCounter > 10 && areAllAliveSnakesNegative) {
        hasEveryoneDied = true;
      }
    }
    return { hasEveryoneDied, areAllAliveSnakesNegative };
  }

  private sortSnakes(clonedSnakes: any) {
    clonedSnakes.forEach((clonedSnake: ISnake, j: number) => {
      clonedSnake.index = j;
    });
    clonedSnakes.sort((a: ISnake, b: ISnake) => {
      if (a.firstAttemptScore > b.firstAttemptScore) {
        return -1;
      }
      if (a.firstAttemptScore < b.firstAttemptScore) {
        return 1;
      }
      return 0;
    });
  }

  private breed() {
    this.neat.sort();
    const newPopulation = [];
    let i;

    // Elitism
    for (i = 0; i < this.neat.elitism; i++) {
      newPopulation.push(this.neat.population[i]);
    }

    // Breed the next individuals
    for (i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
      newPopulation.push(this.neat.getOffspring());
    }

    // Replace the old population with the new population
    this.neat.population = newPopulation;
    this.neat.mutate();
    this.neat.generation++;
    d3.select('#gen').html(this.neat.generation + 1);
    this.snakes = [];

    this.neat.population.forEach((_snake: ISnake, j: number) => {
      const newGenome = this.neat.population[j];      
      this.snakes.push(new Snake(newGenome, this.config, j));
    });

    this.iterationCounter = 0;
    this.tick();
  }

  private drawHistoryGraph() {
    d3
      .select('#graph')
      .selectAll('svg')
      .remove();
    const width = document.getElementById('graph')!.clientWidth;
    const height = document.getElementById('graph')!.clientHeight;

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

    const xMax = this.generationLog.length - 1 > 10 ? this.generationLog.length - 1 : 10;

    const xScale = d3
      .scaleLinear()
      .domain([0, xMax])
      .range([pad.left + 10, width - pad.right - 10])
      .nice();

    const minScore = atoi(d3.min(this.generationLog, (d: any) => d3.min(d, (e: any) => e.score))!) || -10;
    const maxScore = atoi(d3.max(this.generationLog, (d: any) => d3.max(d, (e: any) => e.score))!) || 10;

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
      .data(this.generationLog)
      .enter()
      .append('g');

    const netSvg = genSvg
      .selectAll('net')
      .data((d: any) => d)
      .enter();

    netSvg
      .append('circle')
      .attr('cx', (d: any) => xScale(d.generation))
      .attr('cy', (d: any) => yScale(d.score))
      .attr('opacity', (d: any) => {
        if (d.top) { return 0.8; }
        return 0.25;
      })
      .attr('r', 2.5)
      .attr('fill', (d: any) => {
        if (d.top) { return '#3aa3e3'; }
        return '#000';
      });

    const medianLine: IGraphLineItem[] = [];
    const q1Line: IGraphLineItem[] = [];
    const q3Line: IGraphLineItem[] = [];

    for (let i = 0; i < this.generationLog.length; i++) {
      const genLog = this.generationLog[i];
      medianLine.push({
        score: calculateQ(genLog, 0.5),
        generation: i
      });
      q1Line.push({
        score: calculateQ(genLog, 0.25),
        generation: i
      });
      q3Line.push({
        score: calculateQ(genLog, 0.75),
        generation: i
      });
    }

    const lineFunction = d3
      .line<IGraphLineItem>()
      .x((d: IGraphLineItem) => xScale(d.generation))
      .y((d: IGraphLineItem) => yScale(d.score))
      .curve(d3.curveCardinal);

    svg
      .append('path')
      .attr('d', lineFunction(medianLine)!)
      .attr('stroke', '#000')
      .attr('stroke-width', 4)
      .attr('fill', 'none')
      .attr('opacity', 0.25);

    svg
      .append('path')
      .attr('d', lineFunction(q1Line)!)
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('fill', 'none')
      .attr('opacity', 0.25);

    svg
      .append('path')
      .attr('d', lineFunction(q3Line)!)
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

  private drawGraph(graph: any, panel: string) {
    const NODE_RADIUS = 7;
    const GATE_RADIUS = 2;
    const REPEL_FORCE = -5;
    const LINK_DISTANCE = 100;
    const WIDTH = 1000;
    const HEIGHT = 500;

    const d3cola = cola
      .d3adaptor(d3)
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

    graph.nodes.forEach(function(v: any) {
      v.height = v.width = 2 * (v.name === 'GATE' ? GATE_RADIUS : NODE_RADIUS); }
    );
  
    graph.nodes.forEach((v: any) => {
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

    path.append('title').text((d: any) => {
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
      .attr('class', (d: any) => `node ${d.name}`)
      .attr('r', (d: any) => (d.name === 'GATE' ? GATE_RADIUS : NODE_RADIUS))
      .on('click', function (d: any) { d.fixed = true; })
      .call(d3cola.drag);

    node.append('title').text((d: any) => {
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
      .text((d: any) => `(${d.index}) ${d.name}`)
      .on('click', function (d: any) { d.fixed = true; })
      .call(d3cola.drag);

    d3cola.on('tick', () => {
      // draw directed edges with proper padding from node centers
      path.attr('d', (d: any) => {
        let deltaX = d.target.x - d.source.x;
        let deltaY = d.target.y - d.source.y;
        let dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        let normX = deltaX / dist;
        let normY = deltaY / dist;

        if (isNaN(normX)) { normX = 0; }
        if (isNaN(normY)) { normY = 0; }

        let sourcePadding = d.source.width / 2;
        let targetPadding = d.target.width / 2 + 2;
        let sourceX = d.source.x + sourcePadding * normX;
        let sourceY = d.source.y + sourcePadding * normY;
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
          drx = dist;
          dry = dist;
          xRotation = -45;
          largeArc = 1;
          drx = 20;
          dry = 20;
          targetX = targetX + 1;
          targetY = targetY + 1;
        }
        return `M${sourceX},${sourceY}A${drx},${dry} ${xRotation},${largeArc},${sweep} ${targetX},${targetY}`;
      });
      
      node
      .attr('cx', function (d: any) {
        return d.x;
      })
      .attr('cy', function (d: any) {
        return d.y;
      });

      label
      .attr('x', function (d: any) {
        return d.x + 10;
      })
      .attr('y', function (d: any) {
        return d.y - 10;
      });
    });
  }

  private handleSnakeClick() {
    document.addEventListener('click', e => {
      let canvasId = String((<HTMLCanvasElement> e.target).id.indexOf('snake-canvas'));
      if (canvasId !== '-1') {
        const selectedSnake = this.snakes[canvasId.substr(canvasId.length - 1)];
        this.drawGraph(selectedSnake.brain.graph(400, 400), '.draw');
      }
    });
  }
}

export default Manager;
