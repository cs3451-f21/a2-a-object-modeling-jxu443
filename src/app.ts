// abstract library
import { DrawingCommon } from './common';
import * as THREE from 'three'
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

const pi = 3.1415926
const scale = 0.08
const textureLoader = new THREE.TextureLoader()
const normalTexture = textureLoader.load('normalTexture.jpeg')
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
    }),
    new THREE.MeshPhongMaterial({color: 0x2b22a4}),
    new THREE.MeshStandardMaterial({
        metalness: 0.7,
        roughness: 0.2,
        normalMap: normalTexture,
        color: 0x2b22a4
    }),
    //MeshStandardMaterial would be dark in this case bc both receiveShadow and castShadow set to true
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

        //*** design helper ****
        //const gui = new GUI()
        
        //***** Model ************
        //Ground
        const plane = new THREE.PlaneGeometry(10,10);
        plane.rotateX(-Math.PI * 0.5);
        plane.translate(0, -2.3, 0)
        const ground = new THREE.Mesh(plane, materialArray[1])
        objectRoot.add(ground)

        //Protagonist 
        const protagonist = this.createProtagonist() 
        protagonist.position.set(0, 0, 0)
        protagonist.scale.set(scale,scale,scale)
        objectRoot.add(protagonist)

        const gridhelper = new THREE.GridHelper(10,10)
        gridhelper.position.set(0,-2.3,0)
        objectRoot.add(gridhelper)

        this.scene.add(objectRoot);
        
        // *** Animation ***
        document.addEventListener('mousemove', onDocumentMouseMove) 

        let mouseX = 0
        let mouseY = 0

        let targetX = 0
        let targetY = 0

        const windowHalfX = window.innerWidth/2
        const windowHalfY = window.innerHeight/2

        function onDocumentMouseMove(event) {
            mouseX = (event.clientX - windowHalfX)
            mouseY = (event.clientY - windowHalfY)
        }

        const clock = new THREE.Clock()
        const tick = () => {
            targetX = mouseX * 0.005
            targetY = mouseY * 0.005

            const elapsedTime = clock.getElapsedTime()

            // Update objects
            objectRoot.rotation.y = .5 * elapsedTime
            objectRoot.rotation.y += 0.5 * (targetX - objectRoot.rotation.y)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }
        tick()
    }

    createProtagonist(): THREE.Group {
        const ProtagonistGroup = new THREE.Group();

        const groupNames = ["neck","head",              //primary-secondary pair
                            "wheel", "wheel_skelenton", 
                            "body_screwL", "armLeft",
                            "body_screwR","armRight", 
                            "body"]
        const primaryGroupPos = [
            [0,9,0],
            [0,-17,5],
            [8.5,3.5,-3.4],
            [-8.5,3.5,-3.4],
            [0,0,0]
        ]
        var currJoint
        const initDim: number[][][] = [
        //geoType  material  position     rotation        geoParams
            [ //neck
            [1,     2,       0,0,0,         0,0,0,         2,2,4,10], //neck
            ],
            [ //head
            [2,     0,       0,9.5,0,        0,0,0,          10,6], //skull
            [3,     1,       -4,8.5,-9,       0,0,0,         2,8,6], //eyeLeft
            [3,     1,       4,8.5,-9,       0,0,0,          2,8,6], //eyeRight
            [1,     1,      4,11.5,-8.9,       0,-0.5,-1.4,    0.5,0.5,5,4], //eyebrowL 
            [1,     1,      -4,11.5,-8.9,      0,0.4,1.4,      0.5,0.5,5,4], //eyebrowR
            ],
        
            [ //wheel
            [1,     0,      0,0,0,        0,0,pi/2,       1,1,3,8], //wheel_joint
            [4,     2,      0,0,0,        0,pi/2,0,       10,2.8,16,100], //tire
            ],
            [ //wheel_skelenton
            [1,     2,      0,-4,0,       0,0,0,          .3,.3,8,10], //wheel skeleton,
            ],
            
            [ //body_screwL
            [1,     1,      0,0,0,      pi/2,0,1.3,    2,2,3,6], 
            ],
            [ //armL
            [1,     0,    2.7,0.1,-1,     -2.1,-0.5,-1.3,    1.5,1,9,4], //armL1
            [1,     1,    6,2,-3,         2,0.4,0.4,         2.5,2.5,2,6], //armL_screw
            [1,     0,    6.1,4,-6.6,     -1,0,0,            3,1.5,9,4], //armL2
            ],
            [ //body_screwR
            [1,     1,      0,0,0,         pi/2,0,-1.3,        2,2,3,6],
            ],
            [ //armR
            [1,     0,    -2.7,0.1,-1,     -2.1,0.5,1.3,     1.5,1,9,4], //armR1
            [1,     1,    -6,2,-3,         2,0.4,-0.2,        2.5,2.5,2,6], //armR_screw
            [1,     0,    -6.1,4,-6.6,     -1,0,0,           3,1.5,9,4], //armR2
            ],
            
            [ //body
            [1,     3,      0,6,0,0,         0,0,0,         5,10,4,6], //body top
            [1,     4,      0,0,0,           0,0,0,         10,6,8,6], // bodcoy bottom
            [1,     0,      -5,-7.4,1.3,    -pi/8,0,0.3,    1.5,1,23,4], // legL
            [1,     0,      5,-7.4,1.3,     -pi/8,0,-0.3,   1.5,1,23,4], //legR
            ],
        ]
        
        //draw based on params 
        for (let i = 0; i < initDim.length; i++) {
            const group = new THREE.Group()
            group.name = groupNames[i]
            //const currGui = gui.addFolder(groupNames[i])
            for (let j = 0; j < initDim[i].length; j++) {
                const mesh = this.drawGeo(initDim[i][j])
                group.add(mesh)
            }
            if (i%2 == 0) { //is joint 
                const pos = primaryGroupPos[i/2]
                group.position.set(pos[0], pos[1],pos[2])
                currJoint = group
                ProtagonistGroup.add(group)
            } else { //is normal object3D
                currJoint?.add(group)
            }
        }
        
        //rotation of rightArm group
        const body_screwR = ProtagonistGroup.getObjectByName("body_screwR")
        body_screwR?.children[1].rotation.set(-pi/4, 0, 0)

        //transformation of wheel skeleton (1 -> 8)
        const wgroup = ProtagonistGroup.getObjectByName("wheel")
        var templetSkeleton = wgroup.children[2]
        const angels = range(0, 2* pi, pi/4)
        for (let i = 1; i < angels.length; i++) {
            const currSkeleton = templetSkeleton.clone()
            currSkeleton.rotation.set(angels[i], 0, 0)
            wgroup?.add(currSkeleton)
            templetSkeleton = currSkeleton
        }

        return ProtagonistGroup
    }

    drawGeo(dim: number[]): THREE.Mesh {
        const material = materialArray[dim[1]]
        
        var geoParam: number[] = []
        var geo: THREE.BufferGeometry
        switch (dim[0]) {
            case 1: //cylinder 4
                geoParam = dim.slice(dim.length - 4, dim.length)
                geo = new THREE.CylinderGeometry(...geoParam) 
                break;
            case 2: //tetra 2
                geoParam = dim.slice(dim.length - 2, dim.length)
                console.log(geoParam)
                geo = new THREE.TetrahedronGeometry(...geoParam) 
                break;
            case 3: //sphere 3
                geoParam = dim.slice(dim.length - 3, dim.length)
                geo = new THREE.SphereGeometry(...geoParam) 
                break;
            case 4: //Torus 4
                geoParam = dim.slice(dim.length - 4, dim.length)
                geo = new THREE.TorusGeometry(...geoParam) 
                break;
            default:
                geo = new THREE.SphereGeometry(2,16,16) 
        }
        const mesh = new THREE.Mesh(geo, material)

        mesh.position.set(dim[2],dim[3],dim[4])
        mesh.rotateX(dim[5])
        mesh.rotateY(dim[6])
        mesh.rotateZ(dim[7])

        //GUI
        // const x = gui
        // x.add(mesh.position, 'x').min(-20).max(25).step(0.1)
        // x.add(mesh.position, 'y').min(-20).max(25).step(0.1)
        // x.add(mesh.position, 'z').min(-20).max(25).step(0.1)
        // x.add(mesh.rotation, 'x').min(-pi).max(pi).step(0.1)
        // x.add(mesh.rotation, 'y').min(-pi).max(pi).step(0.1)
        // x.add(mesh.rotation, 'z').min(-pi).max(pi).step(0.1)
        // var params = {
        //     color: 0xff00ff,
        // };
        
        // x.addColor(params, 'color' )
        //     .onChange( function() {mesh.material.color.set(params.color ); } );

        return mesh
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
    for (let i = start; i < end; i += step) {
        ans.push(i);
    }
    return ans;
}