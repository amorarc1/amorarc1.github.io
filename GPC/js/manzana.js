// Manzana
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

  const objeto = crearManzana();
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

function crearManzana()
{
  let manzana = new THREE.Object3D();
  const radio = 13;

  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(radio, 24, 16), mat(0xC8242B));
  cuerpo.scale.set(1, 0.92, 1);
  manzana.add(cuerpo);

  const rabito = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 6, 8), mat(0x5B3A1E));
  rabito.position.set(0.8, radio * 0.92 + 1, 0);
  rabito.rotation.z = -0.2;
  manzana.add(rabito);

  const hoja = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), mat(0x3F8F3A));
  hoja.scale.set(1.7, 0.25, 0.8);
  hoja.position.set(5, radio * 0.92 + 3.5, 0);
  hoja.rotation.z = 0.35;
  manzana.add(hoja);

  return manzana;
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
