

// for global adjust
var mainScale = 1 ;
var mainScaleAdjust = 0 ; // for plus main scale
var mainRot = {x:0, y:0, z:0} ;
var mainPos = {x:0, y:0, z:0} ;

var mixer = undefined ;
var model_list = [] ;
var model_index = 0 ;
var model_callback_list = [] ;
var model_tips = [] ;

var isLoadingModel = false ;
// init model and model callback

model_list.push("model/stl/wrench.stl") ;
    model_callback_list.push(function(gltf) {
});
model_tips.push("This isn't the first 3D-printed object made in space, but it is the first created to meet the needs of an astronaut. When International Space Station Commander Barry Wilmore needed a wrench, NASA knew just what to do. They `e-mailed` him one. This is the first time an object has been designed on Earth and then transmitted to space for manufacture.") ;

model_list.push("model2/hammer/scene.gltf") ;
model_callback_list.push(function(gltf) {
    mainScaleAdjust = 12;
})
model_tips.push("Hammer - This tool serves three functions: as a sampling hammer to chip or break large rocks, as a pick, and as a haper to drive the drive tubes or other pieces of lunar equipment. has a small hammer face on one end, a broad flat blade on the other, and large hammering flats on the sides. The handle, made of aluminum, is 36 cm (14 inches) long; its lower end fits the extension handle when the tool is used as a hoe.") ;

model_list.push("model/stl/v1.stl") ;
    model_callback_list.push(function(gltf) {
});
model_tips.push("broom header, The broom is compatible with the extension handle. ") ;

model_list.push("model/stl/Apollo_lunar_module.stl") ;
    model_callback_list.push(function(gltf) {
    mainRot.y = 90 ;
    $("#main_rot_y").val(90) ;
});
model_tips.push("The Apollo Lunar Module, or simply Lunar Module (LM /ˈlɛm/), originally designated the Lunar Excursion Module (LEM), was the Lunar lander spacecraft that was flown between lunar orbit and the Moon's surface during the United States' Apollo program. It was the first crewed spacecraft to operate exclusively in the airless vacuum of space, and remains the only crewed vehicle to land anywhere beyond Earth.") ;


model_list.push("model/dustpan_346/scene.gltf") ;
    model_callback_list.push(function(gltf) {
    //gltf.scene.position.set(0,0,20) ;
    mainScaleAdjust = 500 ;
});
model_tips.push("The sampling scoop is used to collect soil material or other lunar samples too small for the rake or tongs to pick up. The stainless Steel pan of the scoop, which is 5 cm (2 inches) by 11 cm (41/2 inches) by 15 cm (6 inches) has a flat bottom flanged on both sides and apartial cover on the top to prevent loss of contents. The pan is adjustable from horizontal to 55 degrees and 90 degrees from the horizontal for use in scooping andtrenching. The scoop handle is compatible with the extension handle. ") ;


//model_list.push("model/litter_scoop/scene.gltf") ;
//    model_callback_list.push(function(gltf) {
//    //gltf.scene.position.set(0,0,20) ;
//    console.log("litter scoop callback") ;
//    mainScaleAdjust = 4 ;
//});
//model_tips.push("litter scoop, pick few dust on the moon") ;

model_list.push("model/low_poly_pickaxe/scene.gltf") ;
model_callback_list.push(function(gltf) {
    //gltf.scene.position.set(0,0,20) ;
    mainScaleAdjust = 400 ;
});
model_tips.push("pick-axe is a generally T-shaped hand tool used for prying. Its head is typically metal, attached perpendicularly to a longer handle, traditionally made of wood, occasionally metal, and increasingly fiberglass. ") ;

model_list.push("model/rake/scene.gltf") ;
model_callback_list.push(function(gltf) {
    //gltf.scene.position.set(0,0,20) ;
    mainScaleAdjust = 100 ;
    //gltf.scene.scale.set(3,3,3);
});
model_tips.push("Lunar rake - The rake is used to collect discrete samples of rocks and rock chips ranging from 1.3 cm (one-half inch) to 2.5 cm (one inch) in size. The rake is adjustable for ease of sample collection and stowage. The tines, formed in the shape of a scoop, are stainless steel. A handle,approximately 25 cm (10 inches) long, attaches to the extension handle for sample collection tasks. ") ;



model_list.push("model/electric_drill/scene.gltf") ;
model_callback_list.push(function(gltf) {
    mainScaleAdjust = 2 ;
    gltf.scene.scale.set(2.5, 2.5, 2.5) ; // set the basic scale
})
model_tips.push("Power up the drill, Adjust the torque so it's low, Fit the screw into the slot on the drill bit, Line up the screw with the hole, Make sure the drill is vertical. Pull the trigger on the drill and press gently into the screw.") ;


model_list.push("model/doge_coin/scene.gltf") ;
model_callback_list.push(function(gltf) {
})
model_tips.push("SpaceX to Launch DOGE-1 to the Moon! (Source: Elon Musk's twitter)") ;

model_list.push("model/sci-fi_box/scene.gltf") ;
model_callback_list.push(function(gltf) {
})
model_tips.push("Sample Return Container - This container maintains a vacuum environment And padded protection for lunar samples. 11.5 by 19 inches) in size, with a knife-edge indium-, silver seal, a strap latch system for closing, and a lever and pin system to support the container in the LM and CM stowage compartments under all vibration and g-force conditions. The drive tubes, special environmental sample container, and the core sample vacuum container as well as some vther specialized pieces of equipment are flown outbound and inbound within the sample return containers, two of which will be carried on Apollo 16.") ;


/*

*/

var handposeModel = null; // this will be loaded with the handpose model
var videoDataLoaded = false; // is webcam capture ready?
var statusText = "Loading handpose model...";
var myHands = []; // single hand only
var handMeshes = []; // array of threejs objects that makes up the hand rendering
var handObj ;

var smooth = {x:0, y:0, z:0} ; // for smooth moving the object

// html canvas for drawing debug view
var dbg = document.createElement("canvas").getContext('2d');
dbg.canvas.style.position="absolute";
dbg.canvas.style.left = "0px";
dbg.canvas.style.top = "0px";
dbg.canvas.style.zIndex = 100; // "bring to front"
document.body.appendChild(dbg.canvas);

// boilerplate to initialize threejs scene
var scene = new THREE.Scene();
var clock = new THREE.Clock();
// scene.background = new THREE.Color( 0xbfe3dd );
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({alpha: true});
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

var ambientLight = new THREE.AmbientLight(0xffffff) ;
ambientLight.position.set(0,0,0) ;
scene.add(ambientLight)

var mainObject = undefined ;
var updateModuleInfo = function() {
    if ( isLoadingModel ) {
        $("#tips p").text( model_tips[model_index]) ;
    }
    else {
        // skip tips when tensorflow not done
    }

    $("#model_info").text(model_list[model_index] + "(" + (model_index+1) + "/" + model_list.length + ")") ;
}

var updateAdjustText = function(){
    var text = "Scale:" + mainScale + "<BR>"  ;
    text = text + "Rot=" + mainRot.x + ", " + mainRot.y + ", " + mainRot.z + "<BR>";
    text = text + "Pos=" + mainPos.x + ", " + mainPos.y + ", " + mainPos.z ;
    $("#range_debug").html(text) ;
}

var testLoadNextObject = function() {
    if ( isLoadingModel == true ) {
        console.log("is loading model, skip") ;
        return ;
    }
    model_index = (model_index + 1) % model_list.length ;
    testLoadMainObject(model_list[model_index], model_callback_list[model_index]) ;
    updateModuleInfo() ;
};

var testLoadPrevObject = function() {
    if ( isLoadingModel == true ) {
        console.log("is loading model, skip") ;
        return ;
    }
    model_index = (model_index - 1 + model_list.length ) % model_list.length ;
    testLoadMainObject(model_list[model_index], model_callback_list[model_index]) ;
    updateModuleInfo() ;
};

var testLoadCurrentIndexObject = function() {
    if ( isLoadingModel == true ) {
        console.log("is loading model, skip") ;
        return ;
    }
    testLoadMainObject(model_list[model_index], model_callback_list[model_index]) ;
    updateModuleInfo() ;
};



var testLoadMainObject = function(name, callback) {

    mainScaleAdjust = 0 ;

    updateAdjustText() ;

    if (name.indexOf(".stl") > 0 ) {
        testLoadSTL(name, callback) ;
        return ;
    }

    isLoadingModel = true ;
    if ( mainObject ) scene.remove(mainObject) ;

    console.log("start to load gltf:" + name) ;
    // Instantiate a loader
    const loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
        name,
        function ( gltf ) {
            updateModuleInfo() ;
            isLoadingModel = false ;
            console.log("gltf loaded") ;
            //scene.add( gltf.scene );
            mainObject = new THREE.Object3D();
            mainObject.add(gltf.scene) ;

            var axesHelper = new THREE.AxesHelper( 150 );
            mainObject.add( axesHelper );

            if ( callback ) { callback(gltf) } ;

            scene.add(mainObject) ;

            if ( gltf.scene.children != undefined ) {
                gltf.scene.children[0].material = new THREE.MeshNormalMaterial();
            }
            gltf.scene.position.set(0,0,0) ;
            //gltf.scene.scale.set(50,50,50) ;

            gltf.animations; // Array<THREE.AnimationClip>
            console.log("animations:") ;
            console.log(gltf.animations) ;

            mainObject._gltf = gltf ;


            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        function ( xhr ) {
            isLoadingModel = false ;
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
            isLoadingModel = false ;
            console.log(error) ;
            console.log( 'An error happened' );
        }
    );
}

/**
    if no animation: slide show once
    if has animation: play once
*/
var testPlayOnce = function() {
	mixer = new THREE.AnimationMixer( mainObject._gltf.scene );
	if ( mainObject._gltf.hasOwnProperty("animations")) {
	    if ( mainObject._gltf.animations.length > 0) {
	    	var action = mixer.clipAction( mainObject._gltf.animations[0] ) ;
            action.setLoop( THREE.LoopOnce ) ;
            action.timeScale = 3;
            action.play() ;
	    }
	}
}

var testLoadSTL= function(name, callback) {
    updateAdjustText() ;
    isLoadingModel = true ;
    if ( mainObject ) scene.remove(mainObject) ;

    var loader = new THREE.STLLoader();
    loader.load( name, function ( geometry ) {
        updateModuleInfo() ;
        isLoadingModel = false ;
        const material = new THREE.MeshNormalMaterial( { color: 0xCC0000 } );
        const mesh = new THREE.Mesh( geometry, material );

        mesh.position.set( 0, 0, 0 );
        mesh.rotation.set( 0, 0, 0 );
        mesh.scale.set( 3,3,3 );

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //scene.add( mesh );
        var obj = new THREE.Object3D();
        obj.add(mesh) ;
        obj.scene = mesh ;
        scene.add(obj) ;
        mainObject = obj
        mainObject._gltf = obj ;

        if ( callback ) { callback(mesh) } ;

        var axesHelper = new THREE.AxesHelper( 150 );
        mainObject.add( axesHelper );

    } );
}

// testLoadMainObject("") ;
testLoadMainObject(model_list[model_index]) ;
//testLoadMainObject(model_list[2]) ;
//testLoadWrench("") ;


for (var i = 0; i < 21; i++){ // 21 keypoints
  var {isPalm,next} = getLandmarkProperty(i);

  var obj = new THREE.Object3D(); // a parent object to facilitate rotation/scaling

  // we make each bone a cylindrical shape, but you can use your own models here too
  var geometry = new THREE.CylinderGeometry( isPalm?0.5:1.0, 0.5, 1);

  var material = new THREE.MeshNormalMaterial();
  // another possible material (after adding a light source):
  // var material = new THREE.MeshPhongMaterial({color:0x00ffff});

  var mesh = new THREE.Mesh( geometry, material );
  mesh.rotation.x = Math.PI/2;
  mesh.visible = false ; // hand live hand

  obj.add( mesh );
  scene.add(obj);
  handMeshes.push(obj);
}


var printRad = function(r) {
    var line = "(" + parseInt(THREE.Math.radToDeg(r.x)) + ",";
    line = line + parseInt(THREE.Math.radToDeg(r.y)) + ",";
    line = line + parseInt(THREE.Math.radToDeg(r.z)) + ")" ;

    return line ;
}

var lastIndexFingerStatus = false ;
var indexFingerCnt = 0 ;

var onChangeFingerStatus = function() {
    testPlayOnce() ;
}

var toggleIndexFingerCheck = function(val) {
    if ( lastIndexFingerStatus == false && val == true) {
        console.log("send Trigger!!!") ;
        onChangeFingerStatus() ;
        $("#index_finger_status").removeClass("btn-info");
        $("#index_finger_status").addClass("btn-primary");
        $("#index_finger_status").text("IndexFinger Trigger");
        lastIndexFingerStatus = true ;
        setTimeout(function() {
            toggleIndexFingerCheck(false) ;
        },1000) ;
    }
    else {
        $("#index_finger_status").removeClass("btn-primary");
        $("#index_finger_status").addClass("btn-info");
        $("#index_finger_status").text("IndexFinger None");
        lastIndexFingerStatus = false ;
    }
}
/**
    check index finger status:
    trigger: return true
    else: false ;

**/
var checkIndexFingerStatus = function() {

    if (!handMeshes) {
        return ;
    }

    //console.log("-------");
    //console.log("----------");

    var check_finger = [6,7] ;
    for (var i = 0; i < check_finger.length; i++){
        var f = check_finger[i] ;
        var mesh = handMeshes[f] ;

        //console.log("finger:" + f) ;
        //console.log(mesh.position) ;
        //console.log(mesh.rotation.x) ;
        //console.log(printRad(mesh.rotation)) ;
    }

    var v = 0 ;
    var finger_1 = 6 ;
    var finger_2 = 7 ;

    x = parseInt(THREE.Math.radToDeg(handMeshes[finger_1].rotation.x)) ;
    y = parseInt(THREE.Math.radToDeg(handMeshes[finger_1].rotation.y)) ;
    z = parseInt(THREE.Math.radToDeg(handMeshes[finger_1].rotation.z)) ;

    xx = parseInt(THREE.Math.radToDeg(handMeshes[finger_2].rotation.x));
    yy = parseInt(THREE.Math.radToDeg(handMeshes[finger_2].rotation.y)) ;
    zz = parseInt(THREE.Math.radToDeg(handMeshes[finger_2].rotation.z)) ;

    vx = (x-xx) * (x-xx) ;
    vy = (y-yy) * (y-yy) ;
    vz = (z-zz) * (z-zz) ;
    v = Math.sqrt( (vx + vy + vz) / 3 );
    //console.log("calc v=" + v) ;

    if ( v > 90) {
        indexFingerCnt = indexFingerCnt + 1
        if ( indexFingerCnt > 3 ) {
            // has trigger finger!!
            toggleIndexFingerCheck(true) ;
        }
    }
    else {
        indexFingerCnt = 0 ;
        toggleIndexFingerCheck(false) ;
    }
}

// update threejs object position and orientation from the detected hand pose
// threejs has a "scene" model, so we don't have to specify what to draw each frame,
// instead we put objects at right positions and threejs renders them all
function updateMeshes(hand){
  //console.log("update meshes... hands") ;
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
//        console.log("hand mesh pos, rot =") ;
//        console.log(handMeshes[i].position);
//        console.log(handMeshes[i].rotation) ;
    }
    if (i == 5) {
        if ( false ) { // play method 1
            //console.log("update mesh rot:") ;
            //console.log(handMeshes[i].rotation)
            //mainObject.position.set(mid.x,mid.y,mid.z);
            //mainObject.lookAt(p1) ;
            var rot = handMeshes[i].rotation ;
            if ( smooth.x == 0 ) {
                smooth.x = rot.x ;
                smooth.y = rot.y ;
                smooth.z = rot.z
            }
            else {
                var sm_r1 = 7/10 ;
                var sm_r2 = 3/10 ;
                smooth.x = (smooth.x * sm_r1 + rot.z * sm_r2 ) ;
                smooth.y = (smooth.y * sm_r1 + rot.y * sm_r2 ) ;
                smooth.z = (smooth.z * sm_r1 + rot.z * sm_r2 ) ;
    //            console.log("rot, smooth") ;
    //            console.log(rot) ;
    //            console.log(smooth) ;
            }
            //debug_obj.rotation.set(rot.x, rot.y, rot.z) ;
            if ( mainObject != undefined ) {
                mainObject.rotation.set(smooth.x, smooth.y, smooth.z) ;
            }
        }
        else { // play method v2
            //console.log("set method v2") ;
            var rot = handMeshes[i].rotation ;
            var pos = handMeshes[i].position ;
            //console.log(pos) ;
            if ( mainObject ) {
                //gltf.scene.scale.set(50,50,50) ;
                var t = mainScale + mainScaleAdjust ;
                mainObject._gltf.scene.scale.set(t, t, t) ;
                mainObject.rotation.set(rot.x + THREE.Math.degToRad(mainRot.x), rot.y + THREE.Math.degToRad(mainRot.y), rot.z + THREE.Math.degToRad(mainRot.z)) ;
                mainObject.position.set(pos.x + mainPos.x, pos.y + mainPos.y, pos.z + mainPos.z ) ;
            }

        }
    }
  } // end of for 21 fingers

  // update tirgger status
  checkIndexFingerStatus() ;
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

  var delta = clock.getDelta();
  if ( mixer ) mixer.update( delta );

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

var bind_html = function() {
    console.log("bind html") ;


    $("index_finger_status").click(function(){
        testPlayOnce() ;
    }) ;

    $(".btnNext").click(function(){
        console.log("next module") ;
        testLoadNextObject() ;
    }) ;

    $(".btnPrev").click(function(){
        console.log("prev module!") ;
        testLoadPrevObject() ;
    }) ;


    $(".btnPrint").click(function(){
        console.log("print module!") ;
    }) ;



     $("#main_scale").change(function(){
        mainScale = $(this).val() ;
        updateAdjustText() ;
    });


    $("#main_rot_x").change(function(){
        mainRot.x = $(this).val() ;
        updateAdjustText() ;
    });

    $("#main_rot_y").change(function(){
        mainRot.y = $(this).val() ;
        updateAdjustText() ;
    });

    $("#main_rot_z").change(function(){
        mainRot.z = $(this).val() ;
        updateAdjustText() ;
    });

    //

    $("#main_pos_x").change(function(){
        mainPos.x = $(this).val() ;
        updateAdjustText() ;
    });

    $("#main_pos_y").change(function(){
        mainPos.y = $(this).val() ;
        updateAdjustText() ;
    });

    $("#main_pos_z").change(function(){
        mainPos.z = $(this).val() ;
        updateAdjustText() ;
    });

    $("#model_select").change(function(){
        console.log("select change=" + $(this).val()) ;
        model_index = $(this).val() ;
        testLoadCurrentIndexObject() ;
    })
}

// basic js
$(function(){
    // init model_select

    for (var i = 0; i < model_list.length ; i++) {
        $('#model_select').append("<li index=" + i + "><a>" + model_list[i] + "</a></li>") ;
    }
    $("#model_select li").click(function(){
        var new_index = parseInt($(this).attr("index")) ;
        //console.log( new_index );
        model_index = new_index ;
        testLoadCurrentIndexObject(model_index) ;
        console.log("Loading " + $(this).text());
    });


    bind_html() ;
}) ;