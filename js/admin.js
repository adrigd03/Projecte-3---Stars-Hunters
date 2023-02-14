"use strict";

document.getElementById("administrar").addEventListener("click", administrar, false);
document.getElementById("aturar").addEventListener("click", aturar, false);


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

}