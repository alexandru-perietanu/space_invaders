let GameManager = (function () {
    function GameManager() {
        this.invaders = [];
        this.invadersModel = [];
        this.boardWidth = 750;
        this.boardHeight = 800;
        this.element = document.createElement("div");
        this.element.className = "board";
        //this.invadersContainer = new Sprite("invadersContainer");

        this.alienColumns = 11;
        this.alienRows = 5;

        //variables for aliens
        this.interval;
        this.stepSize = 10;
        this.direction = 1;
        this.currentStep = 0;
        this.stepTime = 500;
        this.difficulty = 0;
        this.distanceX = 50;
        this.distanceY = 50;
        this.offsetY = 50;

        //battle ship variables
        this.battleShip;
        this.fireSprite;
        this.firing = false;
        this.fireFrame = null;
        this.fireSpeed = -13;

        //sounds
        this.shoot = new Audio("sounds/shoot.wav");
        this.invaderKilled = new Audio("sounds/invaderkilled.wav");
        this.fastInvader1 = new Audio("sounds/fastinvader1.wav");
        this.fastInvader2 = new Audio("sounds/fastinvader2.wav");
        this.fastInvader3 = new Audio("sounds/fastinvader3.wav");
        this.fastInvader4 = new Audio("sounds/fastinvader4.wav");

        //shields
        this.shields = [];

        this.createInvaders();
        this.createBattleShip();
        this.createShields();
        this.startGame();
    }

    GameManager.prototype = {
        getElement: function () {
            return this.element;
        },

        createShields: function () {
            var shield;
            var body = document.body;
            var nX = 106;
            var xDist = 106 + 54;
            for (var i = 0; i < 4; i++) {
                shield = new Shield();
                body.appendChild(shield.getElement());
                shield.position({ x: nX, y: 650 });
                this.shields.push(shield);
                nX += xDist;
            }
        },

        createBattleShip: function () {
            var body = document.body;
            this.battleShip = new BattleShip(this.fire.bind(this), 0, this.boardWidth);
            this.fireSprite = new Sprite("bullet", 1, 5);
            body.appendChild(this.battleShip.getElement());
            body.appendChild(this.fireSprite.getElement());
            this.fireSprite.position({
                x: -1000,
                y: -1000
            });
            this.battleShip.position({
                x: 1000 / 2 - 50 / 2,
                y: 800 - 50
            });

        },

        createInvaders: function () {
            var invader;
            var invaders = this.invaders;
            var alien;
            ///var invadersContainerElement = this.invadersContainer.getElement();
            var body = document.body;

            //body.appendChild(invadersContainerElement);
            for (var i = 0; i < this.alienRows; i++) {
                invaders[i] = [];
                this.invadersModel[i] = [];
                for (var j = 0; j < this.alienColumns; j++) {
                    alien = AlienFactory.getAlien(i);
                    invader = new MultiStateSprite(alien.class, alien.width, alien.height);
                    invader.position({ x: 1 + j * this.distanceX, y: i * this.distanceY });
                    invaders[i][j] = invader;
                    this.invadersModel[i][j] = 1;
                    body.appendChild(invader.getElement());
                }
            }
            //this.determineAlienContainerDimensions();
        },

        fire: function () {
            //console.log("---------------->", this.firing);
            if (!this.firing) {
                this.initiateFire();
                //console.log("setting fire to true");
                this.firing = true;
                this.shoot.play();
            }
        },

        initiateFire: function () {
            //console.count()
            //console.log("initiate fire");
            this.fireSprite.position({
                x: this.battleShip.getPosition().x + 19,
                y: 800 - 50
            });
            this.moveFire();
        },

        moveFire: function () {
            var fireY = this.fireSprite.getPosition().y;
            var hitInvader;
            var hitBrick;
            if (fireY > -10) {
                fireY += this.fireSpeed;
                this.fireSprite.position({
                    x: this.fireSprite.getPosition().x,
                    y: fireY 
                });
                this.fireFrame = requestAnimationFrame(() => {
                    this.moveFire();
                });
                hitInvader = this.testHitAlien();
                hitBrick = this.testHitShield();

                if (hitBrick) {
                    this.brickIsHit(hitBrick);
                }

                if (hitInvader) {
                    this.invaderDie(hitInvader);
                }

            } else {
                this.firing = false;
                cancelAnimationFrame(this.fireFrame);
                this.fireFrame = null;
                this.fireSprite.position({
                    x: -1000,
                    y: fireY
                });
            }
        },

        brickIsHit: function (hitObject) {
            var shield = hitObject.shield;
            var brick = hitObject.brick;
            //console.log("brick is hit");
            this.firing = false;
            brick.nextState();
            if (brick.getState() == 4) {
                shield.remove(brick);
            }
            cancelAnimationFrame(this.fireFrame);
            this.fireFrame = null;
            this.fireSprite.position({
                x: -1000,
                y: -1000
            });
        },

        testHitShield: function () {
            var bulletBBox = this.fireSprite.getBoundingBox();
            var shield;
            var shieldBBox;
            var shieldBrickBox;
            var bricksMatrix;
            var hitMatrix;
            for (var i = 0; i < this.shields.length; i++) {
                shield = this.shields[i];
                bricksMatrix = shield.getBricks();
                shieldBBox = shield.getBoundingBox();
                hitMatrix = shield.getHitMatrix();
                for (var k = 0; k < bricksMatrix.length; k++) {
                    for (var l = 0; l < bricksMatrix[k].length; l++) {
                        shieldBrickBox = Object.assign({}, bricksMatrix[k][l].getBoundingBox());
                        shieldBrickBox.x += shieldBBox.x;
                        shieldBrickBox.y += shieldBBox.y;
                        if (this.isHit(bulletBBox, shieldBrickBox) && hitMatrix[k][l]) {
                            return {
                                shield: shield,
                                brick: bricksMatrix[k][l]
                            };
                        }
                    }
                }
            }
            return null;
        },

        invaderDie: function (hitInvader) {
            var invaderBBox = hitInvader.getBoundingBox();
            var explosion = new LimitedLifeSpanSprite("explosion", 200, 39, 27);
            var explostionBBox = explosion.getBoundingBox();
            document.body.appendChild(explosion.getElement());
            explosion.position({
                x: invaderBBox.x - (explostionBBox.width - invaderBBox.width) / 2,
                y: invaderBBox.y
            });
            explosion.startDeath();
            
            hitInvader.position({
                x: -1000,
                y: -1000
            });
            this.invaderKilled.play();
            this.firing = false;
            cancelAnimationFrame(this.fireFrame);
            this.fireFrame = null;
            this.fireSprite.position({
                x: -1000,
                y: -1000
            });

        },

        isHit: function (box1, box2) {
            if (!(box1.x + box1.width < box2.x ||
                box1.x > box2.x + box2.width ||
                box1.y > box2.y + box2.height ||
                box1.y + box1.height < box2.y)) {
                return true;
            }
            return false;
        },

        testHitAlien: function () {
            var alienBBox;
            var bulletBBox = this.fireSprite.getBoundingBox();
            for (var i = 0; i < this.alienRows; i++) {
                for (var j = 0; j < this.alienColumns; j++) {
                    alienBBox = this.invaders[i][j].getBoundingBox();
                    if (this.isHit(bulletBBox, alienBBox)) {
                        this.invadersModel[i][j] = 0;
                        return this.invaders[i][j];
                    }
                }
            }
            return null;
        },

        startGame: function () {
            clearInterval(this.interval);
            this.interval = setInterval(this.moveAliens.bind(this), this.stepTime);
            this.fastInvader1.addEventListener("ended", () => {
                //console.log("ended");
                this.fastInvader1.play();
            });
        },



        moveAliens: function () {
            this.currentStep += this.direction;
            var invaders = this.invaders;
            var invader;
            //var invadersContainer = this.invadersContainer; 
            //var invadersContainerBBox = invadersContainer.getBoundingBox();
            if (this.exitRight()) {
                //console.log("exist Right");
                this.currentStep -= 2;
                this.direction *= -1;
                this.difficulty++;
                //debugger;
            } else if (this.exitLeft()) {
                //console.log("exist Left");
                this.currentStep += 2;
                this.direction *= -1;
                this.difficulty++;
                if (this.stepTime > 100) {
                    this.stepTime -= 50;
                    this.startGame();
                }
               // debugger;
            }

            for (var i = 0; i < this.alienRows; i++) {
                for (var j = 0; j < this.alienColumns; j++) {
                    invader = invaders[i][j];
                    if (this.invadersModel[i][j]) {
                        invader.position({
                            x: (j * this.distanceX) + this.currentStep * this.stepSize,
                            y: i * this.distanceY + this.difficulty * this.offsetY
                        });
                    }
                    invader.nextState();
                }
            }

        },

        exitRight: function () {
            var invaders = this.invaders;
            var invader;
            for (var i = 0; i < this.alienRows; i++) {
                for (var j = 0; j < this.alienColumns; j++) {
                    invader = invaders[i][j];
                    if (invader.getBoundingBox().x + invader.getBoundingBox().width >= this.boardWidth && this.invadersModel[i][j]) {
                        return true;
                    }
                }
            }
            return false;
        },

        exitLeft: function () {
            var invaders = this.invaders;
            var invader;
            for (var i = 0; i < this.alienRows; i++) {
                for (var j = 0; j < this.alienColumns; j++) {
                    invader = invaders[i][j];
                    if (invader.getBoundingBox().x <= 0 && this.invadersModel[i][j]) {
                        return true;
                    }
                }
            }
            return false;
        }  
    }



    return GameManager;
})();