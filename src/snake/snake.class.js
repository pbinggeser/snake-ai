// snake.class.js

function Snake(genome, config) {
  this.state = {};
  this.config = config;

  this.brain = genome;
  this.brain.score = 0;
  this.currentScore = 0;
  this.firstAttemptScore = 0;
  this.bestScore = 0;
  this.deaths = 0;
  this.maxDeaths = 2;

  this.highScore = 0;
  this.gamesPlayed = -1;

  this.restart();
  this.direction = 0;
  this.turnAngle = 90;
  this.makeFood();
  this.lastDirection = undefined;
  this.lastDistance = this.config.gridResolution;

  return this;
}

Snake.prototype = {
  getFontSize(t) {
    const val = 1 / (1 + Math.pow(Math.E, -t / 10)) * 15;
    if (val < 8) return 8;
    return val;
  },

  hideCanvas(context) {
    context.fillStyle = "rgba(255,255,255,.75)";
    context.fillRect(0, 0, this.config.displaySize, this.config.displaySize);
  },
  bragCanvas(context) {
    context.strokeStyle = "#3aa3e3";
    context.lineWidth = 4;
    context.strokeRect(0, 0, this.config.displaySize, this.config.displaySize);
  },
  showCanvas(context) {
    context.clearRect(0, 0, this.config.displaySize, this.config.displaySize);
    context.fillStyle = "#000";
    if (this.deaths > 0) context.fillStyle = "#bbb";

    // for (const i in this.state.body) {
    Object.keys(this.state.body).forEach(i => {
      context.globalAlpha =
        (this.state.body.length - i) / this.state.body.length / 2 + 0.5;

      const d = this.state.body[i];
      context.fillRect(
        d.x / this.config.gridResolution * this.config.displaySize,
        d.y / this.config.gridResolution * this.config.displaySize,
        this.config.displaySize / this.config.gridResolution,
        this.config.displaySize / this.config.gridResolution
      );
    });

    context.globalAlpha = 1;
    context.fillStyle = "#2c4";
    context.beginPath();
    context.arc(
      (this.state.food.x + 0.5) /
        this.config.gridResolution *
        this.config.displaySize,
      (this.state.food.y + 0.5) /
        this.config.gridResolution *
        this.config.displaySize,
      this.config.displaySize / this.config.gridResolution / 2,
      0,
      2 * Math.PI
    );
    context.fill();
    // Show the different textAlign values
    context.textAlign = "start";
    context.fillStyle = "#red";
    context.font = `italic ${this.getFontSize(this.currentScore)}pt Calibri`;
    // console.log(this.getFontSize(this.currentScore));
    context.fillText(`${this.currentScore}/${this.bestScore}`, 10, 20);
  },

  look() {
    if (this.dead) return;

    const a = angleToPoint(
      this.state.body[0].x,
      this.state.body[0].y,
      this.state.food.x,
      this.state.food.y
    );
    const d = radiansToDegrees(a);

    let theta = d + 90;
    if (theta > 180) theta -= 360;
    theta += this.direction;

    if (theta > 180) theta -= 360;

    this.theta = theta.toFixed(2);
    theta /= 180;

    let data = [];
    if (theta > -0.25 && theta < 0.25) {
      data = [0, 1, 0];
    } else if (theta <= -0.25) {
      data = [1, 0, 0];
    } else {
      data = [0, 0, 1];
    }

    const head = JSON.parse(JSON.stringify(this.state.body[0]));
    this.checks = [];

    if (this.direction === 0) {
      // up
      this.checks = [{ x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 }]; // , {x: -1, y: -1}, {x: 1, y: -1} ];
    } else if (this.direction === 90) {
      // left
      this.checks = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }]; // , {x: -1, y: -1}, {x: -1, y: 1} ];
    } else if (this.direction === 270) {
      // right
      this.checks = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }]; // , {x: 1, y: -1}, {x: 1, y: 1} ];
    } else if (this.direction === 180) {
      // down
      this.checks = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }]; // , {x: -1, y: 1}, {x: 1, y: 1} ];
    }

    // for (const i in this.checks) {
    Object.keys(this.checks).forEach(i => {
      const tx = this.checks[i].x + head.x;
      const ty = this.checks[i].y + head.y;

      if (tx < 0 || tx >= this.config.gridResolution) {
        data.push(1);
        this.checks[i].hit = true;
        // continue;
      }

      if (ty < 0 || ty >= this.config.gridResolution) {
        data.push(1);
        this.checks[i].hit = true;
        // continue;
      }

      let bodyHit = false;
      // for (const j in this.state.body) {
      Object.keys(this.state.body).forEach(j => {
        const b = this.state.body[j];
        if (b.x === tx && b.y === ty) {
          bodyHit = true;
          return;
        }

        if (bodyHit) {
          data.push(1);
          this.checks[i].hit = true;
          // continue;
        }
        this.checks[i].hit = false;
        data.push(0);
      });
    });

    this.data = data;
  },

  moveCanvas(context) {
    const head = JSON.parse(JSON.stringify(this.state.body[0]));
    const moveOdds = this.brain.activate(this.data);
    const max = moveOdds.indexOf(Math.max(...moveOdds));
    let eating = false;
    switch (max) {
      case 0:
        // left
        this.key = "left";
        this.direction += this.turnAngle;
        break;
      case 1:
        // straight
        this.key = "straight";
        break;
      case 2:
        // right
        this.key = "right";
        this.direction -= this.turnAngle;
        break;
      default:
        break;
    }

    if (this.direction < 0) this.direction += 360;
    this.direction = this.direction % 360;

    if (this.direction === 0) {
      head.y -= 1;
    } else if (this.direction === 90) {
      head.x -= 1;
    } else if (this.direction === 180) {
      head.y += 1;
    } else if (this.direction === 270) {
      head.x += 1;
    }

    let died = false;
    if (this.config.borderWalls) {
      if (head.x < 0 || head.x >= this.config.gridResolution) {
        died = true;
      }
      if (head.y < 0 || head.y >= this.config.gridResolution) {
        died = true;
      }
    } else {
      if (head.x < 0) head.x = this.config.gridResolution - 1; // head.x = 0;
      if (head.x >= this.config.gridResolution) head.x = 0; // head.x = this.config.gridResolution - 1;
      if (head.y < 0) head.y = this.config.gridResolution - 1;
      if (head.y >= this.config.gridResolution) head.y = 0;
    }

    if (this.state.body.length > 1 && this.config.canEatSelf) {
      for (let i = 2; i < this.state.body.length; i += 1) {
        if (
          head.x === this.state.body[i].x &&
          head.y === this.state.body[i].y
        ) {
          died = true;
          break;
        }
      }
    }

    if (this.currentScore < -50) died = true;

    if (!died) {
      if (head.x === this.state.food.x && head.y === this.state.food.y) {
        eating = true;
        this.currentScore += this.config.foodScore - 0;
        this.lastDistance = this.config.gridResolution * 2;
      }

      // no hit
      this.state.body.unshift(head);
      if (!eating || !this.config.growWhenEating) {
        this.state.body.splice(this.state.body.length - 1, 1);
      }

      const d = distance(head.x, head.y, this.state.food.x, this.state.food.y);
      if (d < this.lastDistance) {
        this.currentScore += this.config.moveTowardsScore - 0;
      } else {
        this.currentScore += this.config.moveAwayScore - 0;
      }
      this.lastDistance = d;
    }

    if (this.currentScore > this.brain.score) {
      this.bestScore = this.currentScore;
    }

    if (this.deaths === 0) {
      this.firstAttemptScore = this.currentScore;
      this.brain.score = this.currentScore;
    }

    if (died) {
      context.clearRect(0, 0, 100, 100);
      context.fillStyle = "rgba(255,0,0,.5)";
      Object.keys(this.state.body).forEach(i => {
        const d = this.state.body[i];
        context.fillRect(
          d.x / this.config.gridResolution * 100,
          d.y / this.config.gridResolution * 100,
          100 / this.config.gridResolution,
          100 / this.config.gridResolution
        );
      });

      // for (const i in this.state.body) {
      //   const d = this.state.body[i];
      //   context.fillRect(
      //     d.x / this.config.gridResolution * 100,
      //     d.y / this.config.gridResolution * 100,
      //     100 / this.config.gridResolution,
      //     100 / this.config.gridResolution
      //   );
      // }
      this.restart();
      this.makeFood();
      this.deaths += 1;
      return;
    }
    if (eating) this.makeFood();
  },

  makeFood() {
    let food;

    while (food === undefined) {
      const tfood = {
        x: parseInt(this.config.gridResolution * Math.random(), 10),
        y: parseInt(this.config.gridResolution * Math.random(), 10)
      };
      let found = false;
      for (const i in this.state.body) {
        if (
          this.state.body[i].x === tfood.x &&
          this.state.body[i].y === tfood.y
        ) {
          found = true;
          break;
        }
      }

      if (!found) food = tfood;
    }

    this.state.food = food;
  },

  restart() {
    const body = [];
    const rows = [];
    for (let x = 0; x < this.config.gridResolution; x += 1) {
      const d = [];
      for (let y = 0; y < this.config.gridResolution; y += 1) {
        d.push({ x, y });
      }
      rows.push(d);
    }

    body.push({
      x: parseInt(this.config.gridResolution / 2, 10),
      y: parseInt(this.config.gridResolution / 2, 10)
    });

    for (let i = 1; i < this.config.initialSnakeLength; i += 1) {
      body.push({
        x: parseInt(this.config.gridResolution / 2, 10),
        y: parseInt(this.config.gridResolution / 2, 10) + i
      });
    }

    this.state = {
      rows,
      body,
      food: { x: -1, y: -1 }
    };

    this.currentScore = 0;
    this.direction = 0;
    this.gamesPlayed += 1;
    this.lastDirection = undefined;
    this.lastDistance = this.config.gridResolution;
  }
};

/** Calculate distance between two points */
function distance(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;

  return Math.sqrt(dx * dx + dy * dy);
}

/** Get the angle from one point to another */
function angleToPoint(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function radiansToDegrees(r) {
  return r / (Math.PI * 2) * 360;
}

export default Snake;
