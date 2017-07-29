var resOb       = null; // the 3d reservoir object
var waterInside = null; // object to show the current water level
var rootObject  = null; // contains the other objets
var renderer    = null;
var scene       = null;
var camera      = null;
var controls    = null; // to rotate and zoom the scene

// to load assets
var textureLoader = new THREE.TextureLoader();
var fontLoader    = new THREE.FontLoader();


function InputPipeCurve () {
  THREE.Curve.call(this);
}

InputPipeCurve.prototype = Object.create(THREE.Curve.prototype);
InputPipeCurve.prototype.constructor = InputPipeCurve;

InputPipeCurve.prototype.getPoint = function (t) {
    var tx = 0.2*t;
    var ty = Math.cos(2*Math.PI*t);
    var tz = 0;

    return new THREE.Vector3(0, tx, 0);
};


/**
 * To do the water animation
 */
var animate = function () {
}

/**
 * Scene update loop
 */
var run = () => {
  requestAnimationFrame(run);
  renderer.clear();
  controls.update();
  renderer.render(scene, camera);
  animate();
}

/**
 * Setup animation
 */
var main = () => {
  var canvas = document.getElementById('reservoir-animation');
  var sceneWidth = canvas.offsetWidth;
  var sceneHeigth = canvas.offsetHeight;
  /* create a renderer to draw on the canvas */
  renderer   = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
  renderer.setSize(sceneWidth, sceneHeigth);
  renderer.setClearColor(0xffffff, 1);
  renderer.autoClear = false;  

  /* create a scene to render the objects */
  scene = new THREE.Scene();
  // the scene's camera
  camera = new THREE.PerspectiveCamera(45, sceneWidth/sceneHeigth, 1, 4000);
  camera.position.z = 13;
  scene.add(camera);

  /* lighting for the scene */
  light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  /* create the controls to move the scene */
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableRotate = true;

  rootObject = new THREE.Object3D();
  rootObject.rotation.y = 0.7*Math.PI/2;
  rootObject.rotation.x = 0.07*Math.PI;

  /* create the reservoir object */
  var resMat  = new THREE.MeshLambertMaterial({
    map  : textureLoader.load(RESERVOIR_WALL),
    transparent: true, // to show the water inside
    opacity: 0.4,
    color: 0x50ffffff
  });
  var resGeom = new THREE.BoxGeometry(
    reservoir.width, reservoir.heigth, reservoir.length, 1, 1, 1);
  resOb = new THREE.Mesh(resGeom, resMat);
  resOb.position.x = 0;
  resOb.position.y = 0;
  resOb.position.z = 0;

  /* create the 'water inside' object */
  // the height of the part of the reservoir without water
  var wl = reservoir.waterLevel;
  var wiMat  = new THREE.MeshPhongMaterial({ color: 0x142286 });
  var waterTexture = textureLoader.load(WATER_TEXTURE);
  waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
  waterTexture.offset.set(0, 0);
  waterTexture.repeat.set(4, 4);
  // materials for the water inside. top material will have a water texture
  var waterInsideMats = [
    wiMat, wiMat,
    new THREE.MeshPhongMaterial({ color: 0xffffff, map: waterTexture }),
    wiMat, wiMat, wiMat
  ]
  var waterInsideGeom = new THREE.BoxGeometry(
    reservoir.width-0.01, wl-0.01, reservoir.length-0.01);
  waterInside         = new THREE.Mesh(waterInsideGeom, waterInsideMats);
  waterInside.position = resOb.position;
  waterInside.position.y = resOb.position.y - (reservoir.heigth - wl)/2; // to be at the bottom of the reservoir
  
  /* show  outputs of the reservoir */
  var output = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.2, 0.4, 20, 10),
    new THREE.MeshPhongMaterial({ color: 0x200505 })
  );
  var outOffset = reservoir.width / reservoirOutputs.length; // distance between outputs
  for (var i = 0; i < reservoirOutputs.length; i++) {
    var out_ = output.clone();
    // at the end of th reservoir
    out_.position.z = resOb.position.z + reservoir.length/2 + 0.1;
    // a little bit above the ground
    out_.position.y = resOb.position.y - reservoir.heigth/2 + 0.5;
    // displacement in the wall
    out_.position.x = i*outOffset + outOffset/2 - reservoir.width/2;
    out_.rotation.x = Math.PI/2;
    rootObject.add(out_);
  }

  /* show the inputs of the reservoir */
  var input = new THREE.Mesh(
    new THREE.TubeGeometry(new InputPipeCurve(), 20, 0.2, 20, true),
    // new THREE.CylinderGeometry(0.25, 0.2, 0.4, 20, 10),
    new THREE.MeshBasicMaterial({ color: 0x200505 })
  );
  var inOffset = reservoir.width / reservoirInputs.length; // distance between inputs
  for (var i = 0; i < reservoirInputs.length; i++) {
    var in_ = input.clone();
    // at the begginig of the reservoir
    in_.position.z = resOb.position.z - reservoir.length/2 + 0.5;
    // at the top of the reservoir
    in_.position.y = resOb.position.y + reservoir.heigth/2;
    // displacement in the roof
    in_.position.x = i*inOffset + inOffset/2 - reservoir.width/2;
    in_.rotation.y = -Math.PI/2;
    rootObject.add(in_);
  }

  /*
  // create the axis to show the reservoir dimensions
  var axisSource = new THREE.Vector3(
    resOb.position.x + reservoir.width/2,
    resOb.position.y - reservoir.heigth/2,
    resOb.position.z - reservoir.length/2    
  );
  
  // points indicating x axis
  var xgeom = new THREE.Geometry();
  var endOfX = new THREE.Vector3(
    axisSource.x - (reservoir.width + 1), axisSource.y, axisSource.z)
  xgeom.vertices.push(axisSource, endOfX);
  // points indicating y axis
  var ygeom = new THREE.Geometry();
  ygeom.vertices.push(axisSource, new THREE.Vector3(
    axisSource.x, axisSource.y + reservoir.heigth + 1, axisSource.z));
  // points indicating the z axis
  var zgeom = new THREE.Geometry();
  zgeom.vertices.push(axisSource, new THREE.Vector3(
    axisSource.x, axisSource.y, axisSource.z + reservoir.length + 1));
  
  var lineMaterial = new THREE.LineBasicMaterial({ color: 0 });

  rootObject.add(new THREE.Line(xgeom, lineMaterial));
  rootObject.add(new THREE.Line(ygeom, lineMaterial));
  rootObject.add(new THREE.Line(zgeom, lineMaterial));
  */

  rootObject.add(resOb);
  rootObject.add(waterInside);
  //rootObject.add(mirrorMesh);
  scene.add(rootObject);

  run();
}

$(document).ready(main);