// var a = 5;
// //let a = 6;

// function x() {
//     var a = 10;
//     this.a = 12;
//     //var window = "14";
//     console.log(a);
//     console.log(this.a);
//     console.log(window.a)
// }
// x();


document.addEventListener("DOMContentLoaded", function(event) {
    var body = document.body;
    var gameManager = new GameManager();

    body.appendChild(gameManager.getElement());
    
});