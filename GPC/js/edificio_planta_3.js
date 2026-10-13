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
	let planta3 = new THREE.Object3D();

	// ===== GRADIENT MAP (toon) =====
	const tonos = new Uint8Array([100, 180, 255]);
	const gradientMap = new THREE.DataTexture(tonos, tonos.length, 1, THREE.RedFormat);
	gradientMap.minFilter = THREE.NearestFilter;
	gradientMap.magFilter = THREE.NearestFilter;
	gradientMap.needsUpdate = true;

	const toon = (color) => new THREE.MeshToonMaterial( { color: color, gradientMap: gradientMap } );

	// ===== MATERIALES =====
	const materialPared = toon(0xF5B97A);   // pared lisa, sin textura
	const naranja = toon(0xE8892B);

	// ===== BLOQUE =====
	const bloque = new THREE.Mesh( new THREE.BoxGeometry( 30, 15, 20 ), materialPared );
	planta3.add(bloque);

	// ===== VENTANAS (iguales que la planta 2) =====
	function crearVentana(ancho, alto, columnas, filas) {
		const ventana = new THREE.Object3D();
		const grosorMarco = 0.4;

		const materialMarco = toon(0x5A3A22);
		const materialCristal = toon(0x9FD8F0);

		const marco = new THREE.Mesh( new THREE.BoxGeometry(ancho, alto, 0.4), materialMarco );
		ventana.add(marco);

		const anchoPanel = (ancho - (columnas + 1) * grosorMarco) / columnas;
		const altoPanel  = (alto  - (filas + 1) * grosorMarco) / filas;
		const geoPanel = new THREE.BoxGeometry(anchoPanel, altoPanel, 0.2);

		for (let i = 0; i < columnas; i++) {
			for (let j = 0; j < filas; j++) {
				const panel = new THREE.Mesh(geoPanel, materialCristal);
				panel.position.set(
					-ancho / 2 + grosorMarco + anchoPanel / 2 + i * (anchoPanel + grosorMarco),
					-alto  / 2 + grosorMarco + altoPanel  / 2 + j * (altoPanel  + grosorMarco),
					0.2
				);
				ventana.add(panel);
			}
		}
		return ventana;
	}

	const ventanaIzq = crearVentana(4, 8, 2, 3);
	ventanaIzq.position.set(-8, 1.5, 10);
	planta3.add(ventanaIzq);

	const ventanaDer = crearVentana(4, 8, 2, 3);
	ventanaDer.position.set(8, 1.5, 10);
	planta3.add(ventanaDer);

	// ===== BALCONES =====
	// Caja entre dos puntos alineados con un eje (p1 -> p2) y con grosor g
	function crearBarra(p1, p2, g, material) {
		const tam = [
			p2[0] - p1[0] === 0 ? g : Math.abs(p2[0] - p1[0]),
			p2[1] - p1[1] === 0 ? g : Math.abs(p2[1] - p1[1]),
			p2[2] - p1[2] === 0 ? g : Math.abs(p2[2] - p1[2])
		];
		const barra = new THREE.Mesh( new THREE.BoxGeometry(tam[0], tam[1], tam[2]), material );
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
		const matBase = toon(0xBBBBBB);
		const matReja = toon(0x2B2B2B);

		// Base: de (0,0,0) a (8,0,2) con altura 2 (hacia abajo desde el origen)
		const base = new THREE.Mesh( new THREE.BoxGeometry(8, 2, 2), matBase );
		base.position.set(4, -1, 1);
		balcon.add(base);

		// Barandillas horizontales: abajo (y = 0) y arriba (y = 5)
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

	// Un balcón delante de cada ventana (base a y = -2.5, pegada a la pared z = 10)
	const balconIzq = crearBalcon(1);
	balconIzq.position.set(-8 - 4, -2.5, 10);
	planta3.add(balconIzq);

	const balconDer = crearBalcon(1);
	balconDer.position.set(8 - 4, -2.5, 10);
	planta3.add(balconDer);

	// ===== AZOTEA =====
	const yTecho = 7.5;
	const grosorSuelo = 0.4;
	const ySuelo = yTecho + grosorSuelo;

	// Suelo naranja
	const suelo = new THREE.Mesh( new THREE.BoxGeometry( 30, grosorSuelo, 20 ), naranja );
	suelo.position.set(0, yTecho + grosorSuelo / 2, 0);
	planta3.add(suelo);

	// Barreras (mismo color que el suelo)
	const altoBarrera = 1.5;
	const gb = 0.5;
	const yBarrera = ySuelo + altoBarrera / 2;

	const barreraFrente = new THREE.Mesh( new THREE.BoxGeometry( 30, altoBarrera, gb ), naranja );
	barreraFrente.position.set(0, yBarrera, 10 - gb / 2);
	planta3.add(barreraFrente);

	const barreraFondo = new THREE.Mesh( new THREE.BoxGeometry( 30, altoBarrera, gb ), naranja );
	barreraFondo.position.set(0, yBarrera, -10 + gb / 2);
	planta3.add(barreraFondo);

	const barreraIzq = new THREE.Mesh( new THREE.BoxGeometry( gb, altoBarrera, 20 - 2 * gb ), naranja );
	barreraIzq.position.set(-15 + gb / 2, yBarrera, 0);
	planta3.add(barreraIzq);

	const barreraDer = new THREE.Mesh( new THREE.BoxGeometry( gb, altoBarrera, 20 - 2 * gb ), naranja );
	barreraDer.position.set(15 - gb / 2, yBarrera, 0);
	planta3.add(barreraDer);

	// ===== CUBO CON PUERTA (lado = 2/3 de la altura de la planta = 10) =====
	const lado = 15 * 2 / 3;
	const cubo = new THREE.Mesh( new THREE.BoxGeometry( lado, lado, lado ), materialPared );
	cubo.position.set(-8, ySuelo + lado / 2, -4.5);
	planta3.add(cubo);

	const zFrenteCubo = -4.5 + lado / 2;

	const puerta = new THREE.Mesh( new THREE.BoxGeometry( 4, 7, 0.4 ), toon(0x7B4A2A) );
	puerta.position.set(-8, ySuelo + 3.5, zFrenteCubo + 0.2);
	planta3.add(puerta);

	const pomo = new THREE.Mesh( new THREE.SphereGeometry( 0.35, 16, 16 ), toon(0xFFD700) );
	pomo.position.set(-8 + 1.4, ySuelo + 3.3, zFrenteCubo + 0.5);
	planta3.add(pomo);

	// ===== TENDEDEROS =====
	function crearTendedero(largo, alto) {
		const tendedero = new THREE.Object3D();
		const matPoste = toon(0x555555);
		const matCuerda = toon(0xEEEEEE);

		[-largo / 2, largo / 2].forEach(x => {
			const poste = new THREE.Mesh( new THREE.BoxGeometry( 0.3, alto, 0.3 ), matPoste );
			poste.position.set(x, alto / 2, 0);
			tendedero.add(poste);
		});

		const cuerda = new THREE.Mesh( new THREE.CylinderGeometry( 0.05, 0.05, largo, 8 ), matCuerda );
		cuerda.rotation.z = Math.PI / 2;
		cuerda.position.set(0, alto - 0.2, 0);
		tendedero.add(cuerda);

		return tendedero;
	}

	const tendedero1 = crearTendedero(9, 4);
	tendedero1.position.set(8.5, ySuelo, -4);
	planta3.add(tendedero1);

	const tendedero2 = crearTendedero(9, 4);
	tendedero2.position.set(8.5, ySuelo, 3);
	planta3.add(tendedero2);

	// ===== PLANTAS EN MACETAS =====
	function crearMaceta(escala) {
		const maceta = new THREE.Object3D();

		const tiesto = new THREE.Mesh( new THREE.CylinderGeometry( 0.9, 0.65, 1.4, 16 ), toon(0xB5502A) );
		tiesto.position.y = 0.7;
		maceta.add(tiesto);

		const tierra = new THREE.Mesh( new THREE.CylinderGeometry( 0.8, 0.8, 0.1, 16 ), toon(0x4A2F1B) );
		tierra.position.y = 1.4;
		maceta.add(tierra);

		const matHoja = toon(0x3FA34D);
		[[0, 2.3, 0, 0.9], [-0.5, 1.9, 0.2, 0.55], [0.5, 2.0, -0.2, 0.55]].forEach(([x, y, z, r]) => {
			const hoja = new THREE.Mesh( new THREE.SphereGeometry( r, 12, 12 ), matHoja );
			hoja.position.set(x, y, z);
			maceta.add(hoja);
		});

		maceta.scale.set(escala, escala, escala);
		return maceta;
	}

	const maceta1 = crearMaceta(1);
	maceta1.position.set(-12, ySuelo, 6);
	planta3.add(maceta1);

	const maceta2 = crearMaceta(1.2);
	maceta2.position.set(-5, ySuelo, 7);
	planta3.add(maceta2);

	scene.add(planta3);

	// ===== LUCES =====
	scene.add(new THREE.AmbientLight(0xffffff, 0.3));

	const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.5);
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