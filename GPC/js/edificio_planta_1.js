// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 1000 );
  camera.position.set( 40, 25, 5 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{  
	let planta1 = new THREE.Object3D();

	//Bloque rectangular
	const geometry = new THREE.BoxGeometry( 30, 15, 20 );
	const material = new THREE.MeshToonMaterial( { color: 0xF5B97A } );
	const bloque = new THREE.Mesh( geometry, material );
	bloque.position.set(0, 0, 0);
	planta1.add(bloque);



	//Ventanas
	function crearVentana(ancho, alto) {
		const ventana = new THREE.Object3D();
		const grosorMarco = 0.5;

		const materialMarco = new THREE.MeshToonMaterial( { color: 0x5A3A22 } );
		const materialCristal = new THREE.MeshToonMaterial( { color: 0x9FD8F0 } );

		// Marco (fondo de la ventana)
		const marco = new THREE.Mesh(
			new THREE.BoxGeometry(ancho, alto, 0.4),
			materialMarco
		);
		ventana.add(marco);

		// Tamaño de cada panel (2 columnas x 2 filas)
		const anchoPanel = (ancho - 3 * grosorMarco) / 2;
		const altoPanel  = (alto  - 3 * grosorMarco) / 2;
		const geoPanel = new THREE.BoxGeometry(anchoPanel, altoPanel, 0.2);

		for (let i = -1; i <= 1; i += 2) {      // columnas: izquierda / derecha
			for (let j = -1; j <= 1; j += 2) {  // filas: abajo / arriba
				const panel = new THREE.Mesh(geoPanel, materialCristal);
				panel.position.set(
					i * (anchoPanel / 2 + grosorMarco / 2),
					j * (altoPanel  / 2 + grosorMarco / 2),
					0.2 // sobresale un poco del marco
				);
				ventana.add(panel);
			}
		}
		return ventana;
	}

	// Ventana izquierda y derecha en la fachada frontal (z = +10)
	const ventanaIzq = crearVentana(6, 6);
	ventanaIzq.position.set(-9, 1.5, 10);
	planta1.add(ventanaIzq);

	const ventanaDer = crearVentana(6, 6);
	ventanaDer.position.set(9, 1.5, 10);
	planta1.add(ventanaDer);

	//Puerta
	const puerta = new THREE.Mesh(
		new THREE.BoxGeometry(6, 10, 0.4),
		new THREE.MeshToonMaterial( { color: 0x7B4A2A } )
	);
	// El suelo del bloque está en y = -7.5, así que la puerta (alto 10) se centra en y = -2.5
	puerta.position.set(0, -2.5, 10);
	planta1.add(puerta);

	// Pomo de la puerta (opcional)
	const pomo = new THREE.Mesh(
		new THREE.SphereGeometry(0.4, 16, 16),
		new THREE.MeshToonMaterial( { color: 0xFFD700 } )
	);
	pomo.position.set(2, -3, 10.4);
	planta1.add(pomo);

	scene.add(planta1);

	// Luces: sube un poco la ambiente para que la banda oscura no sea negra
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));

	const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.0);
	luzDireccional.position.set(10, 20, 15);
	scene.add(luzDireccional);


}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}