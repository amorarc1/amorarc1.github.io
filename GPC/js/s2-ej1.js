

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
  //bucle for i in range 7
  const a = 3.75;
  const b = 0.625;
  const c = 1.4375;
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.BoxGeometry(c, b, a);
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(i * c*0.5, (i + 1) * b, 0);
    scene.add( cube );
  }

    


    // Añadir el piso a la escena 
    let geometriaPiso = new THREE.PlaneGeometry(20, 20, 20, 20); 
    
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