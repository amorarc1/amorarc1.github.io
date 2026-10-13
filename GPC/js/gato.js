var renderer, scene, camera;
var gato = null;
var angulo = 0;
var desfase_orientacion = -Math.PI / 4;
var velocity = new THREE.Vector3(0, 0, 1);
var objectsToCheck = [];
var pizzas = [];
var pizzasRecogidas = 0;
var mensajeVictoria = null;
var textoVictoria = null;
var botonVolverInicio = null;
var tiempoAnimacionPizza = 0;
var alturaFlotacionPizza = 0;
var alturaBaseGato = 3.5;
var radioColisionGato = 0;
var factorRadioColisionMovimiento = 0.5;
var idleAction = null;
var moveAction = null;
var currentAction = null;
var catIsMoving = false;
var manzanaAction = null;
var victoriaAction = null;
var derrotaAction = null;
var haPerdido = false;

var indiceAnimQuieto = 0;
var indiceAnimNormal = 1;
var indiceAnimManzana = 2;
var indiceAnimVictoria = 3;
var indiceAnimMenu = 4;
var indiceAnimDerrota = 5;

var enMenu = true;
var menuAction = null;
var overlayMenu = null;
var botonEmpezar = null;

var nivelActual = 0;
var niveles = [
    { boton: 'Tutorial',          mapa: 'tutorial', instrucciones: instruccionesTutorial },
    { boton: 'Nivel 1 (fácil)',   mapa: 'nivel1',   instrucciones: instruccionesNivel1 },
    { boton: 'Nivel 2 (medio)',   mapa: 'nivel1',   noche: true, radioMinimapa: 500, instrucciones: instruccionesNivel2 },
    { boton: 'Nivel 3 (difícil)', mapa: 'nivel1',   noche: true, farolas: false, linterna: true, conoMinimapa: true, instrucciones: instruccionesNivel3 }
];
var vistaNiveles = null;
var vistaNivel = null;
var contenedorInstrucciones = null;
var fraccionVistaMenu = 0.22;
var fraccionVista = 0.22;
var distanciaCamaraMenu = 250;
var alturaCamaraMenu = 40;
var alturaMiradaMenu = 30;
var anguloCamaraMenu = 0.45;

var panelHud = null;

// ===== NIVEL 1 =====
var alturaArbol = 110;
var posicionesPizzaParque = [
    [680, 680], [-680, 680], [680, -680], [-680, -680],
    [600, 350], [-600, 350],
    [0, -680], [0, 450]
];
var pizzasEnParque = 3;
var manzanasEnParque = 3;
var fuenteParque = { x: 0, z: 0, radio: 120 };
var arbolesCercaDePizzas = [
    [600, 700], [700, 590], [-600, 700], [-700, 590],
    [600, -700], [700, -590], [-600, -700], [-700, -590],
    [520, 385], [630, 265], [-520, 385], [-630, 265],
    [-85, -650], [85, -700],
    [-90, 485], [80, 410]
];
var textoHudAnterior = '';
var totalPizzas = 0;
var tiempoPartida = 0;
var partidaTerminada = false;
var desplazamientoCamaraVictoria = new THREE.Vector3(34.4, 43.2, 125.2);

var manzanas = [];
var numeroManzanas = 6;
var tiempoEfectoManzana = 0;
var duracionEfectoManzana = 5;
var multiplicadorManzana = 2;

// ===== GATOS FANTASMA (enemigos) =====
var rutaModeloFantasma = 'models/gato/gato_fantasma.glb';
var posicionesFantasma = [
    [-320, 500],
    [-400, 1000],
    [400, -1000]
];
var fantasmas = [];
var mixersFantasma = [];
var tamanoReferenciaGato = 0;
var escalaRelativaFantasma = 1;
var factorColisionFantasma = 0.7;
var velocidadRelativaFantasma = 0.6;
var giroFantasma = 0.06;
var framesGiroFantasma = 18;
var distanciaMinimaPizzaFantasma = 150;

var intensidadSol = 1.2;

var luzFarola = {
    color: 0xFFD98A,
    intensidad: 1.6,
    alcance: 700,
    decaimiento: 1.6,
    cantidad: 16,
    tamanoHalo: 90,
    intensidadHalo: 0.85
};
var colorCieloNoche = 0x05070f;

var luzLinterna = {
    color: 0xFFF4D6,
    intensidad: 2.2,
    alcance: 1000,
    angulo: Math.PI * 0.14,
    penumbra: 0.5,
    decaimiento: 1.1,
    inclinacion: 0.10,
    distanciaObjetivo: 400,
    sombras: true
};
var linterna = null;
var grupoLinterna = null;
var huesoLinterna = null;
var linternaActiva = false;
var nombreHuesoLinterna = '';
var ajusteAlturaLinterna = -5;
var desplazamientoLateralLinterna = 5;
var radioVisionMapa = 700;
var radioCercaMapa = 120;
var farolasEncendidas = true;
var alturaGato = 40;
var materialesBombilla = [];
var factorBombillaAmbiente = 1;
var brilloNocheFactor = 0.12;
var reflejoNocheFactor = 0.1;
var nocheActiva = false;
var lucesFarola = [];
var posicionesBombillas = [];
var texturaCieloDia = null;
var grupoHalos = null;

var sunLight = null;
var tamanoMapaSombras = 4096;
var radioSombras = 1200;
var profundidadSombras = radioSombras * 1.35 + 150;
var distanciaSol = profundidadSombras + 10;
var direccionSol = new THREE.Vector3(100, 57.735, 100).normalize();
var _sombraCentro = new THREE.Vector3();
var _sombraDerecha = new THREE.Vector3();
var _sombraArriba = new THREE.Vector3();
var _ejeY = new THREE.Vector3(0, 1, 0);

function activarSombras(objeto, proyectar, recibir)
{
    objeto.traverse(function (o)
    {
        if (o.isMesh)
        {
            o.castShadow = proyectar;
            o.receiveShadow = recibir;
        }
    });
}

function agregarSuelo(objeto)
{
    activarSombras(objeto, false, true);
    scene.add(objeto);
    objetosMapa.push(objeto);
}

function actualizarSombraSol()
{
    if (sunLight === null || gato === null) return;

    var texel = 2 * radioSombras / tamanoMapaSombras;
    _sombraDerecha.crossVectors(_ejeY, direccionSol).normalize();
    _sombraArriba.crossVectors(direccionSol, _sombraDerecha);

    var c = gato.position;
    var r = Math.round(c.dot(_sombraDerecha) / texel) * texel;
    var u = Math.round(c.dot(_sombraArriba) / texel) * texel;

    _sombraCentro.set(0, 0, 0)
        .addScaledVector(_sombraDerecha, r)
        .addScaledVector(_sombraArriba, u)
        .addScaledVector(direccionSol, c.dot(direccionSol));

    sunLight.target.position.copy(_sombraCentro);
    sunLight.position.copy(_sombraCentro).addScaledVector(direccionSol, distanciaSol);
}
var brilloPropio = 0.4;
var brilloPropioGato = 0.5;

var materialesConBrillo = [];
var factorBrilloAmbiente = 1;

function matEstandar(parametros, brillo)
{
    var material = new THREE.MeshStandardMaterial(parametros);
    if (parametros.emissive === undefined)
    {
        material.emissive.copy(material.color);
        var brilloBase = (brillo === undefined) ? brilloPropio : brillo;
        material.userData.brilloBase = brilloBase;
        material.emissiveIntensity = brilloBase * factorBrilloAmbiente;
        materialesConBrillo.push(material);
        if (material.map) material.emissiveMap = material.map;
    }
    return material;
}

var duracionCuentaAtras = 3;
var cuentaIniciada = false;
var tiempoCuenta = 0;
var ultimoNumeroCuenta = 0;
var juegoActivo = false;
var elementoCuenta = null;
var progresoAparicion = 0;

var canvasMapa = null;
var ctxMapa = null;
var fondoMapa = null;
var minimapaVisible = false;
var tamanoMapa = 240;
var resolucionMapa = 480;
var limiteMapa = 1400;

// ===== TEXTURAS =====
var tamanoBaldosaCarretera = 120;
var tamanoBaldosaAcera = 80;
var tamanoBaldosaLadrillo = 8;
var tamanoBaldosaMetal = 4;
var tamanoBaldosaMadera = 4;
var tamanoBaldosaPuerta = 5;
var tamanoBaldosaPomo = 1.5;
var tamanoBaldosaPlanta = 3;
var tamanoBaldosaPizza = 28;
var tamanoBaldosaCesped = 100;
var tamanoBaldosaRoca = 150;
var reliveRoca = 1.8;
var tamanoBaldosaTronco = 0.3;

var metalnessMetal = 0.8;
var metalnessPomo = 0.8;
var metalnessRoca = 0.1;

var matidadCarretera = 0;
var matidadAcera = 0;
var matidadCesped = 0;
var matidadFachada = 0;

var texturasCargadas = {};
var materialesCompartidos = {};
var materialesConReflejo = [];
var entornoMetal = null;

function cargarTextura(archivo, extensiones)
{
    if (!texturasCargadas[archivo])
    {
        var textura = new THREE.Texture();
        textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
        textura.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texturasCargadas[archivo] = textura;

        if (/\.(jpe?g|png)$/i.test(archivo)) extensiones = [''];
        else extensiones = extensiones || ['.jpg', '.png', '.jpeg'];

        var cargador = new THREE.ImageLoader();
        var intento = 0;
        var probar = function ()
        {
            if (intento >= extensiones.length)
            {
                console.warn('No se pudo cargar la textura. Probé: ' +
                    extensiones.map(function (e) { return 'images/' + archivo + e; }).join(', '));
                return;
            }
            cargador.load('images/' + archivo + extensiones[intento++], function (imagen)
            {
                textura.image = imagen;
                textura.needsUpdate = true;
            }, undefined, probar);
        };
        probar();
    }
    return texturasCargadas[archivo];
}

function matDesdePack(prefijo, extra, brillo, conMetal)
{
    var parametros = {
        map: cargarTextura(prefijo + '_Color'),
        normalMap: cargarTextura(prefijo + '_NormalGL'),
        roughnessMap: cargarTextura(prefijo + '_Roughness')
    };
    if (conMetal)
    {
        parametros.metalnessMap = cargarTextura(prefijo + '_Metalness');
        parametros.metalness = 1;
    }
    for (var k in extra) parametros[k] = extra[k];
    return matEstandar(parametros, brillo);
}

function compartido(clave, crear)
{
    if (!materialesCompartidos[clave]) materialesCompartidos[clave] = crear();
    return materialesCompartidos[clave];
}

function hacerMate(material, cantidad)
{
    material.onBeforeCompile = function (shader)
    {
        var marca = '#include <roughnessmap_fragment>';
        shader.fragmentShader = shader.fragmentShader.replace(
            marca,
            marca + '\nroughnessFactor = mix(roughnessFactor, 1.0, ' + cantidad.toFixed(3) + ');');
    };
    material.customProgramCacheKey = function () { return 'mate' + cantidad; };
    return material;
}

function matCarretera()
{
    return compartido('carretera', function () { return hacerMate(matDesdePack('Road012A_1K-JPG'), matidadCarretera); });
}
function matAceraTex()
{
    return compartido('acera', function ()
    {
        var material = hacerMate(matDesdePack('PavingStones150_1K-JPG'), matidadAcera);
        [material.map, material.normalMap, material.roughnessMap, material.emissiveMap].forEach(function (textura)
        {
            if (!textura) return;
            textura.center.set(0.5, 0.5);
            textura.rotation = Math.PI / 2;
        });
        return material;
    });
}
var ladrillosEdificio = [
    { pack: 'Bricks092_1K-JPG', baldosa: tamanoBaldosaLadrillo },
    { pack: 'Bricks054_1K-JPG', baldosa: tamanoBaldosaLadrillo },
    { pack: 'Bricks059_1K-JPG', baldosa: tamanoBaldosaLadrillo }
];
var variantePared = 0;
function baldosaLadrillo() { return ladrillosEdificio[variantePared].baldosa; }
function matLadrillo(variante)
{
    if (variante === undefined) variante = variantePared;
    return compartido('ladrillo' + variante, function ()
    {
        return hacerMate(matDesdePack(ladrillosEdificio[variante].pack), matidadFachada);
    });
}
function matMadera(tinte)
{
    return compartido('madera' + tinte, function () { return matDesdePack('Wood035_1K-JPG', { color: tinte }); });
}
function matMetalPack(clave, prefijo, metalness)
{
    return compartido(clave, function ()
    {
        var material = matDesdePack(prefijo, { metalness: metalness }, 0.15, true);
        materialesConReflejo.push(material);
        if (entornoMetal) material.envMap = entornoMetal;
        return material;
    });
}
function matMetal() { return matMetalPack('metal', 'Metal063_1K-JPG', metalnessMetal); }
function matPomo() { return matMetalPack('pomo', 'Metal048B_1K-JPG', metalnessPomo); }
function matCesped()
{
    return compartido('cesped', function () { return hacerMate(matDesdePack('Grass001_1K-JPG'), matidadCesped); });
}
function matRoca()
{
    return compartido('roca', function ()
    {
        var material = matDesdePack('Rock051_1K-JPG',
            { metalness: metalnessRoca, normalScale: new THREE.Vector2(reliveRoca, reliveRoca) },
            0.25,
            true);
        return material;
    });
}
function matPuerta()
{
    return compartido('puerta', function () { return matDesdePack('Wood018_1K-JPG'); });
}

function matTexturaSimple(clave, archivo, extra)
{
    return compartido(clave, function ()
    {
        var parametros = { map: cargarTextura(archivo) };
        for (var k in extra) parametros[k] = extra[k];
        return matEstandar(parametros);
    });
}

function matPizzaCorteza() { return matTexturaSimple('pizzaCorteza', 'pizza_corteza.png', { side: THREE.DoubleSide }); }
function matPizzaSalsa()   { return matTexturaSimple('pizzaSalsa', 'salsa_tomate.png', { side: THREE.DoubleSide }); }
function matPizzaQueso()   { return matTexturaSimple('pizzaQueso', 'pizza_fondo.jpg', { side: THREE.DoubleSide }); }
function matPepperoni()    { return matTexturaSimple('pepperoni', 'pepperoni.jpg'); }

function matManzanaCuerpo()
{
    return compartido('manzana', function ()
    {
        return matEstandar({
            map: cargarTextura('food_0006_color_1k'),
            normalMap: cargarTextura('food_0006_normal_opengl_1k', ['.png']),
            roughnessMap: cargarTextura('food_0006_roughness_1k')
        });
    });
}
function matHojaManzana() { return matTexturaSimple('hojaManzana', 'hoja.jpg'); }

function matPlantaTex() { return matTexturaSimple('planta', 'planta.jpg'); }

var propiedadesCristal = {
    color: 0x9FD8F0,
    metalness: 0.85,
    roughness: 0.04,
    reflejo: 1.6
};

function matCristal()
{
    return compartido('cristal', function ()
    {
        var material = matEstandar({
            color: propiedadesCristal.color,
            metalness: propiedadesCristal.metalness,
            roughness: propiedadesCristal.roughness,
            envMapIntensity: propiedadesCristal.reflejo
        }, 0.3);
        materialesConReflejo.push(material);
        if (entornoMetal) material.envMap = entornoMetal;
        return material;
    });
}

function prepararEntornoMetal(texturaCielo)
{
    try
    {
        var pmrem = new THREE.PMREMGenerator(renderer);
        entornoMetal = pmrem.fromEquirectangular(texturaCielo).texture;
        materialesConReflejo.forEach(function (material)
        {
            material.envMap = entornoMetal;
            material.needsUpdate = true;
        });
    }
    catch (error)
    {
        console.warn('No se pudo preparar el reflejo del cielo para los metales:', error);
    }
}

// ===== UV =====
function aBuffer(geometria)
{
    return geometria.isBufferGeometry ? geometria : new THREE.BufferGeometry().fromGeometry(geometria);
}

function uvCajaEscalada(geometria, tam)
{
    var pr = geometria.parameters;
    geometria = aBuffer(geometria);
    var nor = geometria.attributes.normal;
    var uv = geometria.attributes.uv;
    for (var i = 0; i < uv.count; i++)
    {
        var ancho, alto;
        if (Math.abs(nor.getX(i)) > 0.5) { ancho = pr.depth; alto = pr.height; }
        else if (Math.abs(nor.getY(i)) > 0.5) { ancho = pr.width; alto = pr.depth; }
        else { ancho = pr.width; alto = pr.height; }
        uv.setXY(i, uv.getX(i) * ancho / tam, uv.getY(i) * alto / tam);
    }
    uv.needsUpdate = true;
    return geometria;
}

function uvEsferaEscalada(geometria, tam)
{
    var pr = geometria.parameters;
    geometria = aBuffer(geometria);
    var uv = geometria.attributes.uv;
    for (var i = 0; i < uv.count; i++)
    {
        uv.setXY(i, uv.getX(i) * pr.radius * pr.phiLength / tam, uv.getY(i) * pr.radius * pr.thetaLength / tam);
    }
    uv.needsUpdate = true;
    return geometria;
}

function uvPlanarXZ(geometria)
{
    var pr = geometria.parameters;
    geometria = aBuffer(geometria);
    var pos = geometria.attributes.position;
    var uv = geometria.attributes.uv;
    for (var i = 0; i < pos.count; i++)
    {
        uv.setXY(i, (pos.getX(i) / pr.radius + 1) / 2, (1 - pos.getZ(i) / pr.radius) / 2);
    }
    uv.needsUpdate = true;
    return geometria;
}

function uvToroEscalado(geometria, tam)
{
    var pr = geometria.parameters;
    geometria = aBuffer(geometria);
    var uv = geometria.attributes.uv;
    for (var i = 0; i < uv.count; i++)
    {
        uv.setXY(i, uv.getX(i) * pr.radius * pr.arc / tam, uv.getY(i) * 2 * Math.PI * pr.tube / tam);
    }
    uv.needsUpdate = true;
    return geometria;
}

function uvPlanarExtrusion(geometria, radio)
{
    geometria = aBuffer(geometria);
    var pos = geometria.attributes.position;
    var nor = geometria.attributes.normal;
    var uv = geometria.attributes.uv;
    var tam = 2 * radio;
    for (var i = 0; i < pos.count; i++)
    {
        if (Math.abs(nor.getZ(i)) > 0.5)
            uv.setXY(i, (pos.getX(i) + radio) / tam, (pos.getY(i) + radio) / tam);
        else
            uv.setXY(i, (pos.getX(i) + pos.getY(i)) / tam, pos.getZ(i) / tam);
    }
    uv.needsUpdate = true;
    return geometria;
}

function uvCilindroEscalado(geometria, tam)
{
    var pr = geometria.parameters;
    geometria = aBuffer(geometria);
    var radio = (pr.radiusTop + pr.radiusBottom) / 2;
    var nor = geometria.attributes.normal;
    var uv = geometria.attributes.uv;
    for (var i = 0; i < uv.count; i++)
    {
        if (Math.abs(nor.getY(i)) < 0.5)
            uv.setXY(i, uv.getX(i) * 2 * Math.PI * radio / tam, uv.getY(i) * pr.height / tam);
        else
            uv.setXY(i, uv.getX(i) * 2 * radio / tam, uv.getY(i) * 2 * radio / tam);
    }
    uv.needsUpdate = true;
    return geometria;
}

var distancia_camara = 10;
var altura_camara = 5;
var desfase_lookat_y = 100;

var angulo_inclinacion_camara = 30 * Math.PI / 180;

const rigidez_camara = 50;
const amortiguacion_camara = 14;
const velocidad_camara = new THREE.Vector3();
const velocidad_mirada_camara = new THREE.Vector3();
const posicion_objetivo_camara = new THREE.Vector3();
const mirada_objetivo_camara = new THREE.Vector3();
const posicion_actual_camara = new THREE.Vector3();
const mirada_actual_camara = new THREE.Vector3();
const aceleracion_camara = new THREE.Vector3();
var camara_spring_iniciada = false;
var distanciaCamaraMinima = 10;
var distanciaCamaraMaxima = 1200;

var desplazamientoInicialCamara = new THREE.Vector3(-14.6, 38.9, -106.3);
var anguloHorizontalCamara = Math.atan2(
    desplazamientoInicialCamara.x,
    -desplazamientoInicialCamara.z
);
var arrastrandoCamara = false;
var posicionRatonX = 0;
var posicionRatonY = 0;

const controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    speed: 2
};

var mixer = null;
const clock = new THREE.Clock();

var pausado = false;
var cameraControls = null;
var transicionCamara = false;
var tTransicionCamara = 0;
var duracionTransicionCamara = 0.5;
var duracionTransicionActual = 0.5;
var inicioTransicionPos = new THREE.Vector3();
var inicioTransicionQuat = new THREE.Quaternion();

var anchoCarretera = 120;
var alturaPavimento = 5;
var alturaSueloGato = 0;

// ===== MAPAS POR NIVEL =====
var inclinacionRampa = 20;
var lineaInicioRampa = 4;
var lineaFinRampa = 6;

var vallaParque = false;
var entradasParque = [
    { lado: 'sur',   pos: 0 },
    { lado: 'este',  pos: 372 },
    { lado: 'oeste', pos: 372 }
];
var anchoEntradaParque = 140;
var alturaValla = 50;
var seccionValla = 70;
var separacionPinchos = 9;
var margenTrasCasas = 25;
var grosorColisionExterior = 120;
var grosorColisionValla = 1;
var casasInteriores = true;
var rampa = null;
var objetosMapa = [];
var mapaConstruido = null;
var _ejeX = new THREE.Vector3(1, 0, 0);
var _qGiroYaw = new THREE.Quaternion();
var _qGiroPitch = new THREE.Quaternion();

function alturaRampaEn(z)
{
    if (rampa === null) return 0;
    if (z >= rampa.zInicio) return 0;
    if (z <= rampa.zFin) return rampa.altura;
    return (rampa.zInicio - z) * rampa.pendiente;
}

function inclinacionSueloEn(z)
{
    if (rampa === null) return 0;
    return (z < rampa.zInicio && z > rampa.zFin) ? Math.atan(rampa.pendiente) : 0;
}

function orientarSobreSuelo(objeto, yaw, pitch)
{
    _qGiroYaw.setFromAxisAngle(_ejeY, yaw);
    _qGiroPitch.setFromAxisAngle(_ejeX, pitch);
    objeto.quaternion.copy(_qGiroPitch).multiply(_qGiroYaw);
}

function configurarMapa(tipo)
{
    vallaParque = (tipo === 'nivel1');
    if (tipo === 'nivel1')
    {
        casasInteriores = false;
        var pendiente = Math.tan(inclinacionRampa * Math.PI / 180);
        var celda = 2 * (bordeAceraExt + 20 * escalaEdificio + 40) / 8;
        var zInicio = -(lineaInicioRampa - 4) * celda;
        var zFin = -(lineaFinRampa - 4) * celda;
        rampa = {
            zInicio: zInicio,
            zFin: zFin,
            pendiente: pendiente,
            altura: (zInicio - zFin) * pendiente
        };
    }
    else
    {
        casasInteriores = true;
        rampa = null;
    }
}

function construirMapa(tipo)
{
    if (mapaConstruido === tipo) return;

    objetosMapa.forEach(function (objeto)
    {
        scene.remove(objeto);
        objeto.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    });
    objetosMapa.length = 0;
    objectsToCheck.length = 0;

    posicionesBombillas.length = 0;
    while (grupoHalos.children.length > 0) grupoHalos.remove(grupoHalos.children[0]);
    configurarMapa(tipo);
    createEnvironment(tipo);
    mapaConstruido = tipo;

    if (fondoMapa !== null) dibujarFondoMapa(fondoMapa.getContext('2d'));
}

function regenerarObjetosJuego()
{
    pizzas.forEach(function (p) { scene.remove(p); });
    manzanas.forEach(function (m) { scene.remove(m); });
    pizzas.length = 0;
    manzanas.length = 0;
    createPizzas();
    createManzanas();
    colocarFantasmas();
}

// ===== MAPA =====
var mitadCarretera = 1000;
var anchoAcera = 200;
var mitadMundo = 3500;
var escalaFarola = 4;
var escalaBanco = 6;
var largoBanco = 14;
var factorAlturaFarola = 2.2;
var separacionFarolas = 320;

var bordeCarreteraInt = mitadCarretera - anchoCarretera / 2;
var bordeCarreteraExt = mitadCarretera + anchoCarretera / 2;
var bordeAceraInt = bordeCarreteraInt - anchoAcera;
var bordeAceraExt = bordeCarreteraExt + anchoAcera;

var ladosMapa = [[0, 1], [0, -1], [1, 0], [-1, 0]];

var posicionInicialGato = { x: mitadCarretera, z: 0 };

var ajustePivoteGato = { x: 0, z: 0 };

var velocidadGiro = 12;


var escalaEdificio = 5;
var separacionMinimaEdificios = 50;
var pisosEdificio = [2, 3, 4];

function alturaSueloEn(x, z)
{
    var d = Math.max(Math.abs(x), Math.abs(z));
    if (d < bordeAceraInt) return alturaPavimento - 1;
    var base;
    if (d > bordeCarreteraInt && d < bordeCarreteraExt) base = 0;
    else if (d >= bordeAceraInt && d <= bordeAceraExt) base = alturaPavimento;
    else base = alturaPavimento - 1;
    return base + alturaRampaEn(z);
}

document.addEventListener('keydown', function (event)
{
    if (event.code === 'KeyW' || event.code === 'ArrowUp') controls.moveForward = true;
    if (event.code === 'KeyS' || event.code === 'ArrowDown') controls.moveBackward = true;
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') controls.moveLeft = true;
    if (event.code === 'KeyD' || event.code === 'ArrowRight') controls.moveRight = true;

    if (event.code === 'KeyP' && !event.repeat) cambiarPausa();

    if (event.code.startsWith('Arrow')) event.preventDefault();
});

document.addEventListener('keyup', function (event)
{
    if (event.code === 'KeyW' || event.code === 'ArrowUp') controls.moveForward = false;
    if (event.code === 'KeyS' || event.code === 'ArrowDown') controls.moveBackward = false;
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') controls.moveLeft = false;
    if (event.code === 'KeyD' || event.code === 'ArrowRight') controls.moveRight = false;
});

function releaseControls()
{
    controls.moveForward = false;
    controls.moveBackward = false;
    controls.moveLeft = false;
    controls.moveRight = false;
}

window.addEventListener('blur', releaseControls);
document.addEventListener('visibilitychange', function ()
{
    if (document.hidden) releaseControls();
});

init();
loadScene();
render();


function cambiarPausa()
{
    if (gato === null || transicionCamara || enMenu || !juegoActivo) return;

    pausado = !pausado;

    releaseControls();
    arrastrandoCamara = false;

    if (pausado)
    {
        cameraControls.target.copy(gato.position);
        cameraControls.update();
        cameraControls.enabled = true;
    }
    else
    {
        cameraControls.enabled = false;
        camara_spring_iniciada = false;
        inicioTransicionPos.copy(camera.position);
        inicioTransicionQuat.copy(camera.quaternion);
        tTransicionCamara = 0;
        duracionTransicionActual = duracionTransicionCamara;
        transicionCamara = true;
    }
}

function init()
{
    renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(
        50,
        aspectRatio,
        0.5,
        6000
    );

    camera.position.set(0, altura_camara, distancia_camara);
    installCameraMouseControls();
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.enabled = false;
    cameraControls.maxDistance = 5000;

    sunLight = new THREE.DirectionalLight(0xffffff, intensidadSol);
    sunLight.position.copy(direccionSol).multiplyScalar(distanciaSol);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(tamanoMapaSombras, tamanoMapaSombras);
    sunLight.shadow.camera.left = -radioSombras;
    sunLight.shadow.camera.right = radioSombras;
    sunLight.shadow.camera.top = radioSombras;
    sunLight.shadow.camera.bottom = -radioSombras;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = distanciaSol + profundidadSombras;
    sunLight.shadow.camera.updateProjectionMatrix();
    sunLight.shadow.bias = -0.5 / (sunLight.shadow.camera.far - sunLight.shadow.camera.near);
    sunLight.shadow.normalBias = 0.5;
    scene.add(sunLight);
    scene.add(sunLight.target);

    for (var i = 0; i < luzFarola.cantidad; i++)
    {
        var luz = new THREE.PointLight(luzFarola.color, 0, luzFarola.alcance, luzFarola.decaimiento);
        luz.visible = false;
        scene.add(luz);
        lucesFarola.push(luz);
    }

    linterna = new THREE.SpotLight(luzLinterna.color, 0, luzLinterna.alcance, luzLinterna.angulo, luzLinterna.penumbra, luzLinterna.decaimiento);
    linterna.visible = false;
    linterna.castShadow = luzLinterna.sombras;
    linterna.shadow.mapSize.set(2048, 2048);
    linterna.shadow.camera.near = 5;
    linterna.shadow.camera.far = luzLinterna.alcance;
    linterna.shadow.bias = -0.0005;
    linterna.shadow.normalBias = 0.5;
    scene.add(linterna);
    scene.add(linterna.target);

    window.addEventListener('resize', updateAspectRatio);
}

function loadScene()
{
    grupoHalos = new THREE.Object3D();
    grupoHalos.visible = false;
    scene.add(grupoHalos);

    new THREE.TextureLoader().load('images/skybox-day.png', function (textura)
    {
        textura.mapping = THREE.EquirectangularReflectionMapping;
        textura.encoding = THREE.sRGBEncoding;
        texturaCieloDia = textura;
        if (!nocheActiva) scene.background = textura;
        prepararEntornoMetal(textura);
    });

    loadObjGLTF();

    construirMapa('tutorial');
    createVictoryMessage();
    createHud();
    createPizzas();
    createManzanas();
    actualizarHud();
    createMenuInicio();
    createCuentaAtras();
    crearMinimapa();
}

function filaInstruccion(icono, titulo, parrafos)
{
    return '<div class="fila"><div class="icono">' + icono + '</div><div><h2>' + titulo + '</h2>' +
        parrafos.map(function (t) { return '<p>' + t + '</p>'; }).join('') + '</div></div>';
}

function puntoColor(color)
{
    return '<b style="color:' + color + ';font-size:1.2em;">●</b>';
}

function instruccionesTutorial()
{
    return '<h1>Tutorial</h1>' +
        filaInstruccion('🎮', 'Controles', [
            '<b>Movimiento:</b> <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> (o las flechas) para mover al gato. ' +
            'Arrastra con el botón izquierdo del ratón para girar la cámara y prueba a hacer zoom.',
            '<b>Pausa:</b> <kbd>P</kbd> pausa el juego y te deja mover la cámara libremente para admirar la vista de la ciudad. Púlsala otra vez para continuar.'
        ]) +
        filaInstruccion('🍕', 'Objetivo', [
            '<b>Pizzas:</b> recoge los ' + totalPizzas + ' trozos de pizza repartidos por la carretera y las aceras. ' +
            'El contador de arriba a la izquierda muestra cuántos llevas.',
            '<b>Manzanas:</b> al comer una manzana, el gato empezará a correr e irás el doble de rápido durante ' + duracionEfectoManzana + ' segundos. ' +
            'Ojo que no se acumula: si coges otra, la cuenta simplemente vuelve a empezar (no queremos gatos yendo a la velocidad de la luz).',
            '<b>Tiempo:</b> el cronómetro arranca al pulsar Empezar y se detiene cuando recoges la última pizza. ¡Hazlo lo más rápido que puedas!'
        ]) +
        filaInstruccion('🗺', 'Minimapa', [
            puntoColor('#1e6bff') + ' Pizzas &nbsp; ' + puntoColor('#ff2a2a') + ' Manzanas &nbsp; ' + puntoColor('#ffd400') + ' Tú (la punta indica hacia dónde miras)'
        ]);
}

function instruccionesNivel1()
{
    return '<h1>Nivel 1</h1>' +
        filaInstruccion('🏙', '¡La ciudad se ha ampliado!', [
            'Ahora tenemos un parque y una zona alta en la ciudad.',
            '¡Recoge las pizzas en el menor tiempo posible! Ayúdate del mapa si lo necesitas.'
        ]);
}

function instruccionesNivel2()
{
    return '<h1>Nivel 2</h1>' +
        filaInstruccion('🌙', 'Se ha hecho de noche', [
            'Tu visibilidad se ve reducida a lo iluminado por las farolas de la calle.',
            'El minimapa también se resiente: solo muestra lo que tienes cerca.'
        ]);
}

function instruccionesNivel3()
{
    return '<h1>Nivel 3</h1>' +
        filaInstruccion('🔦', '¡Ha habido un apagón!', [
            'Con ayuda de una linterna, encuentra las pizzas para volver a casa lo antes posible.',
            'Cuidado, ahora que está a oscuras... no vaya a ser que haya algo peligroso en la ciudad, como fantasmas.',
            'El minimapa solo enseña lo que alumbra tu linterna.'
        ]);
}

function createMenuInicio()
{
    var estilo = document.createElement('style');
    estilo.textContent =
        '#menu-inicio{position:fixed;top:0;left:0;right:0;bottom:0;z-index:5;display:flex;justify-content:flex-end;align-items:center;padding:0 4vw;box-sizing:border-box;pointer-events:none;transition:opacity .5s;font-family:system-ui,Segoe UI,Arial,sans-serif;}' +
        '#menu-inicio .panel{pointer-events:auto;width:min(46vw,540px);max-height:92vh;overflow:auto;box-sizing:border-box;padding:26px 28px;background:rgba(15,15,20,.8);color:#fff;border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.45);}' +
        '#menu-inicio .vista,#menu-inicio .instrucciones,#menu-inicio .niveles{display:flex;flex-direction:column;gap:14px;}' +
        '#menu-inicio .niveles{gap:10px;}' +
        '#menu-inicio h1{margin:0 0 2px;font-size:28px;}' +
        '#menu-inicio .fila{display:flex;gap:14px;align-items:flex-start;}' +
        '#menu-inicio .icono{font-size:26px;width:36px;text-align:center;flex:none;}' +
        '#menu-inicio h2{margin:0 0 2px;font-size:16px;color:#ffcf6b;}' +
        '#menu-inicio p{margin:0;font-size:14.5px;line-height:1.5;color:#e8e8ee;}' +
        '#menu-inicio h1.titulo{margin:0 0 4px;font-size:clamp(36px,4.4vw,58px);line-height:1.05;text-align:center;color:#ffcf6b;text-shadow:0 4px 0 #c2410c;}' +
        '#menu-inicio p.intro{font-size:16px;line-height:1.6;}' +
        '#menu-inicio kbd{display:inline-block;min-width:22px;padding:2px 7px;margin:0 2px;border-radius:5px;background:#2b2b35;border:1px solid #5a5a6a;border-bottom-width:3px;font:bold 13px monospace;text-align:center;}' +
        '#menu-inicio button{margin-top:6px;padding:14px;border:0;border-radius:12px;background:#ff8a1f;color:#fff;font:bold 20px system-ui,Arial,sans-serif;cursor:pointer;}' +
        '#menu-inicio button:hover:not(:disabled){background:#ff9d44;}' +
        '#menu-inicio button:disabled{opacity:.6;cursor:default;}' +
        '#menu-inicio button.btn-nivel,#menu-inicio button.btn-volver{margin-top:0;background:#2b2b35;border:1px solid #5a5a6a;}' +
        '#menu-inicio button.btn-nivel:hover:not(:disabled),#menu-inicio button.btn-volver:hover:not(:disabled){background:#3d3d4d;}' +
        '#menu-inicio button.btn-volver{margin-top:0;padding:10px;font-size:15px;font-weight:normal;}';
    document.head.appendChild(estilo);

    overlayMenu = document.createElement('div');
    overlayMenu.id = 'menu-inicio';
    overlayMenu.innerHTML =
        '<div class="panel">' +
            '<div class="vista vista-niveles">' +
                '<h1 class="titulo">Pepperonis y Gatos</h1>' +
                '<p class="intro">¡Hola! Bienvenid@ a Pepperonis y Gatos, el juego donde debes buscar los ' + totalPizzas + ' trozos de pizza escondidos por toda la ciudad. ' +
                'Cada nivel añade una dificultad que te hará más difícil encontrar los trozos de pizza, te recomiendo probarlo todos (y repetir si crees que puedes hacerlo mejor). ' +
                'Si es tu primera vez jugando, te recomiendo pasarte por el tutorial para aprender los controles. ' +
                '¡Mucha suerte y que aproveche!</p>' +
                '<div class="niveles"></div>' +
            '</div>' +
            '<div class="vista vista-nivel" style="display:none">' +
                '<div class="instrucciones"></div>' +
                '<button type="button" class="btn-empezar">Empezar</button>' +
                '<button type="button" class="btn-volver">Volver</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlayMenu);

    vistaNiveles = overlayMenu.querySelector('.vista-niveles');
    vistaNivel = overlayMenu.querySelector('.vista-nivel');
    contenedorInstrucciones = overlayMenu.querySelector('.instrucciones');

    var listaNiveles = overlayMenu.querySelector('.niveles');
    niveles.forEach(function (nivel, indice)
    {
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-nivel';
        boton.textContent = nivel.boton;
        boton.addEventListener('click', function () { seleccionarNivel(indice); });
        listaNiveles.appendChild(boton);
    });

    botonEmpezar = overlayMenu.querySelector('.btn-empezar');
    botonEmpezar.disabled = true;
    botonEmpezar.textContent = 'Cargando...';
    botonEmpezar.addEventListener('click', iniciarJuego);

    overlayMenu.querySelector('.btn-volver').addEventListener('click', volverASeleccionNivel);
}

function aplicarAmbiente(noche, farolas, conLinterna)
{
    nocheActiva = noche;
    farolasEncendidas = noche && farolas !== false;
    linternaActiva = noche && !!conLinterna;
    factorBombillaAmbiente = (noche && !farolasEncendidas) ? 0.03 : 1;
    materialesBombilla.forEach(function (m) { m.emissiveIntensity = m.userData.emisivoBase * factorBombillaAmbiente; });
    factorBrilloAmbiente = noche ? brilloNocheFactor : 1;

    materialesConBrillo.forEach(function (m) { m.emissiveIntensity = m.userData.brilloBase * factorBrilloAmbiente; });
    materialesConReflejo.forEach(function (m)
    {
        if (m.userData.reflejoBase === undefined) m.userData.reflejoBase = m.envMapIntensity;
        m.envMapIntensity = m.userData.reflejoBase * (noche ? reflejoNocheFactor : 1);
    });

    if (sunLight !== null) sunLight.visible = !noche;
    lucesFarola.forEach(function (l) { l.visible = farolasEncendidas; l.intensity = 0; });
    grupoHalos.visible = farolasEncendidas;
    linterna.visible = linternaActiva;
    linterna.intensity = linternaActiva ? luzLinterna.intensidad : 0;

    if (noche) scene.background = new THREE.Color(colorCieloNoche);
    else if (texturaCieloDia !== null) scene.background = texturaCieloDia;
}

function buscarHuesoMano(modelo)
{
    if (nombreHuesoLinterna)
    {
        var buscado = nombreHuesoLinterna.toLowerCase();
        var exacto = null;
        modelo.traverse(function (o) { if (!exacto && o.name && o.name.toLowerCase().indexOf(buscado) !== -1) exacto = o; });
        if (exacto) return exacto;
    }

    var mejor = null, mejorPuntos = 0, nombres = [];
    modelo.traverse(function (o)
    {
        if (!o.name) return;
        nombres.push(o.name);
        var n = o.name.toLowerCase();
        if (!/hand|paw|mano|wrist|palm|zarpa|pata/.test(n)) return;
        var puntos = 1;
        if (/right|derech|(^|[_.\-\s])r($|[_.\-\s])|[a-z]r$/.test(n)) puntos += 4;
        if (/(hand|paw|mano|wrist|palm)[_.\-\s]*(r|right|\d*)?$/.test(n)) puntos += 3;
        if (/finger|thumb|index|middle|ring|pinky|toe|claw|dedo|garra|uña/.test(n)) puntos -= 5;
        if (/hind|back|rear|foot|leg|trasera/.test(n)) puntos -= 4;
        if (puntos > mejorPuntos) { mejorPuntos = puntos; mejor = o; }
    });
    console.info('Huesos/nodos del gato:', nombres.join(', '));
    console.info('Linterna en:', mejor ? mejor.name : '(ninguno: se usa una posición fija junto al gato)');
    return mejor;
}

function crearModeloLinterna()
{
    var L = Math.max(alturaGato, 10) * 0.4;
    var g = new THREE.Object3D();

    var matCuerpo = matEstandar({ color: 0x2f3640, roughness: 0.5, metalness: 0.3 });
    var matCabeza = matEstandar({ color: 0x9aa3ad, roughness: 0.4, metalness: 0.4 });
    var matBombilla = new THREE.MeshBasicMaterial({ color: 0xFFE040 });

    var mango = new THREE.Mesh(new THREE.CylinderGeometry(L * 0.11, L * 0.11, L * 0.6, 16).rotateX(Math.PI / 2), matCuerpo);
    mango.position.z = -L * 0.15;
    var cabeza = new THREE.Mesh(new THREE.CylinderGeometry(L * 0.2, L * 0.15, L * 0.35, 20).rotateX(Math.PI / 2), matCabeza);
    cabeza.position.z = L * 0.32;
    var bombilla = new THREE.Mesh(new THREE.SphereGeometry(L * 0.15, 16, 12), matBombilla);
    bombilla.position.z = L * 0.5;

    g.add(mango, cabeza, bombilla);
    g.userData.largo = L;
    g.userData.punta = L * 0.5;
    g.rotation.order = 'YXZ';
    g.visible = false;
    activarSombras(g, false, false);
    return g;
}

var _vMano = new THREE.Vector3();

function actualizarLinterna()
{
    if (grupoLinterna !== null) grupoLinterna.visible = linternaActiva && gato !== null;
    if (!linternaActiva || gato === null || grupoLinterna === null) return;

    var dx = Math.sin(angulo), dz = Math.cos(angulo);
    gato.updateMatrixWorld(true);

    if (huesoLinterna !== null)
    {
        huesoLinterna.getWorldPosition(_vMano);
    }
    else
    {
        var lado = radioColisionGato * 0.9;
        _vMano.set(gato.position.x - dz * lado, gato.position.y + alturaGato * 0.5, gato.position.z + dx * lado);
    }

    _vMano.x += dz * desplazamientoLateralLinterna;
    _vMano.z -= dx * desplazamientoLateralLinterna;
    _vMano.y += ajusteAlturaLinterna;

    var inc = luzLinterna.inclinacion;
    var ch = Math.cos(inc), sh = Math.sin(inc);
    grupoLinterna.position.copy(_vMano);
    grupoLinterna.rotation.set(inc, angulo, 0);

    var punta = grupoLinterna.userData.punta;
    linterna.position.set(_vMano.x + dx * ch * punta, _vMano.y - sh * punta, _vMano.z + dz * ch * punta);
    linterna.target.position.set(
        linterna.position.x + dx * ch * luzLinterna.distanciaObjetivo,
        linterna.position.y - sh * luzLinterna.distanciaObjetivo,
        linterna.position.z + dz * ch * luzLinterna.distanciaObjetivo);
    linterna.target.updateMatrixWorld();
}

var _candidatasLuz = [];
function actualizarLucesFarolas()
{
    if (!farolasEncendidas || gato === null) return;
    var gx = gato.position.x, gz = gato.position.z;
    var maximo = luzFarola.alcance * 1.5;

    _candidatasLuz.length = 0;
    for (var i = 0; i < posicionesBombillas.length; i++)
    {
        var p = posicionesBombillas[i];
        var d = (p.x - gx) * (p.x - gx) + (p.z - gz) * (p.z - gz);
        if (d < maximo * maximo) _candidatasLuz.push({ p: p, d: d });
    }
    _candidatasLuz.sort(function (a, b) { return a.d - b.d; });

    for (var j = 0; j < lucesFarola.length; j++)
    {
        var luz = lucesFarola[j];
        if (j < _candidatasLuz.length)
        {
            luz.position.copy(_candidatasLuz[j].p);
            luz.intensity = luzFarola.intensidad;
        }
        else luz.intensity = 0;
    }
}

function seleccionarNivel(indice)
{
    if (!enMenu) return;
    nivelActual = indice;
    if (niveles[indice].mapa !== mapaConstruido)
    {
        construirMapa(niveles[indice].mapa);
        regenerarObjetosJuego();
    }
    colocarFantasmas();
    aplicarAmbiente(!!niveles[indice].noche, niveles[indice].farolas, niveles[indice].linterna);
    contenedorInstrucciones.innerHTML = niveles[indice].instrucciones();
    vistaNiveles.style.display = 'none';
    vistaNivel.style.display = 'flex';
    overlayMenu.querySelector('.panel').scrollTop = 0;
}

function volverASeleccionNivel()
{
    if (!enMenu) return;
    vistaNivel.style.display = 'none';
    vistaNiveles.style.display = 'flex';
    overlayMenu.querySelector('.panel').scrollTop = 0;
}

function activarBotonEmpezar()
{
    if (botonEmpezar === null) return;
    botonEmpezar.disabled = false;
    botonEmpezar.textContent = 'Empezar';
}

function iniciarJuego()
{
    if (!enMenu || gato === null) return;
    enMenu = false;
    releaseControls();

    inicioTransicionPos.copy(camera.position);
    inicioTransicionQuat.copy(camera.quaternion);
    tTransicionCamara = 0;
    duracionTransicionActual = 1.0;
    transicionCamara = true;

    panelHud.style.display = 'block';
    canvasMapa.style.display = 'block';
    minimapaVisible = true;

    overlayMenu.querySelector('.panel').style.pointerEvents = 'none';
    overlayMenu.style.opacity = '0';
    setTimeout(function () { overlayMenu.style.display = 'none'; }, 500);
}

function aplicarVistaMenu()
{
    if (!camera) return;
    if (fraccionVista > 0.0005)
    {
        camera.setViewOffset(
            window.innerWidth, window.innerHeight,
            window.innerWidth * fraccionVista, 0,
            window.innerWidth, window.innerHeight
        );
    }
    else if (camera.view && camera.view.enabled)
    {
        camera.clearViewOffset();
    }
}

function actualizarVistaMenu(delta)
{
    var objetivo = enMenu ? fraccionVistaMenu : 0;
    if (fraccionVista === objetivo) return;
    fraccionVista += (objetivo - fraccionVista) * (1 - Math.exp(-5 * delta));
    if (Math.abs(fraccionVista - objetivo) < 0.001) fraccionVista = objetivo;
    aplicarVistaMenu();
}

// ===== CUENTA ATRÁS =====
function createCuentaAtras()
{
    if (window.location && window.location.protocol === 'file:')
    {
        console.warn('⚠ Has abierto el juego con doble clic (file://). El navegador bloquea así las texturas\ny el modelo del gato. Ábrelo desde un servidor local (por ejemplo, la extensión Live Server\nde VS Code, o "python -m http.server" en la carpeta del juego).');
    }

    var estilo = document.createElement('style');
    estilo.textContent =
        '@keyframes pop-cuenta{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}' +
        '35%{transform:translate(-50%,-50%) scale(1.15);opacity:1}' +
        '100%{transform:translate(-50%,-50%) scale(1);opacity:1}}';
    document.head.appendChild(estilo);

    elementoCuenta = document.createElement('div');
    elementoCuenta.style.cssText = 'position:fixed;top:36%;left:50%;transform:translate(-50%,-50%);font:bold 150px system-ui,Arial,sans-serif;color:#fff;text-shadow:0 6px 0 #c2410c,0 0 30px rgba(0,0,0,.55);display:none;z-index:4;pointer-events:none;';
    document.body.appendChild(elementoCuenta);
}

function mostrarNumeroCuenta(texto)
{
    elementoCuenta.textContent = texto;
    elementoCuenta.style.display = 'block';
    elementoCuenta.style.animation = 'none';
    void elementoCuenta.offsetWidth;
    elementoCuenta.style.animation = 'pop-cuenta .6s ease-out forwards';
}

function actualizarCuentaAtras(delta)
{
    if (enMenu || juegoActivo) return;

    if (!cuentaIniciada)
    {
        if (transicionCamara) return;
        cuentaIniciada = true;
        tiempoCuenta = duracionCuentaAtras;
        ultimoNumeroCuenta = 0;
    }

    tiempoCuenta -= delta;
    var numero = Math.ceil(tiempoCuenta);
    if (numero > 0)
    {
        if (numero !== ultimoNumeroCuenta) mostrarNumeroCuenta(String(numero));
        ultimoNumeroCuenta = numero;
    }
    else
    {
        activarJuego();
    }
}

function activarJuego()
{
    juegoActivo = true;
    pizzas.forEach(function (pizza) { pizza.visible = true; });
    manzanas.forEach(function (manzana) { manzana.visible = true; });
    mostrarNumeroCuenta('¡YA!');
    setTimeout(function () { elementoCuenta.style.display = 'none'; }, 900);
}

// ===== MINIMAPA =====
function crearMinimapa()
{
    limiteMapa = limiteExterior() + 15;

    canvasMapa = document.createElement('canvas');
    canvasMapa.width = resolucionMapa;
    canvasMapa.height = resolucionMapa;
    canvasMapa.style.cssText = 'display:none;position:fixed;right:14px;bottom:14px;width:' + tamanoMapa + 'px;height:' + tamanoMapa + 'px;z-index:3;pointer-events:none;border-radius:12px;border:2px solid rgba(255,255,255,.9);box-shadow:0 4px 16px rgba(0,0,0,.45);';
    document.body.appendChild(canvasMapa);
    ctxMapa = canvasMapa.getContext('2d');

    fondoMapa = document.createElement('canvas');
    fondoMapa.width = resolucionMapa;
    fondoMapa.height = resolucionMapa;
    dibujarFondoMapa(fondoMapa.getContext('2d'));
}

function dibujarFondoMapa(ctx)
{
    var k = resolucionMapa / (2 * limiteMapa);
    function m(v) { return (v + limiteMapa) * k; }

    function anillo(a, b, color)
    {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(m(-b), m(-b), 2 * b * k, 2 * b * k);
        ctx.rect(m(-a), m(-a), 2 * a * k, 2 * a * k);
        ctx.fill('evenodd');
    }

    ctx.fillStyle = '#5aa05a';
    ctx.fillRect(0, 0, resolucionMapa, resolucionMapa);
    anillo(bordeAceraInt, bordeAceraExt, '#a9a9a9');
    anillo(bordeCarreteraInt, bordeCarreteraExt, '#383838');

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(m(-mitadCarretera), m(-mitadCarretera), 2 * mitadCarretera * k, 2 * mitadCarretera * k);
    ctx.setLineDash([]);

    if (rampa !== null)
    {
        var degradado = ctx.createLinearGradient(0, m(rampa.zInicio), 0, m(rampa.zFin));
        degradado.addColorStop(0, 'rgba(90,50,10,0)');
        degradado.addColorStop(1, 'rgba(90,50,10,0.45)');
        ctx.fillStyle = degradado;
        ctx.fillRect(0, m(rampa.zFin), resolucionMapa, m(rampa.zInicio) - m(rampa.zFin));
        ctx.fillStyle = 'rgba(90,50,10,0.45)';
        ctx.fillRect(0, 0, resolucionMapa, m(rampa.zFin));
        ctx.fillStyle = '#5aa05a';
        ctx.fillRect(m(-bordeAceraInt), m(-bordeAceraInt), 2 * bordeAceraInt * k, 2 * bordeAceraInt * k);
    }

    ctx.fillStyle = '#d8a56a';
    objectsToCheck.forEach(function (obstaculo)
    {
        var c = cajaColision(obstaculo);
        if (c.max.y - c.min.y < 140) return;
        ctx.fillRect(m(c.min.x), m(c.min.z), (c.max.x - c.min.x) * k, (c.max.z - c.min.z) * k);
    });
}

function actualizarMinimapa()
{
    if (!minimapaVisible || ctxMapa === null) return;
    var k = resolucionMapa / (2 * limiteMapa);

    var nivel = niveles[nivelActual];
    var cono = !!nivel.conoMinimapa && linternaActiva && gato !== null;
    var rCerca = radioCercaMapa * k, rVision = radioVisionMapa * k;

    if (cono)
    {
        ctxMapa.fillStyle = '#05070f';
        ctxMapa.fillRect(0, 0, resolucionMapa, resolucionMapa);

        var cx = (gato.position.x + limiteMapa) * k, cy = (gato.position.z + limiteMapa) * k;
        var dir = Math.atan2(Math.cos(angulo), Math.sin(angulo));
        var medio = luzLinterna.angulo;

        ctxMapa.save();
        ctxMapa.beginPath();
        ctxMapa.moveTo(cx, cy);
        ctxMapa.arc(cx, cy, rVision, dir - medio, dir + medio);
        ctxMapa.closePath();
        ctxMapa.moveTo(cx + rCerca, cy);
        ctxMapa.arc(cx, cy, rCerca, 0, Math.PI * 2);
        ctxMapa.clip();
        ctxMapa.drawImage(fondoMapa, 0, 0);
    }
    else
    {
        ctxMapa.drawImage(fondoMapa, 0, 0);
    }

    function punto(x, z, color)
    {
        ctxMapa.beginPath();
        ctxMapa.arc((x + limiteMapa) * k, (z + limiteMapa) * k, 9, 0, Math.PI * 2);
        ctxMapa.fillStyle = color;
        ctxMapa.fill();
        ctxMapa.lineWidth = 3;
        ctxMapa.strokeStyle = '#ffffff';
        ctxMapa.stroke();
    }

    if (juegoActivo)
    {
        var radio = niveles[nivelActual].radioMinimapa || 0;
        var visible = function (objeto)
        {
            if (!radio || gato === null) return true;
            return Math.hypot(objeto.position.x - gato.position.x, objeto.position.z - gato.position.z) <= radio;
        };

        if (radio && gato !== null)
        {
            ctxMapa.beginPath();
            ctxMapa.arc((gato.position.x + limiteMapa) * k, (gato.position.z + limiteMapa) * k, radio * k, 0, Math.PI * 2);
            ctxMapa.fillStyle = 'rgba(255,255,255,0.10)';
            ctxMapa.fill();
            ctxMapa.lineWidth = 2;
            ctxMapa.strokeStyle = 'rgba(255,255,255,0.7)';
            ctxMapa.stroke();
        }

        pizzas.forEach(function (pizza) { if (visible(pizza)) punto(pizza.position.x, pizza.position.z, '#1e6bff'); });
        manzanas.forEach(function (manzana) { if (visible(manzana)) punto(manzana.position.x, manzana.position.z, '#ff2a2a'); });
    }

    if (cono)
    {
        ctxMapa.restore();
        ctxMapa.beginPath();
        ctxMapa.moveTo(cx, cy);
        ctxMapa.arc(cx, cy, rVision, dir - medio, dir + medio);
        ctxMapa.closePath();
        ctxMapa.lineWidth = 2;
        ctxMapa.strokeStyle = 'rgba(255,224,64,0.7)';
        ctxMapa.stroke();
    }

    if (gato !== null)
    {
        var dx = Math.sin(angulo), dz = Math.cos(angulo);
        var px = (gato.position.x + limiteMapa) * k;
        var py = (gato.position.z + limiteMapa) * k;
        ctxMapa.beginPath();
        ctxMapa.moveTo(px + dx * 16, py + dz * 16);
        ctxMapa.lineTo(px - dx * 10 + dz * 10, py - dz * 10 - dx * 10);
        ctxMapa.lineTo(px - dx * 10 - dz * 10, py - dz * 10 + dx * 10);
        ctxMapa.closePath();
        ctxMapa.fillStyle = '#ffd400';
        ctxMapa.fill();
        ctxMapa.lineWidth = 3;
        ctxMapa.strokeStyle = '#000000';
        ctxMapa.stroke();
    }
}

function createHud()
{
    panelHud = document.createElement('div');
    panelHud.style.cssText = 'display:none;position:fixed;top:12px;left:12px;padding:10px 14px;background:rgba(0,0,0,.72);color:#fff;font:bold 18px/1.5 monospace;white-space:pre;z-index:3;pointer-events:none;border-radius:6px;';
    document.body.appendChild(panelHud);
    actualizarHud();
}

function installCameraMouseControls()
{
    var canvas = renderer.domElement;

    canvas.addEventListener('contextmenu', function (event)
    {
        event.preventDefault();
    });

    canvas.addEventListener('pointerdown', function (event)
    {
        if (pausado || partidaTerminada || enMenu || event.button !== 0) return;
        arrastrandoCamara = true;
        posicionRatonX = event.clientX;
        posicionRatonY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    canvas.addEventListener('pointermove', function (event)
    {
        if (!arrastrandoCamara) return;
        var deltaX = event.clientX - posicionRatonX;
        var deltaY = event.clientY - posicionRatonY;
        posicionRatonX = event.clientX;
        posicionRatonY = event.clientY;
        anguloHorizontalCamara -= deltaX * 0.005;
        angulo_inclinacion_camara = THREE.MathUtils.clamp(
            angulo_inclinacion_camara + deltaY * 0.005,
            10 * Math.PI / 180,
            75 * Math.PI / 180
        );
        event.preventDefault();
    });

    canvas.addEventListener('pointerup', function (event)
    {
        if (event.button === 0) arrastrandoCamara = false;
    });

    canvas.addEventListener('pointercancel', function ()
    {
        arrastrandoCamara = false;
    });

    canvas.addEventListener('wheel', function (event)
    {
        if (pausado) return;
        event.preventDefault();
        var factorZoom = event.deltaY > 0 ? 1.1 : 0.9;
        distancia_camara = THREE.MathUtils.clamp(
            distancia_camara * factorZoom,
            distanciaCamaraMinima,
            distanciaCamaraMaxima
        );
    }, { passive: false });
}

function createVictoryMessage()
{
    mensajeVictoria = document.createElement('div');
    mensajeVictoria.style.cssText = 'position:fixed;top:20%;left:50%;transform:translate(-50%,-50%);padding:20px 40px;background:rgba(0,0,0,.8);color:white;font:bold 44px sans-serif;text-align:center;border-radius:16px;display:none;z-index:2;';

    textoVictoria = document.createElement('div');
    textoVictoria.style.whiteSpace = 'pre';
    textoVictoria.textContent = '¡Victoria!';
    mensajeVictoria.appendChild(textoVictoria);

    botonVolverInicio = document.createElement('button');
    botonVolverInicio.type = 'button';
    botonVolverInicio.textContent = 'Volver al inicio';
    botonVolverInicio.style.cssText = 'margin-top:18px;padding:12px 28px;border:0;border-radius:12px;background:#ff8a1f;color:#fff;font:bold 20px system-ui,Arial,sans-serif;cursor:pointer;';
    botonVolverInicio.addEventListener('mouseenter', function () { botonVolverInicio.style.background = '#ff9d44'; });
    botonVolverInicio.addEventListener('mouseleave', function () { botonVolverInicio.style.background = '#ff8a1f'; });
    botonVolverInicio.addEventListener('click', volverAlInicio);
    mensajeVictoria.appendChild(botonVolverInicio);

    document.body.appendChild(mensajeVictoria);
}

function volverAlInicio()
{
    if (gato === null || !partidaTerminada) return;

    partidaTerminada = false;
    haPerdido = false;
    juegoActivo = false;
    cuentaIniciada = false;
    tiempoCuenta = 0;
    ultimoNumeroCuenta = 0;
    progresoAparicion = 0;
    pizzasRecogidas = 0;
    tiempoPartida = 0;
    tiempoEfectoManzana = 0;
    pausado = false;
    cameraControls.enabled = false;
    releaseControls();
    arrastrandoCamara = false;

    regenerarObjetosJuego();

    angulo = 0;
    velocity.set(0, 0, 1);
    alturaSueloGato = 0;
    catIsMoving = false;
    gato.position.set(posicionInicialGato.x, alturaBaseGato, posicionInicialGato.z);
    gato.rotation.y = angulo + desfase_orientacion;

    distancia_camara = Math.hypot(desplazamientoInicialCamara.x, desplazamientoInicialCamara.z);
    anguloHorizontalCamara = Math.atan2(desplazamientoInicialCamara.x, -desplazamientoInicialCamara.z);
    angulo_inclinacion_camara = Math.atan2(desplazamientoInicialCamara.y, distancia_camara);
    camara_spring_iniciada = false;

    enMenu = true;
    inicioTransicionPos.copy(camera.position);
    inicioTransicionQuat.copy(camera.quaternion);
    tTransicionCamara = 0;
    duracionTransicionActual = 1.2;
    transicionCamara = true;

    mensajeVictoria.style.display = 'none';
    elementoCuenta.style.display = 'none';
    panelHud.style.display = 'none';
    canvasMapa.style.display = 'none';
    minimapaVisible = false;
    textoHudAnterior = '';
    actualizarHud();

    vistaNivel.style.display = 'none';
    vistaNiveles.style.display = 'flex';
    var panel = overlayMenu.querySelector('.panel');
    panel.style.pointerEvents = 'auto';
    panel.scrollTop = 0;
    overlayMenu.style.display = 'flex';
    void overlayMenu.offsetWidth;
    overlayMenu.style.opacity = '1';
}

function createPizzaSlice()
{
    var trozo_pizza = new THREE.Object3D();
    var arco = Math.PI / 3;
    var radio = 14;
    var grosor = 2.5;
    var alturaCapa = 0.8;
    var inicio = -arco / 2;
    var fin = arco / 2;
    var recorte = 5 * Math.PI / 180;
    var arcoCorteza = arco - 2 * recorte;
    var inicioCorteza = inicio + recorte;
    var finCorteza = fin - recorte;

    var geometry = uvToroEscalado(new THREE.TorusGeometry(radio, grosor, 16, 100, arcoCorteza), tamanoBaldosaPizza);
    var materialBorde = matPizzaCorteza();
    var torus = new THREE.Mesh(geometry, materialBorde);
    torus.rotation.z = inicioCorteza;
    trozo_pizza.add(torus);

    var formaCapa = new THREE.Shape();
    formaCapa.moveTo(0, 0);
    formaCapa.lineTo(radio * Math.cos(inicio), radio * Math.sin(inicio));
    formaCapa.absarc(0, 0, radio, inicio, fin, false);
    formaCapa.lineTo(0, 0);

    function crearCapa(materialCapa, posicionZ)
    {
        var geometriaCapa = uvPlanarExtrusion(new THREE.ExtrudeGeometry(formaCapa, {
            depth: alturaCapa,
            bevelEnabled: false
        }), radio);
        var capa = new THREE.Mesh(geometriaCapa, materialCapa);
        capa.position.z = posicionZ;
        trozo_pizza.add(capa);
    }

    crearCapa(matPizzaCorteza(), -1.2);
    crearCapa(matPizzaSalsa(), -0.4);
    crearCapa(matPizzaQueso(), 0.4);

    var geometriaMediaEsfera = uvEsferaEscalada(new THREE.SphereGeometry(grosor, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), tamanoBaldosaPizza);
    var mediaEsferaInicial = new THREE.Mesh(geometriaMediaEsfera, materialBorde);
    mediaEsferaInicial.position.set(radio * Math.cos(inicioCorteza), radio * Math.sin(inicioCorteza), 0);
    mediaEsferaInicial.rotation.z = Math.PI + inicioCorteza;
    trozo_pizza.add(mediaEsferaInicial);

    var mediaEsferaFinal = new THREE.Mesh(geometriaMediaEsfera, materialBorde);
    mediaEsferaFinal.position.set(radio * Math.cos(finCorteza), radio * Math.sin(finCorteza), 0);
    mediaEsferaFinal.rotation.z = finCorteza;
    trozo_pizza.add(mediaEsferaFinal);

    var escalaX = radio / 10 * 0.85;
    var escalaY = radio / 10 * 1.5;
    var posicionesCilindros = [[3.2, 0.2], [5.1, -0.8], [6.2, 0.9], [7.4, -1.5], [8.6, 0.6]];
    var geometriaCilindro = new THREE.CylinderGeometry(0.6, 0.6, 0.18, 16);
    var materialCilindro = matPepperoni();
    posicionesCilindros.forEach(function (posicion)
    {
        var cilindro = new THREE.Mesh(geometriaCilindro, materialCilindro);
        cilindro.position.set(posicion[0] * escalaX, posicion[1] * escalaY, 1.29);
        cilindro.rotation.x = Math.PI / 2;
        trozo_pizza.add(cilindro);
    });

    var posicionesPuntosVerdes = [[2.1, 0.1], [4.1, 1.1], [5.2, -1.6], [6.9, 1.4], [7.8, -0.4]];
    var geometriaPuntoVerde = new THREE.SphereGeometry(0.25, 12, 8);
    var materialPuntoVerde = matEstandar({ color: 0x245A20 });
    posicionesPuntosVerdes.forEach(function (posicion)
    {
        var puntoVerde = new THREE.Mesh(geometriaPuntoVerde, materialPuntoVerde);
        puntoVerde.position.set(posicion[0] * escalaX, posicion[1] * escalaY, 1.4);
        trozo_pizza.add(puntoVerde);
    });

    var pivote = new THREE.Object3D();
    var centroX = radio * 0.42;
    var inclinacion = new THREE.Object3D();
    inclinacion.rotation.y = -Math.PI / 6;
    var hijos = trozo_pizza.children.slice();
    hijos.forEach(function (hijo)
    {
        trozo_pizza.remove(hijo);
        hijo.position.x -= centroX;
        inclinacion.add(hijo);
    });
    pivote.position.x = centroX;
    pivote.add(inclinacion);
    var orientacionSuelo = new THREE.Object3D();
    orientacionSuelo.rotation.x = -Math.PI / 2;
    orientacionSuelo.add(pivote);
    trozo_pizza.add(orientacionSuelo);
    trozo_pizza.userData.pivote = pivote;

    activarSombras(trozo_pizza, true, true);
    return trozo_pizza;
}

function createPizzas()
{
    if (esMapaNivel1())
    {
        repartoNivel1();
        totalPizzas = pizzas.length;
        return;
    }

    var posiciones = [];
    var intentos = 0;
    var margenObstaculo = 30;
    var mediaBanda = anchoCarretera / 2 + anchoAcera - 25;

    while (posiciones.length < 8 && intentos < 5000)
    {
        intentos++;
        var u = ladosMapa[Math.floor(Math.random() * ladosMapa.length)];
        var d = mitadCarretera + (Math.random() * 2 - 1) * mediaBanda;
        var t = (Math.random() * 2 - 1) * mitadCarretera;
        var x = u[0] * d - u[1] * t;
        var z = u[1] * d + u[0] * t;

        if (Math.hypot(x - posicionInicialGato.x, z - posicionInicialGato.z) < 150) continue;
        if (posiciones.some(function (p) { return Math.hypot(x - p.x, z - p.z) < 200; })) continue;
        if (puntoBloqueado(x, z, margenObstaculo)) continue;

        var pizza = createPizzaSlice();
        pizza.position.set(x, alturaFlotacionPizza, z);
        pizza.userData.faseAnimacion = Math.random() * Math.PI * 2;
        pizza.visible = false;
        scene.add(pizza);
        posiciones.push({ x: x, z: z });
        pizzas.push(pizza);
    }
    totalPizzas = pizzas.length;
}


function createManzana()
{
    var manzana = new THREE.Object3D();
    var radio = 13;

    var cuerpo = new THREE.Mesh(
        uvEsferaEscalada(new THREE.SphereGeometry(radio, 24, 16), Math.PI * radio),
        matManzanaCuerpo()
    );
    cuerpo.scale.set(1, 0.92, 1);
    manzana.add(cuerpo);

    var rabito = new THREE.Mesh(
        uvCilindroEscalado(new THREE.CylinderGeometry(0.9, 1.2, 6, 8), 6),
        matHojaManzana()
    );
    rabito.position.set(0.8, radio * 0.92 + 1, 0);
    rabito.rotation.z = -0.2;
    manzana.add(rabito);

    var hoja = new THREE.Mesh(
        uvPlanarXZ(new THREE.SphereGeometry(4, 12, 8)),
        matHojaManzana()
    );
    hoja.scale.set(1.7, 0.25, 0.8);
    hoja.position.set(5, radio * 0.92 + 3.5, 0);
    hoja.rotation.z = 0.35;
    manzana.add(hoja);

    activarSombras(manzana, true, true);
    return manzana;
}

function createManzanas()
{
    if (esMapaNivel1()) return;

    var intentos = 0;
    var margenObstaculo = 30;
    var mediaBanda = anchoCarretera / 2 + anchoAcera - 25;

    while (manzanas.length < numeroManzanas && intentos < 5000)
    {
        intentos++;
        var u = ladosMapa[Math.floor(Math.random() * ladosMapa.length)];
        var d = mitadCarretera + (Math.random() * 2 - 1) * mediaBanda;
        var t = (Math.random() * 2 - 1) * mitadCarretera;
        var x = u[0] * d - u[1] * t;
        var z = u[1] * d + u[0] * t;

        if (Math.hypot(x - posicionInicialGato.x, z - posicionInicialGato.z) < 150) continue;
        if (pizzas.some(function (q) { return Math.hypot(x - q.position.x, z - q.position.z) < 150; })) continue;
        if (manzanas.some(function (q) { return Math.hypot(x - q.position.x, z - q.position.z) < 250; })) continue;
        if (puntoBloqueado(x, z, margenObstaculo)) continue;

        var manzana = createManzana();
        manzana.position.set(x, alturaFlotacionPizza, z);
        manzana.userData.faseAnimacion = Math.random() * Math.PI * 2;
        manzana.visible = false;
        scene.add(manzana);
        manzanas.push(manzana);
    }
}

// ===== REPARTO =====
function esMapaNivel1()
{
    return rampa !== null;
}

function mezclar(lista)
{
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--)
    {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = copia[i]; copia[i] = copia[j]; copia[j] = tmp;
    }
    return copia;
}

function puntoAnillo(lado, banda, t)
{
    var inicio, fin;
    if (banda === 'acera_int')
    {
        inicio = bordeAceraInt + 55;
        fin = bordeCarreteraInt - 50;
    }
    else if (banda === 'carretera')
    {
        inicio = bordeCarreteraInt + 25;
        fin = bordeCarreteraExt - 25;
    }
    else
    {
        inicio = bordeCarreteraExt + 50;
        fin = bordeAceraExt - 50;
    }
    var d = inicio + Math.random() * (fin - inicio);
    if (lado === 'norte') return { x: t, z: -d };
    if (lado === 'sur') return { x: t, z: d };
    if (lado === 'este') return { x: d, z: t };
    return { x: -d, z: t };
}

function puestoValido(x, z, separacion)
{
    if (posicionesFantasma.some(function (p) { return Math.hypot(x - p[0], z - p[1]) < distanciaMinimaPizzaFantasma; })) return false;
    if (Math.hypot(x - posicionInicialGato.x, z - posicionInicialGato.z) < 150) return false;
    if (puntoBloqueado(x, z, 30)) return false;
    var cerca = function (o) { return Math.hypot(x - o.position.x, z - o.position.z) < separacion; };
    return !pizzas.some(cerca) && !manzanas.some(cerca);
}

function colocarPizza(x, z)
{
    var pizza = createPizzaSlice();
    pizza.position.set(x, alturaFlotacionPizza, z);
    pizza.userData.faseAnimacion = Math.random() * Math.PI * 2;
    pizza.visible = false;
    scene.add(pizza);
    pizzas.push(pizza);
}

function colocarManzana(x, z)
{
    var manzana = createManzana();
    manzana.position.set(x, alturaFlotacionPizza, z);
    manzana.userData.faseAnimacion = Math.random() * Math.PI * 2;
    manzana.visible = false;
    scene.add(manzana);
    manzanas.push(manzana);
}

function repartirEnLado(lado, items)
{
    var mitadLargo = 720;
    var ancho = 2 * mitadLargo / items.length;
    items.forEach(function (item, i)
    {
        var centro = -mitadLargo + (i + 0.5) * ancho;
        var banda = item.carretera ? 'carretera' : (i % 2 === 0 ? 'acera_int' : 'acera_ext');
        for (var intento = 0; intento < 80; intento++)
        {
            var p = puntoAnillo(lado, banda, centro + (Math.random() * 2 - 1) * ancho * 0.3);
            if (!puestoValido(p.x, p.z, 110)) continue;
            if (item.tipo === 'pizza') colocarPizza(p.x, p.z); else colocarManzana(p.x, p.z);
            return;
        }
    });
}

function repartoNivel1()
{
    var colocadas = 0;
    mezclar(posicionesPizzaParque).forEach(function (p)
    {
        if (colocadas >= pizzasEnParque) return;
        if (!puestoValido(p[0], p[1], 100)) return;
        colocarPizza(p[0], p[1]);
        colocadas++;
    });

    var limite = bordeAceraInt - 100;
    var hechas = 0;
    for (var intento = 0; intento < 2000 && hechas < manzanasEnParque; intento++)
    {
        var x = (Math.random() * 2 - 1) * limite, z = (Math.random() * 2 - 1) * limite;
        if (!puestoValido(x, z, 150)) continue;
        colocarManzana(x, z);
        hechas++;
    }

    var ladoCuesta = Math.random() < 0.5 ? 'este' : 'oeste';
    var zMin = rampa.zFin + 80, zMax = rampa.zInicio - 80;
    for (var i = 0; i < 80; i++)
    {
        var banda = Math.random() < 0.5 ? 'acera_int' : 'acera_ext';
        var q = puntoAnillo(ladoCuesta, banda, zMin + Math.random() * (zMax - zMin));
        if (!puestoValido(q.x, q.z, 110)) continue;
        colocarManzana(q.x, q.z);
        break;
    }

    repartirEnLado('norte', mezclar([
        { tipo: 'pizza', carretera: true }, { tipo: 'pizza' }, { tipo: 'pizza' },
        { tipo: 'manzana' }, { tipo: 'manzana' }, { tipo: 'manzana' }
    ]));

    repartirEnLado('sur', mezclar([
        { tipo: 'pizza', carretera: true }, { tipo: 'pizza' },
        { tipo: 'manzana' }, { tipo: 'manzana' }, { tipo: 'manzana' }
    ]));
}

function animatePizzas(delta)
{
    tiempoAnimacionPizza += delta;
    if (juegoActivo && progresoAparicion < 1) progresoAparicion = Math.min(1, progresoAparicion + delta / 0.7);
    var tAparicion = progresoAparicion - 1;
    var escalaObjetos = 1 + 2.70158 * tAparicion * tAparicion * tAparicion + 1.70158 * tAparicion * tAparicion;
    pizzas.forEach(function (pizza)
    {
        pizza.scale.setScalar(escalaObjetos);
        var tiempo = tiempoAnimacionPizza + pizza.userData.faseAnimacion;
        pizza.userData.pivote.rotation.z = tiempo * Math.PI * 2 / 3;
        pizza.position.y = alturaFlotacionPizza
            + alturaSueloEn(pizza.position.x, pizza.position.z)
            + Math.sin(tiempo * Math.PI) * 0.75;
    });

    manzanas.forEach(function (manzana)
    {
        manzana.scale.setScalar(escalaObjetos);
        var tiempo = tiempoAnimacionPizza + manzana.userData.faseAnimacion;
        manzana.rotation.y = tiempo * 1.5;
        manzana.position.y = alturaFlotacionPizza
            + alturaSueloEn(manzana.position.x, manzana.position.z)
            + Math.sin(tiempo * Math.PI) * 0.75;
    });
}

function collectPizzas()
{
    if (partidaTerminada || !juegoActivo) return;
    var radioRecogida = Math.max(radioColisionGato, 10) + 12;
    for (var i = pizzas.length - 1; i >= 0; i--)
    {
        var pizza = pizzas[i];
        if (Math.hypot(gato.position.x - pizza.position.x, gato.position.z - pizza.position.z) <= radioRecogida)
        {
            scene.remove(pizza);
            pizzas.splice(i, 1);
            pizzasRecogidas++;
            if (pizzasRecogidas === totalPizzas) iniciarVictoria();
        }
    }
}

function collectManzanas()
{
    if (partidaTerminada || !juegoActivo) return;
    var radioRecogida = Math.max(radioColisionGato, 10) + 12;
    for (var i = manzanas.length - 1; i >= 0; i--)
    {
        var manzana = manzanas[i];
        if (Math.hypot(gato.position.x - manzana.position.x, gato.position.z - manzana.position.z) <= radioRecogida)
        {
            scene.remove(manzana);
            manzanas.splice(i, 1);
            tiempoEfectoManzana = duracionEfectoManzana;
        }
    }
}

// ===== GATOS FANTASMA =====
function cargarFantasmas()
{
    var gltfLoader = new THREE.GLTFLoader();
    posicionesFantasma.forEach(function (posicion)
    {
        gltfLoader.load(
            rutaModeloFantasma,
            function (gltf) { crearFantasma(gltf, posicion); },
            undefined,
            function (error) { console.error('No se pudo cargar el gato fantasma', error); }
        );
    });
}

function crearFantasma(gltf, posicion)
{
    var modelo = gltf.scene;

    var mallasAuxiliares = [];
    modelo.traverse(function (child)
    {
        if (child.isMesh && !child.isSkinnedMesh && /^cube(?:\.\d+)?$/i.test(child.name))
        {
            mallasAuxiliares.push(child);
        }
    });
    mallasAuxiliares.forEach(function (malla) { malla.parent.remove(malla); });

    modelo.traverse(function (child)
    {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;

        var materiales = Array.isArray(child.material) ? child.material : [child.material];
        child.material = materiales.map(function (material)
        {
            var nuevo = material.clone();
            nuevo.transparent = true;
            nuevo.opacity = Math.min(material.opacity === undefined ? 1 : material.opacity, 0.6);
            nuevo.depthWrite = false;
            nuevo.emissive.set(0x8bdcff);
            nuevo.userData.brilloBase = brilloPropioGato;
            nuevo.emissiveIntensity = brilloPropioGato * factorBrilloAmbiente;
            materialesConBrillo.push(nuevo);
            return nuevo;
        });
        if (child.material.length === 1) child.material = child.material[0];
    });

    modelo.scale.setScalar(1);
    modelo.updateMatrixWorld(true);
    var caja = new THREE.Box3().setFromObject(modelo);
    var tamano = caja.getSize(new THREE.Vector3());
    var dimension = Math.max(tamano.x, tamano.y, tamano.z);
    modelo.scale.setScalar(tamanoReferenciaGato * escalaRelativaFantasma / dimension);
    modelo.updateMatrixWorld(true);

    caja.setFromObject(modelo);
    var centro = caja.getCenter(new THREE.Vector3());
    tamano = caja.getSize(new THREE.Vector3());
    modelo.position.set(-centro.x, -caja.min.y, -centro.z);

    if (gltf.animations.length > 0)
    {
        var mixerFantasma = new THREE.AnimationMixer(modelo);
        var animacionFantasma = gltf.animations.find(function (animacion)
        {
            return /walk|correr|run/i.test(animacion.name);
        }) || gltf.animations.find(function (animacion)
        {
            return /idle|reposo|quiet/i.test(animacion.name);
        }) || gltf.animations[0];
        mixerFantasma.clipAction(animacionFantasma).play();
        mixersFantasma.push(mixerFantasma);
    }

    var fantasma = new THREE.Group();
    fantasma.add(modelo);
    fantasma.visible = false;
    fantasma.userData.posicion = posicion;
    fantasma.userData.radio = Math.sqrt(tamano.x * tamano.x + tamano.z * tamano.z) / 2;
    fantasma.userData.angulo = Math.atan2(-posicion[0], -posicion[1]);
    fantasma.userData.framesGiro = 0;
    fantasma.userData.direccionGiro = 1;
    fantasma.userData.girandoHastaAvanzar = false;
    scene.add(fantasma);
    fantasmas.push(fantasma);

    colocarFantasmas();
}

function colocarFantasmas()
{
    fantasmas.forEach(function (f)
    {
        var p = f.userData.posicion;
        f.position.set(p[0], alturaSueloEn(p[0], p[1]) + alturaBaseGato, p[1]);
        f.visible = nivelActual === 3 && esMapaNivel1();
    });
}

var _rayoFantasma = new THREE.Ray();
var _origenRayoFantasma = new THREE.Vector3();
var _impactoRayoFantasma = new THREE.Vector3();
var _cajaRayoFantasma = new THREE.Box3();

function distanciaLibreFantasma(posicion, direccion)
{
    _origenRayoFantasma.set(posicion.x, 0, posicion.z);
    _rayoFantasma.origin.copy(_origenRayoFantasma);
    _rayoFantasma.direction.set(direccion.x, 0, direccion.z).normalize();
    var masCerca = Infinity;

    for (var i = 0; i < objectsToCheck.length; i++)
    {
        var c = cajaColision(objectsToCheck[i]);
        _cajaRayoFantasma.min.set(c.min.x, -1e9, c.min.z);
        _cajaRayoFantasma.max.set(c.max.x, 1e9, c.max.z);
        if (_cajaRayoFantasma.containsPoint(_origenRayoFantasma)) continue;
        if (_rayoFantasma.intersectBox(_cajaRayoFantasma, _impactoRayoFantasma) === null) continue;

        var distancia = _impactoRayoFantasma.distanceTo(_origenRayoFantasma);
        if (distancia < masCerca) masCerca = distancia;
    }
    return masCerca;
}

function actualizarMovimientoFantasmas(delta)
{
    if (!juegoActivo || partidaTerminada || nivelActual !== 3 || !esMapaNivel1()) return;

    var fotogramas = Math.min(delta || 0, 0.05) * 60;
    var velocidad = controls.speed * velocidadRelativaFantasma;

    fantasmas.forEach(function (fantasma)
    {
        if (!fantasma.visible) return;

        var estado = fantasma.userData;
        var direccion = new THREE.Vector3(Math.sin(estado.angulo), 0, Math.cos(estado.angulo));
        var distanciaFrente = distanciaLibreFantasma(fantasma.position, direccion);
        var distanciaDeteccion = Math.max(fantasma.userData.radio * 3, velocidad * framesGiroFantasma * 3);

        if (!estado.girandoHastaAvanzar && estado.framesGiro <= 0 && distanciaFrente < distanciaDeteccion)
        {
            var izquierda = new THREE.Vector3(
                Math.sin(estado.angulo + Math.PI / 4), 0,
                Math.cos(estado.angulo + Math.PI / 4)
            );
            var derecha = new THREE.Vector3(
                Math.sin(estado.angulo - Math.PI / 4), 0,
                Math.cos(estado.angulo - Math.PI / 4)
            );
            estado.direccionGiro = distanciaLibreFantasma(fantasma.position, izquierda) >=
                distanciaLibreFantasma(fantasma.position, derecha) ? 1 : -1;
            estado.framesGiro = framesGiroFantasma;
        }

        if (estado.girandoHastaAvanzar)
        {
            estado.angulo += estado.direccionGiro * giroFantasma * fotogramas;
            direccion.set(Math.sin(estado.angulo), 0, Math.cos(estado.angulo));
        }
        else if (estado.framesGiro > 0)
        {
            estado.angulo += estado.direccionGiro * giroFantasma * fotogramas;
            estado.framesGiro = Math.max(0, estado.framesGiro - fotogramas);
            direccion.set(Math.sin(estado.angulo), 0, Math.cos(estado.angulo));
        }
        fantasma.rotation.y = estado.angulo + desfase_orientacion;

        var paso = direccion.clone().multiplyScalar(velocidad * fotogramas);
        paso = pasoConRayos(fantasma.position, paso);
        paso = pasoConRayos(fantasma.position, paso);
        var intento = fantasma.position.clone().add(paso);

        if (paso.lengthSq() < 1e-6 || puntoBloqueado(intento.x, intento.z, radioColisionGato * factorRadioColisionMovimiento))
        {
            if (!estado.girandoHastaAvanzar)
            {
                var izquierdaAtasco = new THREE.Vector3(
                    Math.sin(estado.angulo + Math.PI / 4), 0,
                    Math.cos(estado.angulo + Math.PI / 4)
                );
                var derechaAtasco = new THREE.Vector3(
                    Math.sin(estado.angulo - Math.PI / 4), 0,
                    Math.cos(estado.angulo - Math.PI / 4)
                );
                estado.direccionGiro = distanciaLibreFantasma(fantasma.position, izquierdaAtasco) >=
                    distanciaLibreFantasma(fantasma.position, derechaAtasco) ? 1 : -1;
                estado.girandoHastaAvanzar = true;
                estado.framesGiro = 0;
            }
            return;
        }

        fantasma.position.x = intento.x;
        fantasma.position.z = intento.z;
        fantasma.position.y = alturaBaseGato + alturaSueloEn(intento.x, intento.z);
        estado.girandoHastaAvanzar = false;
    });
}

function comprobarFantasmas()
{
    if (partidaTerminada || !juegoActivo) return;
    for (var i = 0; i < fantasmas.length; i++)
    {
        var f = fantasmas[i];
        if (!f.visible) continue;
        var alcance = (radioColisionGato + f.userData.radio) * factorColisionFantasma;
        if (Math.hypot(gato.position.x - f.position.x, gato.position.z - f.position.z) <= alcance)
        {
            iniciarDerrota();
            return;
        }
    }
}

function velocidadActual()
{
    return controls.speed * (tiempoEfectoManzana > 0 ? multiplicadorManzana : 1);
}

function terminarPartida()
{
    partidaTerminada = true;
    tiempoEfectoManzana = 0;
    releaseControls();
    arrastrandoCamara = false;

    anguloHorizontalCamara = Math.atan2(desplazamientoCamaraVictoria.x, -desplazamientoCamaraVictoria.z);
    inicioTransicionPos.copy(camera.position);
    inicioTransicionQuat.copy(camera.quaternion);
    tTransicionCamara = 0;
    duracionTransicionActual = 1.2;
    transicionCamara = true;

    mensajeVictoria.style.display = 'block';
}

function iniciarVictoria()
{
    haPerdido = false;
    textoVictoria.style.color = '';
    textoVictoria.textContent = '¡Victoria!\nTiempo: ' + formatearTiempo(tiempoPartida);
    terminarPartida();
}

function iniciarDerrota()
{
    haPerdido = true;
    textoVictoria.style.color = '#ff6b6b';
    textoVictoria.textContent = '¡Has perdido!\nTe ha atrapado un gato fantasma';
    terminarPartida();
}

function formatearTiempo(segundos)
{
    var decimas = Math.floor(segundos * 10);
    var minutos = Math.floor(decimas / 600);
    var seg = Math.floor((decimas % 600) / 10);
    var dec = decimas % 10;
    return (minutos < 10 ? '0' : '') + minutos + ':' + (seg < 10 ? '0' : '') + seg + '.' + dec;
}

function actualizarHud()
{
    if (panelHud === null) return;
    var texto = '🍕 ' + pizzasRecogidas + '/' + totalPizzas +
                '\n⏱ ' + formatearTiempo(tiempoPartida);
    if (tiempoEfectoManzana > 0)
    {
        texto += '\n🍎 x' + multiplicadorManzana + '  ' + tiempoEfectoManzana.toFixed(1) + 's';
    }
    if (texto !== textoHudAnterior)
    {
        panelHud.textContent = texto;
        textoHudAnterior = texto;
    }
}


function createEnvironment(tipo)
{
    var materialCarretera = matCarretera();
    var matAcera = matAceraTex();
    var matSuelo = matCesped();
    var grosor = 10;
    var alturaSuelo = alturaPavimento - 1;

    agregarSuelo(crearAnillo(bordeCarreteraInt, bordeCarreteraExt, 0, grosor, materialCarretera, tamanoBaldosaCarretera));

    agregarSuelo(crearAnillo(bordeAceraInt, bordeCarreteraInt, alturaPavimento, grosor, matAcera, tamanoBaldosaAcera));
    agregarSuelo(crearAnillo(bordeCarreteraExt, bordeAceraExt, alturaPavimento, grosor, matAcera, tamanoBaldosaAcera));

    var plaza = new THREE.Object3D();
    crearCajaSuelo(plaza, 2 * bordeAceraInt, grosor, 2 * bordeAceraInt, 0, alturaSuelo - grosor / 2, 0, matSuelo, tamanoBaldosaCesped, true);
    agregarSuelo(plaza);
    agregarSuelo(crearAnillo(bordeAceraExt, mitadMundo, alturaSuelo, grosor, matSuelo, tamanoBaldosaCesped));

    crearLineasCarretera();
    crearEdificios();
    crearMobiliario();
    if (rampa !== null) crearMuroParque();
    crearVallaExterior();
    if (tipo === 'tutorial') crearVallaInteriorTutorial();
    if (vallaParque) crearVallaParque();
    if (vallaParque) crearParqueNivel1();
}

function geometriaConUVMundo(geometria, posX, posY, posZ, tamano)
{
    geometria = aBuffer(geometria);
    var pos = geometria.attributes.position;
    var nor = geometria.attributes.normal;
    var uv = geometria.attributes.uv;
    for (var i = 0; i < pos.count; i++)
    {
        var wx = pos.getX(i) + posX, wy = pos.getY(i) + posY, wz = pos.getZ(i) + posZ;
        var nx = nor.getX(i), ny = nor.getY(i), nz = nor.getZ(i);
        if (ny > 0.5) uv.setXY(i, wx / tamano, -wz / tamano);
        else if (nx > 0.5) uv.setXY(i, -wz / tamano, wy / tamano);
        else if (nx < -0.5) uv.setXY(i, wz / tamano, wy / tamano);
        else if (nz > 0.5) uv.setXY(i, wx / tamano, wy / tamano);
        else if (nz < -0.5) uv.setXY(i, -wx / tamano, wy / tamano);
    }
    uv.needsUpdate = true;
    return geometria;
}

function crearCajaSuelo(destino, ancho, grosor, fondo, x, y, z, material, tamanoBaldosa, llano)
{
    var conRampa = (rampa !== null) && !llano;
    var z0 = z - fondo / 2, z1 = z + fondo / 2;
    var cortes = [z0];
    if (conRampa)
    {
        [rampa.zFin, rampa.zInicio].forEach(function (c)
        {
            if (c > z0 + 0.01 && c < z1 - 0.01) cortes.push(c);
        });
    }
    cortes.push(z1);

    for (var i = 0; i < cortes.length - 1; i++)
    {
        var a = cortes[i], b = cortes[i + 1], zc = (a + b) / 2;
        var geometria = new THREE.BoxGeometry(ancho, grosor, b - a);
        if (tamanoBaldosa) geometria = geometriaConUVMundo(geometria, x, y, zc, tamanoBaldosa);

        if (conRampa)
        {
            geometria = aBuffer(geometria);
            var pos = geometria.attributes.position;
            for (var j = 0; j < pos.count; j++)
            {
                pos.setY(j, pos.getY(j) + alturaRampaEn(pos.getZ(j) + zc));
            }
            pos.needsUpdate = true;
            geometria.computeVertexNormals();
        }

        var m = new THREE.Mesh(geometria, material);
        m.position.set(x, y, zc);
        destino.add(m);
    }
}

function crearAnillo(a, b, yTop, grosor, material, tamanoBaldosa)
{
    var anillo = new THREE.Object3D();
    var y = yTop - grosor / 2;
    var centro = (a + b) / 2, banda = b - a;

    function caja(ancho, fondo, x, z)
    {
        crearCajaSuelo(anillo, ancho, grosor, fondo, x, y, z, material, tamanoBaldosa);
    }
    caja(2 * b, banda, 0, centro);
    caja(2 * b, banda, 0, -centro);
    caja(banda, 2 * a, centro, 0);
    caja(banda, 2 * a, -centro, 0);
    return anillo;
}

function crearLineasCarretera()
{
    var largo = 30, hueco = 30;
    var geometria = new THREE.BoxGeometry(largo, 0.2, 3);
    var material = matEstandar({ color: 0xffffff });
    var dummy = new THREE.Object3D();
    var matrices = [];

    ladosMapa.forEach(function (u)
    {
        var tx = -u[1], tz = u[0];
        for (var t = -mitadCarretera + largo; t <= mitadCarretera - largo; t += largo + hueco)
        {
            var cx = u[0] * mitadCarretera + tx * t, cz = u[1] * mitadCarretera + tz * t;
            var yaw = (tx !== 0) ? 0 : Math.PI / 2;

            var mitadZ = (tx !== 0) ? 1.5 : largo / 2;
            if (inclinacionSueloEn(cz - mitadZ) !== inclinacionSueloEn(cz + mitadZ)) continue;

            dummy.position.set(cx, 0.1 + alturaRampaEn(cz), cz);
            orientarSobreSuelo(dummy, yaw, inclinacionSueloEn(cz));
            dummy.updateMatrix();
            matrices.push(dummy.matrix.clone());
        }
    });
    instanciarGrupos([{ geometry: geometria, material: material }], matrices, false);
}

function anadirObstaculo(x, z, mitadX, mitadZ)
{
    objectsToCheck.push(new THREE.Box3(
        new THREE.Vector3(x - mitadX, 0, z - mitadZ),
        new THREE.Vector3(x + mitadX, 100, z + mitadZ)
    ));
}

function crearMuroParque()
{
    var muro = new THREE.Object3D();
    var material = matRoca();
    var cara = bordeAceraInt - 0.5;
    var grosorMuro = 4.5;
    var yFondo = alturaPavimento - 1 - 3;

    function bloque(x0, x1, z0, z1)
    {
        var cortes = [z0];
        [rampa.zFin, rampa.zInicio].forEach(function (c)
        {
            if (c > z0 + 0.01 && c < z1 - 0.01) cortes.push(c);
        });
        cortes.push(z1);

        for (var i = 0; i < cortes.length - 1; i++)
        {
            var a = cortes[i], b = cortes[i + 1];
            var xc = (x0 + x1) / 2, zc = (a + b) / 2;
            var geometria = aBuffer(new THREE.BoxGeometry(x1 - x0, 1, b - a));
            var pos = geometria.attributes.position;
            for (var j = 0; j < pos.count; j++)
            {
                if (pos.getY(j) > 0) pos.setY(j, alturaPavimento + alturaRampaEn(pos.getZ(j) + zc) - 0.05);
                else pos.setY(j, yFondo);
            }
            pos.needsUpdate = true;
            geometria = geometriaConUVMundo(geometria, xc, 0, zc, tamanoBaldosaRoca);
            geometria.computeVertexNormals();
            var malla = new THREE.Mesh(geometria, material);
            malla.position.set(xc, 0, zc);
            muro.add(malla);
        }
    }

    var zNorte = -(bordeAceraInt + grosorMuro - 0.5);
    bloque(-cara, cara, zNorte, -cara);
    bloque(cara, cara + grosorMuro, zNorte, rampa.zInicio);
    bloque(-cara - grosorMuro, -cara, zNorte, rampa.zInicio);

    activarSombras(muro, true, true);
    scene.add(muro);
    objetosMapa.push(muro);
}

function crearVallaParque()
{
    crearVallaCuadrada(bordeAceraInt + 5, alturaPavimento, entradasParque);
}

function limiteExterior()
{
    return bordeAceraExt + 20 * escalaEdificio + margenTrasCasas;
}

function crearVallaExterior()
{
    var L = limiteExterior();
    crearVallaCuadrada(L, alturaPavimento - 1, []);

    var mitad = grosorColisionExterior / 2;
    anadirObstaculo(0, L + mitad, L + grosorColisionExterior, mitad);
    anadirObstaculo(0, -L - mitad, L + grosorColisionExterior, mitad);
    anadirObstaculo(L + mitad, 0, mitad, L);
    anadirObstaculo(-L - mitad, 0, mitad, L);
}

function crearVallaInteriorTutorial()
{
    var L = bordeAceraInt - 20 * escalaEdificio - margenTrasCasas;
    crearVallaCuadrada(L, alturaPavimento - 1, []);
}

function crearVallaCuadrada(L, baseY, entradas)
{
    var radioPoste = 2.6, radioBarra = 1.1, radioPincho = 0.8, radioCono = 1.5;
    var alturaPunta = 7;
    var alturasBarras = [alturaValla * 0.2, alturaValla * 0.62];

    var valla = new THREE.Object3D();
    var material = matMetal();
    var postes = {};

    function sueloEn(z) { return baseY + alturaRampaEn(z); }

    function pieza(geometria, x, y, z)
    {
        var malla = new THREE.Mesh(uvCilindroEscalado(geometria, tamanoBaldosaMetal), material);
        malla.position.set(x, y, z);
        valla.add(malla);
        return malla;
    }

    function vertical(x, yBase, z, radioArriba, radioAbajo, alto)
    {
        pieza(new THREE.CylinderGeometry(radioArriba, radioAbajo, alto, 8, 1), x, yBase + alto / 2, z);
    }

    function barra(ax, ay, az, bx, by, bz)
    {
        var dir = new THREE.Vector3(bx - ax, by - ay, bz - az);
        var largo = dir.length();
        var malla = pieza(new THREE.CylinderGeometry(radioBarra, radioBarra, largo, 8, 1), (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
        malla.quaternion.setFromUnitVectors(_ejeY, dir.normalize());
    }

    function poste(p)
    {
        var clave = p.x.toFixed(1) + ',' + p.z.toFixed(1);
        if (postes[clave]) return;
        postes[clave] = true;
        vertical(p.x, sueloEn(p.z), p.z, radioPoste, radioPoste, alturaValla + 6);
    }

    function tramo(A, B)
    {
        poste(A); poste(B);
        var yA = sueloEn(A.z), yB = sueloEn(B.z);
        alturasBarras.forEach(function (h) { barra(A.x, yA + h, A.z, B.x, yB + h, B.z); });

        var largo = Math.hypot(B.x - A.x, B.z - A.z);
        var n = Math.max(1, Math.round(largo / separacionPinchos));
        for (var i = 0; i < n; i++)
        {
            var t = (i + 0.5) / n;
            var x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t;
            var y0 = sueloEn(z);
            vertical(x, y0, z, radioPincho, radioPincho, alturaValla - alturaPunta);
            vertical(x, y0 + alturaValla - alturaPunta, z, 0, radioCono, alturaPunta);
        }

        anadirObstaculo((A.x + B.x) / 2, (A.z + B.z) / 2, Math.abs(B.x - A.x) / 2 + grosorColisionValla, Math.abs(B.z - A.z) / 2 + grosorColisionValla);
    }

    [
        { nombre: 'sur',   recorreX: true,  valor: L },
        { nombre: 'norte', recorreX: true,  valor: -L },
        { nombre: 'este',  recorreX: false, valor: L },
        { nombre: 'oeste', recorreX: false, valor: -L }
    ].forEach(function (lado)
    {
        function punto(s) { return lado.recorreX ? { x: s, z: lado.valor } : { x: lado.valor, z: s }; }

        var huecos = entradas
            .filter(function (e) { return e.lado === lado.nombre; })
            .map(function (e) { return [e.pos - anchoEntradaParque / 2, e.pos + anchoEntradaParque / 2]; });

        var paradas = [-L, L];
        huecos.forEach(function (h) { paradas.push(h[0], h[1]); });
        if (!lado.recorreX && rampa !== null)
        {
            [rampa.zFin, rampa.zInicio].forEach(function (c) { if (c > -L + 0.01 && c < L - 0.01) paradas.push(c); });
        }
        paradas.sort(function (a, b) { return a - b; });

        for (var i = 0; i < paradas.length - 1; i++)
        {
            var a = paradas[i], b = paradas[i + 1];
            if (b - a < 0.01) continue;
            var medio = (a + b) / 2;
            var enEntrada = huecos.some(function (h) { return medio > h[0] && medio < h[1]; });
            if (enEntrada) { poste(punto(a)); poste(punto(b)); continue; }

            var n = Math.max(1, Math.round((b - a) / seccionValla));
            for (var k = 0; k < n; k++)
            {
                tramo(punto(a + (b - a) * k / n), punto(a + (b - a) * (k + 1) / n));
            }
        }
    });

    instanciarGrupos(fusionarPorMaterial(valla), [new THREE.Matrix4()]);
}

// ===== ÁRBOLES =====
var coloresArbol = {
    roble: [0x4d8c3a, 0x5fa046, 0x3f7a30],
    pino:  [0x2f6b3a, 0x3a7d44]
};

function matHoja(color)
{
    return compartido('hoja' + color, function () { return matEstandar({ color: color }); });
}

function azarFijo(n)
{
    var s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
}

function geoBajaPoli(geometria, irregularidad, soloHorizontal)
{
    var g = aBuffer(geometria);
    if (g.index) g = g.toNonIndexed();
    var pos = g.attributes.position;
    for (var i = 0; i < pos.count; i++)
    {
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
    var H = altura || 110;
    tipo = tipo || 'roble';
    var arbol = new THREE.Object3D();
    var matTronco = matMadera(0x9C7A5A);
    var colores = coloresArbol[tipo];
    var baldosaTronco = tamanoBaldosaTronco * H;

    function cilindro(rArriba, rAbajo, alto, x, y, z, giroZ)
    {
        var m = new THREE.Mesh(
            uvCilindroEscalado(new THREE.CylinderGeometry(rArriba, rAbajo, alto, 10, 1), baldosaTronco),
            matTronco
        );
        m.position.set(x, y, z);
        m.rotation.z = giroZ || 0;
        arbol.add(m);
    }

    if (tipo === 'pino')
    {
        cilindro(0.03 * H, 0.045 * H, 0.3 * H, 0, 0.15 * H, 0);
        [
            { radio: 0.30, alto: 0.30, base: 0.14 },
            { radio: 0.26, alto: 0.28, base: 0.30 },
            { radio: 0.21, alto: 0.26, base: 0.46 },
            { radio: 0.16, alto: 0.24, base: 0.62 },
            { radio: 0.10, alto: 0.24, base: 0.76 }
        ].forEach(function (c, i)
        {
            var cono = new THREE.Mesh(
                geoBajaPoli(new THREE.CylinderGeometry(0, c.radio * H, c.alto * H, 8, 1), 0.10, true),
                matHoja(colores[i % colores.length])
            );
            cono.position.y = (c.base + c.alto / 2) * H;
            arbol.add(cono);
        });
    }
    else
    {
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
        ].forEach(function (b, i)
        {
            var bola = new THREE.Mesh(
                geoBajaPoli(new THREE.IcosahedronGeometry(b[3] * H, 1), 0.12, false),
                matHoja(colores[i % colores.length])
            );
            bola.position.set(b[0] * H, b[1] * H, b[2] * H);
            bola.scale.y = 0.85;
            arbol.add(bola);
        });
    }

    activarSombras(arbol, true, true);
    return arbol;
}

// ===== FUENTE =====
function crearFuente(f)
{
    var k = f.radio / 120;
    var fuente = new THREE.Object3D();
    var piedra = compartido('piedraFuente', function () { return matEstandar({ color: 0xd2cbbd, side: THREE.DoubleSide }); });
    var agua = compartido('aguaFuente', function ()
    {
        return matEstandar({ color: 0x4aa8e0, emissive: 0x1d6fa5, emissiveIntensity: 0.35, transparent: true, opacity: 0.8, roughness: 0.15, metalness: 0.1 });
    });
    var cortina = compartido('cortinaFuente', function ()
    {
        return matEstandar({ color: 0xbfe6ff, emissive: 0x6fb8e6, emissiveIntensity: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    });

    function anadir(geometria, material, y, esAgua)
    {
        var m = new THREE.Mesh(geometria, material);
        m.position.y = y * k;
        if (esAgua) m.userData.sinSombra = true;
        fuente.add(m);
        return m;
    }
    function torno(perfil)
    {
        return new THREE.LatheGeometry(perfil.map(function (q) { return new THREE.Vector2(q[0] * k, q[1] * k); }), 48);
    }
    function cil(rArriba, rAbajo, alto, abierto)
    {
        return new THREE.CylinderGeometry(rArriba * k, rAbajo * k, alto * k, 48, 1, !!abierto);
    }

    anadir(torno([[0, 2], [108, 2], [108, 16], [120, 16], [120, 0]]), piedra, 0);
    var borde = anadir(new THREE.TorusGeometry(114 * k, 4 * k, 8, 64), piedra, 16);
    borde.rotation.x = Math.PI / 2;
    anadir(cil(106, 106, 0.8), agua, 13, true);

    anadir(cil(16, 24, 38), piedra, 21);

    anadir(torno([[0, 36], [14, 37], [34, 42], [50, 52], [56, 62], [52, 62], [46, 53], [30, 46], [0, 44]]), piedra, 0);
    anadir(cil(48, 48, 0.8), agua, 57, true);
    anadir(cil(55.5, 58, 49, true), cortina, 37.5, true);

    anadir(cil(7, 10, 34), piedra, 61);
    anadir(torno([[0, 74], [8, 75], [20, 80], [30, 88], [27, 88], [18, 82], [7, 78], [0, 78]]), piedra, 0);
    anadir(cil(22, 22, 0.8), agua, 85, true);
    anadir(cil(30.5, 34, 31, true), cortina, 72.5, true);

    anadir(new THREE.CylinderGeometry(1.2 * k, 3.2 * k, 26 * k, 12, 1, true), cortina, 101, true);
    anadir(new THREE.SphereGeometry(3.5 * k, 12, 8), agua, 115, true);

    activarSombras(fuente, true, true);
    fuente.traverse(function (o) { if (o.userData.sinSombra) o.castShadow = false; });
    return fuente;
}

function anadirObstaculoCircular(x, z, radio)
{
    var franja = 24;
    for (var zc = -radio + franja / 2; zc < radio; zc += franja)
    {
        var cerca = Math.max(Math.abs(zc) - franja / 2, 0);
        var mitad = Math.sqrt(Math.max(radio * radio - cerca * cerca, 0));
        anadirObstaculo(x, z + zc, mitad, franja / 2);
    }
}

function anadirObstaculoBanco(x, z, yaw)
{
    var largoMitad = (largoBanco / 2) * escalaBanco + 1, fondoMitad = 2 * escalaBanco;
    var ux = Math.cos(yaw), uz = -Math.sin(yaw);
    var n = 5, paso = largoMitad / n;
    for (var i = 0; i < n; i++)
    {
        var o = -largoMitad + (2 * i + 1) * paso;
        anadirObstaculo(x + ux * o, z + uz * o,
            Math.abs(ux) * paso + Math.abs(uz) * fondoMitad,
            Math.abs(uz) * paso + Math.abs(ux) * fondoMitad);
    }
}

function mobiliarioParque()
{
    var f = fuenteParque;
    var inset = bordeAceraInt - 30;
    var junto = anchoEntradaParque / 2 + 15;

    var farolas = [];
    entradasParque.forEach(function (e)
    {
        [-1, 1].forEach(function (lado)
        {
            var a = e.pos + lado * junto;
            if (e.lado === 'sur') farolas.push([a, inset]);
            else if (e.lado === 'norte') farolas.push([a, -inset]);
            else if (e.lado === 'este') farolas.push([inset, a]);
            else farolas.push([-inset, a]);
        });
    });
    farolas.push([-180, -inset], [180, -inset]);

    [-1, 1].forEach(function (lado)
    {
        farolas.push([lado * 290, -290], [lado * 290, 290]);
        farolas.push([lado * 480, -480]);
        farolas.push([lado * inset, -470]);
        farolas.push([lado * 480, -inset]);
        farolas.push([lado * 500, inset]);
    });
    farolas.push([0, -330]);

    var bancos = [];
    function banco(x, z, miraX, miraZ) { bancos.push({ x: x, z: z, yaw: Math.atan2(miraX, miraZ) }); }
    [-250, 110].forEach(function (z) { banco(inset, z, -1, 0); banco(-inset, z, 1, 0); });
    [-330, 330].forEach(function (x) { banco(x, inset, 0, -1); });
    banco(-320, -inset, 0, 1);
    banco(320, -inset, 0, 1);
    var d = (f.radio + 55) / Math.SQRT2;
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q)
    {
        banco(f.x + q[0] * d, f.z + q[1] * d, -q[0], -q[1]);
    });

    return { farolas: farolas, bancos: bancos };
}

function crearParqueNivel1()
{
    var f = fuenteParque;
    var sueloParque = alturaPavimento - 1;

    var fuente = crearFuente(f);
    fuente.position.set(f.x, sueloParque, f.z);
    scene.add(fuente);
    objetosMapa.push(fuente);
    anadirObstaculoCircular(f.x, f.z, f.radio);

    var mob = mobiliarioParque();
    var dummy = new THREE.Object3D();

    var plantillaBanco = crearBanco();
    plantillaBanco.scale.set(escalaBanco, escalaBanco, escalaBanco);
    var matricesBanco = mob.bancos.map(function (b)
    {
        dummy.position.set(b.x, sueloParque, b.z);
        orientarSobreSuelo(dummy, b.yaw, 0);
        dummy.updateMatrix();
        anadirObstaculoBanco(b.x, b.z, b.yaw);
        return dummy.matrix.clone();
    });
    instanciarGrupos(fusionarPorMaterial(plantillaBanco), matricesBanco);

    var plantillaFarola = crearFarola();
    plantillaFarola.scale.set(escalaFarola, escalaFarola, escalaFarola);
    dummy.quaternion.identity();
    var matricesFarola = mob.farolas.map(function (q)
    {
        dummy.position.set(q[0], sueloParque, q[1]);
        dummy.updateMatrix();
        registrarFarola(q[0], sueloParque, q[1]);
        var r = 1.8 * escalaFarola + 1;
        anadirObstaculo(q[0], q[1], r, r);
        return dummy.matrix.clone();
    });
    instanciarGrupos(fusionarPorMaterial(plantillaFarola), matricesFarola);

    var puntos = arbolesCercaDePizzas.slice();
    var inset = bordeAceraInt - 40;
    var candidatos = [], t;
    for (t = -660; t <= 660; t += 110) candidatos.push([t, inset], [t, -inset]);
    for (t = -550; t <= 550; t += 110) candidatos.push([inset, t], [-inset, t]);
    var inicioInterior = candidatos.length;
    for (var gx = -600; gx <= 600; gx += 200)
        for (var gz = -600; gz <= 600; gz += 200) candidatos.push([gx, gz]);
    candidatos.forEach(function (c, i)
    {
        var interior = i >= inicioInterior;
        var holgura = interior ? 45 : 25;
        var x = c[0] + (azarFijo(i * 5.7 + 3) * 2 - 1) * holgura;
        var z = c[1] + (azarFijo(i * 2.9 + 5) * 2 - 1) * holgura;
        if (interior)
        {
            if (Math.hypot(x - f.x, z - f.z) < 260) return;
            var enPasillo = entradasParque.some(function (e)
            {
                if (e.lado === 'sur') return z > 0 && Math.abs(x - e.pos) < 100;
                if (e.lado === 'norte') return z < 0 && Math.abs(x - e.pos) < 100;
                if (e.lado === 'este') return x > 0 && Math.abs(z - e.pos) < 100;
                return x < 0 && Math.abs(z - e.pos) < 100;
            });
            if (enPasillo) return;
        }
        var enEntrada = entradasParque.some(function (e)
        {
            var mitad = anchoEntradaParque / 2 + 50;
            if (e.lado === 'sur') return z > 600 && Math.abs(x - e.pos) < mitad;
            if (e.lado === 'norte') return z < -600 && Math.abs(x - e.pos) < mitad;
            if (e.lado === 'este') return x > 600 && Math.abs(z - e.pos) < mitad;
            return x < -600 && Math.abs(z - e.pos) < mitad;
        });
        if (enEntrada) return;
        if (posicionesPizzaParque.some(function (p) { return Math.hypot(x - p[0], z - p[1]) < 130; })) return;
        if (mob.bancos.some(function (b) { return Math.hypot(x - b.x, z - b.z) < 90; })) return;
        if (mob.farolas.some(function (q) { return Math.hypot(x - q[0], z - q[1]) < 65; })) return;
        if (puntos.some(function (p) { return Math.hypot(x - p[0], z - p[1]) < 70; })) return;
        puntos.push([x, z]);
    });

    var tipos = ['roble', 'pino'];
    var matrices = { roble: [], pino: [] };
    puntos.forEach(function (p, i)
    {
        var sorteo = azarFijo(i * 1.9 + 0.5);
        var tipo = sorteo < 0.55 ? 'roble' : 'pino';
        var escala = 0.85 + azarFijo(i * 7.3 + 1) * 0.35;
        dummy.position.set(p[0], sueloParque, p[1]);
        dummy.rotation.set(0, azarFijo(i * 3.1 + 2) * Math.PI * 2, 0);
        dummy.scale.setScalar(escala);
        dummy.updateMatrix();
        matrices[tipo].push(dummy.matrix.clone());
        var r = 0.05 * alturaArbol * escala + 3;
        anadirObstaculo(p[0], p[1], r, r);
    });
    tipos.forEach(function (tipo)
    {
        instanciarGrupos(fusionarPorMaterial(crearArbol(alturaArbol, tipo)), matrices[tipo]);
    });
}

function registrarFarola(x, sueloY, z)
{
    var alturaBombilla = escalaFarola * (1 + 9 * factorAlturaFarola + 0.6);
    var posicion = new THREE.Vector3(x, sueloY + alturaBombilla, z);
    posicionesBombillas.push(posicion);

    var halo = new THREE.Sprite(materialHalo());
    halo.position.copy(posicion);
    halo.scale.set(luzFarola.tamanoHalo, luzFarola.tamanoHalo, 1);
    grupoHalos.add(halo);
}

var _materialHalo = null;
function materialHalo()
{
    if (_materialHalo === null)
    {
        var lienzo = document.createElement('canvas');
        lienzo.width = lienzo.height = 128;
        var c = lienzo.getContext('2d');
        var g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,240,190,1)');
        g.addColorStop(0.15, 'rgba(255,215,130,0.75)');
        g.addColorStop(0.5, 'rgba(255,190,90,0.18)');
        g.addColorStop(1, 'rgba(255,180,80,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, 128, 128);
        _materialHalo = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(lienzo),
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: luzFarola.intensidadHalo
        });
    }
    return _materialHalo;
}

function crearMobiliario()
{
    var plantillaFarola = crearFarola();
    plantillaFarola.scale.set(escalaFarola, escalaFarola, escalaFarola);
    var gruposFarola = fusionarPorMaterial(plantillaFarola);
    var matricesFarola = [];

    var plantillaFarolaInclinada = crearFarola(true);
    plantillaFarolaInclinada.scale.set(escalaFarola, escalaFarola, escalaFarola);
    var gruposFarolaInclinada = fusionarPorMaterial(plantillaFarolaInclinada);
    var matricesFarolaInclinada = [];

    var plantillaBanco = crearBanco();
    plantillaBanco.scale.set(escalaBanco, escalaBanco, escalaBanco);
    var gruposBanco = fusionarPorMaterial(plantillaBanco);
    var matricesBanco = [];

    var dummy = new THREE.Object3D();

    function posiciones(separacion)
    {
        var n = Math.max(1, Math.floor(2 * mitadCarretera / separacion));
        var lista = [];
        for (var i = 0; i < n; i++) lista.push(-(n - 1) * separacion / 2 + i * separacion);
        return lista;
    }

    ladosMapa.forEach(function (u)
    {
        var tx = -u[1], tz = u[0];
        var enZ = (u[0] === 0);

        [bordeCarreteraInt - 15, bordeCarreteraExt + 15].forEach(function (d)
        {
            posiciones(separacionFarolas).forEach(function (t)
            {
                var x = u[0] * d + tx * t, z = u[1] * d + tz * t;
                dummy.position.set(x, alturaPavimento + alturaRampaEn(z), z);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                (inclinacionSueloEn(z) > 0 ? matricesFarolaInclinada : matricesFarola).push(dummy.matrix.clone());
                registrarFarola(x, dummy.position.y, z);
                var r = 1.8 * escalaFarola + 1;
                anadirObstaculo(x, z, r, r);
            });
        });

        var tFarolas = posiciones(separacionFarolas);
        var tBancos = tFarolas.slice(0, -1).map(function (t) { return t + separacionFarolas / 2; });
        [
            { d: bordeCarreteraInt - 15, mira: -1 },
            { d: bordeCarreteraExt + 15, mira: 1 }
        ].forEach(function (b)
        {
            tBancos.forEach(function (t)
            {
                var x = u[0] * b.d + tx * t, z = u[1] * b.d + tz * t;
                dummy.position.set(x, alturaPavimento + alturaRampaEn(z), z);
                orientarSobreSuelo(dummy, Math.atan2(b.mira * u[0], b.mira * u[1]), inclinacionSueloEn(z));
                dummy.updateMatrix();
                matricesBanco.push(dummy.matrix.clone());
                var largoMitad = (largoBanco / 2) * escalaBanco + 1, fondoMitad = 2 * escalaBanco;
                anadirObstaculo(x, z, enZ ? largoMitad : fondoMitad, enZ ? fondoMitad : largoMitad);
            });
        });
    });

    instanciarGrupos(gruposFarola, matricesFarola);
    instanciarGrupos(gruposFarolaInclinada, matricesFarolaInclinada);
    instanciarGrupos(gruposBanco, matricesBanco);
}

var inclinacionBaseFarola = 20;

function crearFarola(inclinada)
{
    const farola = new THREE.Object3D();

    const materialBase = matMetal();
    const materialPoste = matMetal();

    const materialBombilla = matEstandar({
        color: 0xFFF2A0,
        emissive: 0xFFD84D,
        emissiveIntensity: 0.5 * factorBombillaAmbiente
    });
    materialBombilla.userData.emisivoBase = 0.5;
    materialesBombilla.push(materialBombilla);

    const base = new THREE.Mesh(
        uvCilindroEscalado(new THREE.CylinderGeometry(1.5, 1.8, 1, 16), tamanoBaldosaMetal),
        materialBase
    );
    base.position.y = 0.5;

    const alturaPoste = 9 * factorAlturaFarola;
    const hundimiento = inclinada ? 0.6 : 0;
    const poste = new THREE.Mesh(
        uvCilindroEscalado(new THREE.CylinderGeometry(0.45, 0.65, alturaPoste + hundimiento, 16), tamanoBaldosaMetal),
        materialPoste
    );
    poste.position.y = 1 + (alturaPoste - hundimiento) / 2;
    farola.add(poste);

    if (inclinada)
    {
        const pivote = new THREE.Object3D();
        pivote.rotation.x = inclinacionBaseFarola * Math.PI / 180;
        pivote.add(base);
        farola.add(pivote);
    }
    else
    {
        farola.add(base);
    }

    const bombilla = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 20, 16),
        materialBombilla
    );
    bombilla.position.y = 1 + alturaPoste + 0.6;
    farola.add(bombilla);

    return farola;
}

function crearBanco()
{
    const banco = new THREE.Object3D();

    const madera = matMadera(0xFFFFFF);
    const maderaOscura = matMadera(0x9C7A5A);

    function crearTabla(ancho, alto, fondo, material)
    {
        return new THREE.Mesh(
            uvCajaEscalada(new THREE.BoxGeometry(ancho, alto, fondo), tamanoBaldosaMadera),
            material
        );
    }

    for (let i = 0; i < 3; i++)
    {
        const tabla = crearTabla(largoBanco, 0.25, 0.7, madera);

        tabla.position.set(
            0,
            1.8,
            -0.7 + i * 0.7
        );

        banco.add(tabla);
    }

    const xExtremo = largoBanco / 2 - 0.7;
    const posicionesPatas = [];
    [-xExtremo, 0, xExtremo].forEach(x =>
    {
        posicionesPatas.push([x, 0, -0.7]);
        posicionesPatas.push([x, 0,  0.7]);
    });

    posicionesPatas.forEach(([x, , z]) =>
    {
        const pata = crearTabla(0.3, 1.8, 0.3, maderaOscura);

        pata.position.set(x, 0.9, z);
        banco.add(pata);
    });

    [-xExtremo, 0, xExtremo].forEach(x =>
    {
        const soporte = crearTabla(0.25, 2.5, 0.25, maderaOscura);

        soporte.position.set(x, 3, -0.9);
        banco.add(soporte);
    });

    for (let i = 0; i < 3; i++)
    {
        const tablaRespaldo = crearTabla(largoBanco - 0.2, 0.5, 0.25, madera);

        tablaRespaldo.position.set(
            0,
            2.5 + i * 0.8,
            -0.9
        );

        banco.add(tablaRespaldo);
    }

    return banco;
}

// ===== OPTIMIZACIÓN =====
function fusionarPorMaterial(objeto)
{
    objeto.updateMatrixWorld(true);
    var grupos = {};

    objeto.traverse(function (hijo)
    {
        if (!hijo.isMesh) return;
        var mat = hijo.material;
        var clave = [
            mat.type, mat.color.getHex(),
            mat.emissive ? mat.emissive.getHex() : 0, mat.emissiveIntensity,
            mat.side, mat.metalness, mat.roughness,
            mat.map ? mat.map.uuid : '', mat.normalMap ? mat.normalMap.uuid : '',
            mat.roughnessMap ? mat.roughnessMap.uuid : '', mat.metalnessMap ? mat.metalnessMap.uuid : ''
        ].join('|');
        if (!grupos[clave]) grupos[clave] = { material: mat, geometrias: [] };

        var g = hijo.geometry;
        if (!g.isBufferGeometry) g = new THREE.BufferGeometry().fromGeometry(g);
        g = g.clone();
        if (g.applyMatrix4) g.applyMatrix4(hijo.matrixWorld);
        else g.applyMatrix(hijo.matrixWorld);
        grupos[clave].geometrias.push(g);
    });

    return Object.keys(grupos).map(function (clave)
    {
        return {
            material: grupos[clave].material,
            geometry: unirGeometrias(grupos[clave].geometrias)
        };
    });
}

function unirGeometrias(lista)
{
    var posiciones = [], normales = [], uvs = [], indices = [], desplazamiento = 0;

    lista.forEach(function (g)
    {
        var p = g.attributes.position, n = g.attributes.normal, t = g.attributes.uv, i;
        for (i = 0; i < p.count; i++)
        {
            posiciones.push(p.getX(i), p.getY(i), p.getZ(i));
            normales.push(n.getX(i), n.getY(i), n.getZ(i));
            uvs.push(t ? t.getX(i) : 0, t ? t.getY(i) : 0);
        }
        if (g.index) for (i = 0; i < g.index.count; i++) indices.push(g.index.getX(i) + desplazamiento);
        else for (i = 0; i < p.count; i++) indices.push(i + desplazamiento);
        desplazamiento += p.count;
    });

    var geometria = new THREE.BufferGeometry();
    geometria.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
    geometria.setAttribute('normal', new THREE.Float32BufferAttribute(normales, 3));
    geometria.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometria.setIndex(indices);
    return geometria;
}

function instanciarGrupos(grupos, matrices, proyectarSombra)
{
    if (matrices.length === 0) return;
    grupos.forEach(function (g)
    {
        var malla = new THREE.InstancedMesh(g.geometry, g.material, matrices.length);
        matrices.forEach(function (m, i) { malla.setMatrixAt(i, m); });
        malla.instanceMatrix.needsUpdate = true;
        malla.frustumCulled = false;
        malla.castShadow = (proyectarSombra !== false);
        malla.receiveShadow = true;
        scene.add(malla);
        objetosMapa.push(malla);
    });
}

function crearVentana(ancho, alto, columnas, filas, grosorMarco)
{
    var ventana = new THREE.Object3D();
    var materialMarco = matMetal();
    var materialCristal = matCristal();

    ventana.add(new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(ancho, alto, 0.4), tamanoBaldosaMetal), materialMarco));

    var anchoPanel = (ancho - (columnas + 1) * grosorMarco) / columnas;
    var altoPanel = (alto - (filas + 1) * grosorMarco) / filas;
    var geoPanel = new THREE.BoxGeometry(anchoPanel, altoPanel, 0.2);

    for (var i = 0; i < columnas; i++)
    {
        for (var j = 0; j < filas; j++)
        {
            var panel = new THREE.Mesh(geoPanel, materialCristal);
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
    var tam = [
        p2[0] - p1[0] === 0 ? g : Math.abs(p2[0] - p1[0]),
        p2[1] - p1[1] === 0 ? g : Math.abs(p2[1] - p1[1]),
        p2[2] - p1[2] === 0 ? g : Math.abs(p2[2] - p1[2])
    ];
    var barra = new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(tam[0], tam[1], tam[2]), tamanoBaldosaMetal), material);
    barra.position.set((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2);
    return barra;
}

function crearBalcon()
{
    var balcon = new THREE.Object3D();
    var g = 0.25;
    var matBase = matMetal();
    var matReja = matMetal();

    var base = new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(8, 2, 2), tamanoBaldosaMetal), matBase);
    base.position.set(4, -1, 1);
    balcon.add(base);

    [g / 2, 5 - g / 2].forEach(function (y)
    {
        balcon.add(crearBarra([0, y, 0], [0, y, 2], g, matReja));
        balcon.add(crearBarra([0, y, 2], [8, y, 2], g, matReja));
        balcon.add(crearBarra([8, y, 2], [8, y, 0], g, matReja));
    });

    [[0, 0], [0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [8, 0]].forEach(function (p)
    {
        balcon.add(crearBarra([p[0], 0, p[1]], [p[0], 5, p[1]], g, matReja));
    });
    return balcon;
}

function crearPlanta1()
{
    var planta = new THREE.Object3D();
    planta.add(new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(30, 15, 20), baldosaLadrillo()), matLadrillo()));

    [-9, 9].forEach(function (x)
    {
        var v = crearVentana(6, 6, 2, 2, 0.5);
        v.position.set(x, 1.5, 10);
        planta.add(v);
    });

    var puerta = new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(6, 10, 0.4), tamanoBaldosaPuerta), matPuerta());
    puerta.position.set(0, -2.5, 10);
    planta.add(puerta);

    var pomo = new THREE.Mesh(uvEsferaEscalada(new THREE.SphereGeometry(0.4, 16, 16), tamanoBaldosaPomo), matPomo());
    pomo.position.set(2, -3, 10.4);
    planta.add(pomo);
    return planta;
}

function crearPlanta2()
{
    var planta = new THREE.Object3D();
    planta.add(new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(30, 15, 20), baldosaLadrillo()), matLadrillo()));

    [-8, 8].forEach(function (x)
    {
        var v = crearVentana(4, 8, 2, 3, 0.4);
        v.position.set(x, 1.5, 10);
        planta.add(v);

        var b = crearBalcon();
        b.position.set(x - 4, -2.5, 10);
        planta.add(b);
    });
    return planta;
}

function crearPlanta3()
{
    var planta = new THREE.Object3D();
    var materialPared = matLadrillo();
    var naranja = matEstandar({ color: 0xE8892B });

    planta.add(new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(30, 15, 20), baldosaLadrillo()), materialPared));

    [-8, 8].forEach(function (x)
    {
        var v = crearVentana(4, 8, 2, 3, 0.4);
        v.position.set(x, 1.5, 10);
        planta.add(v);

        var b = crearBalcon();
        b.position.set(x - 4, -2.5, 10);
        planta.add(b);
    });

    var yTecho = 7.5, grosorSuelo = 0.4;
    var ySuelo = yTecho + grosorSuelo;

    var suelo = new THREE.Mesh(new THREE.BoxGeometry(30, grosorSuelo, 20), naranja);
    suelo.position.set(0, yTecho + grosorSuelo / 2, 0);
    planta.add(suelo);

    var altoBarrera = 1.5, gb = 0.5;
    var yBarrera = ySuelo + altoBarrera / 2;
    [
        [30, gb, 0, 10 - gb / 2],
        [30, gb, 0, -10 + gb / 2],
        [gb, 20 - 2 * gb, -15 + gb / 2, 0],
        [gb, 20 - 2 * gb, 15 - gb / 2, 0]
    ].forEach(function (d)
    {
        var b = new THREE.Mesh(new THREE.BoxGeometry(d[0], altoBarrera, d[0] === 30 ? gb : d[1]), naranja);
        b.position.set(d[2], yBarrera, d[3]);
        planta.add(b);
    });

    var lado = 15 * 2 / 3;
    var cubo = new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(lado, lado, lado), baldosaLadrillo()), materialPared);
    cubo.position.set(-8, ySuelo + lado / 2, -4.5);
    planta.add(cubo);

    var zFrenteCubo = -4.5 + lado / 2;
    var puerta = new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(4, 7, 0.4), tamanoBaldosaPuerta), matPuerta());
    puerta.position.set(-8, ySuelo + 3.5, zFrenteCubo + 0.2);
    planta.add(puerta);

    var pomo = new THREE.Mesh(uvEsferaEscalada(new THREE.SphereGeometry(0.35, 16, 16), tamanoBaldosaPomo), matPomo());
    pomo.position.set(-8 + 1.4, ySuelo + 3.3, zFrenteCubo + 0.5);
    planta.add(pomo);

    function crearTendedero(largo, alto)
    {
        var t = new THREE.Object3D();
        var matPoste = matMetal();
        [-largo / 2, largo / 2].forEach(function (x)
        {
            var poste = new THREE.Mesh(uvCajaEscalada(new THREE.BoxGeometry(0.3, alto, 0.3), tamanoBaldosaMetal), matPoste);
            poste.position.set(x, alto / 2, 0);
            t.add(poste);
        });
        var cuerda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, largo, 8), matEstandar({ color: 0xEEEEEE }));
        cuerda.rotation.z = Math.PI / 2;
        cuerda.position.set(0, alto - 0.2, 0);
        t.add(cuerda);
        return t;
    }
    var t1 = crearTendedero(9, 4); t1.position.set(8.5, ySuelo, -4); planta.add(t1);
    var t2 = crearTendedero(9, 4); t2.position.set(8.5, ySuelo, 3);  planta.add(t2);

    function crearMaceta(escala)
    {
        var m = new THREE.Object3D();
        var tiesto = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.65, 1.4, 16), matEstandar({ color: 0xB5502A }));
        tiesto.position.y = 0.7;
        m.add(tiesto);
        var tierra = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16), matEstandar({ color: 0x4A2F1B }));
        tierra.position.y = 1.4;
        m.add(tierra);
        var matHoja = matPlantaTex();
        [[0, 2.3, 0, 0.9], [-0.5, 1.9, 0.2, 0.55], [0.5, 2.0, -0.2, 0.55]].forEach(function (h)
        {
            var hoja = new THREE.Mesh(uvEsferaEscalada(new THREE.SphereGeometry(h[3], 12, 12), tamanoBaldosaPlanta), matHoja);
            hoja.position.set(h[0], h[1], h[2]);
            m.add(hoja);
        });
        m.scale.set(escala, escala, escala);
        return m;
    }
    var m1 = crearMaceta(1);   m1.position.set(-12, ySuelo, 6); planta.add(m1);
    var m2 = crearMaceta(1.2); m2.position.set(-5, ySuelo, 7);  planta.add(m2);

    return planta;
}

function crearEdificio(pisos, variante)
{
    variantePared = variante || 0;
    var edificio = new THREE.Object3D();
    var p1 = crearPlanta1(); p1.position.y = 7.5; edificio.add(p1);
    for (var i = 1; i < pisos - 1; i++)
    {
        var p2 = crearPlanta2(); p2.position.y = 7.5 + 15 * i; edificio.add(p2);
    }
    var p3 = crearPlanta3(); p3.position.y = 7.5 + 15 * (pisos - 1); edificio.add(p3);
    edificio.scale.set(escalaEdificio, escalaEdificio, escalaEdificio);
    variantePared = 0;
    return edificio;
}

function crearEdificios()
{
    var s = escalaEdificio;
    var ancho = 30 * s, fondo = 20 * s;
    var dummy = new THREE.Object3D();

    var gruposPorModelo = {}, matricesPorModelo = {};
    function modelo(pisos, variante)
    {
        var clave = pisos + '_' + variante;
        if (!gruposPorModelo[clave])
        {
            gruposPorModelo[clave] = fusionarPorMaterial(crearEdificio(pisos, variante));
            matricesPorModelo[clave] = [];
        }
        return clave;
    }

    var semillaLadrillo = 987654321;
    function aleatorioLadrillo()
    {
        semillaLadrillo = (Math.imul(semillaLadrillo, 1664525) + 1013904223) >>> 0;
        return semillaLadrillo / 4294967296;
    }

    var semilla = 20240613;
    function aleatorio()
    {
        semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
        return semilla / 4294967296;
    }

    function fila(u, dCentro, mira, mitadLargo)
    {
        var n = Math.max(1, Math.floor(2 * mitadLargo / (ancho + separacionMinimaEdificios)));
        var paso = 2 * mitadLargo / n;
        var tx = -u[1], tz = u[0];
        var fx = mira * u[0], fz = mira * u[1];
        var rot = Math.atan2(fx, fz);
        var enZ = (u[0] === 0);

        for (var i = 0; i < n; i++)
        {
            var pos = -mitadLargo + paso * (i + 0.5);
            var x = u[0] * dCentro + tx * pos;
            var z = u[1] * dCentro + tz * pos;

            var cx = x + fx * s, cz = z + fz * s;
            var hx = enZ ? ancho / 2 : (fondo + 2 * s) / 2;
            var hz = enZ ? (fondo + 2 * s) / 2 : ancho / 2;

            var yBase = alturaRampaEn(cz + hz);

            if (rampa !== null && cz + hz > rampa.zFin + 0.01 && cz - hz < rampa.zInicio - 0.01) continue;

            var pisos = pisosEdificio[Math.floor(aleatorio() * pisosEdificio.length)];
            var alto = 15 * pisos * s;

            dummy.position.set(x, yBase, z);
            dummy.rotation.y = rot;
            dummy.updateMatrix();
            var variante = Math.floor(aleatorioLadrillo() * ladrillosEdificio.length);
            matricesPorModelo[modelo(pisos, variante)].push(dummy.matrix.clone());

            objectsToCheck.push(new THREE.Box3(
                new THREE.Vector3(cx - hx, yBase, cz - hz),
                new THREE.Vector3(cx + hx, yBase + alto, cz + hz)
            ));
        }
    }

    ladosMapa.forEach(function (u)
    {
        var enZ = (u[0] === 0);
        fila(u, bordeAceraExt + fondo / 2, -1, bordeAceraExt);
        if (casasInteriores) fila(u, bordeAceraInt - fondo / 2, +1, enZ ? bordeAceraInt : bordeAceraInt - fondo);
    });

    Object.keys(gruposPorModelo).forEach(function (clave)
    {
        instanciarGrupos(gruposPorModelo[clave], matricesPorModelo[clave]);
    });
}

// ===== PIVOTE DEL GATO =====
var modeloGato = null;
var muestrasGato = [];
var _pBase = new THREE.Vector3();
var _pAcum = new THREE.Vector3();
var _pPiel = new THREE.Vector3();
var _pTmp = new THREE.Vector3();
var _mHueso = new THREE.Matrix4();
var _pIdx = [0, 0, 0, 0];
var _pPeso = [0, 0, 0, 0];

function prepararMuestrasGato(raiz)
{
    muestrasGato = [];
    var mallas = [];
    var totalVertices = 0;
    raiz.traverse(function (o)
    {
        if (o.isMesh && o.geometry && o.geometry.attributes.position)
        {
            mallas.push(o);
            totalVertices += o.geometry.attributes.position.count;
        }
    });
    var paso = Math.max(1, Math.floor(totalVertices / 600));
    mallas.forEach(function (malla)
    {
        var indices = [];
        for (var i = 0; i < malla.geometry.attributes.position.count; i += paso) indices.push(i);
        muestrasGato.push({ malla: malla, indices: indices });
    });
}

function centroActualGato()
{
    gato.updateMatrixWorld(true);
    _pAcum.set(0, 0, 0);
    var n = 0;

    muestrasGato.forEach(function (m)
    {
        var malla = m.malla;
        var geo = malla.geometry;
        var pos = geo.attributes.position;
        var si = geo.attributes.skinIndex;
        var sw = geo.attributes.skinWeight;
        var conPiel = malla.isSkinnedMesh && malla.skeleton && si && sw;

        for (var j = 0; j < m.indices.length; j++)
        {
            var i = m.indices[j];
            _pBase.set(pos.getX(i), pos.getY(i), pos.getZ(i));

            if (conPiel)
            {
                _pIdx[0] = si.getX(i); _pIdx[1] = si.getY(i); _pIdx[2] = si.getZ(i); _pIdx[3] = si.getW(i);
                _pPeso[0] = sw.getX(i); _pPeso[1] = sw.getY(i); _pPeso[2] = sw.getZ(i); _pPeso[3] = sw.getW(i);

                _pBase.applyMatrix4(malla.bindMatrix);
                _pPiel.set(0, 0, 0);
                for (var k = 0; k < 4; k++)
                {
                    if (_pPeso[k] <= 0) continue;
                    var hueso = malla.skeleton.bones[_pIdx[k]];
                    if (!hueso) continue;
                    _mHueso.multiplyMatrices(hueso.matrixWorld, malla.skeleton.boneInverses[_pIdx[k]]);
                    _pPiel.addScaledVector(_pTmp.copy(_pBase).applyMatrix4(_mHueso), _pPeso[k]);
                }
                _pPiel.applyMatrix4(malla.bindMatrixInverse).applyMatrix4(malla.matrixWorld);
            }
            else
            {
                _pPiel.copy(_pBase).applyMatrix4(malla.matrixWorld);
            }

            _pAcum.add(_pPiel);
            n++;
        }
    });

    return n > 0 ? _pAcum.clone().divideScalar(n) : null;
}

function ajustarPivoteGato(delta, instantaneo)
{
    if (gato === null || modeloGato === null || muestrasGato.length === 0) return;

    var c = centroActualGato();
    if (c === null) return;
    gato.worldToLocal(c);

    var a = instantaneo ? 1 : 1 - Math.exp(-4 * delta);
    modeloGato.position.x -= (c.x + ajustePivoteGato.x) * a;
    modeloGato.position.z -= (c.z + ajustePivoteGato.z) * a;

    if (instantaneo)
    {
        console.info('Pivote del gato: desplazamiento aplicado x=' + (-c.x).toFixed(1) + ', z=' + (-c.z).toFixed(1));
    }
}

function loadObjGLTF()
{
    const gltfLoader = new THREE.GLTFLoader();
    const model = 'models/gato/gato_animado.glb';

    gltfLoader.load(
        model,
        function (gltf)
        {
            var modelo = gltf.scene;
            modeloGato = modelo;

            modelo.traverse(function (child)
            {
                if (child.isMesh)
                {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const materiales = Array.isArray(child.material)
                        ? child.material
                        : [child.material];

                    child.material = materiales.map(function (material)
                    {
                        var nuevo = new THREE.MeshLambertMaterial({
                            map: material.map || null,
                            color: material.color || 0xffffff,
                            side: material.side,
                            vertexColors: material.vertexColors,
                            transparent: false,
                            opacity: 1.0
                        });
                        nuevo.emissive.copy(nuevo.color);
                        nuevo.userData.brilloBase = brilloPropioGato;
                        nuevo.emissiveIntensity = brilloPropioGato * factorBrilloAmbiente;
                        materialesConBrillo.push(nuevo);
                        if (nuevo.map) nuevo.emissiveMap = nuevo.map;
                        return nuevo;
                    });

                    if (child.material.length === 1) child.material = child.material[0];
                }
            });

            if (gltf.animations.length > 0)
            {
                mixer = new THREE.AnimationMixer(modelo);
                var accionDe = function (i, respaldo)
                {
                    return gltf.animations[i] ? mixer.clipAction(gltf.animations[i]) : respaldo;
                };
                idleAction = accionDe(indiceAnimQuieto, null) || mixer.clipAction(gltf.animations[0]);
                moveAction = accionDe(indiceAnimNormal, idleAction);
                manzanaAction = accionDe(indiceAnimManzana, moveAction);
                victoriaAction = accionDe(indiceAnimVictoria, idleAction);
                menuAction = accionDe(indiceAnimMenu, idleAction);
                derrotaAction = accionDe(indiceAnimDerrota, idleAction);
                if (gltf.animations[indiceAnimDerrota])
                {
                    derrotaAction.setLoop(THREE.LoopOnce, 1);
                    derrotaAction.clampWhenFinished = true;
                }
                else
                {
                    console.warn('El modelo del gato no tiene la animacion ' + indiceAnimDerrota + ': al perder se usara la de estar quieto.');
                }
                currentAction = menuAction;
                currentAction.play();
            }

            modelo.scale.set(100, 100, 100);
            gato = new THREE.Group();
            gato.add(modelo);
            gato.position.set(posicionInicialGato.x, alturaBaseGato, posicionInicialGato.z);
            gato.rotation.y = angulo + desfase_orientacion;
            scene.add(gato);

            prepararMuestrasGato(modelo);
            ajustarPivoteGato(0, true);

            var gatoBounds = new THREE.Box3().setFromObject(gato);
            var gatoSize = new THREE.Vector3();
            gatoBounds.getSize(gatoSize);

            var dimensionMaxima = Math.max(gatoSize.x, gatoSize.y, gatoSize.z);
            tamanoReferenciaGato = dimensionMaxima;
            distanciaCamaraMenu = dimensionMaxima * 2.6;
            alturaCamaraMenu = gatoSize.y * 0.55;
            alturaMiradaMenu = gatoSize.y * 0.45;

            alturaGato = gatoSize.y;
            huesoLinterna = buscarHuesoMano(modelo);
            grupoLinterna = crearModeloLinterna();
            scene.add(grupoLinterna);
            radioColisionGato = Math.sqrt(
                gatoSize.x * gatoSize.x + gatoSize.z * gatoSize.z
            ) / 2;

            distancia_camara = Math.hypot(
                desplazamientoInicialCamara.x,
                desplazamientoInicialCamara.z
            );
            anguloHorizontalCamara = Math.atan2(
                desplazamientoInicialCamara.x,
                -desplazamientoInicialCamara.z
            );
            angulo_inclinacion_camara = Math.atan2(
                desplazamientoInicialCamara.y,
                distancia_camara
            );
            distanciaCamaraMinima = Math.max(10, distancia_camara * 0.5);
            distanciaCamaraMaxima = distancia_camara * 2;
            altura_camara = desplazamientoInicialCamara.y;
            desfase_lookat_y = 0;
            camara_spring_iniciada = false;
            alturaFlotacionPizza = gato.position.y + gatoSize.y / 2;
            pizzas.forEach(function (pizza)
            {
                pizza.position.y = alturaFlotacionPizza;
            });
            camera.far = Math.max(camera.far, distancia_camara * 20);
            camera.updateProjectionMatrix();
            aplicarVistaMenu();
            activarBotonEmpezar();
            updateCamera();
            cargarFantasmas();
        },
        undefined,
        function (error)
        {
            console.error(error);
        }
    );
}


function updateAspectRatio()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    aplicarVistaMenu();
}


function actualizarResorte(actual, velocidadActual, objetivo, delta)
{
    aceleracion_camara
        .copy(objetivo)
        .sub(actual)
        .multiplyScalar(rigidez_camara)
        .addScaledVector(velocidadActual, -amortiguacion_camara);

    velocidadActual.addScaledVector(aceleracion_camara, delta);
    actual.addScaledVector(velocidadActual, delta);
}

function updateCamera(delta)
{
    if (gato === null) return;

    var objetivo = gato.position.clone();
    objetivo.y += desfase_lookat_y;
    if (enMenu)
    {
        objetivo = gato.position.clone();
        objetivo.y += alturaMiradaMenu;
        camera.position.set(
            gato.position.x + Math.sin(anguloCamaraMenu) * distanciaCamaraMenu,
            gato.position.y + alturaCamaraMenu,
            gato.position.z + Math.cos(anguloCamaraMenu) * distanciaCamaraMenu
        );
        camara_spring_iniciada = false;
    }
    else if (partidaTerminada)
    {
        camera.position.copy(gato.position).add(desplazamientoCamaraVictoria);
        camara_spring_iniciada = false;
    }
    else
    {
        var distanciaHorizontal = distancia_camara;
        posicion_objetivo_camara.set(
            gato.position.x + Math.sin(anguloHorizontalCamara) * distanciaHorizontal,
            objetivo.y + distanciaHorizontal * Math.tan(angulo_inclinacion_camara),
            gato.position.z - Math.cos(anguloHorizontalCamara) * distanciaHorizontal
        );
        var ySueloCamara = alturaSueloEn(posicion_objetivo_camara.x, posicion_objetivo_camara.z) + 6;
        if (posicion_objetivo_camara.y < ySueloCamara) posicion_objetivo_camara.y = ySueloCamara;

        mirada_objetivo_camara.copy(objetivo);

        if (!camara_spring_iniciada)
        {
            posicion_actual_camara.copy(posicion_objetivo_camara);
            mirada_actual_camara.copy(mirada_objetivo_camara);
            velocidad_camara.set(0, 0, 0);
            velocidad_mirada_camara.set(0, 0, 0);
            camara_spring_iniciada = true;
        }
        else
        {
            var dt = Math.min(delta || 0, 0.05);
            actualizarResorte(posicion_actual_camara, velocidad_camara, posicion_objetivo_camara, dt);
            actualizarResorte(mirada_actual_camara, velocidad_mirada_camara, mirada_objetivo_camara, dt);
        }
        camera.position.copy(posicion_actual_camara);
        var ySueloActual = alturaSueloEn(camera.position.x, camera.position.z) + 6;
        if (camera.position.y < ySueloActual) camera.position.y = ySueloActual;
        objetivo = mirada_actual_camara;
    }
    camera.lookAt(objetivo);

    if (transicionCamara)
    {
        tTransicionCamara += (delta || 0) / duracionTransicionActual;
        var t = Math.min(tTransicionCamara, 1);
        var e = t * t * (3 - 2 * t);

        var posFinal = camera.position.clone();
        var quatFinal = camera.quaternion.clone();
        camera.position.lerpVectors(inicioTransicionPos, posFinal, e);
        camera.quaternion.copy(inicioTransicionQuat).slerp(quatFinal, e);

        if (t >= 1) transicionCamara = false;
    }
}


function update()
{
    const delta = clock.getDelta();

    if (pausado)
    {
        cameraControls.update();
        return;
    }

    if (mixer !== null) mixer.update(delta);
    mixersFantasma.forEach(function (m) { m.update(delta); });
    if (gato !== null)
    {
        var alturaObjetivo = alturaSueloEn(gato.position.x, gato.position.z);
        alturaSueloGato += (alturaObjetivo - alturaSueloGato) * (1 - Math.exp(-40 * delta));
        gato.position.y = alturaBaseGato + alturaSueloGato;
    }
    animatePizzas(delta);
    if (gato === null) return;
    actualizarMovimientoFantasmas(delta);

    if (juegoActivo && !partidaTerminada) tiempoPartida += delta;
    actualizarCuentaAtras(delta);
    if (tiempoEfectoManzana > 0) tiempoEfectoManzana = Math.max(0, tiempoEfectoManzana - delta);

    var cameraForward = new THREE.Vector3(
        -Math.sin(anguloHorizontalCamara), 0, Math.cos(anguloHorizontalCamara)
    );
    var cameraRight = new THREE.Vector3().crossVectors(
        new THREE.Vector3(0, 1, 0), cameraForward
    ).normalize();
    var movementDirection = new THREE.Vector3();
    if (controls.moveForward) movementDirection.add(cameraForward);
    if (controls.moveBackward) movementDirection.sub(cameraForward);
    if (controls.moveRight) movementDirection.sub(cameraRight);
    if (controls.moveLeft) movementDirection.add(cameraRight);

    if (juegoActivo && !partidaTerminada && movementDirection.lengthSq() > 0)
    {
        movementDirection.normalize();
        velocity.copy(movementDirection);
        var anguloObjetivo = Math.atan2(velocity.x, velocity.z);
        var diferencia = Math.atan2(
            Math.sin(anguloObjetivo - angulo),
            Math.cos(anguloObjetivo - angulo)
        );
        angulo += diferencia * (1 - Math.exp(-velocidadGiro * delta));
        gato.rotation.y = angulo + desfase_orientacion;

        var direccionActual = new THREE.Vector3(Math.sin(angulo), 0, Math.cos(angulo));
        var paso = direccionActual.clone().multiplyScalar(velocidadActual());

        paso = pasoConRayos(gato.position, paso);
        paso = pasoConRayos(gato.position, paso);

        var intento = gato.position.clone().add(paso);
        if (puntoBloqueado(intento.x, intento.z, radioColisionGato * factorRadioColisionMovimiento)) intento = null;

        if (intento !== null) gato.position.copy(intento);

        catIsMoving = true;
    }
    else
    {
        catIsMoving = false;
    }

    ajustarPivoteGato(delta, false);
    actualizarSombraSol();
    collectPizzas();
    collectManzanas();
    comprobarFantasmas();
    actualizarAccionGato();
    actualizarHud();
    actualizarMinimapa();
    actualizarVistaMenu(delta);
    updateCamera(delta);
}


function cajaColision(objeto)
{
    if (objeto.isBox3) return objeto;
    if (!objeto.userData.caja)
    {
        objeto.updateMatrixWorld(true);
        objeto.userData.caja = new THREE.Box3().setFromObject(objeto);
    }
    return objeto.userData.caja;
}

function puntoBloqueado(x, z, margen)
{
    return objectsToCheck.some(function (obstaculo)
    {
        var c = cajaColision(obstaculo);
        return x > c.min.x - margen && x < c.max.x + margen &&
               z > c.min.z - margen && z < c.max.z + margen;
    });
}

var _rayoCol = new THREE.Ray();
var _golpeCol = new THREE.Vector3();
var _cajaCol = new THREE.Box3();
var _origenCol = new THREE.Vector3();
var _dirCol = new THREE.Vector3();
var _ladoCol = new THREE.Vector3();

function pasoConRayos(pos, paso)
{
    var dist = paso.length();
    if (dist < 1e-6) return paso;

    var radioMovimiento = radioColisionGato * factorRadioColisionMovimiento;
    _dirCol.copy(paso).divideScalar(dist);
    _ladoCol.set(-_dirCol.z, 0, _dirCol.x).multiplyScalar(radioMovimiento * 0.9);
    var alcance = dist + radioMovimiento;
    var masCerca = Infinity;
    var nx = 0, nz = 0;
    var desplazamientos = [0, 1, -1];

    for (var i = 0; i < desplazamientos.length; i++)
    {
        var k = desplazamientos[i];
        _origenCol.set(pos.x + _ladoCol.x * k, 0, pos.z + _ladoCol.z * k);
        _rayoCol.origin.copy(_origenCol);
        _rayoCol.direction.copy(_dirCol);

        for (var j = 0; j < objectsToCheck.length; j++)
        {
            var c = cajaColision(objectsToCheck[j]);
            _cajaCol.min.set(c.min.x, -1e9, c.min.z);
            _cajaCol.max.set(c.max.x, 1e9, c.max.z);

            if (_cajaCol.containsPoint(_origenCol)) continue;
            if (_rayoCol.intersectBox(_cajaCol, _golpeCol) === null) continue;

            var d = _golpeCol.distanceTo(_origenCol);
            if (d > alcance || d >= masCerca) continue;
            masCerca = d;

            var e = 0.05;
            if (Math.abs(_golpeCol.x - c.min.x) < e) { nx = -1; nz = 0; }
            else if (Math.abs(_golpeCol.x - c.max.x) < e) { nx = 1; nz = 0; }
            else if (Math.abs(_golpeCol.z - c.min.z) < e) { nx = 0; nz = -1; }
            else { nx = 0; nz = 1; }
        }
    }

    if (masCerca === Infinity) return paso;

    var entra = paso.x * nx + paso.z * nz;
    if (entra >= 0) return paso;
    return new THREE.Vector3(paso.x - entra * nx, paso.y, paso.z - entra * nz);
}

function actualizarAccionGato()
{
    if (idleAction === null || moveAction === null) return;

    var deseada;
    if (enMenu) deseada = menuAction;
    else if (partidaTerminada) deseada = (haPerdido && derrotaAction !== null) ? derrotaAction : victoriaAction;
    else if (catIsMoving) deseada = tiempoEfectoManzana > 0 ? manzanaAction : moveAction;
    else deseada = idleAction;

    if (deseada === currentAction) return;

    deseada.reset();
    deseada.crossFadeFrom(currentAction, 0.2, true);
    deseada.play();
    currentAction = deseada;
}


function render()
{
    requestAnimationFrame(render);
    update();
    actualizarLucesFarolas();
    actualizarLinterna();
    renderer.render(scene, camera);
}
