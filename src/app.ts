// abstract library
import { DrawingCommon } from './common';
import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

const pi = 3.1415926
const scale = 0.1
const materialArray = [
    //MeshStandardMaterial
    new THREE.MeshPhongMaterial({ color: 0xffffff}), 
    new THREE.MeshStandardMaterial({ color: 0x000000}),
    new THREE.MeshPhongMaterial({
        color: 0xffffff, 
        shininess: 75,
        reflectivity: 0.7,
        flatShading: true,
        wireframe: true
    }) //MeshStandardMaterial would be dark in this case bc both receiveShadow and castShadow set to true
    //https://stackoverflow.com/questions/45958268/lighting-not-working-properly-with-meshlambertmaterial-in-three-js 
]

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

        //*** Debug ****
        const gui = new GUI()

        //Ground
        const plane = new THREE.PlaneGeometry(200,200);
        const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide});
        plane.rotateX(-Math.PI * 0.5);
        plane.translate(0, -10 * scale, 0)
        const ground = new THREE.Mesh(plane, material)
        //objectRoot.add(ground)
        
        //Building
        const building =  this.creatBuilding()
        building.position.set(0, 0, 0)
        //objectRoot.add(building)

        //Protagonist 
        const protagonist = this.createProtagonist(gui) 
        protagonist.position.set(0, 0, 0)
        objectRoot.add(protagonist)

        objectRoot.scale.set(scale,scale,scale)
        this.scene.add(objectRoot);

        const gridhelper = new THREE.GridHelper(10,10)
        //objectRoot.add(gridhelper)
        this.scene.add(gridhelper)

       
        // *** Animation ***
        const clock = new THREE.Clock()
        const tick = () => {
            const elapsedTime = clock.getElapsedTime()
            objectRoot.rotation.y = .2 * elapsedTime
            
            this.renderer.render(this.scene, this.camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }
        //tick()
    }

    createProtagonist(gui?: GUI): THREE.Group {
        const group = new THREE.Group();
        
        //[top, bottom, height, radialSeg, x, y, z, rotateX, Y, Z, material]
        const cylinderDims: number[][] = [
            [2,2,4,10,      0,8.4,0,    0,0,0,0], //neck
            [5,10,4,6,      0,6,0,0,    0,0,0,0], //body top
            [10,6,8,6,      0,0,0,      0,0,0,0], // body bottom
            [1.5,1,23,4,    -5,-7.4,1.3,    -pi/8,0, 0.3,0], // legL
            [1.5,1,23,4,    5,-7.4,1.3,     -pi/8,0, -0.3,0], //legR
            [1,1,3,8,       0,-17,5,        0,0,pi/2,0], //legJoint
            
            [1.5,1,10,4,    10.6,3.6,-4.4,      -2.1,-0.5,-1.3,0], //armL1
            [1.5,1,10,4,    -10.6,3.6,-4.4,     -2.1,0.5,1.3,0], //armR1
            [3,1.5,10,4,    14.6,7.5,-10,       -1,0,0,0], //armL2
            [3,1.5,10,4,    -14.6,7.5,-10,       -1,0,0,0], //armR2

            [0.5,0.5,5,4,       4,20,-8.9,     0,-0.5,-1.4,1], //eyebrowL
            [0.5,0.5,5,4,       -4,20,-8.9,    0,0.4,1.4,1], //eyebrowR
            
            [2,2,3,6,       8.5,3.5,-3.4,     pi/2,0,1.3,1], //screw_armL1
            [2,2,3,6,       -8.5,3.5,-3.4,     pi/2,0,-1.3,1], //screw_armR1
            [2.5,2.5,2,6,       14.5,5.5,-6.4,     2,0.4,0.4,1], //screw_armL2
            [2.5,2.5,2,6,       -14.5,5.5,-6.4,    2,0.4,0.4,1], //screw_armR2
        ]
        for (let i = 0; i < cylinderDims.length; i ++) {
            const curr: number[] = cylinderDims[i]
            const geo = new THREE.CylinderGeometry(curr[0], curr[1], curr[2], curr[3])
            const mesh = new THREE.Mesh(geo, materialArray[curr[10]])

            mesh.position.set(curr[4],curr[5],curr[6])
            mesh.rotateX(curr[7])
            mesh.rotateY(curr[8])
            mesh.rotateZ(curr[9])

            group.add(mesh)

            // GUI
            const x = gui.addFolder('cylinder' + i)
            x.add(mesh.position, 'x').min(-20).max(25).step(0.1)
            x.add(mesh.position, 'y').min(-20).max(25).step(0.1)
            x.add(mesh.position, 'z').min(-20).max(25).step(0.1)
            x.add(mesh.rotation, 'x').min(-pi).max(pi).step(0.1)
            x.add(mesh.rotation, 'y').min(-pi).max(pi).step(0.1)
            x.add(mesh.rotation, 'z').min(-pi).max(pi).step(0.1)
            var params = {
                color: 0xff00ff,
            };
            
            x.addColor(params, 'color' )
                .onChange( function() {mesh.material.color.set(params.color ); } );
        }

        
        //********* head *********
        // skull
        const headGroup = new THREE.Group();
        const tetra = new THREE.TetrahedronGeometry(10,6) //radius, seg
        const skull = new THREE.Mesh(tetra, materialArray[0])
        skull.position.set(0,18,0);

        const h = gui.addFolder('head')
        const x = h.addFolder('skull')
        x.add(skull.position, 'x').min(-20).max(20).step(0.1)
        x.add(skull.position, 'y').min(-20).max(20).step(0.1)
        x.add(skull.position, 'z').min(-20).max(20).step(0.1)

        //Two eyes
        const eye = new THREE.SphereGeometry(2, 8, 6) //radius, seg
        const eyeL = new THREE.Mesh(eye, materialArray[0])
        eyeL.position.set(4,17,-9);
        
        const eyeR = eyeL.clone()
        eyeR.position.set(-4,17,-9);
        
        headGroup.add(skull, eyeL, eyeR)
        group.add(headGroup)
        //********* End of head *********

        //wheel 
        const arr = [10,2.8,16,100]
        const torus = new THREE.TorusGeometry(...arr) 
        const wheel = new THREE.Mesh(torus, materialArray[2])
        wheel.position.set(0,-17,5);
        wheel.rotateY(pi/2)
        group.add(wheel)

        const y = gui.addFolder('torus')
        y.add(wheel.position, 'x').min(-20).max(20).step(0.1)
        y.add(wheel.position, 'y').min(-20).max(20).step(0.1)
        y.add(wheel.position, 'z').min(-20).max(20).step(0.1)

        return group
    }

    














    //****************************************************************************---
    createCylinderMeshes(dims: number[][], gui?: GUI): THREE.Group {
        const group = new THREE.Group();
        
        return group;
    }



    creatBuilding(gui?: GUI): THREE.Group {
        const group = new THREE.Group();
        const l = 10;

        var basedDim =  range(1, 7, 2);
        const fourLayersPile = new THREE.Group();
        for (let i = basedDim.length -1; i >= 0; i--) {
            const corssBox = this.createCrossBoxPile(basedDim[i], l)
            corssBox.position.set(0, 1.5* l * (basedDim.length -1 -i), 0)
            fourLayersPile.add(corssBox)
        }

        basedDim =  range(1, 3, 2);
        const twoLayersPile = new THREE.Group();
        for (let i = basedDim.length -1; i >= 0; i--) {
            const corssBox = this.createCrossBoxPile(basedDim[i], l)
            corssBox.position.set(0, l * (basedDim.length -1 -i), 0)
            twoLayersPile.add(corssBox)
        }

        twoLayersPile.position.set(-l, 0, -l)
        
        const twoLayersPile2 = twoLayersPile.clone()
        twoLayersPile2.position.set(l, 0, -l)

        const twoLayersPile3 = twoLayersPile.clone()
        twoLayersPile3.position.set(l, 0, l)

        const twoLayersPile4 = twoLayersPile.clone()
        twoLayersPile4.position.set(-l, 0, l)

        const twoLayersPile5 = twoLayersPile.clone()
        twoLayersPile5.scale.set(0.5, 3.5, 0.5)
        twoLayersPile5.position.set(-l/2 + 2, l, l/2)
        
        group.add(fourLayersPile,twoLayersPile, twoLayersPile2, twoLayersPile3, twoLayersPile4, twoLayersPile5)
        return group
    }

    // num: number of boxes along a single axis, width: box width
    createCrossBoxPile(num:number, width: number, gui?: GUI): THREE.Group {
        
        const group = new THREE.Group();

        //const material = new THREE.MeshStandardMaterial({ color: 0xf7a8cc})
        num = Math.floor(num/2)
        const pos: number[] = range(-num * width, num * width, width);
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(width, width, width),
            materialArray[0]
        )

        for (let i = 0; i < pos.length; i++) {
            let boxX = box.clone()
            boxX.position.set(pos[i], 0, 0)
            group.add(boxX)

            let boxZ = box.clone()
            boxZ.position.set(0, 0, pos[i])
            group.add(boxZ)
        }
        return group
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

// helper functions ----------------------------------------------
function range(start: number, end: number, step: number) : number[] {
    var ans = [];
    for (let i = start; i <= end; i += step) {
        ans.push(i);
    }
    return ans;
}
