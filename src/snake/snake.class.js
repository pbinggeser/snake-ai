// snake.class.js

function Snake(genome, config){
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

  hideCanvas: function(context){
    context.fillStyle = 'rgba(255,255,255,.75)';
    context.fillRect(0, 0, this.config.displaySize, this.config.displaySize);
  },
  bragCanvas: function(context){
    // context.globalAlpha = .25;
    context.strokeStyle = '#3aa3e3';
    context.lineWidth = 4;
    context.strokeRect(0, 0, this.config.displaySize, this.config.displaySize);
    // context.globalAlpha = 1;
  },
  showCanvas: function(context){
    context.clearRect(0, 0, this.config.displaySize, this.config.displaySize);
    
    context.fillStyle = '#000';
    if(this.deaths > 0) context.fillStyle = '#bbb';

    for(var i in this.state.body){
      context.globalAlpha =  (this.state.body.length - i) / this.state.body.length / 2 + .5;

      var d = this.state.body[i];
      context.fillRect((d.x / this.config.gridResolution) * this.config.displaySize, (d.y / this.config.gridResolution) * this.config.displaySize, this.config.displaySize / this.config.gridResolution, this.config.displaySize / this.config.gridResolution);
    }

    context.globalAlpha = 1;
    context.fillStyle = "#2c4";
    context.beginPath();
    context.arc((this.state.food.x + .5) / this.config.gridResolution * this.config.displaySize, (this.state.food.y + .5) / this.config.gridResolution * this.config.displaySize, this.config.displaySize / this.config.gridResolution / 2, 0, 2 * Math.PI);
    context.fill();
  },

  look: function(){
    if(this.dead) return; 

    var a = angleToPoint(this.state.body[0].x, this.state.body[0].y, this.state.food.x, this.state.food.y);
    var d = radiansToDegrees(a);

    var theta = d + 90;
    if(theta > 180) theta -= 360;    
    theta += this.direction;

    if(theta > 180) theta -= 360;

    this.theta = theta.toFixed(2);
    theta /= 180;
    
    var data = [];
    if(theta > -.25 && theta < .25){
      data = [0,1,0];
    } else if(theta <= -.25){
      data = [1,0,0];
    } else {
      data = [0,0,1];
    }

    var head = JSON.parse(JSON.stringify(this.state.body[0]));
    this.checks = [];

    if(this.direction === 0){
      // up
      this.checks = [ {x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}];//, {x: -1, y: -1}, {x: 1, y: -1} ];

    } else if(this.direction === 90){
      // left
      this.checks = [ {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];//, {x: -1, y: -1}, {x: -1, y: 1} ];
      
    } else if(this.direction === 270){
      // right
      this.checks = [ {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}];//, {x: 1, y: -1}, {x: 1, y: 1} ];

    } else if(this.direction === 180){
      // down
      this.checks = [ {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];//, {x: -1, y: 1}, {x: 1, y: 1} ];
    }

    for(var i in this.checks){
      var tx = this.checks[i].x + head.x;
      var ty = this.checks[i].y + head.y;

      if(tx < 0 || tx >= this.config.gridResolution){
        data.push(1);
        this.checks[i].hit = true;
        continue;
      }

      if(ty < 0 || ty >= this.config.gridResolution){
        data.push(1);
        this.checks[i].hit = true;
        continue;
      }

      var bodyHit = false;
      for(var j in this.state.body){
        var b = this.state.body[j];
        if(b.x === tx && b.y === ty){
          bodyHit = true;
          break;
        }
      }

      if(bodyHit){
        data.push(1);
        this.checks[i].hit = true;
        continue;
      }
      this.checks[i].hit = false;
      data.push(0);
    }

    this.data = data;
  },

  moveCanvas: function(context){
    var head = JSON.parse(JSON.stringify(this.state.body[0]));
    var moveOdds = this.brain.activate(this.data);
    var max = moveOdds.indexOf(Math.max(...moveOdds));

    switch(max){
      case 0:
        // left
        this.key = 'left';
        this.direction += this.turnAngle;
        break;
      case 1:
        // straight
        this.key = 'straight';
        break;
      case 2:
        // right
        this.key = 'right';
        this.direction -= this.turnAngle;
        break;
      default: 
        break;
    }

    if(this.direction < 0) this.direction += 360;
    this.direction = this.direction % 360;

    if(this.direction === 0){
      head.y--;
    } else if(this.direction === 90){
      head.x--;
    } else if(this.direction === 180){
      head.y++;
    } else if(this.direction === 270){
      head.x++;
    }

    var died = false;
    if(this.config.borderWalls){
      if(head.x < 0 || head.x >= this.config.gridResolution){
        died = true;
      }
      if(head.y < 0 || head.y >= this.config.gridResolution){
        died = true;
      }
    } else {
      if(head.x < 0) head.x = this.config.gridResolution - 1; //head.x = 0;
      if(head.x >= this.config.gridResolution) head.x = 0; //head.x = this.config.gridResolution - 1;
      if(head.y < 0) head.y = this.config.gridResolution - 1; 
      if(head.y >= this.config.gridResolution) head.y = 0;
    }

     
    if(this.state.body.length > 1 && this.config.canEatSelf){
      for(var i = 2; i < this.state.body.length; i++){
        if(head.x === this.state.body[i].x && head.y === this.state.body[i].y){
          died = true;
          break;
        }
      }
    }

    if(!died){
      var eating = false;
      if(head.x === this.state.food.x && head.y === this.state.food.y){
        eating = true;

        this.currentScore += this.config.foodScore;
        this.lastDistance = this.config.gridResolution*2;
      }

      // no hit
      this.state.body.unshift(head);
      if(!eating || !this.config.growWhenEating){
        this.state.body.splice(this.state.body.length - 1, 1);
      }

      var d = distance(head.x, head.y, this.state.food.x, this.state.food.y);
      if(d < this.lastDistance){
        this.currentScore += this.config.moveTowardsScore;
      } else {
        this.currentScore += this.config.moveAwayScore;
      }

      this.lastDistance = d;
    }

    if(this.currentScore > this.brain.score){
      this.bestScore = this.currentScore;
    }
    
    if(this.deaths === 0){
      this.firstAttemptScore = this.currentScore;
      this.brain.score = this.currentScore;
    }

    if(died){

      context.clearRect(0, 0, 100, 100);
      context.fillStyle = 'rgba(255,0,0,.5)';
      
      for(i in this.state.body){
        d = this.state.body[i];
        context.fillRect((d.x / this.config.gridResolution) * 100, (d.y / this.config.gridResolution) * 100, 100 / this.config.gridResolution, 100 / this.config.gridResolution);
      }

      this.restart();
      this.makeFood();
  
      this.deaths++;      

      return;
    }
    if(eating) this.makeFood();
  },

  makeFood: function(){
    
    var food = undefined;
    
    while(food === undefined){
      var tfood = {
        x: parseInt(this.config.gridResolution * Math.random(), 10),
        y: parseInt(this.config.gridResolution * Math.random(), 10)
      }
      var found = false;
      for(var i in this.state.body){
        if(this.state.body[i].x === tfood.x && this.state.body[i].y === tfood.y){
          found = true; 
          break;
        }
      }

      if(!found) food = tfood;
    }

    this.state.food = food;
  },

  restart: function(){
    var body = [];

    var rows = [];

    for(var x = 0; x < this.config.gridResolution; x++){
      var d = [];
      for(var y = 0; y < this.config.gridResolution; y++){
        d.push({x: x, y: y});
      }
      rows.push(d);
    }

    body.push({ x: parseInt(this.config.gridResolution / 2 , 10), y: parseInt(this.config.gridResolution / 2, 10) });
    for(var i = 1; i < this.config.initialSnakeLength; i++){
      body.push({ x: parseInt(this.config.gridResolution / 2 , 10), y: parseInt(this.config.gridResolution / 2, 10) + i });
    }
    
    this.state = {
      rows: rows,
      body: body,
      food: {x: -1, y: -1}
    }

    this.currentScore = 0;
    this.direction = 0;
    this.gamesPlayed++; 
    this.lastDirection = undefined;
    this.lastDistance = this.config.gridResolution;
  }
}

/** Calculate distance between two points */
function distance(x1, y1, x2, y2){
  var dx = x1 - x2;
  var dy = y1 - y2;

  return Math.sqrt(dx * dx + dy * dy);
}

/** Get the angle from one point to another */
function angleToPoint(x1, y1, x2, y2){
  return Math.atan2(y2 - y1, x2 - x1);
}

function radiansToDegrees(r){
  return r / (Math.PI * 2) * 360;
}


export default Snake;