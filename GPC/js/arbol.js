// Árbol (roble y pino)
// Archivo independiente: necesita un <div id="container"> y three.js con OrbitControls.

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;

// Colores de las copas de los árboles
const coloresArbol = {
  roble: [0x4d8c3a, 0x5fa046, 0x3f7a30],
  pino:  [0x2f6b3a, 0x3a7d44]
};

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

  // Los dos tipos de árbol del juego, uno al lado del otro
  const arboles = new THREE.Object3D();
  const roble = crearArbol(110, 'roble');
  roble.position.x = -40;
  arboles.add(roble);
  const pino = crearArbol(110, 'pino');
  pino.position.x = 40;
  arboles.add(pino);

  scene.add(arboles);
  encuadrar(arboles);
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

function aBuffer(geometria)
{
  return geometria.isBufferGeometry ? geometria : new THREE.BufferGeometry().fromGeometry(geometria);
}

function azarFijo(n)
{
  var s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

// Irregulariza una geometría y la deja con caras planas ("low poly")
function geoBajaPoli(geometria, irregularidad, soloHorizontal)
{
  var g = aBuffer(geometria);
  if (g.index) g = g.toNonIndexed();
  var pos = g.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    var h = azarFijo(Math.round(x * 7) * 1.7 + Math.round(y * 7) * 3.1 + Math.round(z * 7) * 5.3);
    var k = 1 + (h - 0.5) * 2 * irregularidad;
    pos.setXYZ(i, x * k, soloHorizontal ? y : y * k, z * k);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function crearArbol(altura, tipo)
{
  const H = altura || 110;
  tipo = tipo || 'roble';
  let arbol = new THREE.Object3D();
  const matTronco = mat(0x9C7A5A);
  const colores = coloresArbol[tipo];

  function cilindro(rArriba, rAbajo, alto, x, y, z, giroZ) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rArriba, rAbajo, alto, 10, 1), matTronco);
    m.position.set(x, y, z);
    m.rotation.z = giroZ || 0;
    arbol.add(m);
  }

  if (tipo === 'pino') {
    // Tronco fino y cinco conos apilados; la punta queda a altura H
    cilindro(0.03 * H, 0.045 * H, 0.3 * H, 0, 0.15 * H, 0);
    [
      { radio: 0.30, alto: 0.30, base: 0.14 },
      { radio: 0.26, alto: 0.28, base: 0.30 },
      { radio: 0.21, alto: 0.26, base: 0.46 },
      { radio: 0.16, alto: 0.24, base: 0.62 },
      { radio: 0.10, alto: 0.24, base: 0.76 }
    ].forEach(function (c, i) {
      const cono = new THREE.Mesh(
        geoBajaPoli(new THREE.CylinderGeometry(0, c.radio * H, c.alto * H, 8, 1), 0.10, true),
        mat(colores[i % colores.length])
      );
      cono.position.y = (c.base + c.alto / 2) * H;
      arbol.add(cono);
    });
  } else {
    // Roble: tronco que se afina, dos ramas y una copa de bolas
    cilindro(0.035 * H, 0.055 * H, 0.46 * H, 0, 0.23 * H, 0);
    cilindro(0.012 * H, 0.02 * H, 0.22 * H, 0.06 * H, 0.47 * H, 0, -0.65);
    cilindro(0.012 * H, 0.02 * H, 0.22 * H, -0.06 * H, 0.47 * H, 0, 0.65);
    [
      [0.00, 0.68, 0.00, 0.27],
      [0.17, 0.60, 0.07, 0.19],
      [-0.16, 0.62, -0.08, 0.20],
      [0.04, 0.58, -0.18, 0.18],
      [-0.05, 0.60, 0.17, 0.19],
      [0.02, 0.88, 0.02, 0.17]
    ].forEach(function (b, i) {
      const bola = new THREE.Mesh(
        geoBajaPoli(new THREE.IcosahedronGeometry(b[3] * H, 1), 0.12, false),
        mat(colores[i % colores.length])
      );
      bola.position.set(b[0] * H, b[1] * H, b[2] * H);
      bola.scale.y = 0.85;
      arbol.add(bola);
    });
  }

  return arbol;
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
