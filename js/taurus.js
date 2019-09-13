
let renderer;
let scene;
let camera;
let fov;
let aspect;
let near;
let far;

let clock;
let step;

let light;

let numberOfTriangles = 60;
let dimensionOfTriangles = 60;
let trianglesTube = [];

//Composer for the post processing effects
let composer;

//Each of our created triangles will need to be rendered so we need to store the render
//functions
let onRenderFunctions = [];

//For the audio
let listener;
let sound;

//Class to create the triangles
class Triangle{
  constructor(inx, material){
    this.b = new THREE.Mesh(new THREE.CylinderGeometry( 3.5, 3.5, 4.5, 3,1,0), material);
    this.b.position.x = Math.cos(inx*(Math.PI*2)/numberOfTriangles)*dimensionOfTriangles;
    this.b.position.z = Math.sin(inx*(Math.PI*2)/numberOfTriangles)*dimensionOfTriangles;
    this.b.lookAt(new THREE.Vector3(0,0,0));
    this.b.rotation.z = Math.PI/2;
  }
}

function init(){

  //Create Renderer
  renderer  = new THREE.WebGLRenderer({
    antialias : true,
    alpha: true
  });

  //The set clear color is the color of the triangle
  renderer.setClearColor(new THREE.Color('#FA1505'), 1)
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //Create scene
  scene = new THREE.Scene();

  //Create camera
  fov = 120;
  aspect = window.innerWidth/window.innerHeight;
  near = 0.01;
  far = 999;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  //Create the audio listener
  listener = new THREE.AudioListener();
  camera.add(listener);
  // create a global audio source
  sound = new THREE.Audio( listener );
  // load a sound and set it as the Audio object's buffer
  let audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'js/Nathaniel_Wyvern_-_Infiltrators.mp3', function( buffer ) {
	  sound.setBuffer( buffer );
	  sound.setLoop( true );
	  sound.setVolume( 0.5 );
	  sound.play();
  });


  //Create the fog
  scene.fog = new THREE.FogExp2(0xFA1505, 0.05);

  //Create the Point light and add it to the scene for triables
  pointLight = new THREE.PointLight(0x0033ff, 1);
  scene.add(pointLight);

  
  //Setup the material
  let material = new THREE.MeshPhongMaterial({
    color: new THREE.Color("rgb(0,15,35)"),
    emissive: new THREE.Color("rgb(0,30,20)"),
    specular: new THREE.Color("rgb(0,60,0)"),
    shininess: 0,
    shading: THREE.SmoothShading,
    side: THREE.BackSide,
  });

  //Create the triangles and add them to the scene
  for(var i=0; i<numberOfTriangles; i++){
    trianglesTube.push(new Triangle(i, material));
    scene.add(trianglesTube[i].b);
  } 

  //Setup for post processing
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const filmPass = new THREE.FilmPass(
        0.50,   // noise intensity
        0.050,  // scanline intensity
        648,    // scanline count
        false,  // grayscale
  );

  filmPass.renderToScreen = true;
  composer.addPass(filmPass);
  clock = new THREE.Clock();
  step = clock.getDelta();

  onRenderFunctions.push(function(){
    camera.position.x = Math.cos(step)*dimensionOfTriangles;
    camera.position.z = Math.sin(step)*dimensionOfTriangles;   
    camera.lookAt(new THREE.Vector3(Math.cos(step+0.001)*dimensionOfTriangles,0,Math.sin(step+0.001)*dimensionOfTriangles));
    camera.rotation.z = Math.PI/2;
    step += 0.0025; 
  });


  renderer.setAnimationLoop((nowMsec) =>{
    update(nowMsec);
    render();
    onRenderFunctions.forEach(function(onRenderFunction){
      onRenderFunction(deltaMsec/1000, nowMsec/1000);
    });
  });
}

function update(nowMsec){

  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  let lastTimeMsec= null;
  lastTimeMsec  = lastTimeMsec || nowMsec-1000/60;
  deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec  = nowMsec; 
  
}

function render(){
  composer.render(scene, camera);
}

function onWindowResize(){
  update();
}

init();


