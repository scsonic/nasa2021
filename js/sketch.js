// sketch.js

/* global describe handpose tf io THREE*/

var handposeModel = null; // this will be loaded with the handpose model
var videoDataLoaded = false; // is webcam capture ready?
var statusText = "Loading handpose model...";
var myHands = []; // hands detected
                  // currently handpose only supports single hand, so this will be either empty or singleton

var handMeshes = []; // array of threejs objects that makes up the hand rendering

// html canvas for drawing debug view
var dbg = document.createElement("canvas").getContext('2d');
dbg.canvas.style.position="absolute";
dbg.canvas.style.left = "0px";
dbg.canvas.style.top = "0px";
dbg.canvas.style.zIndex = 100; // "bring to front"
document.body.appendChild(dbg.canvas);


// boilerplate to initialize threejs scene
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// read video from webcam
var capture = document.createElement("video");
capture.playsinline="playsinline"
capture.autoplay="autoplay"
navigator.mediaDevices.getUserMedia({audio:false,video:true}).then(function(stream){
  window.stream = stream;
  capture.srcObject = stream;
})

// hide the video element
capture.style.position="absolute"
capture.style.opacity= 0
capture.style.zIndex = 0  // "send to back"

// signal when capture is ready and set size for debug canvas
capture.onloadeddata = function(){
  console.log("video initialized");
  videoDataLoaded = true;
  dbg.canvas.width = capture.videoWidth /2; // half size
  dbg.canvas.height= capture.videoHeight/2;

  camera.position.z = capture.videoWidth/2; // rough estimate for suitable camera distance based on FOV
}


// certian materials require a light source, which you can add here:
console.log("add direction light") ;
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.position.set(0,0,400) ;
scene.add( directionalLight );

var mainObject ;
var testLoadMainObject = function(name) {
    console.log("start to load gltf")
    // Instantiate a loader
    const loader = new THREE.GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
//    const dracoLoader = new DRACOLoader();
//    dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
//    loader.setDRACOLoader( dracoLoader );

    // Load a glTF resource
    loader.load(
        'model/scene.gltf',
        function ( gltf ) {
            console.log("gltf loaded") ;
            //scene.add( gltf.scene );
            mainObject = new THREE.Object3D();
            mainObject.add(gltf.scene) ;
            scene.add(mainObject) ;

            gltf.scene.children[0].material = new THREE.MeshLambertMaterial();
            gltf.scene.position.set(0,0,20) ;
            gltf.scene.scale.set(50,50,50) ;

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );
}

testLoadMainObject("") ;

for (var i = 0; i < 21; i++){ // 21 keypoints
  var {isPalm,next} = getLandmarkProperty(i);

  var obj = new THREE.Object3D(); // a parent object to facilitate rotation/scaling

  // we make each bone a cylindrical shape, but you can use your own models here too
  var geometry = new THREE.CylinderGeometry( isPalm?5:10, 5, 1);

  var material = new THREE.MeshNormalMaterial();
  // another possible material (after adding a light source):
  // var material = new THREE.MeshPhongMaterial({color:0x00ffff});

  var mesh = new THREE.Mesh( geometry, material );
  mesh.rotation.x = Math.PI/2;

  obj.add( mesh );
  scene.add(obj);
  handMeshes.push(obj);
}

// test add mesh

console.log("add debug obj");
var debug_obj = new THREE.Object3D();
var debug_geometry = new THREE.CylinderGeometry( 100, 50, 10);
var debug_material = new THREE.MeshNormalMaterial();
var debug_mesh = new THREE.Mesh( debug_geometry, debug_material );
debug_mesh.rotation.x = Math.PI/2;
debug_mesh.position.set(0,0,10) ;
debug_obj.add( debug_mesh );
scene.add(debug_obj);
//handMeshes.push(obj);



// update threejs object position and orientation from the detected hand pose
// threejs has a "scene" model, so we don't have to specify what to draw each frame,
// instead we put objects at right positions and threejs renders them all
function updateMeshes(hand){
  console.log("update meshes... hands") ;
  //console.log("camera pos:") ;
  //console.log(camera.position) ;


  for (var i = 0; i < handMeshes.length; i++){

    var {isPalm,next} = getLandmarkProperty(i);

    var p0 = webcam2space(...hand.landmarks[i   ]);  // one end of the bone
    var p1 = webcam2space(...hand.landmarks[next]);  // the other end of the bone

    // compute the center of the bone (midpoint)
    var mid = p0.clone().lerp(p1,0.5);
    handMeshes[i].position.set(mid.x,mid.y,mid.z);

    // compute the length of the bone
    handMeshes[i].scale.z = p0.distanceTo(p1);

    // compute orientation of the bone
    handMeshes[i].lookAt(p1);

    if ( i == 10){
        console.log("hand mesh pos, rot =") ;
        console.log(handMeshes[i].position);
        console.log(handMeshes[i].rotation) ;
    }
    if (i == 10) {
        console.log("update mesh rot:") ;
        console.log(handMeshes[i].rotation)
        //mainObject.position.set(mid.x,mid.y,mid.z);
        //mainObject.lookAt(p1) ;
        var rot = handMeshes[i].rotation ;
        debug_obj.rotation.set(rot.x, rot.y, rot.z) ;
        mainObject.rotation.set(rot.x, rot.y, rot.z) ;
    }
  }



}


// Load the MediaPipe handpose model assets.
handpose.load().then(function(_model){
  console.log("model initialized.")
  statusText = "Model loaded."
  handposeModel = _model;
})


// compute some metadata given a landmark index
// - is the landmark a palm keypoint or a finger keypoint?
// - what's the next landmark to connect to if we're drawing a bone?
function getLandmarkProperty(i){
  var palms = [0,1,2,5,9,13,17] //landmark indices that represent the palm

  var idx = palms.indexOf(i);
  var isPalm = idx != -1;
  var next; // who to connect with?
  if (!isPalm){ // connect with previous finger landmark if it's a finger landmark
    next = i-1;
  }else{ // connect with next palm landmark if it's a palm landmark
    next = palms[(idx+1)%palms.length];
  }
  return {isPalm,next};
}

// draw a hand object (2D debug view) returned by handpose
function drawHands(hands,noKeypoints){

  // Each hand object contains a `landmarks` property,
  // which is an array of 21 3-D landmarks.
  for (var i = 0; i < hands.length; i++){

    var landmarks = hands[i].landmarks;

    var palms = [0,1,2,5,9,13,17] //landmark indices that represent the palm

    for (var j = 0; j < landmarks.length; j++){
      var [x,y,z] = landmarks[j]; // coordinate in 3D space

      // draw the keypoint and number
      if (!noKeypoints){
        dbg.fillRect(x-2,y-2,4,4);
        dbg.fillText(j,x,y);
      }

      // draw the skeleton
      var {isPalm,next} = getLandmarkProperty(j);
      dbg.beginPath();
      dbg.moveTo(x,y);
      dbg.lineTo(...landmarks[next]);
      dbg.stroke();
    }

  }
}


// transform webcam coordinates to threejs 3d coordinates
function webcam2space(x,y,z){
  return new THREE.Vector3(
     (x-capture.videoWidth /2),
    -(y-capture.videoHeight/2), // in threejs, +y is up
    - z
  )
}

function render() {
  requestAnimationFrame(render); // this creates an infinite animation loop

  if (handposeModel && videoDataLoaded){ // model and video both loaded

    handposeModel.estimateHands(capture).then(function(_hands){
      // we're handling an async promise
      // best to avoid drawing something here! it might produce weird results due to racing

      myHands = _hands; // update the global myHands object with the detected hands
      if (!myHands.length){
        // haven't found any hands
        statusText = "Show some hands!"
      }else{
        // display the confidence, to 3 decimal places
        statusText = "Confidence: "+ (Math.round(myHands[0].handInViewConfidence*1000)/1000);

        // update 3d objects
        updateMeshes(myHands[0]);
      }
    })
  }

  dbg.clearRect(0,0,dbg.canvas.width,dbg.canvas.height);

  dbg.save();
  dbg.fillStyle="red";
  dbg.strokeStyle="red";
  dbg.scale(0.5,0.5); //halfsize;

  dbg.drawImage(capture,0,0);
  drawHands(myHands);
  dbg.restore();

  dbg.save();
  dbg.fillStyle="red";
  dbg.fillText(statusText,2,60);
  dbg.restore();

  // render the 3D scene!
  renderer.render( scene, camera );
}

render(); // kick off the rendering loop!

