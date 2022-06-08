const fechaInicioReporte = new Date('1/1/22')
const fechaFinReporte = new Date('6/1/22')
// para 1 maquina

const dataPlc = getDataPlc(fechaInicioReporte, fechaFinReporte)

console.log(dataPlc)
var fs = require('fs');
fs.writeFile("dataset.txt", JSON.stringify(dataPlc), function(err) {
    if (err) {
        console.log(err);
    }
});

function getDataPlc(_fechaInicio, _fechaFin) {
    var _dataPlc = {}
    _dataPlc.fechaInicioReporte = _fechaInicio
    _dataPlc.fechaFinReporte = _fechaFin
    _dataPlc.dias = []
    var _fechaActual = new Date(_fechaInicio);
    while (_fechaActual <= _fechaFin) {
        var _dataFechaActual = {}
        _dataFechaActual.fecha = _fechaActual

        _dataFechaActual.matto_máquina = rand(h2m(0.5), h2m(1.5));
        _dataFechaActual.matto_molde = rand(h2m(0.5), h2m(1));
        _dataFechaActual.sin_operario = rand(h2m(0.5), h2m(1));
        _dataFechaActual.material = rand(h2m(0.5), h2m(1));
        _dataFechaActual._calidad = rand(h2m(0.25), h2m(0.5));
        _dataFechaActual.montaje = rand(h2m(0.5), h2m(1));
        _dataFechaActual.tiempoProductivo = rand(h2m(10), h2m(12));
        _dataFechaActual.defectosInicioTurno = rand(5, 10, true);
        _dataFechaActual.defectosLluvia = rand(15, 20, true);
        _dataFechaActual.produccionReal = rand(1000, 1200, true);
        _dataFechaActual.tiempoCicloIdeal = 30;

        _dataFechaActual.tiempoParadas = _dataFechaActual.matto_máquina + _dataFechaActual.matto_molde + _dataFechaActual.sin_operario + _dataFechaActual.material + _dataFechaActual._calidad + _dataFechaActual.montaje;
        _dataFechaActual.tiempoDisponible = _dataFechaActual.tiempoProductivo + _dataFechaActual.tiempoParadas;
        _dataFechaActual.piezasMalas = _dataFechaActual.defectosInicioTurno + _dataFechaActual.defectosLluvia;
        _dataFechaActual.piezasBuenas = _dataFechaActual.produccionReal - _dataFechaActual.piezasMalas;
        _dataFechaActual.capacidadProductiva = _dataFechaActual.tiempoProductivo / _dataFechaActual.tiempoCicloIdeal;

        _dataFechaActual.disponibilidad = _dataFechaActual.tiempoProductivo / _dataFechaActual.tiempoDisponible;
        _dataFechaActual.rendimiento = _dataFechaActual.produccionReal / _dataFechaActual.capacidadProductiva;
        _dataFechaActual.calidad = _dataFechaActual.piezasBuenas / _dataFechaActual.produccionReal;
        _dataFechaActual.eficiencia = _dataFechaActual.disponibilidad * _dataFechaActual.rendimiento * _dataFechaActual.calidad;

        _dataPlc.dias.push(_dataFechaActual)
        var _fechaProxima = _fechaActual.setDate(_fechaActual.getDate() + 1);
        _fechaActual = new Date(_fechaProxima);
    }
    return _dataPlc
}

function rand(min, max, int = false) {
    if (!int)
        return Math.random() * (max - min) + min;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function h2m(h) {
    return h * 60 * 60
}

const ejemplo = {}