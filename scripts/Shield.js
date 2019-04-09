let Shield = (function () {
    function Shield(className, width, height) {
        this.className = "shield";
        this.width = 18 * 3;
        this.height = 12 * 4;
        Sprite.call(this, this.className, this.width, this.height);
        this.bricks = [["shieldFullBrickUpLeft", "shieldFullBrick", "shieldFullBrickUpRight"],
        ["shieldFullBrick", "shieldFullBrick", "shieldFullBrick"],
        ["shieldFullBrick", "shieldFullBrickBottomMiddle", "shieldFullBrick"],
        ["shieldFullBrick", "", "shieldFullBrick"]];
        this.brickSprites = undefined;
        this.hitMatrix = undefined;
        this.createShield();
    }

    Shield.prototype = Object.create(Sprite.prototype);
    Object.assign(Shield.prototype, {
        getBricks: function() {
            return this.brickSprites;
        },

        getHitMatrix: function() {
            return this.hitMatrix;
        },

        remove: function(brick) {
            for (var i = 0; i < this.brickSprites.length; i++) {
                for (var j = 0; j < this.brickSprites[i].length; j++) {
                    if (brick == this.brickSprites[i][j]) {
                        this.hitMatrix[i][j] = 0;
                    }
                }
            }
        },

        createShield: function () {
            this.brickSprites = [];
            this.hitMatrix = [];
            var brick;
            for (var i = 0; i < this.bricks.length; i++) {
                this.brickSprites[i] = [];
                this.hitMatrix[i] = [];
                for (var j = 0; j < this.bricks[i].length; j++) {
                    brick = new MultiStateSprite([this.bricks[i][j], 
                                               `${this.bricks[i][j]}Hit1`, 
                                               `${this.bricks[i][j]}Hit2`, 
                                               `${this.bricks[i][j]}Hit3`,
                                               "deadBrick"], 18, 12);
                                               
                    this.brickSprites[i][j] = brick;
                    this.hitMatrix[i][j] = 1;
                    this.getElement().appendChild(brick.getElement());
                    brick.position({x: j * 18, y: i * 12});
                }
            }
            this.hitMatrix[3][1] = 0;
        },

        reset: function() {
            var brick;
            for (var i = 0; i < this.bricks.length; i++) {
                for (var j = 0; j < this.bricks[i].length; j++) {
                    brick = this.brickSprites[i][j];
                    this.hitMatrix[i][j] = 1;
                    brick.firstState();
                }
            }
            this.hitMatrix[3][1] = 0;
        }

    });

    return Shield;
})();