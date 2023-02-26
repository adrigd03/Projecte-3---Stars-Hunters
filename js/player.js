"use strict";


///////////////////////////////////////////////////////////
// Alumnes: Adrián García Domínguez, Sergi Triadó
///////////////////////////////////////////////////////////

const WIDTH = 640;
const HEIGHT = 480
let socket;
let estrelles = [];
let destructor;
let interval;
let intervalCooldown;
let intervalTurbo;

let tecles = {
    right: false,
    left: false,
    up: false,
    down: false
};

$(document).keydown(detectarKeyDown).keyup(detectarKeyUp).click();


class Destructor {

    constructor() {
        // Inicialitzar valors
        this.xPos = 320; // Posició horitzontal de la nau
        this.yPos = 400; // Posició vertical de la nau
        this.x = 0;
        this.y = 0;
        this.speed = 4;
        this.turbo = true;
        // Moure la nau a la posició inicial
        this.nau = document.getElementById("nau");
        this.nau.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");

    }
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
        document.getElementById('joc').appendChild(this.estrella);
        this.estrella.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");
        estrelles.push(this.estrella);
    }
}

// Crear la nau 
destructor = new Destructor();

$(function () {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function (event) {
        console.log('Connection opened');
        socket.send('hola');
    };

    socket.onmessage = function (e) {
        let m = JSON.parse(e.data);
        console.log(m)
        if (m.accio == 'estrella') {
            new Estrella(m.x, m.y);
        } else if (m.accio == 'borrarEstrella') {
            estrelles[m.index].remove();
            estrelles.splice(m.index, 1)

        } else if (m.accio == 'estrellaCaducada') {
            estrelles[0].remove();
            estrelles.splice(0, 1);
        }
    };

    socket.onerror = function (event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function (event) {
        console.log('Connection closed');
    };
});


function detectarEstrella() {
    estrelles.forEach((estrella, index) => {
        try {
            if (intersectRect(estrella, destructor.nau)) {
                estrella.remove();
                socket.send(JSON.stringify({
                    accio: 'borrarEstrella',
                    index: index
                }));
                estrelles.splice(index, 1);
            }

        } catch (error) {

        }
    })

}

function intersectRect(r1, r2) {
    var r1 = r1.getBoundingClientRect(); //BOUNDING BOX OF THE FIRST OBJECT
    var r2 = r2.getBoundingClientRect(); //BOUNDING BOX OF THE SECOND OBJECT

    //CHECK IF THE TWO BOUNDING BOXES OVERLAP
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}


function detectarKeyDown(e) {

    if (e.shiftKey) {
        if (destructor.turbo) {
            turbo();
        }

    }

    switch (e.key.toLowerCase()) {


        case ('arrowright'):
        case ('d'):
            tecles.dreta = true;
            break;
        case ('arrowleft'):
        case ('a'):
            tecles.esquerra = true;
            break;
        case ('w'):
        case ('arrowup'):
            tecles.up = true;
            break;
        case ('arrowdown'):
        case ('s'):
            tecles.down = true;
            break;
        default:
            return;
    }


    calcMoviment();

}

function calcMoviment() {
    let x = 0;
    let y = 0;
    let angle = 0;
    let speed = destructor.speed;
    if (tecles.dreta) {
        x += speed;
        angle = 90;
    }
    if (tecles.esquerra) {
        x -= speed;
        angle = -90;
    }
    if (tecles.up) {
        y -= speed;
        angle = 0;
    }
    if (tecles.down) {
        y += speed;
        angle = 180;
    }
    if (x != 0 && y != 0) {

        if (tecles.dreta && tecles.up) {
            x = Math.sqrt(speed * speed / 2);
            y = -(Math.sqrt(speed * speed / 2));
            angle = 45;
        }

        if (tecles.dreta && tecles.down) {
            x = Math.sqrt(speed * speed / 2);
            y = Math.sqrt(speed * speed / 2);
            angle = 135;
        }

        if (tecles.esquerra && tecles.up) {
            x = -(Math.sqrt(speed * speed / 2));
            y = -(Math.sqrt(speed * speed / 2));

            angle = -45;
        }

        if (tecles.esquerra && tecles.down) {
            x = -(Math.sqrt(speed * speed / 2));
            y = Math.sqrt(speed * speed / 2);
            angle = -135;
        }
    }

    if ((x == 0 && y == 0) || (x == destructor.x && y == destructor.y)) return;

    clearInterval(interval);

    interval = setInterval(() => {
        moureNau(angle, x, y)
    }, 20);



}

function moureNau(angle, x, y) {
    if (y < 0)
        if (!tecles.up) return;
    if (y > 0)
        if (!tecles.down) return;
    if (x > 0)
        if (!tecles.dreta) return;
    if (x < 0)
        if (!tecles.esquerra) return;


    if (destructor.xPos + x < WIDTH - 20 && destructor.xPos + x > 20) destructor.xPos += x;

    if (destructor.yPos + y < HEIGHT - 20 && destructor.yPos + y > 20) destructor.yPos += y;

    destructor.x = x;
    destructor.y = y;

    // Apliquem la rotació al centre de la nau
    var rotateTransform = "rotate(" + angle + " " + 19 + " " + 19 + ")";

    $(destructor.nau).attr('transform', ` translate(${destructor.xPos} ${destructor.yPos}) ${rotateTransform}`);
    detectarEstrella();

    socket.send(JSON.stringify({
        accio: 'movimentNau',
        x: destructor.xPos,
        y: destructor.yPos
    }));

}

function detectarKeyUp(e) {

    switch (e.key.toLowerCase()) {
        case ('arrowright'):
        case ('d'):
            tecles.dreta = false;
            calcMoviment();
            break;
        case ('arrowleft'):
        case ('a'):
            tecles.esquerra = false;
            calcMoviment();
            break;
        case ('w'):
        case ('arrowup'):
            tecles.up = false;
            calcMoviment();
            break;
        case ('arrowdown'):
        case ('s'):
            tecles.down = false;
            calcMoviment();
            break;
        default:
            return;
    }
}

function countdownTurboActivat() {
    var countdown = 5;
    $('#mostrarTurbo').html('TURBOO ACTIVAAAT')
    $('#countdownTurbo').html(countdown--);

    intervalTurbo = setInterval(() => {
        $('#countdownTurbo').html(countdown--);
    }, 1000)
}

function countdownTurboCooldown() {
    var countdown = 10;

    $('#countdownTurbo').html(countdown--);

    $('#mostrarTurbo').html("El turbo s'està recargant");

    intervalCooldown = setInterval(() => {
        $('#countdownTurbo').html(countdown--);
    }, 1000)

}

function turbo() {
    destructor.turbo = false;
    destructor.speed = 6;
    countdownTurboActivat();

    setTimeout(() => {
        destructor.speed = 4;
        clearInterval(intervalTurbo);
        countdownTurboCooldown();
    }, 5000);

    setTimeout(() => {
        destructor.turbo = true;
        clearInterval(intervalCooldown);
        $('#mostrarTurbo').html("El turbo està preparat");
        $('#countdownTurbo').html("");
    }, 15000);

    calcMoviment();
}