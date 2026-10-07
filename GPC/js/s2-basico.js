

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
  renderer = new THREE.WebGLRenderer(); // Crea el renderizador WebGL
  renderer.setSize( window.innerWidth, window.innerHeight ); // Ajusta el tamaño del renderizador al tamaño de la ventana
  renderer.setClearColor( new THREE.Color(0xFFFFFF) ); // Color de fondo del renderizador
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 20, 20, 20 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 5, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
	// Añade el objeto grafico a la escena
  let material = new THREE.MeshNormalMaterial();
    flecha = new THREE.Object3D();
    let geometriaCilindro = new THREE.CylinderGeometry(1, 1, 10, 32); 
    let cilindro = new THREE.Mesh(geometriaCilindro, material); 
    cilindro.position.y = 5; // Posicionar el cilindro sobre el origen 
    flecha.add(cilindro); // Añadir el cilindro al nodo flecha 
    let geometriaCono = new THREE.ConeGeometry(2, 4, 32); 
    let cono = new THREE.Mesh(geometriaCono, material); 
    cono.position.y = 10; // Posicionar el cono en la parte superior del cilindro 
    flecha.add(cono); // Añadir el cono al nodo flech
    scene.add(flecha);

    // Añadir el piso a la escena 
    let geometriaPiso = new THREE.PlaneGeometry(10, 10, 10, 10); 
    
    let piso = new THREE.Mesh(geometriaPiso,material); 
    piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ; 
    scene.add(piso);
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