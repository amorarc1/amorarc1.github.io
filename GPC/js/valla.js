// Valla del parque (un tramo entre dos postes)
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

  const objeto = crearVallaTramo();
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

function crearVallaTramo()
{
  const alturaValla = 50;
  const radioPoste = 2.6, radioBarra = 1.1, radioPincho = 0.8, radioCono = 1.5;
  const alturaPunta = 7;
  const separacionPinchos = 9;
  const seccionValla = 70;
  const alturasBarras = [alturaValla * 0.2, alturaValla * 0.62];

  let valla = new THREE.Object3D();
  const material = mat(0x8a8f98, { metalness: 0.8, roughness: 0.4 });

  function pieza(geometria, x, y, z) {
    const malla = new THREE.Mesh(geometria, material);
    malla.position.set(x, y, z);
    valla.add(malla);
    return malla;
  }

  // Cilindro vertical con la base en yBase (radioArriba = 0 lo convierte en un cono con la punta hacia arriba)
  function vertical(x, yBase, z, radioArriba, radioAbajo, alto) {
    pieza(new THREE.CylinderGeometry(radioArriba, radioAbajo, alto, 8, 1), x, yBase + alto / 2, z);
  }

  // Cilindro horizontal entre dos puntos
  function barra(ax, ay, az, bx, by, bz) {
    const dir = new THREE.Vector3(bx - ax, by - ay, bz - az);
    const largo = dir.length();
    const malla = pieza(new THREE.CylinderGeometry(radioBarra, radioBarra, largo, 8, 1), (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    malla.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  }

  // Postes en los dos extremos
  vertical(0, 0, 0, radioPoste, radioPoste, alturaValla + 6);
  vertical(seccionValla, 0, 0, radioPoste, radioPoste, alturaValla + 6);

  // Dos barras
  alturasBarras.forEach(function (h) { barra(0, h, 0, seccionValla, h, 0); });

  // Pinchos: varilla + punta cónica
  const n = Math.max(1, Math.round(seccionValla / separacionPinchos));
  for (let i = 0; i < n; i++) {
    const x = seccionValla * (i + 0.5) / n;
    vertical(x, 0, 0, radioPincho, radioPincho, alturaValla - alturaPunta);
    vertical(x, alturaValla - alturaPunta, 0, 0, radioCono, alturaPunta);
  }

  return valla;
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
