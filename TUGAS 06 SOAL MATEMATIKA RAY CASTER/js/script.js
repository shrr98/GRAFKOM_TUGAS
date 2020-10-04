function main() {
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  canvas = renderer.domElement;

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 200;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera. position.z = 70;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('White');

  const cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(camera);

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1,2,4);
    camera.add(light);
  }

  
  const color_ori = 0x0739ad;
  const color_pik = 0xff7af0;

  function rand(min, max) {
    if (max == undefined) {
      max = min;
      min = 0;
    }
    return min + (max - min) * Math.random();
  }

  function randomColor() {
    return `hsl(${rand(360) | 0}, ${rand(50,100) | 0}%, 50%)`;
  }

  const numObjects = 10;
  var manager = new THREE.LoadingManager();
  manager.onLoad = function() { // when all resources are loaded
    init();
  }
  var fontUsed = null;
  const loader = new THREE.FontLoader(manager);
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    fontUsed = font;
  });

  function init(){
    for(let i=0; i< numObjects; i++){
      var num = 1;
      var mesh = create(num, i.toString(), rand(-30,30), rand(-20,10), rand(-20,20));
      scene.add(mesh);
    }
  }

  function create(num, name, posx, posy, posz){
    var geometry = new THREE.TextBufferGeometry(num.toString(), {
      font : fontUsed,
      size : 5.0,
      height : 1,
      curveSegments : 5,
      bevelEnabled : true,
      bevelThickness : 0.05,
      bevelSize : .01,
      bevelSegments : 1
    });

    const material = new THREE.MeshPhongMaterial({color : color_ori});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.num = num;
    mesh.name = name;
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);
  
    mesh.position.set(posx, posy, posz);
    mesh.rotation.set(0, rand(Math.PI), 0);
    return mesh;
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize){
      renderer.setSize(width, height);
    }
    return needResize;
  }

  class PickHelper {
      constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
        this.selectedObject = null;
        this.numSelect = 0;
      }
      pick(normalizedPosition, scene, camera, time) {
        if (this.pickedObject){
          this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
          this.pickedObject = undefined;
        }

      this.raycaster.setFromCamera(normalizedPosition, camera);
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        this.pickedObject = intersectedObjects[0].object;
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }
      else {
        this.pickedObject = null;
      }
    }
  }

  const pickPosition = {x: 0, y: 0};
  const pickHelper = new PickHelper();
  clearPickPosition();

  function render(time) {
    time *= 0.001;  // convert to seconds;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cameraPole.rotation.y = time * .1;

    pickHelper.pick(pickPosition, scene, camera, time);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
    pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y
  }

  function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }

  function setSelected(event) {
    if(pickHelper.pickedObject===null) {
      return;
    }
    else if(pickHelper.numSelect===0){
      pickHelper.pickedObject.material.color.setHex(color_pik);
      pickHelper.selectedObject = pickHelper.pickedObject;
      pickHelper.numSelect+=1;
    }
    else if(pickHelper.pickedObject.name === pickHelper.selectedObject.name){
      pickHelper.numSelect = 0;
      pickHelper.pickedObject.material.color.setHex(color_ori);
      return;
    }
    else if(pickHelper.pickedObject.num === pickHelper.selectedObject.num){
      var num = pickHelper.pickedObject.num + pickHelper.selectedObject.num;
      var name = pickHelper.pickedObject.name;
      const posx = pickHelper.pickedObject.position.x;
      const posy = pickHelper.pickedObject.position.y;
      const posz = pickHelper.pickedObject.position.z;
      const mesh = create(num, name, posx, posy, posz);
      scene.add(mesh);

      num = 1;
      name = pickHelper.selectedObject.name;
      const new_mesh = create(num, name, rand(-20,20), rand(-20,10), rand(-20,20));
      scene.add(new_mesh);

      scene.remove(pickHelper.selectedObject);
      scene.remove(pickHelper.pickedObject);

      pickHelper.numSelect = 0;
      pickHelper.selectedObject = pickHelper.pickedObject = null;
    }
    else {
      pickHelper.numSelect = 0;
      pickHelper.selectedObject.material.color.setHex(color_ori);
      pickHelper.pickedObject.material.color.setHex(color_ori);
      pickHelper.selectedObject = pickHelper.pickedObject = null;
    }
    clearPickPosition();
  }
  

  window.addEventListener('mousemove', setPickPosition);
  window.addEventListener('mouseout', clearPickPosition);
  window.addEventListener('mouseleave', clearPickPosition);
  window.addEventListener('click', setSelected);

  window.addEventListener('touchstart', (event) => {
    // prevent the window from scrolling
    event.preventDefault();
    setPickPosition(event.touches[0]);
  }, {passive: false});

  window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);
  });

  window.addEventListener('touchend', clearPickPosition);
}

main();