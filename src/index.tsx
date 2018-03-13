import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { IStoreState } from './types/index';
import { Provider } from 'react-redux';
import Manager from './AI/manager';
import Field from './components/Field';
import BorderWallSwitch from './containers/BorderWallSwitch';
import EatSelfSwitch from './containers/EatSelfSwitch';
import './styles/App.css';
import configureStore from './store/configureStore';

const configuredStore = configureStore();
class App extends Component<{}, IStoreState> {
    manager: Manager;
    constructor(props: any) {
      super(props);     
      this.state = { // todo take these all away and use redux..
        populationSize: 50,
        elitismPercent: 10,
        foodScore: 25, // 10
        moveTowardsScore: 2,
        moveAwayScore: -3, // -1.5
        initialSnakeLength: 4,        
        growWhenEating: true,
        gameSpeedUp: false,
        displaySize: 100,
        gridResolution: 20,
        running: false,
        paused: false,
        snakes: [],
        borderWallSwitch: {
          label: 'Snake dies when it hits a wall.',
          value: true
        },
        eatSelfSwitch: {
          label: 'Snake dies when it his itself.',
          value: true
        }
      };
      this.manager = new Manager(this.state);
      this.start = this.start.bind(this);
      this.pause = this.pause.bind(this);
      this.resume = this.resume.bind(this);
      this.stop = this.stop.bind(this);
    }
  
    start() {
      this.setState({
        running: true
      });
      this.manager.updateSettings(this.state);
      this.manager.start();
    }
  
    stop() {
      this.setState({
        running: false
      });
      this.manager.stop();
    }
  
    pause() {
      this.setState({
        paused: true
      });
      this.manager.pause();
    }
  
    resume() {
      this.setState({
        paused: false
      });
      this.manager.resume();
    }
  
    render() {
      var that = this;
  
      this.manager.updateSettings(this.state);
  
      var canvases = [];
      for (var i = 0; i < this.state.populationSize; i++) {
        canvases.push(i);
      }
  
      return (
        <div className="App">
          <div className="control-menu">
            {this.state.running && !this.state.paused ? (
              <div>
                <div className="btn btn-orange" onClick={this.pause}>
                  Pause Evolution
                </div>
              </div>
            ) : (
                ''
              )}
  
            {this.state.running && this.state.paused ? (
              <div>
                <div className="btn btn-success" onClick={this.resume}>
                  Resume Evolution
                </div>
                <div className="btn btn-danger" onClick={this.stop}>
                  Stop Evolution
                </div>
              </div>
            ) : (
                ''
              )}
  
            {!this.state.running ? (
              <div className="btn btn-success" onClick={this.start}>
                Start Evolution
              </div>
            ) : (
                ''
              )}
  
            <Field
              type="number"
              name="populationSize"
              placeholder="Population Size"
              required={true}
              value={this.state.populationSize}
              onChangeEvent={v => {
                that.setState({ populationSize: v });
              }}
              disabled={this.state.running}
              description="How many neural nets per generation?"
              min={2}
            />
            <Field
              type="number"
              name="elitismPercent"
              placeholder="Elitism Percent"
              required={true}
              value={this.state.elitismPercent}
              onChangeEvent={v => {
                that.setState({ elitismPercent: v });
              }}
              disabled={this.state.running}
              description="% of top performers to use for the next generation."
              min={1}
              max={100}
              step={1}
            />
            <Field
              type="number"
              name="foodScore"
              placeholder="Eat Food Score"
              required={true}
              value={this.state.foodScore}
              onChangeEvent={v => {
                that.setState({ foodScore: v });
              }}
              description="Awarded for eating food."
              step={1}
            />
            <Field
              type="number"
              name="moveTowardsScore"
              placeholder="Move Towards Food Score"
              required={true}
              value={this.state.moveTowardsScore}
              onChangeEvent={v => {
                that.setState({ moveTowardsScore: v });
              }}
              description="Awarded for each step towards food."
              step={0.5}
            />
            <Field
              type="number"
              name="moveAwayScore"
              placeholder="Move Away Food Score"
              required={true}
              value={this.state.moveAwayScore}
              onChangeEvent={v => {
                that.setState({ moveAwayScore: v });
              }}
              description="Awarded for each step away from food."
              step={0.5}
            />
            <Field
              type="number"
              name="initialSnakeLength"
              placeholder="Snake Starting Length"
              required={true}
              value={this.state.initialSnakeLength}
              onChangeEvent={v => {
                that.setState({ initialSnakeLength: v });
              }}
              description="Measured in grid cells."
              min={1}
              step={1}
              max={Math.floor(this.state.gridResolution / 2)}
            />
            <Field
              type="number"
              name="gridResolution"
              placeholder="Grid Resolution"
              required={true}
              value={this.state.gridResolution}
              onChangeEvent={v => {
                that.setState({ gridResolution: v });
              }}
              description="Resolution of each Snake's grid environment."
              min={5}
              step={1}
            />
            <Field
              type="number"
              name="displaySize"
              placeholder="Display Size"
              required={true}
              value={this.state.displaySize}
              onChangeEvent={v => {
                that.setState({ displaySize: v });
              }}
              description="Does not affect game-play."
              min={10}
              step={1}
            />
            <BorderWallSwitch />
            <EatSelfSwitch />
            {/*           
            <Switch
              value={this.state.growWhenEating}
              label="Snake grows longer when it eats."
              onToggle={() => {
                that.setState({ growWhenEating: !that.state.growWhenEating });
              }}
            />
            <Switch
              value={this.state.gameSpeedUp}
              label="Runs with high speed."
              onToggle={() => {
                that.setState({ gameSpeedUp: !that.state.gameSpeedUp });
              }}
            /> */}
          </div>
          <div className="description">
            <h3 style={{ marginBottom: 10, marginTop: 0 }}>
              {this.state.running ? (
                <span>
                  Generation <span id="gen" />{''}
                </span>
              ) : (
                  <span>Designing AI: Solving Snake with Evolution</span>
                )}
            </h3>
            <div id="workspace">
              {canvases.map(j => {
                return (
                  <div className="grid-item" key={j}>
                    <canvas
                      // name={'snake-canvas'}
                      id={'snake-canvas-' + j}
                      width={that.state.displaySize + 'px'}
                      height={that.state.displaySize + 'px'}
                    />
                  </div>
                );
              })}
            </div>
            <hr />
            <div>
              <h3 style={{ marginBottom: 10 }}>Performance by Generation</h3>
              <div id="graph">{/* graph will load here */}</div>
              <div className="row">
                <svg className="draw" width="800px" height="800px" />
              </div>
              <p>
                This graph shows a dot for every individual neural net's
                performance. Each new generation will appear at to the right.
              </p>
              <p>
                <small>
                  <strong>Be patient.</strong> Sometimes, advantageous random
                  mutations happen quickly, sometimes those mutations prove it's
                  better to play it safe, and sometimes they never seem to
                  happen...
                </small>
              </p>
              <small>
                <i>
                  <strong>
                    Warning: Some browsers slow down the loops being used to train
                    the AI if this tab is in the background. Funky things may
                    happen.
                  </strong>
                </i>
              </small>
            </div>
          </div>
        </div>
      );
    }
  }

ReactDOM.render(
    <Provider store={configuredStore}>
        <App />
    </Provider>,
    document.getElementById('root')
);
