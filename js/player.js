"use strict";

///////////////////////////////////////////////////////////
// Alumnes: Adrián García Domínguez, Sergi Triadó
///////////////////////////////////////////////////////////

const FILES = 5;		// Nombre de files de l'exèrcit dels aliens
const COLUMNES = 8;		// Nombre de columnes de l'exèrcit dels aliens
const ALIENS = FILES * COLUMNES;	// Nombre total d'aliens
let destructor;
let exercit;
let tecles = { 0x27: false, 68: false, 0x25: false, 65: false, 38:false, 87: false, 83:false,40:false };


class Destructor {
	constructor() {
		// Inicialitzar valors
		this.xPos = 320; // Posició horitzontal de la nau
		this.yPos = 460; // Posició vertical de la nau

		// Moure la nau a la posició inicial
		this.nau = document.getElementById("nau");
		this.nau.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");
	}

	update(){
		this.nau.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");
	}
}

class Exercit {
	constructor() {
		// Inicialitzar valors
		this.xPos = 90;	// Posició horitzontal de l'exèrcit d'aliens
		this.yPos = 40; // Posició vertical de l'exèrcit d'aliens
		this.nAliens = ALIENS;

		// Posicionar l'exèrcit dels aliens
		this.exercit = document.getElementById("aliens");
		this.exercit.setAttribute("transform", "translate(" + this.xPos + " " + this.yPos + ")");

		// Moure l'alien original fora de l'àrea de joc
		document.getElementById("alien").setAttribute("transform", "translate(-20 -15)");

		// Crear còpies de l'alien original
		for (let i = 0; i < FILES; i++) {
			for (let j = 0; j < COLUMNES; j++) {
				this.exercit.innerHTML += "<use id='a" + i + j + "' href='#alien' transform='translate(" + (j * 60 + 40) + " " + (i * 40 + 30) + ")'></use>";
			}
		}
	}
}

function init() {
	// Crear la nau i l'exèrcit dels aliens
	destructor = new Destructor();
	exercit = new Exercit();


	$(document).keydown(moviment).keyup(tecla).click();

}


function moviment(e) {

	var moveVal = 5;
	var code = e.keyCode;
	switch (code) {
		case (0x27):
		case (68):
            tecles[code] = true;
			if (tecles[65] == false && tecles[0x25] == false) {
                if(tecles[87] || tecles[38]){
                    if(destructor.xPos != WIDTH - 20 && destructor.yPos != HEIGHT){
                        destructor.xPos += moveVal;
                        destructor.yPos -= moveVal;
                        destructor.update();
                    }
                }else if (tecles[83] || tecles[40]) {
                    
                }                else{
                    if(destructor.xPos != WIDTH - 20){
                        destructor.xPos += moveVal;
                        destructor.update();
                    }
                }
			}
			break;
		case (0x25):
		case (65):
			tecles[code] = true;
			if (tecles[68] == false && tecles[0x27] == false) {
				if(destructor.xPos != 20){
					destructor.xPos -= moveVal;
					destructor.nau.setAttribute('transform', 'translate(' + destructor.xPos + ' ' + destructor.yPos + ')');
				}
			}
			break;
            case(87):
		    case(38):
                tecles[code] = true;
                if (tecles[83] == false && tecles[40] == false) {
                    if(destructor.yPos != 20){
                        destructor.yPos -= moveVal;
                        destructor.nau.setAttribute('transform', 'translate(' + destructor.xPos + ' ' + destructor.yPos + ')');
                    }
                }

            break;
            case(83):
		    case(40):
                tecles[code] = true;
                if (tecles[87] == false && tecles[38] == false) {
                    if(destructor.yPos != HEIGHT){
                        destructor.yPos += moveVal;
                        destructor.nau.setAttribute('transform', 'translate(' + destructor.xPos + ' ' + destructor.yPos + ')');
                    }
                }
                break;
		default:
			break;
	}
}

function tecla(e) {
	if (e.keyCode in tecles) tecles[e.keyCode] = false;

}

init();
