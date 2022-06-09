
// Estados
//const status = '???'; // status
//const motor_on = 'I3'; // booleano


// Montaje
//const tolva = 'MI27'; // temperatura
//const atemperador = 'MI17'; // temperatura
const orden = 'ML1'; // #
const color = 'ML3'; // codigo ????????????
const lote = 'ML5'; // #
const operario = 'MI18'; // #
const molde = '???'; // codigo ????????????
const tipoMaterial = 'MI19'// codigo


// Consumos
const cavidades = 'MF12'; // peso
const cavidad1 = 'MF13'; // peso
const cavidad2 = 'MF14'; // peso
const cavidad3 = 'MF15'; // peso
const cavidad4 = 'MF16'; // peso
const cavidad5 = 'MF17'; // peso
const cavidad6 = 'MF18'; // peso

const consumoMotor = 'MI100'; // energia
const consumoMaquina = 'MI99'; // energia


// Ciclos
const puertas = 'MF8'; // segundos 
const maq_movimiento = 'MF9'; // segundos 
const ciclo_inyeccion = 'MF1'; // segundos 


// Disponibilidad
const matto_máquina = 'MI121'; // 0.5 - 1.5 horas
const matto_molde = 'MI122'; // 0.5 - 1 hora
const sin_operario = 'MI124'; // 0.5 - 1 hora
const material = 'MI127'; // 0.5 - 1 hora
const _calidad = 'MI128'; // 0.25 - 0.5 hora
const montaje = 'MI123'; // 0.5 - 1 hora

var tiempoParadas = matto_máquina + matto_molde + sin_operario + material + _calidad + montaje;

const tiempoProductivo = 'ML0'; // 10 - 12 horas 'Tiempo Motor'

var tiempoDisponible = tiempoProductivo + tiempoParadas;

var disponibilidad = tiempoProductivo / tiempoDisponible;


// Calidad

const defectosInicioTurno = 'MI101'; // 5 - 10 inyecciones
const defectosLluvia = 'MI102'; // 15 - 20 inyecciones

var piezasMalas = defectosInicioTurno + defectosLluvia;

const produccionReal = 'ML131'; // 1000 - 1200 inyecciones 'Contador Inyecciones'

var piezasBuenas = produccionReal - piezasMalas;
var calidad = piezasBuenas / produccionReal;

// Rendimiento

/*
// DE CALIDAD:
const produccionReal = 'ML131'; // 1000 - 1200 inyecciones 'Contador Inyecciones'

// DE DISPONIBILIDAD
const tiempoProductivo = 'ML0'; // 10 - 12 horas 'Tiempo Motor'
*/

const tiempoCicloIdeal = 'MF5'; // 30 Segundos/Inyeccion 'ciclo estandar'

var capacidadProductiva = tiempoProductivo / tiempoCicloIdeal;
var rendimiento = produccionReal / capacidadProductiva;
