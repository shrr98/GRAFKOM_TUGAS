function main(){
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor ( 0xffffff );
    document.body.appendChild( renderer.domElement );


    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 30);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    {
        const skyColor = 0xB1E1FF;
        const groundColor = 0xB97A20;
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const color = 0x553300;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 0, -5);
        scene.add(light);
        scene.add(light.target);
    }

    {
        const color = 0xffffff;
        const intensity = .4;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 5, 5);
        scene.add(light);
        scene.add(light.target);
    }


    {
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('assets/target.mtl',  (materials) =>{
            const objLoader = new THREE.OBJLoader();
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load('assets/target.obj', (root) => {
                scene.add(root);
                root.position.x = -5;
                root.rotation.x = Math.PI / 2.0;
            });
        });
    }

    {
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('assets/logo_its.mtl',  (materials) =>{
            const objLoader = new THREE.OBJLoader();
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load('assets/logo_its.obj', (root) => {
                scene.add(root);
                root.position.x = 5;
            });
        });
    }

    function resizeRendererToDisplaySize(renderer){
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if(needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(){
        if(resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
