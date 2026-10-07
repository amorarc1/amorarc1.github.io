/*
 * Seminario practico: Tron Battle Grid
 *
 * Punto de partida copiado de js/base-sample.js (usado por ej-base.html).
 * Se han dejado tambien disponibles GLTFLoader y FBXLoader siguiendo
 * js/ej-loader.js y js/ej-loader-FBX.js, pero aqui no se carga ningun modelo:
 * esa parte se construira durante el seminario.
 */

// Variables globales basicas de cualquier ejemplo Three.js del curso.
var renderer, scene, camera;
var cameraControls;

//1-escenario
const largo_arena=100;
const alto_pared=20;

// 2-light cycle 
var pos_cycle = new THREE.Vector3(0, 0, 0); 
var light_cycle = null;

// Nos servira mas adelante si incorporamos modelos animados.
var mixer = null;
var clock = new THREE.Clock();

init();
loadScene();
render();

function init()
{
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0x000000));
  document.getElementById('container').appendChild(renderer.domElement);

  scene = new THREE.Scene();

  // Iluminacion basica incluida en la plantilla.
  var luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(luzAmbiente);

  var luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
  luzDireccional.position.set(30, 50, 20);
  scene.add(luzDireccional);

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000);
  camera.position.set(10, 10, 10);

  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 0, 0);

  window.addEventListener('resize', updateAspectRatio);
}

function loadLightCycle() 
{
  var loader = new THREE. GLTFLoader();
  loader. load('models/tron/scene.gltf', 
    function(gltf) {
      light_cycle = gltf.scene;
      light_cycle.position.copy(pos_cycle);
      light_cycle.scale.set(0.5, 0.5, 0.5);
      scene.add(light_cycle);
    },
    undefined,
    function(error) {
        console.error('No se pudo cargar el light cycle', error);
      }
    );
  }

function loadScene()
{
  // TODO: construir aqui el escenario, las motos y las luces.
  // Para cargar modelos podremos crear:
  //   var loaderGLTF = new THREE.GLTFLoader();
  //   var loaderFBX = new THREE.FBXLoader();

  

  const arena = new THREE.Object3D();

  const geometry_arena = new THREE.CylinderGeometry( largo_arena, largo_arena-10, alto_pared, 32, 1, true );
  const material_arena = new THREE.MeshBasicMaterial( { color: 0xffff00, side:THREE.DoubleSide  });
  const cylinder_arena = new THREE.Mesh( geometry_arena, material_arena );
  cylinder_arena.position.y = alto_pared/2;
  arena.add( cylinder_arena );

  // 1. Añadir el piso a la escena 
  const geometriaPiso = new THREE.PlaneGeometry(1000, 1000, 10, 10); 
  const material_piso = new THREE.MeshBasicMaterial( { color: 0xd0d4d8, side:THREE.DoubleSide } );
  const piso = new THREE.Mesh(geometriaPiso,material_piso); 
  piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ; 
  scene.add(piso);

  const geometry_cilindro_arena = new THREE.CylinderGeometry( 10, 10, alto_pared, 32 );
  const material_cilindro_arena = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  const cylinder_arena_ext = new THREE.Mesh( geometry_cilindro_arena, material_cilindro_arena );
  cylinder_arena_ext.position.x = (largo_arena+10)*Math.cos(Math.PI/4);
  cylinder_arena_ext.position.y = alto_pared/2;
  cylinder_arena_ext.position.z = (largo_arena+10)*Math.sin(Math.PI/4);
  arena.add( cylinder_arena_ext );

  scene.add(arena);

  // Focos: circulo con seno y coseno.
  var geometriaFoco = new THREE.BoxGeometry(1.6, 0.5, 0.8);
  var materialFoco = new THREE.MeshBasicMaterial({ color: 0xccffff });
  var radioFocos = largo_arena-1.6;
  var alturaFocos = alto_pared + 0.25;

  for (var grados = 0; grados < 360; grados += 15) {
    var a = THREE.MathUtils.degToRad(grados);
    var foco = new THREE.Mesh(geometriaFoco, materialFoco);
    foco.position.set(
      Math.cos(a) * radioFocos,
      alturaFocos,
      Math.sin(a) * radioFocos
    );
    foco.lookAt(0, alturaFocos, 0);
    scene.add(foco);
  }

  loadLightCycle();




}

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.set(largo_arena / 2 + 10,45,largo_arena / 2 + 10);
  cameraControls.target.set(0, 4, 0);
  cameraControls. enableKeys = false;
}




function update()
{
  if (light_cycle==null)
    return;
  cameraControls.update();

  // Preparado para una posible animacion FBX, sin resolverla en la plantilla.
  var delta = clock.getDelta();
  if (mixer !== null) mixer.update(delta);
}

function render()
{
  requestAnimationFrame(render);
  update();
  renderer.render(scene, camera);
}
