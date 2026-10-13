// Banco
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

  const objeto = crearBanco();
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

function crearBanco()
{
  const escalaBanco = 6;
  const largoBanco = 14;
  let banco = new THREE.Object3D();

  const madera = mat(0xC9A27A);
  const maderaOscura = mat(0x9C7A5A);

  function crearTabla(ancho, alto, fondo, material) {
    return new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, fondo), material);
  }

  // Asiento
  for (let i = 0; i < 3; i++) {
    const tabla = crearTabla(largoBanco, 0.25, 0.7, madera);
    tabla.position.set(0, 1.8, -0.7 + i * 0.7);
    banco.add(tabla);
  }

  // Patas
  const xExtremo = largoBanco / 2 - 0.7;
  [-xExtremo, 0, xExtremo].forEach(function (x) {
    [-0.7, 0.7].forEach(function (z) {
      const pata = crearTabla(0.3, 1.8, 0.3, maderaOscura);
      pata.position.set(x, 0.9, z);
      banco.add(pata);
    });
  });

  // Soportes del respaldo
  [-xExtremo, 0, xExtremo].forEach(function (x) {
    const soporte = crearTabla(0.25, 2.5, 0.25, maderaOscura);
    soporte.position.set(x, 3, -0.9);
    banco.add(soporte);
  });

  // Respaldo
  for (let i = 0; i < 3; i++) {
    const tablaRespaldo = crearTabla(largoBanco - 0.2, 0.5, 0.25, madera);
    tablaRespaldo.position.set(0, 2.5 + i * 0.8, -0.9);
    banco.add(tablaRespaldo);
  }

  banco.scale.set(escalaBanco, escalaBanco, escalaBanco);
  return banco;
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
