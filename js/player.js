"use strict";

///////////////////////////////////////////////////////////
// Alumnes: Adrián García Domínguez, Sergi Triadó
///////////////////////////////////////////////////////////

let estrelles_id = 1;
let destructor;
let interEstrella;
let tecles = {
    0x27: false,
    68: false,
    0x25: false,
    65: false,
    38: false,
    87: false,
    83: false,
    40: false
};

class Destructor {
    constructor() {
        // Inicialitzar valors
        this.xPos = 320; // Posició horitzontal de la nau
        this.yPos = 460; // Posició vertical de la nau

        // Moure la nau a la posició inicial
        this.nau = document.getElementById("nau");
        this.nau.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");
    }

    update() {
        this.nau.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ')');
    }
}

class Estrella {
    constructor() {
        // Inicialitzar valors
        
        this.xPos = 5 + Math.floor(Math.random() * (WIDTH)); // Posició horitzontal de l'estrella
        this.yPos = 5 + Math.floor(Math.random() * (HEIGHT)); // Posició vertical de l'estrella

        // Creem la el path de l'estrela i la coloquem
        this.estrella = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.estrella.setAttributeNS(null, "id", "e" + estrelles_id++);
        this.estrella.setAttributeNS(null, "d", "M115.5 104C116.5 102 118.5 102 119.5 104L124.5 113.5 135.5 115.5C137.5 116 138 117.5 136.5 119L129 127 130.5 139C130.5 140.5 130 141 128.5 140.5L117.5 135 106.5 140.5C105.5 141 104.5 140.5 104.5 139L106 127 98.5 119C97 117.5 97 116 99.5 115.5L110.5 113.5Z");
        this.estrella.setAttributeNS(null, "stroke", "#000");
        this.estrella.setAttributeNS(null, "stroke-width", 3);
        this.estrella.setAttributeNS(null, "stroke-linecap", "round");
        this.estrella.setAttributeNS(null, "fill", "#ff0");
        this.estrella.setAttributeNS(null, "stroke-linejoin", "round");
        document.getElementById('joc').appendChild(this.estrella);
        this.estrella.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");

    }
}

function init() {
    // Crear la nau i l'exèrcit dels aliens
    destructor = new Destructor();
    interEstrella = setInterval(() => {
        new Estrella
    }, 5000);

    $(document).keydown(moviment).keyup(tecla).click();

}

function detectarEstrella(){
    for(var x = 1; x < estrelles_id; x++){
        try {
            if(intersectRect(document.getElementById('e'+ '' + x),destructor.nau)){
                
                document.getElementById('e'+ '' + x).remove();
            }
            
        } catch (error) {
            
        }
    }
}

function intersectRect(r1, r2) {
	var r1 = r1.getBoundingClientRect();    //BOUNDING BOX OF THE FIRST OBJECT
	var r2 = r2.getBoundingClientRect();    //BOUNDING BOX OF THE SECOND OBJECT

	//CHECK IF THE TWO BOUNDING BOXES OVERLAP
	return !(r2.left > r1.right ||
		r2.right < r1.left ||
		r2.top > r1.bottom ||
		r2.bottom < r1.top);
}


function moviment(e) {

    var moveVal = 5;
    var code = e.keyCode;
    switch (code) {
        case (0x27):
        case (68):
            tecles[code] = true;
            if (tecles[65] == false && tecles[0x25] == false) {

                if (movimentDiagonal(moveVal)) {
                    if (destructor.xPos != WIDTH - 20) {
                        destructor.xPos += moveVal;
                        destructor.update();
                    }
                }
            }
            break;
        case (0x25):
        case (65):
            tecles[code] = true;
            if (movimentDiagonal(moveVal)) {
                if (tecles[68] == false && tecles[0x27] == false) {
                    if (destructor.xPos != 20) {
                        destructor.xPos -= moveVal;
                        destructor.nau.setAttribute('transform', 'translate(' + destructor.xPos + ' ' + destructor.yPos + ')');
                    }
                }
            }
            break;
        case (87):
        case (38):
            tecles[code] = true;
            if (movimentDiagonal(moveVal)) {
                if (tecles[83] == false && tecles[40] == false) {
                    if (destructor.yPos != 0) {
                        destructor.yPos -= moveVal;
                        destructor.nau.setAttribute('transform', 'translate(' + destructor.xPos + ' ' + destructor.yPos + ')');
                    }
                }
            }

            break;
        case (83):
        case (40):
            tecles[code] = true;
            if (movimentDiagonal(moveVal)) {
                if (tecles[87] == false && tecles[38] == false) {
                    if (destructor.yPos != HEIGHT) {
                        destructor.yPos += moveVal;
                        destructor.nau.setAttribute('transform', 'translate(' + destructor.xPos + ' ' + destructor.yPos + ')');
                    }
                }
            }
            break;
        default:
            break;
    }
    detectarEstrella();
    socket.send(JSON.stringify({x:destructor.xPos,y:destructor.yPos}));
}


function movimentDiagonal(moveVal) {
    //Moure arriba i dreta
    if ((tecles[87] || tecles[38]) && (tecles[68] || tecles[0x27])) {
        if (destructor.xPos != WIDTH - 20 && destructor.yPos != 0) {
            destructor.xPos += moveVal;
            destructor.yPos -= moveVal;
            destructor.update();
            return false;
        }

    }
    //moure avall i dreta
    else if ((tecles[83] || tecles[40]) && (tecles[0x28] || tecles[68])) {
        if (destructor.xPos != WIDTH - 20 && destructor.yPos != HEIGHT) {
            destructor.xPos += moveVal;
            destructor.yPos += moveVal;
            destructor.update();
            $(destructor.nau)
            return false;
        }
    }
    //moure arriba i esquerra
    else if ((tecles[87] || tecles[38]) && (tecles[0x25] || tecles[65])) {
        if (destructor.xPos != 20 && destructor.yPos != 0) {
            destructor.xPos -= moveVal;
            destructor.yPos -= moveVal;
            destructor.update();
            return false;
        }
    }
    //moure avall i esquerra
    else if ((tecles[83] || tecles[40]) && (tecles[0x25] || tecles[65])) {
        if (destructor.xPos != 20 && destructor.yPos != HEIGHT) {
            destructor.xPos -= moveVal;
            destructor.yPos += moveVal;
            destructor.update();
            return false;
        }
    }
    return true;
}

function tecla(e) {
    if (e.keyCode in tecles) tecles[e.keyCode] = false;

}


$(function() {
    const socket = new WebSocket('ws://localhost:8080');
    console.log(socket);

    socket.onopen = function(event) {
        console.log('Connection opened');
        socket.send('hola');
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

init();