const fechaInicioReporte = new Date('1/1/22')
const fechaFinReporte = new Date('6/1/22')
// para 1 maquina

const dataPlc = getDataPlc(fechaInicioReporte, fechaFinReporte)

console.log(dataPlc)
var fs = require('fs');
fs.writeFile("dataset.json", JSON.stringify(dataPlc), function (err) {
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

        _dataFechaActual.orden = rand(1233, 1263, true); /// pueden ser varias
        _dataFechaActual.color = rand(0, 254, true); /// pueden ser varias
        _dataFechaActual.lote = rand(0, 20, true); /// pueden ser varias
        _dataFechaActual.operario = rand(100, 200, true); /// pueden ser varias
        var moldP1 = rand(0, 9, true);
        var moldP2 = rand(0, 9, true);
        _dataFechaActual.molde = moldP1 * 1000 + moldP2 * 10; /// pueden ser varias
        _dataFechaActual.tipoMaterial =rand(0, 15, true) /// pueden ser varias
        _dataFechaActual.cavidad1 = rand(2, 4); /// la suma, el promedio o la ultima
        _dataFechaActual.cavidad2 = rand(2, 4); /// la suma, el promedio o la ultima
        _dataFechaActual.cavidad3 = 0; /// la suma, el promedio o la ultima
        _dataFechaActual.cavidad4 = 0; /// la suma, el promedio o la ultima
        _dataFechaActual.cavidad5 = 0; /// la suma, el promedio o la ultima
        _dataFechaActual.cavidad6 = 0; /// la suma, el promedio o la ultima
        _dataFechaActual.consumoMotor = rand(200, 400); /// la suma, el promedio o la ultima
        _dataFechaActual.consumoMaquina = rand(200, 400); /// la suma, el promedio o la ultima
        if(moldP1 > 3)
        {
            _dataFechaActual.cavidad3 = rand(2, 4);
            _dataFechaActual.cavidad4 = rand(2, 4);
            if(moldP1 > 7)
            {
                _dataFechaActual.cavidad5 = rand(2, 4);
                _dataFechaActual.cavidad6 = rand(2, 4);
            }
        }
        _dataFechaActual.cavidades = _dataFechaActual.cavidad1 + _dataFechaActual.cavidad2 + _dataFechaActual.cavidad3 + _dataFechaActual.cavidad4 + _dataFechaActual.cavidad5 + _dataFechaActual.cavidad6;
        _dataFechaActual.puertas = rand(10, 20); /// la suma, el promedio o la ultima
        _dataFechaActual.maq_movimiento = rand(15, 20); /// todo esto tiene que ser una colleccion de data
        _dataFechaActual.ciclo_inyeccion = _dataFechaActual.puertas + _dataFechaActual.maq_movimiento;
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

function UID() {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

const ejemplo = {}