import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { IStoreState } from './types/index';
import { Provider } from 'react-redux';
import Manager from './AI/manager';
import './styles/App.css';
import configureStore from './store/configureStore';

import BorderWallSwitch from './containers/BorderWallSwitch';
import EatSelfSwitch from './containers/EatSelfSwitch';
import GrowWhenEatingSwitch from './containers/GrowWhenEatingSwitch';
import HighSpeedSwitch from './containers/HighSpeedSwitch';
import initialState from './reducers/initialState';
import PopulationField from './containers/PopulationField';
import ElitismPercentField from './containers/ElitismPercentField';
import EatFoodScoreField from './containers/EatFoodScoreField';
import MoveTowardsFoodScoreField from './containers/MoveTowardsFoodScoreField';
import MoveAwayFoodScoreField from './containers/MoveAwayFoodScoreField';
import SnakeStartingLengthField from './containers/SnakeStartingLengthField';
import GridResolutionField from './containers/GridResolutionField';
import DisplaySizeField from './containers/DisplaySizeField';

const configuredStore = configureStore(initialState);

class App extends Component<{}, IStoreState> {
    manager: Manager;
    unsubscribe: any;
    constructor(props: any) {
      super(props);     
      this.state = initialState;
      this.manager = new Manager(configuredStore.getState());
      this.start = this.start.bind(this);
      this.pause = this.pause.bind(this);
      this.resume = this.resume.bind(this);
      this.stop = this.stop.bind(this);
      this.unsubscribe = configuredStore.subscribe(this.changeSubscription(this.manager));
    }
    changeSubscription = (manager: Manager) => () => {
      const newState = configuredStore.getState();
      manager.updateSettings(newState);
    }
    start() {
      this.setState({ running: true });
      // this.manager.updateSettings(configuredStore);
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
      // this.manager.updateSettings(configuredStore);  
      var canvases = [];
      const populationSize = configuredStore.getState().populationReducer.value;
      const displaySize = configuredStore.getState().displaySizeReducer.value;
      for (var i = 0; i < populationSize; i++) {
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
            <PopulationField />
            <ElitismPercentField />
            <EatFoodScoreField />
            <MoveTowardsFoodScoreField />
            <MoveAwayFoodScoreField />
            <SnakeStartingLengthField />
            <GridResolutionField />
            <DisplaySizeField />            
            <BorderWallSwitch />
            <EatSelfSwitch />
            <GrowWhenEatingSwitch/>
            <HighSpeedSwitch/>
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
                      id={'snake-canvas-' + j}
                      width={displaySize + 'px'}
                      height={displaySize + 'px'}
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
