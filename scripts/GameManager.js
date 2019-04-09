let GameManager = (function () {
    function GameManager() {
        this.invaders = [];
        this.invadersModel = [];
        this.boardWidth = 750;
        this.boardHeight = 800;
        this.element = document.createElement("div");
        this.element.className = "board";

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
        this.lives = 3;

        //sounds
        this.shoot = new Audio("sounds/shoot.wav");
        this.invaderKilled = new Audio("sounds/invaderkilled.wav");
        this.fastInvader1 = new Audio("sounds/fastinvader1.wav");
        this.fastInvader2 = new Audio("sounds/fastinvader2.wav");
        this.fastInvader3 = new Audio("sounds/fastinvader3.wav");
        this.fastInvader4 = new Audio("sounds/fastinvader4.wav");

        //shields
        this.shields = [];


        //alien bullet variables
        this.bulletsPool = [];
        this.activeBullets = [];
        this.poolSize = 20;
        this.alienRequestFireTimerReference;
        this.alienRequestFireTime = 500;
        this.moveBulletsReference;
        this.alienBulletSpeed = 5;
        this.moveAlienFireCalls = 0;

        this.createInvaders();
        this.createBattleShip();
        this.createShields();
        this.createBulletPool();
        this.startGame();
    }

    GameManager.prototype = {
        getElement: function () {
            return this.element;
        },

        createBulletPool: function () {
            var bullet;
            for (var i = 0; i < this.poolSize; i++) {
                bullet = new MultiStateSprite(["alienBullet1", "alienBullet2"], 9, 27);
                this.bulletsPool.push(bullet);
                document.body.appendChild(bullet.getElement());
                bullet.position({ x: -100, y: -100 });
            }
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
            this.battleShip = new BattleShip(this.fire.bind(this), this.battleShipDie.bind(this), 0, this.boardWidth);
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
            var body = document.body;

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
        },

        fire: function () {
            if (!this.firing) {
                this.initiateFire();
                this.firing = true;
                this.shoot.play();
            }
        },

        initiateFire: function () {
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
                hitBrick = this.testHitShield(this.fireSprite);

                if (hitBrick) {
                    this.brickIsHit(hitBrick);
                    this.cancelBattleShipFire();
                }

                if (hitInvader) {
                    this.invaderDie(hitInvader);
                    this.cancelBattleShipFire();
                }

            } else {
                this.cancelBattleShipFire();
            }
        },

        brickIsHit: function (hitObject) {
            var shield = hitObject.shield;
            var brick = hitObject.brick;

            brick.nextState();
            if (brick.getState() == 4) {
                shield.remove(brick);
            }
        },

        cancelBattleShipFire: function () {
            this.firing = false;
            cancelAnimationFrame(this.fireFrame);
            this.fireFrame = null;
            this.fireSprite.position({
                x: -1000,
                y: -1000
            });
        },

        testHitShield: function (fireSprite) {
            var bulletBBox = fireSprite.getBoundingBox();
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
            clearInterval(this.alienRequestFireTimerReference);
            cancelAnimationFrame(this.moveBulletsReference);
            this.interval = setInterval(this.moveAliens.bind(this), this.stepTime);
            this.alienRequestFireTimerReference = setInterval(this.alienRequestFire.bind(this), this.alienRequestFireTime);
            this.moveAlienFire();
            // this.fastInvader1.addEventListener("ended", () => {
            //     //console.log("ended");
            //     this.fastInvader1.play();
            // });
        },

        moveAlienFire: function () {
            var bulletBBox;
            var hitBrick;
            var shipIsHit = false;
            this.moveAlienFireCalls++;
            for (var i = 0; i < this.activeBullets.length; i++) {
                bulletBBox = this.activeBullets[i].getBoundingBox();
                this.activeBullets[i].position({
                    y: bulletBBox.y + this.alienBulletSpeed
                });
                if (this.moveAlienFireCalls % 4 == 0) {
                    this.activeBullets[i].nextState();
                    this.moveAlienFireCalls = 0;
                }
                

                hitBrick = this.testHitShield(this.activeBullets[i]);
                shipIsHit = this.testHitShip(this.activeBullets[i]);

                if (shipIsHit) {
                    this.battleShip.die();
                    this.removeAlienBullet(i);
                    i--;
                }

                if (hitBrick) {
                    this.brickIsHit(hitBrick);
                    this.removeAlienBullet(i);
                    i--;
                }

                if (bulletBBox.y + bulletBBox.height > this.boardHeight) {
                    this.removeAlienBullet(i);
                    i--;
                }
            }
            this.moveBulletsReference = requestAnimationFrame(this.moveAlienFire.bind(this));
        },

        battleShipDie: function() {
            this.lives--;
            if (this.lives == 0) {
                this.resetGame();
                return;
            }
            this.battleShip.revive();
        },
        
        resetGame: function() {
            this.lives = 3;
            this.stepTime = 500;
            this.battleShip.revive();
            this.currentStep = 0;
            this.direction = 1;
            this.clearActiveBullets();
            this.resetShields();
            this.resetAliens();
            this.startGame();
        },

        clearActiveBullets: function() {
            while (this.activeBullets.length) {
                this.activeBullets[this.activeBullets.length - 1].position({
                    x: -1000,
                    y: -1000
                });
                this.bulletsPool.push(this.activeBullets.pop());
            }
        },

        resetShields: function() {
            var shield;
            for (var i = 0; i < this.shields.length; i++) {
                shield = this.shields[i];
                shield.reset();            
            }
        },

        resetAliens: function() {
            this.difficulty = 0;
            var invader;

            for (var i = 0; i < this.alienRows; i++) {
                for (var j = 0; j < this.alienColumns; j++) {
                    invader = this.invaders[i][j];
                    invader.position({ x: 1 + j * this.distanceX, y: i * this.distanceY });
                    this.invadersModel[i][j] = 1;
                }
            }
        },

        testHitShip: function(bullet) {
            var battleShipBBox = this.battleShip.getBoundingBox();
            var bulletBBox = bullet.getBoundingBox();
            return this.isHit(battleShipBBox, bulletBBox);
        },

        removeAlienBullet: function (i) {
            let bullet = this.activeBullets.splice(i, 1)[0];
            this.returnBulletToPool(bullet);
            bullet.position({
                x: -100,
                y: - 100
            });
        },

        alienRequestFire: function () {
            var column = Math.round(Math.random() * (this.alienColumns - 1));
            var line = this.alienRows - 1;
            var invaderFound = false;
            var invader;
            var bullet;
            var invaderBBox;

            while (!invaderFound) {
                column = Math.round(Math.random() * (this.alienColumns - 1));
                for (var i = line; i >= 0; i--) {
                    if (this.invadersModel[i][column] == 1) {
                        invaderFound = true;
                        invader = this.invaders[i][column];
                        break;
                    }
                }
            }

            invaderBBox = invader.getBoundingBox();
            bullet = this.getBulletFromPool();
            bullet.position({
                x: invaderBBox.x + invaderBBox.width / 2 - bullet.getBoundingBox().width / 2,
                y: invaderBBox.y + invaderBBox.height
            });
            this.activeBullets.push(bullet);
        },

        getBulletFromPool: function () {
            return this.bulletsPool.pop();
        },

        returnBulletToPool: function (bullet) {
            this.bulletsPool.push(bullet);
        },


        moveAliens: function () {
            this.currentStep += this.direction;
            var invaders = this.invaders;
            var invader;
            if (this.exitRight()) {
                this.currentStep -= 2;
                this.direction *= -1;
                this.difficulty++;
            } else if (this.exitLeft()) {
                this.currentStep += 2;
                this.direction *= -1;
                this.difficulty++;
                if (this.stepTime > 100) {
                    this.stepTime -= 50;
                    this.startGame();
                }
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

            if (this.exitBottom()) {
                this.resetGame();
            }

        },

        exitBottom: function() {
            var invaders = this.invaders;
            var invader;
            for (var i = 0; i < this.alienRows; i++) {
                for (var j = 0; j < this.alienColumns; j++) {
                    invader = invaders[i][j];
                    if (invader.getBoundingBox().y + invader.getBoundingBox().height >= this.battleShip.getBoundingBox().y && this.invadersModel[i][j]) {
                        return true;
                    }
                }
            }
            return false;
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