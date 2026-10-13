// Edificio (3 plantas)
// Archivo independiente: necesita un <div id="container"> y three.js con OrbitControls.

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;

// Materiales compartidos por todas las plantas del edificio
// (van arriba del todo porque loadScene() se ejecuta antes que el resto del archivo)
const metalEdificio = mat(0x8a8f98, { metalness: 0.8, roughness: 0.4 });
const cristalEdificio = mat(0x9fd3e6, { metalness: 0.6, roughness: 0.1 });
const ladrilloEdificio = mat(0xB5523B);
const puertaEdificio = mat(0x6B4226);
const pomoEdificio = mat(0xC9A227, { metalness: 0.8, roughness: 0.3 });

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

  const objeto = crearEdificio();
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

function crearVentana(ancho, alto, columnas, filas, grosorMarco)
{
  let ventana = new THREE.Object3D();

  ventana.add(new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, 0.4), metalEdificio));

  const anchoPanel = (ancho - (columnas + 1) * grosorMarco) / columnas;
  const altoPanel = (alto - (filas + 1) * grosorMarco) / filas;
  const geoPanel = new THREE.BoxGeometry(anchoPanel, altoPanel, 0.2);

  for (let i = 0; i < columnas; i++) {
    for (let j = 0; j < filas; j++) {
      const panel = new THREE.Mesh(geoPanel, cristalEdificio);
      panel.position.set(
        -ancho / 2 + grosorMarco + anchoPanel / 2 + i * (anchoPanel + grosorMarco),
        -alto / 2 + grosorMarco + altoPanel / 2 + j * (altoPanel + grosorMarco),
        0.2
      );
      ventana.add(panel);
    }
  }
  return ventana;
}

function crearBarra(p1, p2, g, material)
{
  const tam = [
    p2[0] - p1[0] === 0 ? g : Math.abs(p2[0] - p1[0]),
    p2[1] - p1[1] === 0 ? g : Math.abs(p2[1] - p1[1]),
    p2[2] - p1[2] === 0 ? g : Math.abs(p2[2] - p1[2])
  ];
  const barra = new THREE.Mesh(new THREE.BoxGeometry(tam[0], tam[1], tam[2]), material);
  barra.position.set((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2);
  return barra;
}

function crearBalcon()
{
  let balcon = new THREE.Object3D();
  const g = 0.25;

  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 2), metalEdificio);
  base.position.set(4, -1, 1);
  balcon.add(base);

  [g / 2, 5 - g / 2].forEach(function (y) {
    balcon.add(crearBarra([0, y, 0], [0, y, 2], g, metalEdificio));
    balcon.add(crearBarra([0, y, 2], [8, y, 2], g, metalEdificio));
    balcon.add(crearBarra([8, y, 2], [8, y, 0], g, metalEdificio));
  });

  [[0, 0], [0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [8, 0]].forEach(function (p) {
    balcon.add(crearBarra([p[0], 0, p[1]], [p[0], 5, p[1]], g, metalEdificio));
  });
  return balcon;
}

function crearPlanta1()
{
  let planta = new THREE.Object3D();
  planta.add(new THREE.Mesh(new THREE.BoxGeometry(30, 15, 20), ladrilloEdificio));

  [-9, 9].forEach(function (x) {
    const v = crearVentana(6, 6, 2, 2, 0.5);
    v.position.set(x, 1.5, 10);
    planta.add(v);
  });

  const puerta = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 0.4), puertaEdificio);
  puerta.position.set(0, -2.5, 10);
  planta.add(puerta);

  const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), pomoEdificio);
  pomo.position.set(2, -3, 10.4);
  planta.add(pomo);
  return planta;
}

function crearPlanta2()
{
  let planta = new THREE.Object3D();
  planta.add(new THREE.Mesh(new THREE.BoxGeometry(30, 15, 20), ladrilloEdificio));

  [-8, 8].forEach(function (x) {
    const v = crearVentana(4, 8, 2, 3, 0.4);
    v.position.set(x, 1.5, 10);
    planta.add(v);

    const b = crearBalcon();
    b.position.set(x - 4, -2.5, 10);
    planta.add(b);
  });
  return planta;
}

function crearPlanta3()
{
  let planta = new THREE.Object3D();
  const naranja = mat(0xE8892B);

  planta.add(new THREE.Mesh(new THREE.BoxGeometry(30, 15, 20), ladrilloEdificio));

  [-8, 8].forEach(function (x) {
    const v = crearVentana(4, 8, 2, 3, 0.4);
    v.position.set(x, 1.5, 10);
    planta.add(v);

    const b = crearBalcon();
    b.position.set(x - 4, -2.5, 10);
    planta.add(b);
  });

  // Azotea
  const yTecho = 7.5, grosorSuelo = 0.4;
  const ySuelo = yTecho + grosorSuelo;

  const suelo = new THREE.Mesh(new THREE.BoxGeometry(30, grosorSuelo, 20), naranja);
  suelo.position.set(0, yTecho + grosorSuelo / 2, 0);
  planta.add(suelo);

  const altoBarrera = 1.5, gb = 0.5;
  const yBarrera = ySuelo + altoBarrera / 2;
  [
    [30, gb, 0, 10 - gb / 2],
    [30, gb, 0, -10 + gb / 2],
    [gb, 20 - 2 * gb, -15 + gb / 2, 0],
    [gb, 20 - 2 * gb, 15 - gb / 2, 0]
  ].forEach(function (d) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(d[0], altoBarrera, d[0] === 30 ? gb : d[1]), naranja);
    b.position.set(d[2], yBarrera, d[3]);
    planta.add(b);
  });

  // Cubo con puerta
  const lado = 15 * 2 / 3;
  const cubo = new THREE.Mesh(new THREE.BoxGeometry(lado, lado, lado), ladrilloEdificio);
  cubo.position.set(-8, ySuelo + lado / 2, -4.5);
  planta.add(cubo);

  const zFrenteCubo = -4.5 + lado / 2;
  const puerta = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 0.4), puertaEdificio);
  puerta.position.set(-8, ySuelo + 3.5, zFrenteCubo + 0.2);
  planta.add(puerta);

  const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), pomoEdificio);
  pomo.position.set(-8 + 1.4, ySuelo + 3.3, zFrenteCubo + 0.5);
  planta.add(pomo);

  // Tendederos
  function crearTendedero(largo, alto) {
    const t = new THREE.Object3D();
    [-largo / 2, largo / 2].forEach(function (x) {
      const poste = new THREE.Mesh(new THREE.BoxGeometry(0.3, alto, 0.3), metalEdificio);
      poste.position.set(x, alto / 2, 0);
      t.add(poste);
    });
    const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, largo, 8), mat(0xEEEEEE));
    cuerda.rotation.z = Math.PI / 2;
    cuerda.position.set(0, alto - 0.2, 0);
    t.add(cuerda);
    return t;
  }
  const t1 = crearTendedero(9, 4); t1.position.set(8.5, ySuelo, -4); planta.add(t1);
  const t2 = crearTendedero(9, 4); t2.position.set(8.5, ySuelo, 3);  planta.add(t2);

  // Macetas
  function crearMaceta(escala) {
    const m = new THREE.Object3D();
    const tiesto = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.65, 1.4, 16), mat(0xB5502A));
    tiesto.position.y = 0.7;
    m.add(tiesto);
    const tierra = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16), mat(0x4A2F1B));
    tierra.position.y = 1.4;
    m.add(tierra);
    const matHojaPlanta = mat(0x3F8F3A);
    [[0, 2.3, 0, 0.9], [-0.5, 1.9, 0.2, 0.55], [0.5, 2.0, -0.2, 0.55]].forEach(function (h) {
      const hoja = new THREE.Mesh(new THREE.SphereGeometry(h[3], 12, 12), matHojaPlanta);
      hoja.position.set(h[0], h[1], h[2]);
      m.add(hoja);
    });
    m.scale.set(escala, escala, escala);
    return m;
  }
  const m1 = crearMaceta(1);   m1.position.set(-12, ySuelo, 6); planta.add(m1);
  const m2 = crearMaceta(1.2); m2.position.set(-5, ySuelo, 7);  planta.add(m2);

  return planta;
}

function crearEdificio()
{
  const escalaEdificio = 5;
  let edificio = new THREE.Object3D();
  const p1 = crearPlanta1(); p1.position.y = 7.5;  edificio.add(p1);
  const p2 = crearPlanta2(); p2.position.y = 22.5; edificio.add(p2);
  const p3 = crearPlanta3(); p3.position.y = 37.5; edificio.add(p3);
  edificio.scale.set(escalaEdificio, escalaEdificio, escalaEdificio);
  return edificio;
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
