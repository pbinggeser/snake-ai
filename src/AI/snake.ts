import { getFontSize, angleToPoint, radiansToDegrees, distance, atoi } from './utilities';
import { IStoreState } from '../types';

export interface ISnake {
  key: string;
  data: number[];
  checks: any;
  dead: boolean;
  currentScore: number;
  firstAttemptScore: number;
  bestScore: number;
  deaths: number;
  maxDeaths: number;
  highScore: number;
  gamesPlayed: number;
  direction: number;
  turnAngle: number;
  lastDirection: number;
  lastDistance: number;
  index: number;
  state: any;
  config: any;
  brain: IBrain;
  look: () => void;  
  makeFood: () => void;
  restart: () => void;
}

export interface IBrain {
  score: number;
  activate: (data: number[]) => number[];
}

class Snake {
  key: string;
  data: number[];
  checks: any; // todo proper typing..
  dead: boolean;
  currentScore: number;
  firstAttemptScore: number;
  bestScore: number;
  deaths: number;
  index: number;
  maxDeaths: number;
  highScore: number;
  gamesPlayed: number;
  direction: number;
  turnAngle: number;
  lastDirection?: number;
  lastDistance: number;
  state: any;  
  brain: IBrain;
  canvasContext: CanvasRenderingContext2D;
  displaySize: number;
  gridResolution: number;
  foodScore: number;
  moveTowardsFoodScore: number;
  moveAwayFoodScore: number;
  initialSnakeLength: number;
  private config: IStoreState;

  // tslint:disable-next-line:member-ordering
  constructor(brain: any, config: IStoreState, index: number) {
    this.state = {};    
    this.config = config;
    this.brain = brain;
    this.key = '';
    this.brain.score = 0;
    this.currentScore = 0;
    this.firstAttemptScore = 0;
    this.bestScore = 0;
    this.deaths = 0;
    this.maxDeaths = 2;
    this.index = index;
    this.highScore = 0;
    this.gamesPlayed = -1;

    this.cacheSettings();

    this.restart();
    this.direction = 0;
    this.turnAngle = 90;
    this.makeFood();
    this.lastDirection = undefined;
    this.canvasContext = (<HTMLCanvasElement> document.getElementById(`snake-canvas-${this.index}`)).getContext('2d')!;
  }

  updateSettings(config: IStoreState) {
    this.config = config;
    this.cacheSettings();
  }
  
  hideCanvas() {
    this.canvasContext.fillStyle = 'rgba(255,255,255,.75)';
    this.canvasContext.fillRect(0, 0, this.displaySize, this.displaySize);
  }

  bragCanvas() {
    this.canvasContext.strokeStyle = '#3aa3e3';
    this.canvasContext.lineWidth = 4;
    this.canvasContext.strokeRect(0, 0, this.displaySize, this.displaySize);
  }

  showCanvas() {
    this.canvasContext.clearRect(0, 0, this.displaySize, this.displaySize);   
    this.drawSnakeOnCanvas();
    this.drawFoodOnCanvas();
    this.drawScoreOnCanvas();
  }

  moveCanvas() {
    // clone the head so that we don't mess with the actual snake in the state
    let eating = false;
    let died = false;
    const head = JSON.parse(JSON.stringify(this.state.body[0]));
    this.getBestDirectionFromNN();
    this.setNewSnakeHead(head, this.direction);

    if (this.config.hitWallReducer.value) {
      if (head.x < 0 || head.x >= this.gridResolution) {
        died = true;
      }
      if (head.y < 0 || head.y >= this.gridResolution) {
        died = true;
      }
    } else {
      if (head.x < 0) { head.x = this.gridResolution - 1; } // head.x = 0;
      if (head.x >= this.gridResolution) { head.x = 0; } // head.x = this.gridResolution - 1;
      if (head.y < 0) { head.y = this.gridResolution - 1; }
      if (head.y >= this.gridResolution) { head.y = 0; }
    }

    // snakes hit themselves
    if (this.state.body.length > 1 && this.config.eatSelfReducer.value) {
      for (let i = 2; i < this.state.body.length; i++) {
        if (head.x === this.state.body[i].x && head.y === this.state.body[i].y) {
          died = true;
          break;
        }
      }
    }
    // snake keeps going round in circles
    if (this.currentScore < -50) { died = true; }

    if (!died) {
      // ate food
      if (head.x === this.state.food.x && head.y === this.state.food.y) {
        eating = true;
        this.currentScore += this.foodScore;
        this.lastDistance = this.gridResolution * 2;
      }
      // add 1 square to the "front" of the snake
      this.state.body.unshift(head);
      // remove 1 square from "end" of the snake if user select "grow when eating"
      if (!eating || !this.config.growWhenEatReducer.value) {
        this.state.body.pop();
      }
      // calculate whether snake is moving towards/away from food
      const d = distance(head.x, head.y, this.state.food.x, this.state.food.y);
      if (d < this.lastDistance) {
        this.currentScore += this.moveTowardsFoodScore;
      } else {
        this.currentScore += this.moveAwayFoodScore;
      }
      this.lastDistance = d;
    }
    // update best score if needed
    if (this.currentScore > this.brain.score) {
      this.bestScore = this.currentScore;
    }

    if (this.deaths === 0) {
      this.firstAttemptScore = this.currentScore;
      this.brain.score = this.currentScore;
    }

    if (died) {
      this.paintSnakeRed();
      
      this.deaths++;
      this.restart();
      this.makeFood();
      return;
    }
    if (eating) { this.makeFood(); }
  }

  look() {
    if (this.dead) { return; }
    const a = angleToPoint(
      this.state.body[0].x,
      this.state.body[0].y,
      this.state.food.x,
      this.state.food.y
    );
    const d = radiansToDegrees(a);
    let theta = d + 90;
    if (theta > 180) { 
      theta -= 360;      
    }    
    theta += this.direction;
    if (theta > 180) { theta -= 360; }

    theta = atoi(theta.toFixed(2));
    theta /= 180;

    // populate NN first 3 input (direction from snake's perspective chosen based on NN predictions)
    let data: number[] = [];    
    if (theta > -0.25 && theta < 0.25) {
      data = [0, 1, 0]; // straight
    } else if (theta <= -0.25) {
      data = [1, 0, 0]; // left
    } else {
      data = [0, 0, 1]; // right
    }

    const head = JSON.parse(JSON.stringify(this.state.body[0]));
    this.checks = [];
    const left = {
      x: -1, y: 0
    };
    const down = {
      x: 0, y: -1
    };
    const right = {
      x: 1, y: 0 
    };
    const up = {
      x: 0, y: 1
    };
    if (this.direction === 0) {
      // up
      this.checks = [left, down, right]; // , {x: -1, y: -1}, {x: 1, y: -1} ];
    } else if (this.direction === 90) {
      // left
      this.checks = [up, right, down]; // , {x: -1, y: -1}, {x: -1, y: 1} ];
    } else if (this.direction === 270) {
      // right
      this.checks = [down, left, up]; // , {x: 1, y: -1}, {x: 1, y: 1} ];
    } else if (this.direction === 180) {
      // down
      this.checks = [right, up, left]; // , {x: -1, y: 1}, {x: 1, y: 1} ];
    }

    this.checks.forEach((check: any, _i: number) => {
      const tx = check.x + head.x;
      const ty = check.y + head.y;
     
      if (tx < 0 || tx >= this.gridResolution) {
        data.push(1);
        check.hit = true;
        return;
      }

      if (ty < 0 || ty >= this.gridResolution) {
        data.push(1);
        check.hit = true;
        return;
      }
      let bodyHit = false;
      // check whether snake hit himself
      this.state.body.forEach((body: any, _j: number) => {
        if (body.x === tx && body.y === ty) {
          bodyHit = true;
          return;
        }
      });

      if (bodyHit) {
        data.push(1);
        this.checks.hit = true;
        return;
      }
      this.checks.hit = false;
      data.push(0);      
    });

    this.data = data;
  }
  
  private cacheSettings() {
    this.displaySize = atoi(this.config.displaySizeReducer.value);
    this.gridResolution = atoi(this.config.gridResolutionReducer.value);
    this.foodScore = atoi(this.config.eatFoodScoreReducer.value);
    this.moveTowardsFoodScore = atoi(this.config.moveTowardsFoodScoreReducer.value);
    this.moveAwayFoodScore = atoi(this.config.moveAwayFoodScoreReducer.value);
    this.initialSnakeLength = atoi(this.config.snakeStartingLengthReducer.value);
  }

  private paintSnakeRed() {
    this.canvasContext.clearRect(0, 0, 100, 100);
    this.canvasContext.fillStyle = 'rgba(255,0,0,.5)';
    Object.keys(this.state.body).forEach(i => {
      const d = this.state.body[i];
      this.canvasContext.fillRect(
        d.x / this.gridResolution * 100,
        d.y / this.gridResolution * 100,
        100 / this.gridResolution,
        100 / this.gridResolution
      );
    });
  }

  private setNewSnakeHead(head: any, direction: number) {
    if (direction === 0) {
      head.y -= 1;
    } else if (direction === 90) {
      head.x -= 1;
    } else if (direction === 180) {
      head.y++;
    } else if (direction === 270) {
      head.x++;
    }
  }

  private getBestDirectionFromNN(): void {
    const moveOdds = this.brain.activate(this.data);
    const bestDirection = moveOdds.indexOf(Math.max(...moveOdds));
    
    switch (bestDirection) {
      case 0:
        this.key = 'left';
        this.direction += this.turnAngle;
        break;
      case 1:
        this.key = 'straight';
        break;
      case 2:
        this.key = 'right';
        this.direction -= this.turnAngle;
        break;
      default:
        break;
    }

    if (this.direction < 0) { this.direction += 360; }
    this.direction = this.direction % 360;
  }

  private makeFood() {
    let food;
    while (food === undefined) {
      const tfood = {
        x: atoi(this.gridResolution * Math.random()),
        y: atoi(this.gridResolution * Math.random())
      };
      let found = false;
      for (const i in this.state.body) {
        if (this.state.body[i].x === tfood.x && this.state.body[i].y === tfood.y) {
          found = true;
          break;
        }
      }
      if (!found) { food = tfood; }
    }
    this.state.food = food;
  }

  private restart() {
    const body = [];
    const rows = [];
    const halfGridResolution = atoi(this.gridResolution / 2); // cache this
    // the plane for the snake (should this be run during construction?)
    for (let x = 0; x < this.gridResolution; x++) {
      const d = [];
      for (let y = 0; y < this.gridResolution; y++) {
        d.push({ x, y });
      }
      rows.push(d);
    }

    // the head
    body.push({x: halfGridResolution, y: halfGridResolution});

    // the tail (configurable)
    for (let i = 1; i < this.initialSnakeLength; i++) {
      body.push({ x: halfGridResolution, y: halfGridResolution + i});
    }

    this.state = { rows, body, food: { x: -1, y: -1 } };
    this.currentScore = 0;
    this.direction = 0;
    this.gamesPlayed++;
    this.lastDirection = undefined;
    this.lastDistance = this.gridResolution;
  }

  private drawSnakeOnCanvas() {
    this.canvasContext.fillStyle = '#000';
    if (this.deaths > 0) { this.canvasContext.fillStyle = '#bbb'; }
    Object.keys(this.state.body).forEach(i => {
      this.canvasContext.globalAlpha =
        (this.state.body.length) / this.state.body.length / 2 + 0.5;
      const d = this.state.body[i];
      this.canvasContext.fillRect(
        d.x / this.gridResolution * this.displaySize,
        d.y / this.gridResolution * this.displaySize, 
        this.displaySize / this.gridResolution, 
        this.displaySize / this.gridResolution);
    });
  }

  private drawFoodOnCanvas() {
    this.canvasContext.globalAlpha = 1;
    this.canvasContext.fillStyle = '#2c4';
    this.canvasContext.beginPath();
    this.canvasContext.arc(
      (this.state.food.x + 0.5) / this.gridResolution * this.displaySize, 
      (this.state.food.y + 0.5) / this.gridResolution * this.displaySize, 
      this.displaySize / this.gridResolution / 2, 
      0, 
      2 * Math.PI
    );
    this.canvasContext.fill();
  }

  private drawScoreOnCanvas() {
    this.canvasContext.font = `${getFontSize(this.currentScore)}pt Calibri`;
    this.canvasContext.fillText(`${this.currentScore}/${this.bestScore}`, 10, 20);
  }
}

export default Snake;
