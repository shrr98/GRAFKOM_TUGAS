
function init(){
  scene = new THREE.Scene();
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 700; 
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane);

  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio); 
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;

  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  var time=0;
  var flag=1;

  //controls.update() must be called after any manual changes to the camera's transform
  camera.position.set( 0, -20, 100 );
  controls.update();
  
  function animate() {
  
    requestAnimationFrame( animate );
  
    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
     
    time++;
    if(time<60){
      nose.position.y -= flag* time *0.001;
    }
    if(time==120){
      time = 0;
      flag *=-1;
    }
    renderer.render( scene, camera );
   
  }
  
  function onMouseMove(event){
    
    eyes.forEach( eye=> {
      eye.position.x -= x;
      eye.position.y -= y;
    });

    event.preventDefault();
    x = ( event.clientX / window.innerWidth ) * 3 - 1.5;
    y = -( event.clientY / window.innerHeight ) * 3 + 1.5;

    eyes.forEach( eye=> {
      eye.position.x += x;
      eye.position.y += y;
    });
}

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
    
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1,2,4);
    scene.add(light);
}

{
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(1,-2,-4);
  scene.add(light);
}

  var geometry = new THREE.BoxGeometry(50,50,20);
  // var geometry = new THREE.BoxBufferGeometry( 200,200,200 );
  var material = new THREE.MeshLambertMaterial( {color: 0x1f5aff} );
  var cube = new THREE.Mesh( geometry, material );
  scene.add(cube);

  var geometry = new THREE.SphereBufferGeometry(5,32,32);
  // var geometry = new THREE.BoxBufferGeometry( 200,200,200 );
  var material = new THREE.MeshLambertMaterial( {color: 0x1f5aff} );
  var cube = new THREE.Mesh( geometry, material );
  scene.add(cube);
  cube.position.z = -12;
  cube.position.y = -15;

  var eyes = [];
  var nose;
  var x = 0, y = 0;

  createLegs(1);
  createLegs(-1);
  createFace();

  function createLegs(pos){
    geometry = new THREE.CylinderBufferGeometry( 5, 5, 10, 32 );
    cube = new THREE.Mesh( geometry, material );
    scene.add(cube);
    cube.position.y = -25;
    cube.position.x = pos*10;

    // shoes
    geometry = new THREE.BoxBufferGeometry(12,5,15);
    mat = new THREE.MeshLambertMaterial({color: 0x422402});
    box = new THREE.Mesh(geometry, mat);
    scene.add(box);
    box.position.y = -32;
    box.position.x = pos*10;
    box.position.z = 2.5;
  }

  function createFace(){
    createEye(1);
    createEye(-1);

    // nose
    geometry = new THREE.ConeBufferGeometry(7, 10, 3);
    mat = new THREE.MeshLambertMaterial({color: 0xf0d400});
    nose = new THREE.Mesh(geometry, mat);
    scene.add(nose);
    nose.position.z = 10;
    nose.rotation.x = Math.PI/2;
  }

  function createEye(pos){
    geometry = new THREE.CylinderBufferGeometry(5, 5, 1, 32);
    var mat = new THREE.MeshLambertMaterial({color: 0xffffff});
    cube = new THREE.Mesh( geometry, mat );
    scene.add(cube);
    geometry = new THREE.CircleBufferGeometry(3, 32);
    mat = new THREE.MeshPhongMaterial({color: 0x000000});
    circle = new THREE.Mesh( geometry, mat);
    scene.add(circle);
    cube.position.z=10;
    circle.position.z = 10.6;
    cube.position.x = circle.position.x = pos * 10;
    cube.position.y = circle.position.y = 10;
    cube.rotation.x = Math.PI/2;
    eyes.push(circle);
  }
window.addEventListener('mousemove', onMouseMove);

animate();
}

init();