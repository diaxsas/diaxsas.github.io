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
