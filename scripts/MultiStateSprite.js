let MultiStateSprite = (function() {
    function MultiStateSprite(classNames, width, height) {
        Sprite.call(this, classNames[0], width, height);
        this.currentState = 0;
        this.classNames = classNames;
        this.lastState = classNames.length - 1;
    }

    MultiStateSprite.prototype = Object.create(Sprite.prototype);
    Object.assign(MultiStateSprite.prototype, {

        getState: function() {
            return this.currentState;
        },

        nextState: function() {
            this.currentState++;
            if (this.currentState > this.lastState) {
                this.currentState = 0;
            }
            this._setState(this.classNames[this.currentState]);
        },

        prevState: function() {
            this.currentState--;
            if (this.currentState < 0) {
                this.currentState = this.lastState;
            }
            this._setState(this.classNames[this.currentState]);
        }, 

        _setState: function(className) {
            this.getElement().className = className;
            this.className = className;
        }, 

        firstState: function() {
            this._setState(this.classNames[0]);
            this.currentState = 0;
        }
    });

    return MultiStateSprite;
})();