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
	let planta2 = new THREE.Object3D();

	//Bloque rectangular
	const geometry = new THREE.BoxGeometry( 30, 15, 20 );
	const material = new THREE.MeshToonMaterial( { color: 0xF5B97A } );
	const bloque = new THREE.Mesh( geometry, material );
	bloque.position.set(0, 0, 0);
	planta2.add(bloque);

	//Ventanas (alargadas: columnas x filas de paneles)
	function crearVentana(ancho, alto, columnas, filas) {
		const ventana = new THREE.Object3D();
		const grosorMarco = 0.4;

		const materialMarco = new THREE.MeshToonMaterial( { color: 0x5A3A22 } );
		const materialCristal = new THREE.MeshToonMaterial( { color: 0x9FD8F0 } );

		// Marco (fondo de la ventana)
		const marco = new THREE.Mesh(
			new THREE.BoxGeometry(ancho, alto, 0.4),
			materialMarco
		);
		ventana.add(marco);

		// Tamaño de cada panel
		const anchoPanel = (ancho - (columnas + 1) * grosorMarco) / columnas;
		const altoPanel  = (alto  - (filas + 1) * grosorMarco) / filas;
		const geoPanel = new THREE.BoxGeometry(anchoPanel, altoPanel, 0.2);

		for (let i = 0; i < columnas; i++) {
			for (let j = 0; j < filas; j++) {
				const panel = new THREE.Mesh(geoPanel, materialCristal);
				panel.position.set(
					-ancho / 2 + grosorMarco + anchoPanel / 2 + i * (anchoPanel + grosorMarco),
					-alto  / 2 + grosorMarco + altoPanel  / 2 + j * (altoPanel  + grosorMarco),
					0.2 // sobresale un poco del marco
				);
				ventana.add(panel);
			}
		}
		return ventana;
	}

	// Ventana izquierda y derecha en la fachada frontal (z = +10): 4 de ancho x 8 de alto
	const ventanaIzq = crearVentana(4, 8, 2, 3);
	ventanaIzq.position.set(-8, 1.5, 10);
	planta2.add(ventanaIzq);

	const ventanaDer = crearVentana(4, 8, 2, 3);
	ventanaDer.position.set(8, 1.5, 10);
	planta2.add(ventanaDer);

	//Balcones
	// Caja entre dos puntos alineados con un eje (p1 -> p2) y con grosor g
	function crearBarra(p1, p2, g, material) {
		const tam = [
			p2[0] - p1[0] === 0 ? g : Math.abs(p2[0] - p1[0]),
			p2[1] - p1[1] === 0 ? g : Math.abs(p2[1] - p1[1]),
			p2[2] - p1[2] === 0 ? g : Math.abs(p2[2] - p1[2])
		];
		const barra = new THREE.Mesh(
			new THREE.BoxGeometry(tam[0], tam[1], tam[2]),
			material
		);
		barra.position.set(
			(p1[0] + p2[0]) / 2,
			(p1[1] + p2[1]) / 2,
			(p1[2] + p2[2]) / 2
		);
		return barra;
	}

	// El origen (0,0,0) es la esquina de la parte de arriba de la base pegada a la pared
	function crearBalcon(escala) {
		const balcon = new THREE.Object3D();
		const g = 0.25; // grosor de barandilla y palos
		const matBase = new THREE.MeshToonMaterial( { color: 0xBBBBBB } );
		const matReja = new THREE.MeshToonMaterial( { color: 0x2B2B2B } );

		// Base: de (0,0,0) a (8,0,2) con altura 2 (hacia abajo desde el origen)
		const base = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 2), matBase);
		base.position.set(4, -1, 1);
		balcon.add(base);

		// Barandillas horizontales: abajo (y = 0) y arriba (y = 5)
		// Recorrido: (0,0,0) -> (0,0,2) -> (8,0,2) -> (8,0,0)
		[g / 2, 5 - g / 2].forEach(y => {
			balcon.add(crearBarra([0, y, 0], [0, y, 2], g, matReja));
			balcon.add(crearBarra([0, y, 2], [8, y, 2], g, matReja));
			balcon.add(crearBarra([8, y, 2], [8, y, 0], g, matReja));
		});

		// Palos verticales de y = 0 a y = 5
		const postes = [[0, 0], [0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [8, 0]];
		postes.forEach(([x, z]) => {
			balcon.add(crearBarra([x, 0, z], [x, 5, z], g, matReja));
		});

		balcon.scale.set(escala, escala, escala);
		return balcon;
	}

	// Un balcón delante de cada ventana (la base queda a y = -2.5 y pegada a la pared z = 10)
	const balconIzq = crearBalcon(1);
	balconIzq.position.set(-8 - 4, -2.5, 10); // -4 para centrarlo (mide 8 de ancho)
	planta2.add(balconIzq);

	const balconDer = crearBalcon(1);
	balconDer.position.set(8 - 4, -2.5, 10);
	planta2.add(balconDer);

	scene.add(planta2);

	// Luces
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