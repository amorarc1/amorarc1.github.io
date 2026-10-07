

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
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 1, 1.5, 2 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
  // Instancia la geometría
  var geometry = new THREE.BufferGeometry();

  // Cuatro vértices por cara, con coordenadas entre -1 y 1
  var vertices = new Float32Array([
    // Cara frontal
    -1, -1,  1,   
    1, -1,  1,  
     1,  1, 1,  
     -1,  1,  1,
    // Cara trasera
     1, -1, -1,  
     -1, -1, -1,  
     -1,  1, -1,  
      1,  1, -1,
    // Cara izquierda
    -1, -1, -1,  
    -1, -1,  1,  
    -1,  1,  1,  
    -1,  1, -1,
    // Cara derecha
     1, -1,  1,  
      1, -1, -1,   
      1,  1, -1,  
       1,  1,  1,
    // Cara superior
    -1,  1,  1,  
     1, 1,  1,  
      1,  1, -1,  
      -1,  1, -1,
    // Cara inferior
    -1, -1, -1,   
    1, -1, -1,   
    1, -1,  1,  
    -1, -1,  1
  ]);

  // Añadir los vértices al objeto de geometría
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  // Dos triángulos forman cada una de las seis caras
  var indices = [
    0, 1, 2,  0, 2, 3,
    4, 5, 6,  4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ];
  geometry.setIndex(indices);

  // Un color para cada cara, repetido en sus cuatro vértices
  var colors = new Float32Array([
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    1, 1, 0,  1, 1, 0,  1, 1, 0,  1, 1, 0,
    1, 0, 1,  1, 0, 1,  1, 0, 1,  1, 0, 1,
    0, 1, 1,  0, 1, 1,  0, 1, 1,  0, 1, 1
  ]);

  // Añadir los colores al objeto de geometría
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Crear el material de la malla que soporta colores por vértice
  var material = new THREE.MeshBasicMaterial({
      vertexColors: true // Habilitar colores por vértice
  });

  /* ejemplo con normales
    material = new THREE.MeshNormalMaterial();
    // Calcula las normales de los vértices para iluminación correcta
    geometry.computeVertexNormals(); 
    */


  // Crear el objeto malla
  var malla = new THREE.Mesh(geometry, material);
  scene.add(malla);

    // Crear el helper de ejes
    var axesHelper = new THREE.AxesHelper(0.5); // El parámetro es el tamaño de los ejes
    scene.add(axesHelper);

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