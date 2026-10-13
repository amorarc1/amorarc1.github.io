var scene;
var camera;
var renderer;
var controls;
var mixer;
var reloj = new THREE.Clock();

// Cambia este numero para probar otra animacion.
var numeroAnimacion = 4;

init();

function init()
{
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x17211f);

	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 40, 80);
	camera.lookAt(0, 20, 0);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('container').appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 20, 0);
	controls.enableRotate = true;
	controls.enableZoom = true;
	controls.enablePan = true;
	controls.update();

	var luz = new THREE.DirectionalLight(0xffffff, 1);
	luz.position.set(100, 100, 100);
	scene.add(luz);
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));

	var loader = new THREE.GLTFLoader();
	loader.load('models/gato/gato_animado.glb', function (gltf)
	{
		var gato = gltf.scene;
		gato.scale.set(500, 500, 500);
		scene.add(gato);

		mixer = new THREE.AnimationMixer(gato);
		var animacion = gltf.animations[numeroAnimacion];
		mixer.clipAction(animacion).play();
	});

	window.addEventListener('resize', function ()
	{
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	render();
}

function render()
{
	requestAnimationFrame(render);
	if (mixer) mixer.update(reloj.getDelta());
	controls.update();
	renderer.render(scene, camera);
}
