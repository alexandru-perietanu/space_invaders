let Sprite = (function() {
    function Sprite(className, width, height) {
        this.element = document.createElement("div");
        this.element.className = className;
        this.x = 0;
        this.y = 0;
        this.width = width || 50;
        this.height = height || 10;
    }

    Sprite.prototype = {
        getElement: function() {
            return this.element;
        }, 

        position: function(positionObject) {
            if (positionObject.x == undefined) {
                positionObject.x = this.x;
            }
            if (positionObject.y == undefined) {
                positionObject.y = this.y;
            }
            this.x = positionObject.x;
            this.y = positionObject.y;
            this.element.style.left = `${positionObject.x}px`;
            this.element.style.top = `${positionObject.y}px`;
        },

        getBoundingBox: function() {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            }
        },

        getPosition: function() {
            return {
                x: this.x,
                y: this.y
            }
        }
    }

    return Sprite;
})();