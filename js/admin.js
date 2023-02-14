"use strict";

document.getElementById("administrar").addEventListener("click", administrar, false);
document.getElementById("aturar").addEventListener("click", aturar, false);
let intervalEstrella;

function administrar(){
    WIDTH = document.getElementById("amplada").value;
    HEIGHT = document.getElementById("alcada").value;
    let joc = document.getElementById("joc");

    joc.setAttribute("width", WIDTH);
    joc.setAttribute("height", HEIGHT);
    joc.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT);

    var camp = document.getElementById("camp").style;
    camp.width = WIDTH + "px";
    camp.height = HEIGHT + "px";

}

function aturar(){

    clearInterval(intervalEstrella);
}

//Aquesta funció és trucarà al començar la partida
function estrella() { 
    intervalEstrella = setInterval(()=> {socket.send('estrella')},5000);
 }

$(function() {
    const socket = new WebSocket('ws://localhost:8080');
    console.log(socket);

    socket.onopen = function(event) {
        console.log('Connection opened');
        socket.send('admin');
    };

    socket.onmessage = function(event) {
        console.log('Message received: ' + event.data);
    };

    socket.onerror = function(event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function(event) {
        console.log('Connection closed');
    };
});