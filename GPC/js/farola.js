// Farola
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

  const objeto = crearFarola();
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

function crearFarola()
{
  const escalaFarola = 4;
  const factorAlturaFarola = 2.2;
  let farola = new THREE.Object3D();

  const materialMetal = mat(0x8a8f98, { metalness: 0.8, roughness: 0.4 });
  const materialBombilla = mat(0xFFF2A0, { emissive: 0xFFD84D, emissiveIntensity: 0.5 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 1, 16), materialMetal);
  base.position.y = 0.5;
  farola.add(base);

  const alturaPoste = 9 * factorAlturaFarola;
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, alturaPoste, 16), materialMetal);
  poste.position.y = 1 + alturaPoste / 2;
  farola.add(poste);

  const bombilla = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 16), materialBombilla);
  bombilla.position.y = 1 + alturaPoste + 0.6;
  farola.add(bombilla);

  farola.scale.set(escalaFarola, escalaFarola, escalaFarola);
  return farola;
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
