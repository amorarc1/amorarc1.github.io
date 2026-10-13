// Pizza (trozo)
// Archivo independiente: necesita un <div id="container"> y three.js con OrbitControls.

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;

// 1-inicializa
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xBFE3F5) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.5, 6000 );
  camera.position.set( 40, 25, 60 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}

function loadScene()
{
  // Luces
  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(luzAmbiente);

  const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
  luzDireccional.position.set(200, 400, 300);
  scene.add(luzDireccional);

  const objeto = crearPizza();
  scene.add(objeto);
  encuadrar(objeto);
}

// Apoya el objeto en y = 0, lo centra en X y Z y coloca la cámara para verlo entero
function encuadrar(objeto)
{
  objeto.updateMatrixWorld(true);
  var caja = new THREE.Box3().setFromObject(objeto);
  var centro = caja.getCenter(new THREE.Vector3());
  objeto.position.x -= centro.x;
  objeto.position.y -= caja.min.y;
  objeto.position.z -= centro.z;
  objeto.updateMatrixWorld(true);

  caja.setFromObject(objeto);
  centro = caja.getCenter(new THREE.Vector3());
  var tam = caja.getSize(new THREE.Vector3());
  var distancia = Math.max(tam.x, tam.y, tam.z) * 2.2;

  cameraControls.target.copy(centro);
  camera.position.set(centro.x + distancia * 0.5, centro.y + distancia * 0.4, centro.z + distancia);
  cameraControls.update();
}

// Material de color liso (en el juego llevan textura; aquí solo color)
function mat(color, extra)
{
  var parametros = { color: color };
  for (var k in extra) parametros[k] = extra[k];
  return new THREE.MeshStandardMaterial(parametros);
}

function crearPizza()
{
  let trozo_pizza = new THREE.Object3D();

  const arco = Math.PI / 3;   // 60° (capas)
  const radio = 14;
  const grosor = 2.5;
  const alturaCapa = 0.8;

  const inicio = -arco / 2;
  const fin = arco / 2;

  // Ángulos de la corteza: 5° menos por cada lado
  const recorte = 5 * Math.PI / 180;
  const arcoCorteza = arco - 2 * recorte;
  const inicioCorteza = inicio + recorte;
  const finCorteza = fin - recorte;

  // Corteza (torus)
  const geometry = new THREE.TorusGeometry(radio, grosor, 16, 100, arcoCorteza);
  const materialBorde = mat(0xF5B97A, { side: THREE.DoubleSide });
  const torus = new THREE.Mesh(geometry, materialBorde);
  torus.rotation.z = inicioCorteza;
  trozo_pizza.add(torus);

  // Forma de las capas: sector circular
  const formaCapa = new THREE.Shape();
  formaCapa.moveTo(0, 0);
  formaCapa.lineTo(radio * Math.cos(inicio), radio * Math.sin(inicio));
  formaCapa.absarc(0, 0, radio, inicio, fin, false);
  formaCapa.lineTo(0, 0);

  function crearCapa(color, posicionZ) {
    const geometriaCapa = new THREE.ExtrudeGeometry(formaCapa, { depth: alturaCapa, bevelEnabled: false });
    const capa = new THREE.Mesh(geometriaCapa, mat(color, { side: THREE.DoubleSide }));
    capa.position.z = posicionZ;
    trozo_pizza.add(capa);
  }

  crearCapa(0xF5B97A, -1.2);  // masa
  crearCapa(0xB62400, -0.4);  // tomate
  crearCapa(0xFFE9A0, 0.4);   // queso

  // Tapas redondeadas de los extremos
  const geometriaMediaEsfera = new THREE.SphereGeometry(grosor, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);

  const mediaEsferaInicial = new THREE.Mesh(geometriaMediaEsfera, materialBorde);
  mediaEsferaInicial.position.set(radio * Math.cos(inicioCorteza), radio * Math.sin(inicioCorteza), 0);
  mediaEsferaInicial.rotation.z = Math.PI + inicioCorteza;
  trozo_pizza.add(mediaEsferaInicial);

  const mediaEsferaFinal = new THREE.Mesh(geometriaMediaEsfera, materialBorde);
  mediaEsferaFinal.position.set(radio * Math.cos(finCorteza), radio * Math.sin(finCorteza), 0);
  mediaEsferaFinal.rotation.z = finCorteza;
  trozo_pizza.add(mediaEsferaFinal);

  // Ingredientes
  const escalaX = radio / 10 * 0.85;
  const escalaY = radio / 10 * 1.5;

  const posicionesCilindros = [[3.2, 0.2], [5.1, -0.8], [6.2, 0.9], [7.4, -1.5], [8.6, 0.6]];
  const geometriaCilindro = new THREE.CylinderGeometry(0.6, 0.6, 0.18, 16);
  const materialCilindro = mat(0xB63010);

  posicionesCilindros.forEach(function (posicion) {
    const cilindro = new THREE.Mesh(geometriaCilindro, materialCilindro);
    cilindro.position.set(posicion[0] * escalaX, posicion[1] * escalaY, 1.29);
    cilindro.rotation.x = Math.PI / 2;
    trozo_pizza.add(cilindro);
  });

  const posicionesPuntosVerdes = [[2.1, 0.1], [4.1, 1.1], [5.2, -1.6], [6.9, 1.4], [7.8, -0.4]];
  const geometriaPuntoVerde = new THREE.SphereGeometry(0.25, 12, 8);
  const materialPuntoVerde = mat(0x245A20);

  posicionesPuntosVerdes.forEach(function (posicion) {
    const puntoVerde = new THREE.Mesh(geometriaPuntoVerde, materialPuntoVerde);
    puntoVerde.position.set(posicion[0] * escalaX, posicion[1] * escalaY, 1.4);
    trozo_pizza.add(puntoVerde);
  });

  return trozo_pizza;
}
function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  cameraControls.update();
}

function render()
{
  requestAnimationFrame( render );
  update();
  renderer.render( scene, camera );
}
