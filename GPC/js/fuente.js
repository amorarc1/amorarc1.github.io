// Fuente
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

  const objeto = crearFuente(120);
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

function crearFuente(radioFuente)
{
  const k = radioFuente / 120;
  let fuente = new THREE.Object3D();

  const piedra = mat(0xd2cbbd, { side: THREE.DoubleSide });
  const agua = mat(0x4aa8e0, { emissive: 0x1d6fa5, emissiveIntensity: 0.35, transparent: true, opacity: 0.8, roughness: 0.15, metalness: 0.1 });
  const cortina = mat(0xbfe6ff, { emissive: 0x6fb8e6, emissiveIntensity: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });

  function anadir(geometria, material, y) {
    const m = new THREE.Mesh(geometria, material);
    m.position.y = y * k;
    fuente.add(m);
    return m;
  }
  function torno(perfil) {
    return new THREE.LatheGeometry(perfil.map(function (q) { return new THREE.Vector2(q[0] * k, q[1] * k); }), 48);
  }
  function cil(rArriba, rAbajo, alto, abierto) {
    return new THREE.CylinderGeometry(rArriba * k, rAbajo * k, alto * k, 48, 1, !!abierto);
  }

  // Pila exterior
  anadir(torno([[0, 2], [108, 2], [108, 16], [120, 16], [120, 0]]), piedra, 0);
  const borde = anadir(new THREE.TorusGeometry(114 * k, 4 * k, 8, 64), piedra, 16);
  borde.rotation.x = Math.PI / 2;
  anadir(cil(106, 106, 0.8), agua, 13);

  // Pedestal
  anadir(cil(16, 24, 38), piedra, 21);

  // Copa inferior y cascada
  anadir(torno([[0, 36], [14, 37], [34, 42], [50, 52], [56, 62], [52, 62], [46, 53], [30, 46], [0, 44]]), piedra, 0);
  anadir(cil(48, 48, 0.8), agua, 57);
  anadir(cil(55.5, 58, 49, true), cortina, 37.5);

  // Columna, copa superior y cascada
  anadir(cil(7, 10, 34), piedra, 61);
  anadir(torno([[0, 74], [8, 75], [20, 80], [30, 88], [27, 88], [18, 82], [7, 78], [0, 78]]), piedra, 0);
  anadir(cil(22, 22, 0.8), agua, 85);
  anadir(cil(30.5, 34, 31, true), cortina, 72.5);

  // Chorro
  anadir(new THREE.CylinderGeometry(1.2 * k, 3.2 * k, 26 * k, 12, 1, true), cortina, 101);
  anadir(new THREE.SphereGeometry(3.5 * k, 12, 8), agua, 115);

  return fuente;
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
