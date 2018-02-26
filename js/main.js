var camera, scene, renderer;
var effect, controls;
var element, container;

var surfacePlane = false;

var menuvr;
var testSession;
var lf; // Light field object

var raycaster = new THREE.Raycaster();

var clock = new THREE.Clock();
var isMobile = false;

var lfPlane;

// No Sleep for mobile platforms
var noSleep = new NoSleep();

init();

animate();


function init() {
  // Check the platform
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }
  else {
    isMobile = false;
  }

  // Init THREE.js WebGL
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor( 0x888888, 1);

  element = renderer.domElement;
  container = document.getElementById('lfvrview');
  container.appendChild(element);

  // Set up scene and camera in THREE.js
  effect = new THREE.StereoEffect(renderer);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(0, 10, 0);

  scene.add(camera);

  // --- Orientation Controls ---
  // Mouse controls
  controls = new THREE.OrbitControls(camera, element);
  //controls.rotateUp(Math.PI / 4);
  controls.target.set(
    camera.position.x + 1,
    camera.position.y,
    camera.position.z
  );
  controls.noZoom = true;
  controls.noPan = true;
  controls.noKeys = true;
  controls.minPolarAngle = Math.PI/2 - 0.20;
  controls.maxPolarAngle = Math.PI/2 + 0.20;

  // Mobile device controls
  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }
    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();
    element.addEventListener('click', fullscreen, false);
    window.removeEventListener('deviceorientation', setOrientationControls, true);
  }
  window.addEventListener('deviceorientation', setOrientationControls, true);
  // --- End of Orientation Controls ---

  // Set up the light
  var light = new THREE.HemisphereLight(0x979797, 0x000000, 0.6);
  scene.add(light);

  // Set up the surface plane
  if (surfacePlane) {
    var texture = THREE.ImageUtils.loadTexture('textures/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(50, 50);
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 20,
      shading: THREE.FlatShading,
      map: texture
    });
    var geometry = new THREE.PlaneGeometry(1000, 1000);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.name = 'floor';
    scene.add(mesh);
  }

  // MENU VR
  if(isMobile){
    menuvr = new MenuVR(new THREE.Vector3(0,10,14));
  }else {
    menuvr = new MenuVR(new THREE.Vector3(14,10,0));
  }
  menuvr.showMenu(scene);
  menuvr.menuvr.visible = false;
  var ret = menuvr.drawRetice();
  ret.position.set(0,0,-13.95);
  ret.visible = false;
  camera.add(ret);
  if(menuvr.welcome!=undefined) menuvr.welcome.visible = false;
  scene.add(menuvr.welcome);
  //scene.add(menuvr.loading);
  menuvr.loading.rotation.y = 0;
  menuvr.loading.position.set(0,0,-14);
  camera.add(menuvr.loading);

  // Test Session Object configurartion
  testSession = new TestSession();
  testSession.loadLF = function (im) {
    lf.loadTextures(im);
    lf.update(camera,0,10,true);
    testSession.currentImage = im;
  }
  //testSession.preloadLF = preloadLFTextures;
  testSession.preloadLF = function functionName() {};
  testSession.showLF = function () {
    lfPlane.visible = true;
  }
  testSession.hideLF = function () {
    lfPlane.visible = false;
  }
  testSession.showMenu = function() {
    camera.children[0].visible = true; // Enable reticle
    menuvr.menuvr.visible = true;
    menuvr.isActive = true;
  }
  testSession.hideMenu = function() {
    menuvr.isActive = false;
    camera.children[0].visible = false; // Hide reticle
    menuvr.menuvr.visible = false;
    menuvr.welcome.visible = false;
    menuvr.training.visible = false;
    menuvr.evaluating.visible = false;
    menuvr.loading.visible = false;
  }
  testSession.scene = scene;
  testSession.menu = menuvr;

  // Light Filed object init
  lf = new LightFieldVR(renderer,scene,camera,testSession,menuvr);
  lfPlane = lf.lfPlane;

  document.body.onkeyup = pressKey;

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();

  controls.update(dt);

  lf.update(camera,0,10);

  menuvr.update();

  // Output debug overlay
  document.getElementById("posx").innerHTML = Number.parseFloat(camera.position.x).toFixed(4);
  document.getElementById("posy").innerHTML = Number.parseFloat(camera.position.y).toFixed(4);
  document.getElementById("posz").innerHTML = Number.parseFloat(camera.position.z).toFixed(4);
  document.getElementById("rotx").innerHTML = Number.parseFloat(camera.rotation.x).toFixed(4);
  document.getElementById("roty").innerHTML = Number.parseFloat(camera.rotation.y).toFixed(4);
  document.getElementById("rotz").innerHTML = Number.parseFloat(camera.rotation.z).toFixed(4);

}

function renderWrapper(){
  if (/Android|webOS|iPhone|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    effect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}
function render(dt) {

  renderWrapper();

}

function animate(t) {
  requestAnimationFrame(animate);

  update(clock.getDelta());
  render(clock.getDelta());
}

function pressKey(e){
  if(e.keyCode == 32){
    if (lf.lfTextueLoaded1&&lf.lfTextueLoaded2) testSession.clickOnScreen();
  }
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
  noSleep.enable();

  if (lf.lfTextueLoaded1&&lf.lfTextueLoaded2) testSession.clickOnScreen();
}
