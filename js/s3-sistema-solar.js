

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
  camera.position.set( 10, 20, 30 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene() {
  sol = new THREE.Mesh(new THREE.SphereGeometry( 3, 15, 15 ), new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe:true }));
  scene.add( sol );
  tierra = new THREE.Mesh(new THREE.SphereGeometry( 1, 15, 15 ), new THREE.MeshBasicMaterial( { color: 0xff0fa0, wireframe:true }));
  scene.add( tierra);
  luna = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 15, 15 ), new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe:true }));
  scene.add(luna);

  
  scene.add( new THREE.AxesHelper(15 ) );

}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var time = 0;
function update()
{
    time += 0.01;
    // Cambios para actualizar la camara segun mvto del raton
    cameraControls.update();

     // Crear la matriz de rotación
    let Rz = new THREE.Matrix4();
    Rz.makeRotationZ(time);  
    let Rx = new THREE.Matrix4();
    Rx.makeRotationX(time);  
    let Ry = new THREE.Matrix4();
    Ry.makeRotationY(time);  

    


     // M = I x Rx = Rx
    


    // Combinar todas las transformaciones
    let M = new THREE.Matrix4();
    sol.matrix.identity();  // Limpiar la matriz actual
    sol.applyMatrix4(M);    // Aplicar la matriz de transformación combinada
    sol.matrixAutoUpdate = false;  // Desactivar la actualización automática de la matriz


    M = new THREE.Matrix4();
    let T = new THREE.Matrix4();
    T.makeTranslation( 0,0,15);
    M.multiply(Ry);
    M.multiply(T); 
    M.multiply(Ry);

    tierra.matrix.identity(); 
    tierra.applyMatrix4(M);  
    tierra.matrixAutoUpdate = false; 

    let M2 = new THREE.Matrix4();
    
    M2 = new THREE.Matrix4();
    let T2 = new THREE.Matrix4();
    let T3 = new THREE.Matrix4();
    T2.makeTranslation( 0,0, 3);
    T3.makeTranslation( 0,0, 15);
    M2.multiply(Ry);
    M2.multiply(T3); 
    M2.multiply(Ry);
    M2.multiply(T2); 

    luna.matrix.identity();
    luna.applyMatrix4(M2);
    luna.matrixAutoUpdate = false;


  
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}