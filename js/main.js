var OnAllJSLoad = function() {
    console.log("on load");
    $rig = document.querySelector('#rig');
    // Let's use weboji. See: https://handsfree.js.org/ref/model/weboji
    window.handsfree = new Handsfree({showDebug: true, handpose: true})
    window.handsfree.start();

    // Used to hold tween values (without this things will be jerky)
    tween = {yaw: 0, pitch: 0, roll: 0, x: 0, y: 0, z: 0}

    // Create a new "plugin" to hook into the main loop
    // @see https://handsfree.js.org/guide/the-loop
    window.handsfree.use('logger', data => {
      //console.log("logger v2:", data) ;
      //console.log("logger v2:", data.handpose) ;
      //console.log(" logger json:", JSON.stringify(data.handpose)) ;
      if ( data != undefined && data.handpose != undefined) {
        OnProcessHandpose(data.handpose);
      }

    })



//    handsfree.use('lookHandsfree', ({weboji}) => {
//        console.log("callback?") ;
//      if (!weboji?.degree?.[0]) return
//
//        console.log("callback ok") ;
//      // Calculate rotation
//      const rot = weboji.degree
//      rot[0] -= 15
//
//      // Calculate position
//      const pos = {
//        x: (weboji.translation[0] - .5) * 10,
//        y: (weboji.translation[1] - .5) * 5,
//        z: 5 - weboji.translation[2] * 30
//      }
//
//      // Tween this values
//      TweenMax.to(tween, 1, {
//        yaw: -rot[0] * 1.5,
//        pitch: -rot[1] * 1.5,
//        roll: rot[2] * 1.5,
//        x: pos.x,
//        y: pos.y,
//        z: pos.z
//      })
//
//      // Use the tweened values instead of the actual current values from webcam
//      $rig.setAttribute('rotation', `${tween.yaw} ${tween.pitch} ${tween.roll}`)
//      $rig.setAttribute('position', `${tween.x} ${tween.y} ${tween.z}`)
//    })

}


var handRotIndex = 17 ;
var OnProcessHandpose = function(handpose) {
    if ( handpose.handInViewConfidence > 0.85 ) {
        var test_box = document.querySelector('#test_box');
        console.log("test_box="),
        console.log(test_box) ;
        //console.log(handpose);
        //console.log(handpose.meshes[0]) ;
        console.log(handpose.meshes[handRotIndex].rotation) ;
        //console.log(handpose.meshes[0].scale) ;
        //console.log(handpose.meshes[0].position) ;
        var rot = handpose.meshes[handRotIndex].rotation;
        rot.x = THREE.Math.radToDeg( rot.x ) ;
        rot.y = THREE.Math.radToDeg( rot.y ) ;
        rot.z = THREE.Math.radToDeg( rot.z ) ;
        test_box.setAttribute('rotation', {x: rot.x, y: rot.y, z: rot.z});

    }
    else {
        console.log("too low, skip, move to center");
    }
}


$(function(){
  // OnAllJSLoad() ;
});
