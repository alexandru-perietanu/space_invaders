let BattleShip = (function () {

    function BattleShip(fireCallBack, limitLeft, limitRight) {
        Sprite.call(this, "battleShip", 39, 24);
        this.keyDownListener;
        this.keyUpListener;
        this.addListeners();
        this.frameReference;
        this.fireFrameReference;
        this.moveSpeed = 5;
        this.moveDirection = 1;
        this.leftIsDown = false;
        this.rightIsDown = false;
        this.spaceIsDown = false;
        this.fireCallBack = fireCallBack;
        this.limitLeft = limitLeft;
        this.limitRight = limitRight;

        this.animateMove();
        this.requestFire();
    }

    BattleShip.prototype = Object.create(Sprite.prototype);

    Object.assign(BattleShip.prototype, {
        constructor: BattleShip,

        addListeners: function () {
            var element = this.getElement();
            this.keyDownListener = this.keyDown.bind(this);
            this.keyUpListener = this.keyUp.bind(this);
            window.addEventListener("keydown", this.keyDownListener);
            window.addEventListener("keyup", this.keyUpListener);
        },

        keyDown: function (e) {
            //console.log("key down");
            switch (e.code) {
                case "ArrowLeft":
                    this.leftIsDown = true;
                    this.moveDirection = -1;
                    break;
                case "ArrowRight":
                    this.rightIsDown = true;
                    this.moveDirection = 1;
                    break;
                case "Space":
                    this.spaceIsDown = true;
                    //this.fireCallBack();
                    break;
            }

            // de specificat cat de greu merge pe key down default
            // if (this.leftIsDown || this.rightIsDown) {
            //     this.animateMove();
            // }
            // if (this.spaceIsDown) {
            //     this.requestFire();
            // }
        },

        keyUp: function (e) {
            switch (e.code) {
                case "ArrowLeft":
                    this.leftIsDown = false;
                    //cancelAnimationFrame(this.frameReference);
                    //this.frameReference = null;
                    break;
                case "ArrowRight":
                    this.rightIsDown = false;
                    //cancelAnimationFrame(this.frameReference);
                    //this.frameReference = null;
                    break;
                case "Space":
                    this.spaceIsDown = false;
                    //cancelAnimationFrame(this.fireFrameReference);
                    //this.fireFrameReference = null;
                    break;
            }

        },

        requestFire: function () {
            this.fireFrameReference = requestAnimationFrame(() => {
                if (this.spaceIsDown) {
                    this.fireCallBack();
                }
                this.requestFire();
            });
        },

        animateMove: function () {
            var x = this.x;
            this.frameReference = requestAnimationFrame(() => {
                x += this.moveSpeed * this.moveDirection;
                if (this.leftIsDown || this.rightIsDown) {
                    this.move(x);
                }
                this.animateMove();
            });
        },

        move: function (newX) {
            if (newX <= this.limitLeft) {
                newX = this.limitLeft;
            }
            if (newX + this.getBoundingBox().width >= this.limitRight) {
                newX = this.limitRight - this.getBoundingBox().width;
            }
            this.position({ x: newX })

        }
    });

    return BattleShip;
})();