const fechaInicioReporte = new Date('1/1/22')
const fechaFinReporte = new Date('6/1/22')
// para 1 maquina

const dataPlc = getDataPlc(fechaInicioReporte, fechaFinReporte)


function getDataPlc(_fechaInicio, _fechaFin) {
    var _dataPlc = []
    var _fechaActual = new Date(_fechaInicio);
    while (_fechaActual <= _fechaFin) {
        var _dataFechaActual = {}
        _dataFechaActual.fecha = _fechaActual




        _dataPlc.push(_dataFechaActual)
        var _fechaProxima = _fechaActual.setDate(_fechaActual.getDate() + 1);
        _fechaActual = new Date(_fechaProxima);
    }
}
// variables son calculadad y numeros vienen del plc, el contexto es en un dia especifico





var matto_máquina = 0; //////////////////////////////////////
var matto_molde = 0; //////////////////////////////////////
var sin_operario = 0; //////////////////////////////////////
var material = 0; //////////////////////////////////////
var calidad = 0; //////////////////////////////////////
var montaje = 0; //////////////////////////////////////
var horometro = 0; //////////////////////////////////////

var fin_producción = 0; // ignoradas por ahora
var fin_turno = 0; // ignoradas por ahora
var no_programada = 0; // ignoradas por ahora

var tiempoParadas = matto_máquina + matto_molde + sin_operario + material + calidad + montaje + horometro; // Horas (La maquina estuvo corriendo por 16.1 horas en la fecha indicada)

var sumaTiempoCiclos = 0; // Toca sumar todos los MF1

var tiempoProductivo = sumaTiempoCiclos; // Horas (La maquina estuvo disponible 22.5 horas en la fecha indicada)

var tiempoDisponible = tiempoProductivo + tiempoParadas; //

var disponibilidad = tiempoProductivo / tiempoDisponible;




var piezasMalas = 30; // Piezas (Se produgieron 30 piezas defectuosas en la fecha) suma de dos contadores de defectos o uno

var produccionReal = 2000; // ML131 contador inyecciones

var piezasBuenas = produccionReal - piezasMalas; /////////////////////////////////////
var calidad = piezasBuenas / produccionReal;






/*

// DE CALIDAD:
var produccionReal = 2000; // ML131 contador inyecciones

// DE DISPONIBILIDAD
var sumaTiempoCiclos = 0; // Toca sumar todos los MF1
var tiempoProductivo = sumaTiempoCiclos; // Horas (La maquina estuvo disponible 22.5 horas en la fecha indicada)

*/


var tiempoCicloIdeal = 30; // Segundos (Idealmente hacer 1 inyeccion toma 30 segundos) MF5 ciclo estandar




var capacidadProductiva = tiempoProductivo / tiempoCicloIdeal; /////////////////////////////////////
var rendimiento = produccionReal / capacidadProductiva;

