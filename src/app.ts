// abstract library
import { DrawingCommon } from './common';
import * as THREE from 'three'

// A class for our application state and functionality
class Drawing extends DrawingCommon {

    constructor (canv: HTMLElement) {
        super (canv)
    }

    /*
	Set up the scene during class construction
	*/
	initializeScene(){
        const objectRoot = new THREE.Group();

        var geometry: THREE.BufferGeometry = new THREE.CylinderGeometry( 0, 1, 3, 10, 1 );
        var material = new THREE.MeshPhongMaterial( { color: 0x00ffff, flatShading: true } );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.set(1,0,0);
        objectRoot.add( mesh );

        geometry = new THREE.TorusGeometry( 1, 0.2, 30, 40 );
        material = new THREE.MeshPhongMaterial( { color: 0xffff00, flatShading: true } );
        mesh = new THREE.Mesh( geometry, material );

        mesh.position.set(-1,0,0);
        objectRoot.add( mesh );

        this.scene.add( objectRoot );
    }

	/*
	Update the scene during requestAnimationFrame callback before rendering
	*/
	updateScene(time: DOMHighResTimeStamp){}
}

// a global variable for our state.  We implement the drawing as a class, and 
// will have one instance
var myDrawing: Drawing;

// main function that we call below.
// This is done to keep things together and keep the variables created self contained.
// It is a common pattern on the web, since otherwise the variables below woudl be in 
// the global name space.  Not a huge deal here, of course.

function exec() {
    // find our container
    var div = document.getElementById("drawing");

    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // create a Drawing object
    myDrawing = new Drawing(div);
}

exec()