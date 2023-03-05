"use strict";

document.getElementById("administrar").addEventListener("click", administrar, false);
$('#engegar').on('click', engegar_aturar);

let intervalEstrella;
let socket;
let estrelles = [];

// funció que s'executa amb el botó administrar, agafa els valors dels inputs i els envia al servidor
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

// Funció que s'executa amb el botó de engegar/aturar
function engegar_aturar(){
    
    if ($('#engegar').html() == 'Engegar') {
        $('#engegar').html('Aturar');
        engegar();
    } else {
        $('#engegar').html('Engegar');
        aturar();
    }
}

// Funció per engegar la partida si no ha començat
function engegar() {
    
    intervalEstrella = setInterval(() => { socket.send('estrella') }, 5000);
    socket.send(JSON.stringify({
        accio: 'engegar'
    }));
    socket.send('estrella');
}

// Funció per aturar la partida si ja ha començat
function aturar() {
    clearInterval(intervalEstrella);
    estrelles.forEach((estrella) => {
        estrella.remove();
    });
    socket.send(JSON.stringify({
        accio: 'aturar'
    }));
}


class Estrella {
    constructor(x, y) {
        // Inicialitzar valors

        this.xPos = x; // Posició horitzontal de l'estrella
        this.yPos = y; // Posició vertical de l'estrella

        // Creem la el path de l'estrella i la coloquem
        this.estrella = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.estrella.setAttributeNS(null, "d", "M115.5 104C116.5 102 118.5 102 119.5 104L124.5 113.5 135.5 115.5C137.5 116 138 117.5 136.5 119L129 127 130.5 139C130.5 140.5 130 141 128.5 140.5L117.5 135 106.5 140.5C105.5 141 104.5 140.5 104.5 139L106 127 98.5 119C97 117.5 97 116 99.5 115.5L110.5 113.5Z");
        this.estrella.setAttributeNS(null, "stroke", "#000");
        this.estrella.setAttributeNS(null, "stroke-width", 3);
        this.estrella.setAttributeNS(null, "stroke-linecap", "round");
        this.estrella.setAttributeNS(null, "fill", "#ff0");
        this.estrella.setAttributeNS(null, "stroke-linejoin", "round");
        this.estrella.setAttributeNS(null, 'name', 'estrella');
        document.getElementById('joc').appendChild(this.estrella);
        this.estrella.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");
        estrelles.push(this.estrella);
    }
}

$(function() {
    // Ip que vam utilitzar a la presentació
    // socket = new WebSocket('ws://10.92.254.198:8180');
    socket = new WebSocket('ws://localhost:8180');
    console.log(socket);

    socket.onopen = function(event) {
        console.log('Connection opened');
        socket.send('admin');
    };

    socket.onmessage = function(event) {
        var m = JSON.parse(event.data);
        // Si rebem el missatge settings del servidor, canviem els valors que toquin
        if (m.accio == 'settings') {
            
            let joc = document.getElementById("joc");

            joc.setAttribute("width", m.width);
            joc.setAttribute("height", m.height);
            joc.setAttribute("viewBox", "0 0 " + m.width + " " + m.height);

            var camp = document.getElementById("camp").style;
            camp.width = m.width + "px";
            camp.height = m.height + "px";
        // Si és nauEnemiga, creem una nau enemiga
        } else if (m.accio == 'nauEnemiga') {
            document.getElementById('joc').innerHTML += `<image id="${m.id}" href="../assets/imatgesstarshunters/nau4.png" height="38" width="38" x="${m.coords.x}" y="${m.coords.y}" />`;
        } else if (m.accio == 'jugadorDesconnectat'){
            if(document.getElementById(m.jugador)){
                document.getElementById(m.jugador).remove();
            }
        // Si es nau moguda, la desplacem
        } else if (m.accio == 'nauMoguda'){
            document.getElementById(m.id).removeAttribute('x');
            document.getElementById(m.id).removeAttribute('y');
            // Apliquem la rotació al centre de la nau
            var rotateTransform = "rotate(" + m.angle + " " + 19 + " " + 19 + ")";
            $(`#${m.id}`).attr('transform', ` translate(${m.coords.x} ${m.coords.y}) ${rotateTransform}`);
        // Si és estrella, creem una estrella
        } else if (m.accio == 'estrella'){
            new Estrella(m.x, m.y);
        // Si es borrarEstrella, la borrem
        } else if (m.accio == 'borrarEstrella') {
            estrelles[m.index].remove();
            estrelles.splice(m.index, 1)
        // Si es estrellaCaducada la borrem també
        } else if (m.accio == 'estrellaCaducada') {
            estrelles[0].remove();
            estrelles.splice(0, 1);
        // Si és guanyador, generem el missatge, el mostrem per alert i aturem la partida
        } else if(m.accio == 'guanyador'){
            let missatge = missatgeGuanyador(m);
            alert(missatge);
            aturar();
        // Si és error, el mostrem
        } else if(m.accio == 'error'){
            alert(m.missatge);
            window.location.href = "../";
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

// Funció que genera el missatge guanyador
function missatgeGuanyador(m){
    let missatge = `El guanyador és: ${m.jugador}!!!`;
    m.puntuacions.forEach(element => {
        missatge += `\n${element.jugador} - ${element.puntuacio} estrelles!`; 
    });
    return missatge;
}