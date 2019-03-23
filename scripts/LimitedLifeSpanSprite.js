let LimitedLifeSpanSprite = (function() {
    function LimitedLifeSpanSprite(className, lifespan, width, height) {
        Sprite.call(this, className, width, height);
        this.lifespan = lifespan;
        this.className = className;
    }

    LimitedLifeSpanSprite.prototype = Object.create(Sprite.prototype);
    Object.assign(LimitedLifeSpanSprite.prototype, {
        startDeath: function() {
            setTimeout(() => {
                this.getElement().remove();
            }, this.lifespan);
        }
    });

    return LimitedLifeSpanSprite;
})();