

// Variables globales que van siempre
var renderer, scene, camera, cameraNormal;
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
  camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 3000);
  camera.position.set(500, 500, 500);

  cameraControls = new THREE.OrbitControls(
    camera,
    renderer.domElement
  );
  cameraControls.target.set(0, 5, 0);

  cameraNormal = new THREE.OrthographicCamera(
    -150, 150, 150, -150, 1, 1000
  );

  cameraNormal.position.set(0, 500, 0);
  cameraNormal.up.set(1, 0, 0);
  cameraNormal.lookAt(0, 0, 0);
  cameraControls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{

  const brazo = new THREE.Object3D();

  // 1. Añadir el piso a la escena 
  const geometriaPiso = new THREE.PlaneGeometry(1000, 1000, 10, 10); 
  const material_piso = new THREE.MeshBasicMaterial( { color: 0xd0d4d8, side: THREE.DoubleSide } );
  const piso = new THREE.Mesh(geometriaPiso,material_piso); 
  piso.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ; 
  scene.add(piso);

  const material_figura = new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } );

  const base = new THREE.Object3D();
	
  // 2. cilindro
  const geometry = new THREE.CylinderGeometry( 50, 50, 15, 32 );
  const cylinder_suelo = new THREE.Mesh( geometry, material_figura );
  cylinder_suelo.position.y = 7.5;
  base.add( cylinder_suelo );
  brazo.add( base );

  // 3. brazo -> cilindro, cubo alargado y esfera

  const brazo_superior = new THREE.Object3D();
  brazo_superior.position.y = 15;

  // 3.1 cilindro
  const geometry_cilindro_brazo= new THREE.CylinderGeometry( 20, 20, 18, 32 );
  const cylinder_brazo = new THREE.Mesh( geometry_cilindro_brazo, material_figura );
  cylinder_brazo.position.y = 0;
  cylinder_brazo.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
  brazo_superior.add( cylinder_brazo );

  // 3.2 cubo alargado
  const geometry_cubo_brazo = new THREE.BoxGeometry( 12, 120, 18 );
  const cube_brazo = new THREE.Mesh( geometry_cubo_brazo, material_figura );
  cube_brazo.position.y = 60;
  brazo_superior.add( cube_brazo );

  // 3.3 esfera
  const geometry_esfera_brazo = new THREE.SphereGeometry( 20, 32, 16 );
  const sphere_brazo = new THREE.Mesh( geometry_esfera_brazo, material_figura );
  sphere_brazo.position.y = 120;
  brazo_superior.add( sphere_brazo );

  // 4. antebrazo -> cilindro, cubos alargados, cilindro
  const antebrazo = new THREE.Object3D();
  antebrazo.position.y = 120;

  // 4. cilindro
  const geometry_cilindro_antebrazo= new THREE.CylinderGeometry( 22, 22, 6, 32 );
  const cylinder_antebrazo = new THREE.Mesh( geometry_cilindro_antebrazo, material_figura );
  cylinder_antebrazo.position.y = 0;
  antebrazo.add( cylinder_antebrazo );

  // 4.2 cubos alargado
  const a=8
  const geometry_cubo_antebrazo = new THREE.BoxGeometry( 4, 80, 4 );
  const cube_antebrazo_1 = new THREE.Mesh( geometry_cubo_antebrazo, material_figura );
  cube_antebrazo_1.position.y = 40;
  cube_antebrazo_1.position.x = a;
  cube_antebrazo_1.position.z = a;
  antebrazo.add( cube_antebrazo_1 );

  const cube_antebrazo_2 = new THREE.Mesh( geometry_cubo_antebrazo, material_figura );
  cube_antebrazo_2.position.y = 40;
  cube_antebrazo_2.position.x = a;
  cube_antebrazo_2.position.z = -a;
  antebrazo.add( cube_antebrazo_2 );

  const cube_antebrazo_3 = new THREE.Mesh( geometry_cubo_antebrazo, material_figura );
  cube_antebrazo_3.position.y = 40;
  cube_antebrazo_3.position.x = -a;
  cube_antebrazo_3.position.z = -a;
  antebrazo.add( cube_antebrazo_3 );

  const cube_antebrazo_4 = new THREE.Mesh( geometry_cubo_antebrazo, material_figura );
  cube_antebrazo_4.position.y = 40;
  cube_antebrazo_4.position.x = -a;
  cube_antebrazo_4.position.z = a;
  antebrazo.add( cube_antebrazo_4 );

  const mano = new THREE.Object3D();
  mano.position.y = 80;

  // 4.3 cilindro
  const geometry_cilindro_antebrazo_2= new THREE.CylinderGeometry( 15, 15, 40, 32 );
  const cylinder_antebrazo_2 = new THREE.Mesh( geometry_cilindro_antebrazo_2, material_figura );
  cylinder_antebrazo_2.position.y = 80;
  cylinder_antebrazo_2.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2) ;
  antebrazo.add( cylinder_antebrazo_2 );
  antebrazo.add( mano );
  brazo_superior.add( antebrazo );
  brazo.add( brazo_superior );

  const vertices_pinza = new Float32Array([
  0, 0, 0,    // v0
  0, 0, 4,    // v1
  20, 0, 0,   // v2
  20, 0, 4,   // v3
  0, 19, 0,   // v4
  0, 19, 4,   // v5
  20, 19, 0,  // v6
  20, 19, 4,  // v7
  2, 38, 0,   // v8
  18, 38, 0,  // v9
  2, 38, 2,   // v10
  18, 38, 2,  // v11
]);

const indices_pinza = [
  0, 2, 3,   0, 3, 1,
  8, 10, 11,  8, 11, 9,
  0, 4, 8,   0, 8, 9,   0, 9, 6,   0, 6, 2,
  1, 3, 7,   1, 7, 5,
  5, 7, 11,  5, 11, 10,
  0, 1, 5,   0, 5, 4,
  4, 5, 10,  4, 10, 8,
  2, 7, 3,   2, 6, 7,
  6, 11, 7,  6, 9, 11,
];

const geometry_cubo_pinza_buffer_1 = new THREE.BufferGeometry();
geometry_cubo_pinza_buffer_1.setAttribute('position', new THREE.BufferAttribute(vertices_pinza, 3));
geometry_cubo_pinza_buffer_1.setIndex(indices_pinza);
geometry_cubo_pinza_buffer_1.computeVertexNormals();

const mitad_pinza_1 = new THREE.Mesh(geometry_cubo_pinza_buffer_1, material_figura);
mitad_pinza_1.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI/2) ;
mitad_pinza_1.position.y = 10;
mitad_pinza_1.position.x = 0;
mitad_pinza_1.position.z = 6;
mano.add(mitad_pinza_1);

const geometry_cubo_pinza_buffer_2 = new THREE.BufferGeometry();
geometry_cubo_pinza_buffer_2.setAttribute('position', new THREE.BufferAttribute(vertices_pinza, 3));
geometry_cubo_pinza_buffer_2.setIndex(indices_pinza);
geometry_cubo_pinza_buffer_2.computeVertexNormals();

const mitad_pinza_2 = new THREE.Mesh(geometry_cubo_pinza_buffer_2, material_figura);
mitad_pinza_2.scale.z = -1;
mitad_pinza_2.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI/2) ;
mitad_pinza_2.position.y = 10;
mitad_pinza_2.position.x = 0;
mitad_pinza_2.position.z = -6;
mano.add(mitad_pinza_2);

scene.add( brazo );
crearPanel(brazo, brazo_superior, antebrazo, mano, mitad_pinza_1, mitad_pinza_2);
    
}

function crearPanel(brazo, brazo_superior, antebrazo, mano, mitad_pinza_1, mitad_pinza_2)
{
  const controles = {
    giroBase: 0,
    giroEje: 0,
    giroAntebrazoY: 0,
    giroAntebrazoZ: 0,
    giroMano: 0,
    separacionPinza: 0,
    alambres: false,
    anima: function()
    {
      const posicionOriginal = antebrazo.rotation.z;
      mitad_pinza_1.position.z = 8;
      mitad_pinza_2.position.z = -8;

      const giroNegativo = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: THREE.MathUtils.degToRad(-60) }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const regreso = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: posicionOriginal }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const cierrePinza1 = new TWEEN.Tween(mitad_pinza_1.position)
        .to({ z: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const cierrePinza2 = new TWEEN.Tween(mitad_pinza_2.position)
        .to({ z: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const aperturaPinza1 = new TWEEN.Tween(mitad_pinza_1.position)
        .to({ z: 8 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const aperturaPinza2 = new TWEEN.Tween(mitad_pinza_2.position)
        .to({ z: -8 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const baseNegativa = new TWEEN.Tween(brazo.rotation)
        .to({ y: THREE.MathUtils.degToRad(-180) }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const basePositiva = new TWEEN.Tween(brazo.rotation)
        .to({ y: THREE.MathUtils.degToRad(180) }, 2400)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const baseCero = new TWEEN.Tween(brazo.rotation)
        .to({ y: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const antebrazoYNegativo = new TWEEN.Tween(antebrazo.rotation)
        .to({ y: THREE.MathUtils.degToRad(-180) }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const antebrazoZNegativo = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: THREE.MathUtils.degToRad(-90) }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const manoNegativa = new TWEEN.Tween(mano.rotation)
        .to({ z: THREE.MathUtils.degToRad(-40) }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const antebrazoYPositivo = new TWEEN.Tween(antebrazo.rotation)
        .to({ y: THREE.MathUtils.degToRad(180) }, 2400)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const antebrazoZPositivo = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: THREE.MathUtils.degToRad(90) }, 2400)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const manoPositiva = new TWEEN.Tween(mano.rotation)
        .to({ z: THREE.MathUtils.degToRad(220) }, 2400)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const antebrazoYCero = new TWEEN.Tween(antebrazo.rotation)
        .to({ y: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const antebrazoZCero = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const manoCero = new TWEEN.Tween(mano.rotation)
        .to({ z: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const saludoFinal = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: THREE.MathUtils.degToRad(-60) }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const regresoFinal = new TWEEN.Tween(antebrazo.rotation)
        .to({ z: posicionOriginal }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const cierreFinal1 = new TWEEN.Tween(mitad_pinza_1.position)
        .to({ z: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const cierreFinal2 = new TWEEN.Tween(mitad_pinza_2.position)
        .to({ z: 0 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const aperturaFinal1 = new TWEEN.Tween(mitad_pinza_1.position)
        .to({ z: 8 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      const aperturaFinal2 = new TWEEN.Tween(mitad_pinza_2.position)
        .to({ z: -8 }, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut);

      giroNegativo.chain(regreso);
      cierrePinza1.chain(aperturaPinza1);
      cierrePinza2.chain(aperturaPinza2);
      regreso.chain(baseNegativa);
      baseNegativa.chain(basePositiva);
      basePositiva.chain(baseCero);
      baseCero.chain(saludoFinal);
      antebrazoYNegativo.chain(antebrazoYPositivo);
      antebrazoYPositivo.chain(antebrazoYCero);
      antebrazoZNegativo.chain(antebrazoZPositivo);
      antebrazoZPositivo.chain(antebrazoZCero);
      manoNegativa.chain(manoPositiva);
      manoPositiva.chain(manoCero);
      baseNegativa.onStart(function()
      {
        antebrazoYNegativo.start();
        antebrazoZNegativo.start();
        manoNegativa.start();
      });
      basePositiva.onStart(function()
      {
        antebrazoYPositivo.start();
        antebrazoZPositivo.start();
        manoPositiva.start();
      });
      baseCero.onStart(function()
      {
        antebrazoYCero.start();
        antebrazoZCero.start();
        manoCero.start();
      });
      saludoFinal.chain(regresoFinal);
      cierreFinal1.chain(aperturaFinal1);
      cierreFinal2.chain(aperturaFinal2);
      saludoFinal.onStart(function()
      {
        cierreFinal1.start();
        cierreFinal2.start();
      });
      giroNegativo.start();
      cierrePinza1.start();
      cierrePinza2.start();
    },
    animarPanel: function()
    {
      new TWEEN.Tween(brazo.rotation)
        .to(
          { y: THREE.MathUtils.degToRad(controles.giroBase) },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      new TWEEn.Tween(brazo_superior.rotation)
        .to(
          { z: THREE.MathUtils.degToRad(controles.giroEje) },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      new TWEEN.Tween(antebrazo.rotation)
        .to(
          { y: THREE.MathUtils.degToRad(controles.giroAntebrazoY) },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      new TWEEN.Tween(antebrazo.rotation)
        .to(
          { y: THREE.MathUtils.degToRad(controles.giroAntebrazoZ) },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      new TWEEN.Tween(mano.rotation)
        .to(
          { z: THREE.MathUtils.degToRad(controles.giroAntebrazoZ) },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      
    }
  };

  const panel = new lil.GUI();

  panel.add(controles, 'giroBase', -180, 180, 1)
    .name('Giro base')
    .onChange(function(valor)
    {
      brazo.rotation.y = THREE.MathUtils.degToRad(valor);
    });

  panel.add(controles, 'giroEje', -45, 45, 1)
    .name('Giro Brazo')
    .onChange(function(valor)
    {
      brazo_superior.rotation.z = THREE.MathUtils.degToRad(valor);
    });

  panel.add(controles, 'giroAntebrazoY', -180, 180, 1)
    .name('Giro Antebrazo Y')
    .onChange(function(valor)
    {
      antebrazo.rotation.y = THREE.MathUtils.degToRad(valor);
    });

  panel.add(controles, 'giroAntebrazoZ', -90, 90, 1)
    .name('Giro Antebrazo Z')
    .onChange(function(valor)
    {
      antebrazo.rotation.z = THREE.MathUtils.degToRad(valor);
    });

    panel.add(controles, 'giroMano', -40, 220, 1)
    .name('Giro Pinza')
    .onChange(function(valor)
    {
      mano.rotation.z = THREE.MathUtils.degToRad(valor);
    });

  panel.add(controles, 'separacionPinza', 0, 15, 1)
    .name('Apertura/Cierre')
    .onChange(function(valor)
    {
      mitad_pinza_1.position.z = valor;
      mitad_pinza_2.position.z = -valor;
    });

  

  panel.add(controles, 'alambres')
    .name('Alambres')
    .onChange(function(activado)
    {
      scene.traverse(function(objeto)
      {
        if (objeto.isMesh)
        {
          objeto.material.wireframe = activado;
        }
      });
    });

  panel.add(controles, 'anima')
    .name('Anima');
}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  cameraNormal.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
}
/*
function render()
{
	requestAnimationFrame( render );
	update();

  renderer.autoClear = false;

  // Vista principal en perspectiva.
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(false);
  renderer.clear();
  renderer.render(scene, camera);

  // Vista superior en un recuadro de la esquina inferior izquierda.
  const viewportSize = Math.min(window.innerWidth, window.innerHeight) / 4;
  renderer.setViewport(0, 0, viewportSize, viewportSize);
  renderer.setScissor(0, 0, viewportSize, viewportSize);
  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(scene, cameraNormal);
  renderer.setScissorTest(false);
}
  */

function render()
{
  requestAnimationFrame(render);
  update();
  TWEEN.update();

  const viewportSize = Math.floor(
    Math.min(window.innerWidth, window.innerHeight) / 4
  );

  renderer.autoClear = false;

  // Vista general.
  renderer.setViewport(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );
  renderer.setScissorTest(false);
  renderer.clear();
  renderer.render(scene, camera);

  // Vista cenital cuadrada en la esquina superior izquierda.
  const viewportY = window.innerHeight - viewportSize;

  renderer.setViewport(
    0,
    viewportY,
    viewportSize,
    viewportSize
  );

  renderer.setScissor(
    0,
    viewportY,
    viewportSize,
    viewportSize
  );

  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(scene, cameraNormal);

  renderer.setScissorTest(false);
}