"use strict";

document.getElementById("administrar").addEventListener("click", administrar, false);
$('#estrellas').on('click',estrella);
$('#engegar').on('click', engegar_aturar);

let intervalEstrella;
let socket;

function administrar(){

    let WIDTH = document.getElementById("amplada").value;
    let HEIGHT = document.getElementById("alcada").value;
    let numEstrelles = document.getElementById("n_estrelles").value;

    socket.send(JSON.stringify({
        accio: 'settings',
        width: WIDTH,
        height: HEIGHT,
        n_estrelles: numEstrelles
    }));
}

function engegar_aturar(){
    clearInterval(intervalEstrella);

    if ($('#engegar').val() == 'Engegar') {
        $('#engegar').val('Aturar');
        socket.send(JSON.stringify({
            accio: 'engegar'
        }));
    } else {
        $('#engegar').val('Engegar');
        socket.send(JSON.stringify({
            accio: 'aturar'
        }));
    }
    //TODO reiniciar contador estrellas php
}

//Aquesta funció és trucarà al començar la partida
function estrella() { 
    intervalEstrella = setInterval(()=> {socket.send('estrella')},5000);

 }

$(function() {
    socket = new WebSocket('ws://localhost:8080');
    console.log(socket);

    socket.onopen = function(event) {
        console.log('Connection opened');
        socket.send('admin');
    };

    socket.onmessage = function(event) {
        var m = JSON.parse(event.data);
        if (m.accio == 'settings') {
            
            let joc = document.getElementById("joc");

            joc.setAttribute("width", m.width);
            joc.setAttribute("height", m.height);
            joc.setAttribute("viewBox", "0 0 " + m.width + " " + m.height);

            var camp = document.getElementById("camp").style;
            camp.width = m.width + "px";
            camp.height = m.height + "px";
        } else if (m.accio == 'nauEnemiga') {
            document.getElementById('joc').innerHTML += `<image id="${m.id}" href="../assets/imatgesstarshunters/nau4.png" height="38" width="38" x="${m.coords.x}" y="${m.coords.y}" />`;
        } else if (m.accio == 'jugadorDesconnectat'){
            document.getElementById(m.jugador).remove();
        } else if (m.accio == 'nauMoguda'){
            document.getElementById(m.id).removeAttribute('x');
            document.getElementById(m.id).removeAttribute('y');
            // Apliquem la rotació al centre de la nau
            var rotateTransform = "rotate(" + m.angle + " " + 19 + " " + 19 + ")";
            $(`#${m.id}`).attr('transform', ` translate(${m.coords.x} ${m.coords.y}) ${rotateTransform}`);
        }
        console.log('Message received: ' + event.data);
    };

    socket.onerror = function(event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function(event) {
        console.log('Connection closed');
    };
});