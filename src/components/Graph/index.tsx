/* having many problems extracting graph as a component by itself currently. KIV */
import React, { Component } from 'react';
import d3 from 'd3';

interface IGraphLineItem {
    score: number;
    generation: number;
}

export interface IGenerationLogItem {
    score: number;
    generation: number;
    top: boolean;
}

export interface IGraphProps {
    containerName: string;    
    generationLog: IGenerationLogItem[][];
}

interface IGraphState {
    generationLog: IGenerationLogItem[][];
    containerName: string;
}

class Graph extends Component<IGraphProps, IGraphState> {
    constructor(props: IGraphProps) {
      super(props);
  
      this.state = {
        generationLog: props.generationLog,
        containerName: props.containerName
      };
    }
    
    calculateQ(values: IGenerationLogItem[], Q: number) {
        values.sort((a: IGenerationLogItem, b: IGenerationLogItem) => a.score - b.score);
        if (values.length === 0) { return 0; }    
        const index = Math.floor(values.length * Q);    
        if (values.length % 2) {
            return values[index].score;
        }
        if (index - 1 < 0) { return 0; }
        return (values[index - 1].score + values[index].score) / 2.0;
    }
    
    componentWillUnmount() {
      d3
        .select(this.state.containerName)
        .selectAll('svg')
        .remove();
      
    }

    drawHistoryGraph() {
      // const containerName = this.state.containerName;
      const genLog = this.state.generationLog;
      // const width = document.getElementById('graph')!.clientWidth;
      // const height = document.getElementById('graph')!.clientHeight;
      const height = 500;
      const width = 500;

      let svg = d3
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
    
      const xMax = genLog.length - 1 > 10 ? genLog.length - 1 : 10;
    
      const xScale = d3
          .scaleLinear()
          .domain([0, xMax])
          .range([pad.left + 10, width - pad.right - 10])
          .nice();
    
      const minScore = parseInt(
            d3.min(genLog, (d: any) => d3.min(d, (e: any) => e.score))!, 10) || -10;
      const maxScore = parseInt(
            d3.max(genLog, (d: any) => d3.max(d, (e: any) => e.score))!, 10) || 10;
    
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
          .data(genLog)
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
    
      for (let i = 0; i < genLog.length; i++) {
          const logs = genLog[i];
          medianLine.push({
            score: this.calculateQ(logs, 0.5),
            generation: i
          });
          q1Line.push({
            score: this.calculateQ(logs, 0.25),
            generation: i
          });
          q3Line.push({
            score: this.calculateQ(logs, 0.75),
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
     
    render() {     
      return (
        <div />
      );
    }
  }

export default Graph;
  