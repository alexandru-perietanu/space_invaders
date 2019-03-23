// let MultiStateSprite = (function() {
//     function MultiAlienStateSprite(classNames) {
//         Sprite.super.call(this, classNames[0]);
//         this.currentState = 0;
//         this.classNames = classNames;
//         this.lastState = classNames.length - 1;
//     }

//     MultiStateSprite.prototype = Object.create(new Sprite.prototype);
//     Object.assign(MultiStateSprite.prototype, {
//         nextState: function() {
//             this.currentState++;
//             if (currentState > this.lastState) {
//                 this.currentState = 0;
//             }
//             this._setState(this.classNames[this.currentState]);
//         },

//         prevState: function() {
//             this.currentState--;
//             if (currentState < 0) {
//                 this.currentState = this.lastState;
//             }
//             this._setState(this.classNames[this.currentState]);
//         }, 

//         _setState: function(className) {
//             this.getElement().className = this.className;
//         }
//     });

//     return MultiStateSprite;
// })();