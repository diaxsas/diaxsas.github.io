const matto_máquina = 0; //////////////////////////////////////
const matto_molde = 0; //////////////////////////////////////
const sin_operario = 0; //////////////////////////////////////
const material = 0; //////////////////////////////////////
const _calidad = 0; //////////////////////////////////////
const montaje = 0; //////////////////////////////////////
const horometro = 0; //////////////////////////////////////

const fin_producción = 0; // ignoradas por ahora
const fin_turno = 0; // ignoradas por ahora
const no_programada = 0; // ignoradas por ahora

var tiempoParadas = matto_máquina + matto_molde + sin_operario + material + _calidad + montaje + horometro; // Horas (La maquina estuvo corriendo por 16.1 horas en la fecha indicada)

const sumaTiempoCiclos = 0; // Toca sumar todos los MF1

var tiempoProductivo = sumaTiempoCiclos; // Horas (La maquina estuvo disponible 22.5 horas en la fecha indicada)

var tiempoDisponible = tiempoProductivo + tiempoParadas; //

var disponibilidad = tiempoProductivo / tiempoDisponible;






const piezasMalas = 30; // Piezas (Se produgieron 30 piezas defectuosas en la fecha) suma de dos contadores de defectos o uno

const produccionReal = 2000; // ML131 contador inyecciones

var piezasBuenas = produccionReal - piezasMalas; /////////////////////////////////////
var calidad = piezasBuenas / produccionReal;






/*

// DE CALIDAD:
const produccionReal = 2000; // ML131 contador inyecciones

// DE DISPONIBILIDAD
const sumaTiempoCiclos = 0; // Toca sumar todos los MF1
var tiempoProductivo = sumaTiempoCiclos; // Horas (La maquina estuvo disponible 22.5 horas en la fecha indicada)

*/

const tiempoCicloIdeal = 30; // Segundos (Idealmente hacer 1 inyeccion toma 30 segundos) MF5 ciclo estandar

var capacidadProductiva = tiempoProductivo / tiempoCicloIdeal; /////////////////////////////////////
var rendimiento = produccionReal / capacidadProductiva;
