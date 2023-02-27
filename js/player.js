"use strict";


///////////////////////////////////////////////////////////
// Alumnes: Adrián García Domínguez, Sergi Triadó
///////////////////////////////////////////////////////////

let WIDTH = 640;
let HEIGHT = 480;
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

class Destructor {

    constructor() {
        // Inicialitzar valors
        this.xPos = Math.random() * (WIDTH - 5) + 5; // Posició horitzontal de la nau
        this.yPos = Math.random() * (HEIGHT - 5) + 5; // Posició vertical de la nau
        
        this.speed = 4;
        this.turbo = true;
        // Moure la nau a la posició inicial
        this.nau = $('#nau');
        this.nau.attr("transform", "translate(" + this.xPos + " " + this.yPos + ")");

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
        this.estrella.setAttributeNS(null, 'name', 'estrella');
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
        socket.send(JSON.stringify({
            accio: 'novaNau',
            coords: {
                x: destructor.xPos,
                y: destructor.yPos
            }
        }));
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
        } else if (m.accio == 'settings') {
            WIDTH = m.width;
            HEIGHT = m.height;

            let joc = document.getElementById("joc");

            joc.setAttribute("width", WIDTH);
            joc.setAttribute("height", HEIGHT);
            joc.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT);

            var camp = document.getElementById("areaJoc").style;
            camp.width = WIDTH + "px";
            camp.height = HEIGHT + "px";
        } else if(m.accio == 'engegar'){
            engegarJoc();
        } else if(m.accio == 'aturar') {
            aturarJoc();
        }
    };

    socket.onerror = function (event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function (event) {
        document.getElementById('nau').remove();
        alert("No et pots unir quan la partida ja ha començat!");
    };
});


function detectarEstrella() {
    estrelles.forEach((estrella, index) => {
        try {
            if (intersectRect(estrella, $('#nau'))) {
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
        moureNau(angle, x, y);
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
    $('#nau').attr('transform', ` translate(${destructor.xPos} ${destructor.yPos}) ${rotateTransform}`);
    detectarEstrella();

    socket.send(JSON.stringify({
        accio: 'movimentNau',
        coords: {
            x: destructor.xPos,
            y: destructor.yPos
        },
        angle: angle
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

function engegarJoc(){
    $(document).keydown(detectarKeyDown).keyup(detectarKeyUp);
}

function aturarJoc(){
    $(document).off('keydown');
    $(document).off('keyup');
    estrelles.forEach((estrella) => {
        estrella.remove();
    });
}