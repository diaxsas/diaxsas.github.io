const fechaInicioReporte = new Date('1/1/22')
const fechaFinReporte = new Date('2/1/22')

const dataPlc = getDataPlc(fechaInicioReporte, fechaFinReporte)

console.log(dataPlc)
var fs = require('fs');
fs.writeFile("dataset.json", JSON.stringify(dataPlc), function (err) {
    if (err) {
        console.log(err);
    }
});

var _dataPlc = {
    fechaInicioReporte: new Date('1/1/22'),
    fechaFinReporte: new Date('6/1/22'),
    data: [{


    }]
}



function getDataPlc(_fechaInicio, _fechaFin) {
    var _dataPlc = {}
    var _maquinas = genList(1, 1);
    _dataPlc.fechaInicioReporte = _fechaInicio
    _dataPlc.fechaFinReporte = _fechaFin
    _dataPlc.data = []




    _maquinas.forEach(function (_maquina) {
        var orden = 20;
        var color = rand(0, 254, true);
        var lote = 1;
        var operario = rand(100, 200, true);
        var molde = rand(100, 200, true);
        var tipoMaterial = rand(0, 15, true)
        var consumoMotor = 0;
        var consumoMaquina = 0;
        var matto_máquina = 0;
        var matto_molde = 0;
        var sin_operario = 0;
        var material = 0;
        var _calidad = 0;
        var montaje = 0;
        var tiempoProductivo = 0;
        var defectosInicioTurno = 0;
        var defectosLluvia = 0;
        var produccionReal = 0;
        var puertas = 0;
        var maq_movimiento = 0;
        var cavidad1 = 0;
        var cavidad2 = 0;
        var cavidad3 = 0;
        var cavidad4 = 0;
        var cavidad5 = 0;
        var cavidad6 = 0;
        var _fechaActual = new Date(_fechaInicio);
        while (_fechaActual <= _fechaFin) {
            var _turnos = rand(2, 3, true)
            for (var _hora = 0; _hora < 6 * _turnos; _hora++) {
                for (var _minute = 0; _minute < 60; _minute++) {
                    var _dataPlcMin = {}
                    _dataPlcMin.fecha = new Date(new Date(_fechaActual).setHours(_hora, _minute, 0))
                    _dataPlcMin.maquina = _maquina

                    if (rand(0, 15000, true) == 1) {
                        orden += 1;
                        lote = 0;
                        consumoMotor = 0;
                        consumoMaquina = 0;
                        matto_máquina = 0;
                        matto_molde = 0;
                        sin_operario = 0;
                        material = 0;
                        _calidad = 0;
                        montaje = 0;
                        tiempoProductivo = 0;
                        defectosInicioTurno = 0;
                        defectosLluvia = 0;
                        produccionReal = 0;
                    }
                    if (rand(0, 11000, true) == 1)
                        color = rand(0, 254, true);
                    if (rand(0, 10000, true) == 1) {
                        lote += 1;
                    }
                    if (rand(0, 1000, true) == 1)
                        operario = rand(100, 200, true);
                    if (rand(0, 11000, true) == 1)
                        molde = rand(100, 200, true);
                    if (rand(0, 11000, true) == 1) {
                        tipoMaterial = rand(0, 15, true)
                    }

                    var state = rand(0, 100, true);
                    if (state < 3) {
                        matto_máquina += rand(10, 30, true);
                    } else if (state < 6) {
                        matto_molde += rand(10, 30, true);
                    } else if (state < 9) {
                        material += rand(10, 30, true);
                    } else if (state < 12) {
                        sin_operario += rand(10, 30, true);
                    } else if (state < 15) {
                        _calidad += rand(10, 30, true);
                    } else if (state < 18) {
                        montaje += rand(10, 30, true);
                    } else {
                        tiempoProductivo += rand(40, 55, true);
                        produccionReal += rand(1, 2, true);

                        if (rand(0, 20, true) == 1) {
                            defectosLluvia += 1;
                        }
                        if (rand(0, 30, true) == 1) {
                            defectosInicioTurno += 1;
                        }
                        puertas = rand(10, 20);
                        maq_movimiento = rand(15, 20);

                        cavidad1 = rand(2, 4);
                        cavidad2 = rand(2, 4);
                        cavidad3 = 0;
                        cavidad4 = 0;
                        cavidad5 = 0;
                        cavidad6 = 0;
                        if (molde > 133) {
                            cavidad3 = rand(2, 4);
                            cavidad4 = rand(2, 4);
                            if (molde > 166) {
                                cavidad5 = rand(2, 4);
                                cavidad6 = rand(2, 4);
                            }
                        }

                    }
                    _dataPlcMin.puertas = puertas;
                    _dataPlcMin.maq_movimiento = maq_movimiento;
                    _dataPlcMin.cavidad1 = cavidad1;
                    _dataPlcMin.cavidad2 = cavidad2;
                    _dataPlcMin.cavidad3 = cavidad3;
                    _dataPlcMin.cavidad4 = cavidad4;
                    _dataPlcMin.cavidad5 = cavidad5;
                    _dataPlcMin.cavidad6 = cavidad6;

                    consumoMotor += rand(3, 5);
                    consumoMaquina += rand(5, 10);


                    _dataPlcMin.consumoMotor = consumoMotor;
                    _dataPlcMin.consumoMaquina = consumoMaquina;
                    _dataPlcMin.matto_máquina = matto_máquina;
                    _dataPlcMin.matto_molde = matto_molde;
                    _dataPlcMin.sin_operario = sin_operario;
                    _dataPlcMin.material = material;
                    _dataPlcMin._calidad = _calidad;
                    _dataPlcMin.montaje = montaje;
                    _dataPlcMin.tiempoProductivo = tiempoProductivo;
                    _dataPlcMin.defectosInicioTurno = defectosInicioTurno;
                    _dataPlcMin.defectosLluvia = defectosLluvia;
                    _dataPlcMin.produccionReal = produccionReal;

                    _dataPlcMin.tiempoCicloIdeal = (molde - 100) / 100 * 5 + 30;
                    _dataPlcMin.orden = orden;
                    _dataPlcMin.color = color;
                    _dataPlcMin.lote = lote;
                    _dataPlcMin.operario = operario;
                    _dataPlcMin.molde = molde;
                    _dataPlcMin.tipoMaterial = tipoMaterial

                    _dataPlcMin.cavidades = _dataPlcMin.cavidad1 + _dataPlcMin.cavidad2 + _dataPlcMin.cavidad3 + _dataPlcMin.cavidad4 + _dataPlcMin.cavidad5 + _dataPlcMin.cavidad6;
                    _dataPlcMin.ciclo_inyeccion = _dataPlcMin.puertas + _dataPlcMin.maq_movimiento;
                    _dataPlcMin.tiempoParadas = _dataPlcMin.matto_máquina + _dataPlcMin.matto_molde + _dataPlcMin.sin_operario + _dataPlcMin.material + _dataPlcMin._calidad + _dataPlcMin.montaje;
                    _dataPlcMin.tiempoDisponible = _dataPlcMin.tiempoProductivo + _dataPlcMin.tiempoParadas;
                    _dataPlcMin.piezasMalas = _dataPlcMin.defectosInicioTurno + _dataPlcMin.defectosLluvia;
                    _dataPlcMin.piezasBuenas = _dataPlcMin.produccionReal - _dataPlcMin.piezasMalas;
                    _dataPlcMin.capacidadProductiva = _dataPlcMin.tiempoProductivo / _dataPlcMin.tiempoCicloIdeal;
                    _dataPlcMin.disponibilidad = _dataPlcMin.tiempoProductivo / _dataPlcMin.tiempoDisponible;
                    _dataPlcMin.rendimiento = _dataPlcMin.produccionReal / _dataPlcMin.capacidadProductiva;
                    _dataPlcMin.calidad = _dataPlcMin.piezasBuenas / _dataPlcMin.produccionReal;
                    _dataPlcMin.eficiencia = _dataPlcMin.disponibilidad * _dataPlcMin.rendimiento * _dataPlcMin.calidad;

                    _dataPlc.data.push(_dataPlcMin)
                }
            }
            var _fechaProxima = _fechaActual.setDate(_fechaActual.getDate() + 1);
            _fechaActual = new Date(_fechaProxima);
        }
    })
    return _dataPlc
}

function genList(min, max) {
    var list = [];
    for (var i = min; i <= max; i++)
        list.push(i);
    return list;
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