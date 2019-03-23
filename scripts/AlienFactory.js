let AlienFactory = (function () {
    var aliens = {
        smallAlien: ["smallAlien1", "smallAlien2"],
        mediumAlien: ["mediumAlien1", "mediumAlien2"],
        bigAlien: ["bigAlien1", "bigAlien2"]
    }

    function AlienFactory() {

    }

    AlienFactory.prototype = {
        getAlien: function (type) {
            switch (type) {
                case 0:
                    return {
                        class: aliens.smallAlien,
                        width: 24,
                        height: 24
                    }
                case 1:
                case 2:
                    return {
                        class: aliens.mediumAlien,
                        width: 33,
                        height: 24
                    }
                case 3:
                case 4:
                    return {
                        class: aliens.bigAlien,
                        width: 36,
                        height: 24
                    }
            }
        }
    }

    return new AlienFactory();
})();