//#region Configs

const __config = {
    pullAPI: "https://api.diax.com.co/diaxiotquery",
    channel: 'diaxPublisher/plcs/#',
    region: 'us-east-1',
    IDPool: '1e835899-922f-4a23-b61a-f3c5e43d94e7',
    endpoint: 'a3ke8mnvd8qmyj-ats.iot.us-east-1.amazonaws.com'
}

const t = {
    "Numero Inyectora": "MI31",
    "Minutos Motor Encendido": "ML0",
    "Molde": "ML3",
    "Orden": "ML1",
    "Contador Inyecciones": "ML131",
    "Contador Unidades": "ML135",
    "Segundos Ultimo Ciclo Total": "MF1",
    "Segundos Ciclo Estandar": "MF5",
    "Segundos Ultimo Ciclo Puerta": "MF8",
    "Segundos Ultimo Ciclo Maquina": "MF9",
    "Material": "MI19",
    "Operario": "MI18",
    "Grados Celsius Atemperador": "MI17",
    "Grados Celsius Tolva": "MI27",
    "KW Motor": "MI100",
    "KW Total Maquina": "MI99",
    "Minutos Mantto Maquina": "MI121",
    "Minutos Mantto Molde": "MI122",
    "Minutos Montaje": "MI123",
    "Minutos Sin Operario": "MI124",
    "Minutos No Programada": "MI125",
    "Minutos Fin Produccion": "MI126",
    "Minutos Por Material": "MI127",
    "Minutos Calidad": "MI128",
    "Minutos Fin Turno": "MI129",
    "Unidades Defecto Inicio Turno": "MI101",
    "Unidades No Conformes": "MI102",
    "Gramos Inyeccion": "MF12",
    "Gramos Cavidad 1": "MF13",
    "Gramos Cavidad 2": "MF14",
    "Gramos Cavidad 3": "MF15",
    "Gramos Cavidad 4": "MF16",
    "Gramos Cavidad 5": "MF17",
    "Gramos Cavidad 6": "MF18",
    "Lote": "ML5",
    "Estado Motor": "I3",
    "Segundos Ciclo Estandar +": "MF6",
    "Segundos Ciclo Estandar -": "MF7",
};

const _colors = [
    "#D6E4FF",
    "#3366D6", "#BE53C4", "#FFA600", "#23C897", "#1EC828", "#FB4826", "#F9E215", "#EC2EB9",
    "#4285F4", "#E585EB", "#F9B432", "#41E6B5", "#4BE354", "#F9674D", "#F9E84B", "#FF44CD",
    "#71A3F7", "#F0B0F3", "#F9C25C", "#76F1CC", "#7DEF84", "#FC9885", "#FCF08B", "#FC7BDA",
    "#A0C2FA", "#F4CFF6", "#FBDA9D", "#A8F6DF", "#ACF8B0", "#FCBBAF", "#FCF8D7", "#FFAAE8",
    "#D0E0FC", "#F9F1F9", "#FCECCE", "#D9F6EE", "#CEFED1", "#FCE0DB", "#FFFCE5", "#FCD7F2",
    "#3366D6", "#4285F4", "#71A3F7", "#A0C2FA", "#D0E0FC",
    "#BE53C4", "#E585EB", "#F0B0F3", "#F4CFF6", "#F9F1F9",
    "#FFA600", "#F9B432", "#F9C25C", "#FBDA9D", "#FCECCE",
    "#FB4826", "#F9674D", "#FC9885", "#FCBBAF", "#FCE0DB",
    "#1EC828", "#4BE354", "#7DEF84", "#ACF8B0", "#CEFED1",
    "#23C897", "#41E6B5", "#76F1CC", "#A8F6DF", "#D9F6EE",
    "#F9E215", "#F9E84B", "#FCF08B", "#FCF8D7", "#FFFCE5",
    "#EC2EB9", "#FF44CD", "#FC7BDA", "#FFAAE8", "#FCD7F2"
];

//#endregion

//#region Globals

// Data
var _pulledData = []
var originalData = {};
var filteredData = {};
var lockedData = false;

// AWS MQTT
var AWSMqttClient = sdk.AWSMqttClient;
var AWS = sdk.AWS
AWS.config.region = __config.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: __config.region + ':' + __config.IDPool,
});
const mqttSettings = {
    region: AWS.config.region,
    credentials: AWS.config.credentials,
    endpoint: __config.endpoint,
    expires: 0,
    clientId: 'mqtt-client-' + (Math.floor((Math.random() * 100000) + 1)),
    will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
    }
}
const client = new AWSMqttClient(mqttSettings)

//#endregion

//#region Load

// Search
$('.search_section').hide()

// Loader
$(document).ready(() => {
    $('body').removeClass('loading');
    $('#loader').hide();
})

var startMinDiff = -60
// Datetime
$('input[name="datetimes"]').daterangepicker({
    timePicker: true,
    startDate: new Date(new Date().getTime() + startMinDiff * 60000),
    endDate: new Date(),
    locale: {
        format: 'M/DD hh:mm A'
    }
});

$('#Indicadores').hide()
$('#subdashboard').hide()

// Auto Pull
$(document).ready(() => {
    const start = new Date($('#datetimes').data('daterangepicker').startDate._d);
    const end = new Date($('#datetimes').data('daterangepicker').endDate._d);
    pullData(start, end)
    $('#config .button_minimize_down').click()
})

//#endregion

//#region Events

// Live
var gotData = false;
async function datacheck() {
    setTimeout(function () {
        if (!gotData) {
            $('body').removeClass('loading');
            $('#loader').hide();
            $('#live').prop('checked', false)
            $('#configError').text('No se pudo conectar con el servidor.');
        }
    }, 70000);
}
$('#live').on('change', function () {
    if (lockedData)
        return
    $('#datetimes').prop("disabled", $(this).prop('checked'));
    if ($(this).prop('checked')) {
        lockedData = true
        $('body').addClass('loading');
        $('#loader').show();
        client.subscribe(__config.channel)
        $('input[name="datetimes"]').daterangepicker({
            timePicker: true,
            startDate: new Date(),
            endDate: new Date(),
            locale: {
                format: 'M/DD hh:mm A'
            }
        });
        _pulledData = []
        gotData = false;
        datacheck()
    } else
        client.unsubscribe(__config.channel)
})

// MQTT AWS Client
client.on('connect', () => {
    console.log('Connected to AWS IoT')
})

client.on('message', (topic, message) => {
    gotData = true;
    lockedData = true
    $('body').removeClass('loading');
    $('#loader').hide();
    var string = new TextDecoder().decode(message);
    var objString = JSON.parse(string)
    _pulledData = _pulledData.concat(objString);
    if (_pulledData.length > 100)
        _pulledData.shift()
    _pulledData = rename(_pulledData)
    originalData = formatData(_pulledData);
    filteredData = formatData(filterData(_pulledData));
    $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        startDate: new Date(_pulledData[0].timeStamp),
        endDate: new Date(),
        locale: {
            format: 'M/DD hh:mm A'
        }
    });
    paintData();
})

client.on('close', () => {
    console.log('Connection closed')
})

client.on('offline', () => {
    console.log('Connection offline')
})

// Offset
$('#offset').on('change', function () {
    if (lockedData)
        return
    lockedData = true
    filteredData = formatData(filterData(_pulledData));
    paintData();
})

// Download
$('#button_download_id').click(function () {
    //$('.menu_download').toggle();
    exportData()
});

// Minimize
$('.button_minimize_down').click(function () {
    $(this).closest('.cube_container').find('>*:not(:first-child)').toggle();
    //if config re toggle title_container because of tabs
    var _contId = $(this).closest('.cube_container').attr('id');
    if (_contId == 'config')
        $(this).closest('.cube_container').find('.title_container').toggle()
    if ($(this).closest('.cube_container').find('>.title_container').css('border-bottom') ==
        '0px none rgb(0, 0, 0)') {
        $(this).closest('.cube_container').find('>.title_container').css('border-bottom',
            '2px solid var(--color-negro)');
        if (_contId == 'Calidad' | _contId == 'Disponibilidad' | _contId == 'Rendimiento')
            $(this).closest('.cube_container').css('min-height', '450px')
    } else {
        $(this).closest('.cube_container').find('>.title_container').css('border-bottom',
            '0px none rgb(0, 0, 0)');
        if (_contId == 'Calidad' | _contId == 'Disponibilidad' | _contId == 'Rendimiento')
            $(this).closest('.cube_container').css('min-height', 'auto')
    }
});
// Search
$('.selected_head').click(function () {
    $(this).closest('.selected_form').find('.search_section').toggle()
});
// Datetime
$('#datetimes').change((e) => {
    try {
        JSON.stringify(e) // Hack checking e recursion to see if its human
        lockedData = false
    } catch (err) {
        if (lockedData)
            return
        lockedData = true
        const start = new Date($('#datetimes').data('daterangepicker').startDate._d);
        const end = new Date($('#datetimes').data('daterangepicker').endDate._d);
        pullData(start, end)
    }
})

// Cicles
$('#ciclePlc').on('change', function () {
    if (lockedData)
        return
    lockedData = true;
    paintData();
});

// Montaje
$('#MontajePlc').on('change', function () {
    if (lockedData)
        return
    lockedData = true;
    paintData();
});

// Material Change
$('#MaterialPlc').on('change', function () {
    if (lockedData)
        return
    lockedData = true
    paintData();
});

//#endregion

//#region Functions

async function pullData(_start, _end) {
    $('body').addClass('loading');
    $('#loader').show();
    var _vars = {
        start: (new Date(_start)).getTime(),
        end: (new Date(_end)).getTime(),
        group: ""
    }
    var diff = (_vars.end - _vars.start) / 1000 / 60;
    var callLimit = 200; // fixed value at 200 suggested
    var maxCalls = 1;
    if (diff > callLimit * maxCalls)
        _vars.group = "Hours"
    if (diff / 60 > callLimit * maxCalls)
        _vars.group = "Days"
    var callsTotal = Math.ceil(diff/callLimit);
    var calls = 0;
    var endOrig = _vars.end;
    _vars.end = new Date(_vars.start + callLimit * 60000).getTime();
    if(_vars.end > endOrig)
        _vars.end = endOrig;
    var retrys = 0;
    while (calls < callsTotal){
        const response = await fetch(__config.pullAPI, {
            method: "POST",
            headers: {},
            body: JSON.stringify(_vars)
        });
        const myJson = await response.json();
        if (response.status == 200) {
            if(calls == 0)
                _pulledData = myJson;
            else
                _pulledData = _pulledData.concat(myJson);
            calls++;
            _vars.start = new Date(_vars.start + 60000).getTime();
            _vars.end = new Date(_vars.start + callLimit*60000).getTime();
            if(_vars.end > endOrig)
            {
                _vars.end = endOrig;
                calls = callsTotal;
            }
        } else {
            retrys++;
        }
        if(retrys > 1)
        {
            $('body').removeClass('loading');
            $('#loader').hide();
            $('#configError').text('Failed to query');
            lockedData = false;
            return;
        }
    }
    _pulledData = rename(_pulledData)
    originalData = formatData(_pulledData);
    filteredData = formatData(filterData(_pulledData));
    $('body').removeClass('loading');
    $('#loader').hide();
    paintData();
}

function rename(toRename) {

    //$('.selected_head').closest('.selected_form').find('.search_section').show()
    /*var _sdata = JSON.stringify(toRename)

    function replaceAll(str, find, replace) {
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }
    _sdata = JSON.parse(_sdata);*/
    _sdata.forEach((data) => {
        // Renombrar Moldes
        Object.keys(data.plcs).forEach(plcID => {
            var plc = data.plcs[plcID]
            var _col = plc.variables[t['Molde']].value
            if (_col.length != 4 && _col != '0') {
                _col = _col.substring(_col.length - 6, _col.length - 2)
                plc.variables[t['Molde']].value = _col
            }
        })
        // +5 hrs & format date
        let dateNum = Date.parse(data.timeStamp)
        let date = new Date(dateNum)
        date = new Date(date.setTime(date.getTime() - (5 * 60 * 60 * 1000)))
        let dateString = date.toISOString()
        data.timeStamp = dateString
        //rename plcs
        var newPLCs = {}
        Object.keys(data.plcs).forEach(plcID => {
            var newID = data.plcs[plcID].variables[t['Numero Inyectora']]
            if (typeof newID === 'undefined') {
                newPLCs["Iny" + plcID.split('PLC')[1]] = data.plcs[plcID];
            } else {
                newPLCs["Iny" + newID.value] = data.plcs[plcID];
            }
        })
        data.plcs = newPLCs;

    })
    return _sdata
}

function getFilters() {
    var _filters = {
        maquinas: [],
        operarios: [],
        ordenes: [],
        lotes: [],
        colores: [],
        materiales: []
    };
    Object.keys(_filters).forEach(filterId => {
        var search_containers = $('#' + filterId + '_config .search_section .rows > div');
        for (let i = 0; i < search_containers.length; i++) {
            var checked = $(search_containers[i]).find('input').prop('checked')
            var _value = $(search_containers[i]).find('input').attr('value')
            if (!checked)
                _filters[filterId].push(_value)
        }
    })
    return _filters
}

var objectToCSVRow = function (dataObject) {
    var dataArray = new Array;
    for (var o in dataObject) {
        var innerValue = dataObject[o] === null ? '' : dataObject[o].toString();
        var result = innerValue.replace(/"/g, '""');
        result = '"' + result + '"';
        dataArray.push(result);
    }
    return dataArray.join(',') + '\r\n';
}

var exportToCSV = function (arrayOfObjects) {

    if (!arrayOfObjects.length) {
        return;
    }

    var csvContent = "data:text/csv;charset=utf-8,";

    // headers
    csvContent += objectToCSVRow(Object.keys(arrayOfObjects[0]));

    arrayOfObjects.forEach(function (item) {
        csvContent += objectToCSVRow(item);
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "LiveDashDiax.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}

function exportData() {
    var rows = []
    var varList = []
    var varNames = []
    var inputs = filterData(_pulledData)
    Object.keys(t).forEach(_var => {
        var varID = t[_var]
        if (!varList.includes(varID)) {
            varList.push(varID)
            varNames.push(_var)
        }
    })
    rows.push(['Fecha', 'Inyectora'].concat(varNames))
    rows.push(['timeStamp', 'inyector'].concat(varList))
    inputs.forEach(input => {
        Object.keys(input.plcs).forEach(plcID => {
            var row = [input.timeStamp, plcID]
            varList.forEach(varID => {
                var _num = "Null"
                if (input.plcs[plcID].variables[varID])
                    _num = input.plcs[plcID].variables[varID].value
                row.push(_num)
            })
            rows.push(row)
        })
    })
    exportToCSV(rows)

}

function filterData(inputs) {
    var filters = getFilters();
    var inputsCopy = JSON.parse(JSON.stringify(inputs))
    var outputs = []
    inputsCopy.forEach(input => {
        Object.keys(input.plcs).forEach(plcID => {
            if (filters.maquinas.includes(plcID)) {
                delete input.plcs[plcID]
                return
            }
            var plc = input.plcs[plcID]
            if (filters.operarios.includes(plc.variables[t['Operario']].value)) {
                delete input.plcs[plcID]
                return
            }
            if (filters.ordenes.includes(plc.variables[t['Orden']].value)) {
                delete input.plcs[plcID]
                return
            }
            if (filters.lotes.includes(plc.variables[t['Lote']].value)) {
                delete input.plcs[plcID]
                return
            }
            if (filters.colores.includes(plc.variables[t['Molde']].value)) {
                delete input.plcs[plcID]
                return
            }
            if (filters.materiales.includes(plc.variables[t['Material']].value)) {
                delete input.plcs[plcID]
                return
            }
        })
        if (Object.keys(input.plcs).length !== 0)
            outputs.push(input)
    })
    return outputs
}

function formatData(tempIinputs) {
    $('body').addClass('loading');
    $('#loader').show();
    var inputs = JSON.parse(JSON.stringify(tempIinputs))
    if (inputs.length < 1) {
        $('body').removeClass('loading');
        $('#loader').hide();
        return {}
    }
    inputs.sort(function (a, b) {
        return new Date(a.timeStamp) - new Date(b.timeStamp);
    });
    // Offset and flatten
    if ($('#offset').prop('checked'))
        Object.keys(inputs[0].plcs).forEach(plcId => {
            var offsets = {
                "ML0": 0, // "Minutos Motor Encendido" 
                "ML131": 0, // "Contador Inyecciones"
                "ML135": 0, // "Contador Unidades"
                "MI100": 0, // "KW Motor"
                "MI99": 0, // "KW Total Maquina"
                "MI121": 0, // "Minutos Mantto Maquina"
                "MI122": 0, // "Minutos Mantto Molde"
                "MI123": 0, // "Minutos Montaje"
                "MI124": 0, // "Minutos Sin Operario"
                "MI125": 0, // "Minutos No Programada"
                "MI126": 0, // "Minutos Fin Produccion"
                "MI127": 0, // "Minutos Por Material"
                "MI128": 0, // "Minutos Calidad"
                "MI129": 0, // "Minutos Fin Turno"
                "MI101": 0, // "Unidades Defecto Inicio Turno"
                "MI102": 0, // "Unidades No Conformes"
            }
            inputs.forEach((input, i) => {
                var plcVars = input.plcs[plcId].variables
                Object.keys(offsets).forEach((offsetKey) => {
                    var currVar = Number(plcVars[offsetKey].value)
                    // flatten
                    if (i == 0)
                        offsets[offsetKey] -= currVar
                    // offset
                    if (i > 0) {
                        var lastVar = Number(inputs[i - 1].plcs[plcId].variables[offsetKey]
                            .value)
                        if (currVar < (lastVar - offsets[offsetKey]))
                            offsets[offsetKey] += ((lastVar - offsets[offsetKey]) - currVar)
                    }
                    plcVars[offsetKey].value = currVar + offsets[offsetKey]
                })
            })
        })
    // Start constructing output
    var output = {
        calidad: [],
        disponibilidad: [],
        rendimiento: [],
        ciclos: {},
        extra: {
            plcStatus: {},
            operarios: {},
            ordenes: {},
            lotes: {},
            colores: {},
            materiales: {}
        },
        configuracion: {
            maquinas: [],
            operarios: [],
            ordenes: [],
            lotes: [],
            colores: [],
            materiales: []
        },
        indicadores: {
            disponibilidad: {
                name: 'Disponibilidad',
                values: [],
                dates: [],
            },
            rendimiento: {
                name: 'Rendimiento',
                values: [],
                dates: [],
            },
            calidad: {
                name: 'Calidad',
                values: [],
                dates: [],
            },
            eficiencia: {
                name: 'Eficiencia',
                values: [],
                dates: [],
            },

        },
        energia: [],
        material: {
            maquina: [],
            molde: [],
        },
        montaje: {}
    };
    var _startD = new Date($('#datetimes').data('daterangepicker').startDate._d);
    var _endD = new Date($('#datetimes').data('daterangepicker').endDate._d);
    var diffMs = (_endD - _startD);
    var _ttotal = Math.round(diffMs / 1000 / 60) * Object.keys(tempIinputs[0].plcs).length; // minutes
    inputs.forEach((input, inputI) => {
        // calidad
        var _buenas = 0;
        var _arranque = 0;
        var _lluvia = 0;
        // disponibilidad
        var _montaje = 0;
        var _calidad = 0;
        var _material = 0;
        var _abandono = 0;
        var _molde = 0;
        var _maquina = 0;
        var _productivo = 0;
        var _noProg = 0
        var _inyecciones = 0
        // rendimiento
        var _sumaTiempoCiclo = 0;
        var _contTiempoCiclo = 0;
        // indicadores
        output.indicadores.disponibilidad.dates.push(input.timeStamp)
        output.indicadores.rendimiento.dates.push(input.timeStamp)
        output.indicadores.calidad.dates.push(input.timeStamp)
        output.indicadores.eficiencia.dates.push(input.timeStamp)
        // energia
        var energia = {
            name: 'Total',
            value: 0,
            date: input.timeStamp,
            children: []
        }
        // material
        var material = {
            name: 'Total',
            value: 0,
            date: input.timeStamp,
            children: [],
        }

        var calidadChildGood = []
        var calidadChildLluvia = []
        var calidadChildArranque = []
        var rendChildProd = []
        var rendChildInef = []
        var dispChildProd = []
        var dispChildMontaje = []
        var dispChildCalidad = []
        var dispChildMaterial = []
        var dispChildAbandono = []
        var dispChildMolde = []
        var dispChildMaquina = []
        var dispChildNoProg = []
        Object.keys(input.plcs).forEach(plcId => {
            var plc = input.plcs[plcId].variables;
            // calidad
            _arranque += Number(plc[t['Unidades Defecto Inicio Turno']].value)
            _lluvia += Number(plc[t['Unidades No Conformes']].value)
            _buenas += (Number(plc[t['Contador Unidades']].value) - Number(plc[t[
                    'Unidades Defecto Inicio Turno']]
                .value) - Number(plc[t['Unidades No Conformes']].value))
            calidadChildGood.push({
                name: 'B.' + plcId,
                value: (Number(plc[t['Contador Unidades']].value) - Number(plc[t[
                        'Unidades Defecto Inicio Turno']]
                    .value) - Number(plc[t['Unidades No Conformes']].value))
            })
            calidadChildLluvia.push({
                name: 'L.' + plcId,
                value: Number(plc[t['Unidades No Conformes']].value)
            })
            calidadChildArranque.push({
                name: 'A.' + plcId,
                value: Number(plc[t['Unidades Defecto Inicio Turno']].value)
            })
            // disponibilidad
            _montaje += Number(plc[t['Minutos Montaje']].value)
            _calidad += Number(plc[t['Minutos Calidad']].value)
            _material += Number(plc[t['Minutos Por Material']].value)
            _abandono += Number(plc[t['Minutos Sin Operario']].value)
            _molde += Number(plc[t['Minutos Mantto Molde']].value)
            _maquina += Number(plc[t['Minutos Mantto Maquina']].value)
            _productivo += Number(plc[t['Minutos Motor Encendido']].value)
            _noProg += Number(plc[t['Minutos No Programada']].value)
            _inyecciones += Number(plc[t['Contador Inyecciones']].value)

            var prod = Math.floor(Math.round(diffMs / 1000 / 60) - Number(plc[t['Minutos No Programada']].value) - (Number(plc[t['Minutos Mantto Maquina']].value) + Number(plc[t['Minutos Mantto Molde']].value) + Number(plc[t['Minutos Sin Operario']].value) + Number(plc[t['Minutos Por Material']].value) + Number(plc[t['Minutos Calidad']].value) + Number(plc[t['Minutos Montaje']].value)))
            dispChildProd.push({
                name: 'P.' + plcId,
                value: prod
            })
            dispChildMontaje.push({
                name: 'MJ.' + plcId,
                value: Number(plc[t['Minutos Montaje']].value)
            })
            dispChildCalidad.push({
                name: 'CA.' + plcId,
                value: Number(plc[t['Minutos Calidad']].value)
            })
            dispChildMaterial.push({
                name: 'MA.' + plcId,
                value: Number(plc[t['Minutos Por Material']].value)
            })
            dispChildAbandono.push({
                name: 'SO.' + plcId,
                value: Number(plc[t['Minutos Sin Operario']].value)
            })
            dispChildMolde.push({
                name: 'MD.' + plcId,
                value: Number(plc[t['Minutos Mantto Molde']].value)
            })
            dispChildMaquina.push({
                name: 'MQ.' + plcId,
                value: Number(plc[t['Minutos Mantto Maquina']].value)
            })
            dispChildNoProg.push({
                name: 'NP.' + plcId,
                value: Number(plc[t['Minutos No Programada']].value)
            })
            // rendimiento
            _sumaTiempoCiclo += Number(plc[t['Segundos Ultimo Ciclo Total']].value)
            _contTiempoCiclo++;
            rendChildProd.push({
                name: 'P.' + plcId,
                value: Number(plc[t['Contador Inyecciones']].value)
            })
            // Ineficiencias
            rendChildInef.push({
                name: 'I.' + plcId,
                value: ((Number(plc[t['Minutos Motor Encendido']].value) * 60) / (
                    Number(plc[t[
                        'Segundos Ciclo Estandar']].value))) - Number(plc[t[
                        'Contador Inyecciones']]
                    .value)
            })
            // ciclos
            if (!(plcId in output.ciclos))
                output.ciclos[plcId] = []
            var puerta = Number(plc[t['Segundos Ultimo Ciclo Puerta']].value)
            var maquina = Number(plc[t['Segundos Ultimo Ciclo Maquina']].value)
            var totalMP = Number(plc[t['Segundos Ultimo Ciclo Total']].value)

            var ciclos = {
                name: 'Ciclo',
                value: totalMP,
                date: input.timeStamp,
                min: Number(plc[t['Segundos Ciclo Estandar -']].value),
                max: Number(plc[t['Segundos Ciclo Estandar +']].value),
                mean: Number(plc[t['Segundos Ciclo Estandar']].value),
                children: [{
                        name: 'Maquina',
                        value: maquina,
                    },
                    {
                        name: 'Puerta',
                        value: puerta,
                    }
                ]
            }
            output.ciclos[plcId].push(ciclos)

            // montaje
            if (!(plcId in output.montaje))
                output.montaje[plcId] = []

            var _col = plc[t['Molde']].value
            if (_col.length != 4 && _col != '0') {
                _col = _col.substring(_col.length - 6, _col.length - 2)
            }
            var montaje = {
                name: 'Montaje',
                orden: plc[t['Orden']].value,
                operario: plc[t['Operario']].value,
                lote: plc[t['Lote']].value,
                molde: _col,
                material: plc[t['Material']].value,
            }
            output.montaje[plcId].push(montaje)

            // energia
            var energiaPlc = {
                name: plcId,
                value: Number(plc[t['KW Total Maquina']].value) + Number(plc[t[
                    'KW Motor']].value),
                children: [{
                    name: 'Motor',
                    value: Number(plc[t['KW Motor']].value),
                }, {
                    name: 'Maquina',
                    value: Number(plc[t['KW Total Maquina']].value),
                }, ]
            }
            energia.children.push(energiaPlc)
            // configuracion
            if (inputI == inputs.length - 1) {
                output.extra.plcStatus[plcId] = "Off"
                if (plc[t['Estado Motor']])
                    if (typeof plc[t['Estado Motor']].value !== 'undefined')
                        if (plc[t['Estado Motor']].value.toLowerCase() == "true")
                            output.extra.plcStatus[plcId] = "On"
            }
            output.configuracion.maquinas.push(plcId)
            output.configuracion.operarios.push(plc[t['Operario']].value)
            output.configuracion.ordenes.push(plc[t['Orden']].value)
            output.configuracion.lotes.push(plc[t['Lote']].value)
            output.configuracion.colores.push(plc[t['Molde']].value)
            output.configuracion.materiales.push(plc[t['Material']].value)
            if (!Object.keys(output.extra.operarios).includes(plc[t['Operario']].value))
                output.extra.operarios[plc[t['Operario']].value] = []
            output.extra.operarios[plc[t['Operario']].value].push(plcId)
            if (!Object.keys(output.extra.ordenes).includes(plc[t['Orden']].value))
                output.extra.ordenes[plc[t['Orden']].value] = []
            output.extra.ordenes[plc[t['Orden']].value].push(plcId)
            if (!Object.keys(output.extra.lotes).includes(plc[t['Lote']].value))
                output.extra.lotes[plc[t['Lote']].value] = []
            output.extra.lotes[plc[t['Lote']].value].push(plcId)
            if (!Object.keys(output.extra.colores).includes(plc[t['Molde']].value))
                output.extra.colores[plc[t['Molde']].value] = []
            output.extra.colores[plc[t['Molde']].value].push(plcId)
            if (!Object.keys(output.extra.materiales).includes(plc[t['Material']].value))
                output.extra.materiales[plc[t['Material']].value] = []
            output.extra.materiales[plc[t['Material']].value].push(plcId)
            // material
            var materialPlc = {
                name: plcId,
                value: Number(plc[t['Gramos Inyeccion']].value),
                children: []
            }

            var simpPlcID = plcId.split(' ')[0].split('Iny')[1]

            if (Number(plc[t['Gramos Cavidad 1']].value) != 0)
                materialPlc.children.push({
                    name: simpPlcID + '.Cav1',
                    value: Number(plc[t['Gramos Cavidad 1']].value),
                })
            if (Number(plc[t['Gramos Cavidad 2']].value) != 0)
                materialPlc.children.push({
                    name: simpPlcID + '.Cav2',
                    value: Number(plc[t['Gramos Cavidad 2']].value),
                })
            if (Number(plc[t['Gramos Cavidad 3']].value) != 0)
                materialPlc.children.push({
                    name: simpPlcID + '.Cav3',
                    value: Number(plc[t['Gramos Cavidad 3']].value),
                })
            if (Number(plc[t['Gramos Cavidad 4']].value) != 0)
                materialPlc.children.push({
                    name: simpPlcID + '.Cav4',
                    value: Number(plc[t['Gramos Cavidad 4']].value),
                })
            if (Number(plc[t['Gramos Cavidad 5']].value) != 0)
                materialPlc.children.push({
                    name: simpPlcID + '.Cav5',
                    value: Number(plc[t['Gramos Cavidad 5']].value),
                })
            if (Number(plc[t['Gramos Cavidad 6']].value) != 0)
                materialPlc.children.push({
                    name: simpPlcID + '.Cav6',
                    value: Number(plc[t['Gramos Cavidad 6']].value),
                })
            material.children.push(materialPlc)
        })
        var materialMolde = {
            name: 'Total',
            value: 0,
            date: input.timeStamp,
            children: [],
        }
        Object.keys(input.plcs).forEach(plcId => {
            // material
            var simpMoldeID = input.plcs[plcId].variables[t['Molde']].value
            if (materialMolde.children.filter(e => e.name === simpMoldeID).length <= 0) {
                var _materialPlcMolde = {
                    name: simpMoldeID,
                    value: 0,
                    children: [{
                            name: simpMoldeID + '.Cav1',
                            value: 0,
                        },
                        {
                            name: simpMoldeID + '.Cav2',
                            value: 0,
                        },
                        {
                            name: simpMoldeID + '.Cav3',
                            value: 0,
                        },
                        {
                            name: simpMoldeID + '.Cav4',
                            value: 0,
                        },
                        {
                            name: simpMoldeID + '.Cav5',
                            value: 0,
                        },
                        {
                            name: simpMoldeID + '.Cav6',
                            value: 0,
                        },
                    ]
                }
                materialMolde.children.push(_materialPlcMolde)
            }
            var materialPlcMolde = materialMolde.children.filter(e => e.name === simpMoldeID)[0]
            var cav1 = Number(input.plcs[plcId].variables[t['Gramos Cavidad 1']].value)
            var cav2 = Number(input.plcs[plcId].variables[t['Gramos Cavidad 2']].value)
            var cav3 = Number(input.plcs[plcId].variables[t['Gramos Cavidad 3']].value)
            var cav4 = Number(input.plcs[plcId].variables[t['Gramos Cavidad 4']].value)
            var cav5 = Number(input.plcs[plcId].variables[t['Gramos Cavidad 5']].value)
            var cav6 = Number(input.plcs[plcId].variables[t['Gramos Cavidad 6']].value)
            materialPlcMolde.children.filter(e => e.name.includes('.Cav1'))[0].value += cav1
            materialPlcMolde.children.filter(e => e.name.includes('.Cav2'))[0].value += cav2
            materialPlcMolde.children.filter(e => e.name.includes('.Cav3'))[0].value += cav3
            materialPlcMolde.children.filter(e => e.name.includes('.Cav4'))[0].value += cav4
            materialPlcMolde.children.filter(e => e.name.includes('.Cav5'))[0].value += cav5
            materialPlcMolde.children.filter(e => e.name.includes('.Cav6'))[0].value += cav6
            materialPlcMolde.value += Number(input.plcs[plcId].variables[t['Gramos Inyeccion']]
                .value)
            materialMolde.value += materialPlcMolde.value
        })
        output.material.molde.push(materialMolde)
        var calidad = {
            name: 'Produccion',
            value: _buenas + _arranque + _lluvia,
            date: input.timeStamp,
            children: [{
                    name: 'Buenas',
                    value: _buenas,
                    children: calidadChildGood
                },
                {
                    name: 'Malas',
                    value: _arranque + _lluvia,
                    children: [{
                            name: 'Arranque',
                            value: _arranque,
                            children: calidadChildArranque
                        },
                        {
                            name: 'Rechazos',
                            value: _lluvia,
                            children: calidadChildLluvia
                        }
                    ]
                }
            ]
        }
        output.calidad.push(calidad)
        var disponibilidad = {
            name: 'Disponible',
            value: _ttotal - _noProg,
            date: input.timeStamp,
            children: [{
                    name: 'Productivo',
                    value: _ttotal - _noProg - (_maquina + _molde + _abandono + _material + _calidad + _montaje),
                    children: dispChildProd
                },
                {
                    name: 'Paradas',
                    value: _maquina + _molde + _abandono + _material + _calidad + _montaje,
                    children: [{
                            name: 'Maquina',
                            value: _maquina,
                            children: dispChildMaquina
                        },
                        {
                            name: 'Molde',
                            value: _molde,
                            children: dispChildMolde
                        },
                        {
                            name: 'Sin Operario',
                            value: _abandono,
                            children: dispChildAbandono
                        },
                        {
                            name: 'Material',
                            value: _material,
                            children: dispChildMaterial
                        },
                        {
                            name: 'Calidad',
                            value: _calidad,
                            children: dispChildCalidad
                        },
                        {
                            name: 'Montaje',
                            value: _montaje,
                            children: dispChildMontaje
                        }
                    ]
                }
            ]
        }
        // Ineficiencias
        var _capacidadProd = (_ttotal - _noProg) / ((_sumaTiempoCiclo / _contTiempoCiclo) / 60)
        var _ineficiencias = _capacidadProd - _inyecciones;
        //_ineficiencias = _ineficiencias<0?0:_ineficiencias;
        output.disponibilidad.push(disponibilidad)
        var rendimiento = {
            name: 'Capacidad',
            value: _capacidadProd,
            date: input.timeStamp,
            children: [{
                    name: 'Producido',
                    value: _inyecciones,
                    children: rendChildProd
                },
                {
                    name: 'Ineficiencias',
                    value: _ineficiencias,
                    children: rendChildInef
                }
            ]
        }
        output.rendimiento.push(rendimiento)
        energia.children.forEach(child => {
            energia.value += child.value
        })
        output.energia.push(energia)
        material.children.forEach(child => {
            material.value += child.value
        })
        output.material.maquina.push(material)
        var disp = (_ttotal - _noProg - (_maquina + _molde + _abandono + _material + _calidad + _montaje)) / (_ttotal - _noProg);
        disp = Math.round(disp * 100 * 10) / 10;
        // Ineficiencias
        var rend = _inyecciones / ((_ttotal - _noProg) / ((_sumaTiempoCiclo / _contTiempoCiclo) / 60));
        rend = Math.round(rend * 100 * 10) / 10;
        var cal = _buenas / (_buenas + _arranque + _lluvia);
        cal = Math.round(cal * 100 * 10) / 10;
        var ef = (disp / 100 * rend / 100 * cal / 100);
        ef = Math.round(ef * 100 * 10) / 10;
        output.indicadores.disponibilidad.values.push(disp)
        output.indicadores.rendimiento.values.push(rend)
        output.indicadores.calidad.values.push(cal)
        output.indicadores.eficiencia.values.push(ef)
    });
    // De dupe configs
    Object.keys(output.configuracion).forEach(configId => {
        var config = output.configuracion[configId]
        config = [...new Set(config)]
        var collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: 'base'
        });
        config = config.sort(collator.compare);
        output.configuracion[configId] = config
    })


    Object.keys(output.extra).forEach(exrtraId => {
        if (exrtraId == "plcStatus")
            return;
        var extraObj = output.extra[exrtraId]
        Object.keys(extraObj).forEach(subExrtraId => {
            var subExtraObj = extraObj[subExrtraId]
            subExtraObj = [...new Set(subExtraObj)]
            var collator = new Intl.Collator(undefined, {
                numeric: true,
                sensitivity: 'base'
            });
            subExtraObj = subExtraObj.sort(collator.compare);
            extraObj[subExrtraId] = subExtraObj
        })

    })


    $('body').removeClass('loading');
    $('#loader').hide();
    return output;
}

function paintData() {
    lockedData = true
    $('body').addClass('loading');
    $('#loader').show();
    if (_pulledData.length < 1) {
        $('#configError').show()
        $('#configError').text('No hay data, intenta otro rango.');
        $('#Indicadores').hide()
        $('#subdashboard').hide()
        $('body').removeClass('loading');
        $('#loader').hide();
        lockedData = false
        return;
    }
    $('#configError').hide()
    $('#Indicadores').show()
    $('#subdashboard').show()
    var oldFilters = getFilters()
    Object.keys(originalData['configuracion']).forEach((key) => {
        var opciones = originalData['configuracion'][key]
        var search_container = $('#' + key + '_config .search_section .rows');
        search_container.empty()
        var reds = []
        opciones.forEach(function (opcion) {
            var _chk = ''
            var _prnt = ''
            if (!oldFilters[key].includes(opcion))
                _chk = 'checked'

            if (!oldFilters[key].includes(opcion)) {
                if (Object.keys(filteredData).length > 0) {
                    if (!filteredData['configuracion'][key].includes(opcion)) {
                        _prnt = 'style="text-decoration: line-through;"'
                    }
                } else {
                    _prnt = 'style="text-decoration: line-through;"'
                }
            }
            var inyStatus = ''
            if (key == 'maquinas') {
                var _tcolor = "red"
                if (originalData.extra.plcStatus[opcion]?.toLowerCase() == 'on')
                    _tcolor = "green"
                inyStatus = ' (<span style="color:' + _tcolor + ';">' + originalData.extra
                    .plcStatus[opcion] + '</span>)'
            } else {
                inyStatus = ' (Iny: ' + originalData.extra[key][opcion].join(', ').split('Iny')
                    .join('') + ')'
            }
            var new_section = `
                <div>
                    <input type="checkbox" name="${opcion}" value="${opcion}" ${_chk}>
                    <label for="${opcion}" ${_prnt}>${opcion + inyStatus}</label>
                </div>`
            if (_prnt === "")
                search_container.append(new_section)
            else
                reds.push(new_section)
        })
        reds.forEach(red => search_container.append(red))
    })
    $('.selected_form .search_section .rows input').off('change').on('change', function (e) {
        if (lockedData)
            return
        lockedData = true
        filteredData = formatData(filterData(_pulledData));
        paintData();
    })
    $('.selected_form .search_section .toggle_all').off('change').on('change', function (e) {
        if (lockedData)
            return
        lockedData = true
        $(this).closest('.selected_form').find('input').prop('checked', $(this).prop('checked'));
        filteredData = formatData(filterData(_pulledData));
        paintData();
    })
    if (Object.keys(filteredData).length < 1) {
        $('#configError').text('No queda data, intenta otra configuración.');
        $('#configError').show();
        $('#Indicadores').hide()
        $('#subdashboard').hide()
        $('body').removeClass('loading');
        $('#loader').hide();
        lockedData = false
        return;
    } else {
        $('#configError').hide();
        $('#Indicadores').show()
        $('#subdashboard').show()
    }
    // dynamic coloring
    function setColors(data) {
        var i = 0
        data.color = _colors[i]
        i++
        if (data.children) {
            data.children.forEach(function (d) {
                d.color = _colors[i]
                i++
            })
            data.children.forEach(function (d) {
                if (d.children)
                    d.children.forEach(function (e) {
                        e.color = _colors[i]
                        i++
                    })
            })
        }
    }
    Object.keys(filteredData).forEach(function (section) {
        if (section == 'configuracion' | section == 'montaje')
            return
        if (section == 'ciclos' || section == 'material') {
            Object.keys(filteredData[section]).forEach(function (_section) {
                filteredData[section][_section].forEach(function (step) {
                    setColors(step)
                })
            })
            return
        }
        if (section == 'indicadores') {
            var i = 1;
            Object.keys(filteredData[section]).forEach(function (_section) {
                filteredData[section][_section].color = _colors[i]
                i++
            })
            return
        }
        if (section == "extra")
            return
        filteredData[section].forEach(function (_section) {
            setColors(_section)
        })
    })
    $('#eficiencia_indicador').css('box-shadow', _colors[4] + ' 0px 0px 8px')
    Object.keys(filteredData).forEach(function (section) {
        var units = 'ud'
        switch (section) {
            case 'disponibilidad':
                units = 'min'
                break
            case 'rendimiento':
                units = 'inys'
                break
            case 'ciclos':
                units = 'seg'
                break
            case 'energia':
                units = 'kw'
                break
            case 'material':
                units = 'g'
                break
        }
        if (section == "configuracion")
            return
        if (section == "extra")
            return
        if (section == "indicadores") {
            var lineID = 'line' + proper(section);
            var lineContainer = '#line' + proper(section) + 'Container'
            var traces = []
            var maxVals = []
            var maxLabels = []
            labels = Object.keys(filteredData[section])
            labels.forEach(function (label, i) {
                var x = filteredData[section][label].dates
                var y = filteredData[section][label].values
                if (label != 'eficiencia') {
                    maxVals.push(y[y.length - 1])
                    maxLabels.push(proper(label).substring(0, 3) + '.')
                }
                $('#indicador' + proper(label)).text(y[y.length - 1])
                $('#underline' + proper(label)).css('border-color', filteredData[section][label]
                    .color)
                var trace = {
                    y: y,
                    x: x,
                    type: 'scatter',
                    name: filteredData[section][label].name,
                    line: {
                        color: filteredData[section][label].color,
                    },
                };
                traces.push(trace)
            })
            maxVals.push(maxVals[0])
            maxLabels.push(maxLabels[0])
            var layout = {
                showlegend: false,
                "margin": {
                    "l": 30,
                    "r": 10,
                    "b": 30,
                    "t": 10
                },
                xaxis: {},
                yaxis: {
                    //type: 'log'
                },
            };
            Plotly.newPlot(lineID, traces, layout, {
                displayModeBar: false,
            });
            $(window).resize(function () {
                var update = {
                    width: $(lineContainer).width(),
                    height: $(lineContainer).width() / 1.9
                };
                if (lineID == 'lineIndicadores') {
                    if ($(window).width() > 1100)
                        update.height = update.width / 3.5
                    else if ($(window).width() < 740)
                        update.height = update.width / 1.9
                    else
                        update.height = update.width / 2.5
                }
                Plotly.relayout(lineID, update);
            });
            var pieID = "pie" + proper(section);
            var pieParent = "#pie" + proper(section) + "Container"
            var _data = [{
                type: 'scatterpolar',
                r: maxVals,
                theta: maxLabels,
                fill: 'toself',
                name: 'Eficiencia',
                line: {
                    color: _colors[4]
                },
                marker: {
                    size: 1
                },
                //fillcolor: _colors[4],
                //opacity: 0.6
            }, {
                type: 'scatterpolar',
                r: [0, maxVals[0]],
                theta: [maxLabels[0], maxLabels[0]],
                name: 'Disponibilidad',
                marker: {
                    color: _colors[1],
                    size: 8
                },
                line: {
                    width: 4
                }
            }, {
                type: 'scatterpolar',
                r: [0, maxVals[1]],
                theta: [maxLabels[1], maxLabels[1]],
                name: 'Rendimiento',
                marker: {
                    color: _colors[2],
                    size: 8
                },
                line: {
                    width: 4
                }
            }, {
                type: 'scatterpolar',
                r: [0, maxVals[2]],
                theta: [maxLabels[2], maxLabels[2]],
                name: 'Calidad',
                marker: {
                    color: _colors[3],
                    size: 8
                },
                line: {
                    width: 4
                }
            }, ];
            var layout = {
                "margin": {
                    "l": 30,
                    "r": 30,
                    "b": 20,
                    "t": 20
                },
                width: $(pieParent).width(),
                height: $(pieParent).width(),
                polar: {
                    radialaxis: {
                        visible: true,
                        range: [30, 100]
                    }
                },
                showlegend: false
            };
            Plotly.newPlot(pieID, _data, layout, {
                showSendToCloud: false,
                displayModeBar: false,
            })
            myPlot = document.getElementById(pieID);
            $(window).resize(function () {
                try {
                    var update = {
                        width: $(pieParent).width(),
                        height: $(pieParent).width()
                    };
                    Plotly.relayout(pieID, update);
                } catch (error) {}
            });
            return
        }
        var currData = filteredData[section];
        if (section == "ciclos") {

            var _keys = Object.keys(filteredData[section])
            var collator = new Intl.Collator(undefined, {
                numeric: true,
                sensitivity: 'base'
            });
            _keys = _keys.sort(collator.compare);

            var _ciclosPlc = $('#ciclePlc').val()
            if (!(_keys.includes(_ciclosPlc))) {
                _ciclosPlc = _keys[0]
            }
            currData = filteredData[section][_ciclosPlc]
            $('#ciclePlc').empty()



            _keys.forEach(function (key) {
                $('#ciclePlc').append($(`<option value="${key}">${proper(key)}</option>`))
            })
            $("#ciclePlc").val(_ciclosPlc);
        }
        if (section == "montaje") {

            var _keys = Object.keys(filteredData[section])
            var collator = new Intl.Collator(undefined, {
                numeric: true,
                sensitivity: 'base'
            });
            _keys = _keys.sort(collator.compare);

            var _ciclosPlc = $('#MontajePlc').val()
            if (!(_keys.includes(_ciclosPlc))) {
                _ciclosPlc = _keys[0]
            }
            currData = filteredData[section][_ciclosPlc]
            $('#MontajePlc').empty()
            _keys.forEach(function (key) {
                $('#MontajePlc').append($(`<option value="${key}">${proper(key)}</option>`))
            })
            $("#MontajePlc").val(_ciclosPlc);
            var _sect = filteredData[section][_ciclosPlc][filteredData[section][_ciclosPlc].length - 1]
            $("#montajeOrden > span").text(_sect.orden);
            $("#montajeOperario > span").text(_sect.operario);
            $("#montajeLote > span").text(_sect.lote);
            $("#montajeMolde > span").text(_sect.molde);
            $("#montajeMaterial > span").text(_sect.material);
            return
        }
        if (section == "material") {
            var _materialPlc = $('#MaterialPlc').val()
            if (!(_materialPlc in filteredData[section])) {
                _materialPlc = Object.keys(filteredData['material'])[0]
            }
            currData = filteredData[section][_materialPlc]
            $('#MaterialPlc').empty()
            var _keys = Object.keys(filteredData[section])
            _keys.forEach(function (key) {
                $('#MaterialPlc').append($(
                    `<option value="${key}">${proper(key)}</option>`))
            })
            $('#MaterialPlc').val(_materialPlc)
        }
        var pieID = "pie" + proper(section);
        var pieParent = "#pie" + proper(section) + "Container"

        function proper(str) {
            return str.replace(
                /\w\S*/g,
                function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }

        function getLabels(data) {
            var _labels = []
            _labels.push(data.name)
            if (data.children) {
                data.children.forEach(function (d) {
                    _labels = _labels.concat(getLabels(d))
                })
            }
            return _labels
        }

        function getColors(data) {
            var _labels = []
            _labels.push(data.color)
            if (data.children) {
                data.children.forEach(function (d) {
                    _labels = _labels.concat(getColors(d))
                })
            }
            return _labels
        }

        function getSunColors(data) {
            var _labels = []
            data.children.forEach(function (d) {
                _labels.push(d.color)
            })
            return _labels
        }
        if (typeof currData === "undefined" | currData === {})
            return
        var sunColors = getSunColors(currData[currData.length - 1])
        var labels = getLabels(currData[currData.length - 1])
        var thisColors = getColors(currData[currData.length - 1])

        function getValues(data) {
            var _values = []
            _values.push(data.value)
            if (data.children) {
                data.children.forEach(function (d) {
                    _values = _values.concat(getValues(d))
                })
            }
            return _values
        }
        var values = getValues(currData[currData.length - 1])
        var customdata = []
        var _maxVal = values[0]
        values.forEach(function (d) {
            customdata.push(Math.round((d * 100 / _maxVal) * 10) / 10)
        })

        function getParent(data, parent) {
            var _parents = []
            _parents.push(parent)
            if (data.children) {
                data.children.forEach(function (d) {
                    _parents = _parents.concat(getParent(d, data.name))
                })
            }
            return _parents
        }
        var parents = getParent(currData[currData.length - 1], "")
        var _data = [{
            "type": "sunburst",
            "labels": labels,
            "parents": parents,
            "values": values,
            "customdata": customdata,
            "textposition:": "inside",
            // "insidetextorientation": "radial",
            "marker": {
                "line": {
                    "width": 2,
                }
            },
            "branchvalues": 'total',
            textinfo: 'label+percent entry',
            hovertemplate: "<extra></extra><br>%{label}<br>%{value} " + units +
                ".</br>(%{customdata}%)"
        }];
        var layout = {
            "margin": {
                "l": 0,
                "r": 0,
                "b": 0,
                "t": 0
            },
            sunburstcolorway: sunColors,
            width: $(pieParent).width(),
            height: $(pieParent).width(),
        };
        if (section == 'energia') {
            _data = []
            var energyLables = []
            currData[0].children.forEach(function (child) {
                energyLables.push(child.name)
            })
            var energySubLables = []
            currData[0].children[0].children.forEach(function (child) {
                energySubLables.push(child.name)
            })
            energySubLables.forEach(function (SubLabel, i) {
                var yvals = []
                currData[currData.length - 1].children.forEach(function (subChild) {
                    yvals.push(subChild.children[i].value)
                })
                var trace = {
                    x: energyLables,
                    y: yvals,
                    name: SubLabel,
                    type: 'bar',
                    marker: {
                        color: currData[0].children[0].children[i].color
                    }
                };
                _data.push(trace)

            })
            layout.barmode = 'stack'
            layout.margin = {
                "l": 40,
                "r": 20,
                "b": 50,
                "t": 20
            }
            layout.showlegend = false
            Plotly.newPlot(pieID, _data, layout, {
                showSendToCloud: false,
                displayModeBar: false,
            })
        }
        Plotly.newPlot(pieID, _data, layout, {
            showSendToCloud: false,
            displayModeBar: false,
        })
        myPlot = document.getElementById(pieID);
        $(window).resize(function () {
            try {
                var update = {
                    width: $(pieParent).width(),
                    height: $(pieParent).width()
                };
                Plotly.relayout(pieID, update);
            } catch (error) {}
        });
        // Line
        var lineID = 'line' + proper(section);
        var lineContainer = '#line' + proper(section) + 'Container'
        var traces = []
        labels.forEach(function (label, i) {
            var x = []
            var y = []
            currData.forEach(function (d) {
                x.push(d.date)
                var sub_values = getValues(d)
                y.push(sub_values[i])
            })
            var trace = {
                y: y,
                x: x,
                type: 'scatter',
                name: label,
                hovertemplate: `<extra>${label}</extra>%{y} ${units}.`,
                line: {
                    color: thisColors[i],
                },
                fill: 'tozeroy',
            };
            if (i == 0)
                trace.line.dash = 'dash'
            if (section == "ciclos")
                trace.line.shape = 'vh'
            traces.push(trace)
        })

        function getVar(data, _var) {
            var _values = []
            _values.push(data[_var])
            if (data.children) {
                data.children.forEach(function (d) {
                    _values = _values.concat(getVar(d, _var))
                })
            }
            return _values
        }
        if (section == "ciclos") {
            var extra = ['min', 'max', 'mean']
            var extra_col = ['green', 'red', 'orange']
            extra.forEach(function (e, i) {
                var x = []
                var y = []
                currData.forEach(function (d) {
                    x.push(d.date)
                    var sub_values = getVar(d, e)
                    y.push(sub_values[0])
                })
                var trace = {
                    y: y,
                    x: x,
                    type: 'scatter',
                    mode: 'lines',
                    name: e,
                    hovertemplate: `<extra>` + e + `</extra>%{y} seg.`,
                    line: {
                        color: extra_col[i],
                        dash: 'dash',
                        width: 1,
                        shape: 'vh',
                    },
                };
                traces.push(trace)
            })
        }
        var layout = {
            showlegend: false,
            "margin": {
                "l": 30,
                "r": 10,
                "b": 30,
                "t": 10
            },
            xaxis: {},
            yaxis: {
                //type: 'log'
            },
        };
        Plotly.newPlot(lineID, traces, layout, {
            displayModeBar: false,
        });
        $(window).resize(function () {
            var update = {
                width: $(lineContainer).width(),
                height: $(lineContainer).width() / 1.9
            };
            Plotly.relayout(lineID, update);
        });
        // Legend
        var legendID = "legend" + proper(section);
        var index = 0;
        var legend = "<li>"
        var substring = ''

        function r2(val) {
            return Math.round(val * 100) / 100
        }
        substring = `:<br> ${r2(currData[currData.length - 1].value)} ` + units
        legend += `<span class="caret columns center_vert leg_toggle" index="${index}">
                    <div class="caret_symbol">&#9654;</div>
                    <div class="indicator" style="background-color: ${currData[currData.length - 1].color}"></div>
                    <div>${currData[currData.length - 1].name}${substring}</div>
                </span>`
        index++;
        legend += '<ul class="nested">'
        currData[currData.length - 1].children.forEach(function (child) {
            substring = ''
            substring = `:<br> ${r2(child.value)} ` + units
            if (child.children == null) {
                legend += `<li class="columns center_vert leg_toggle" index="${index}">
                            <div class="indicator" style="background-color: ${child.color}"></div><span>${child.name}${substring}</span>
                        </li>`
                index++;
            } else {
                legend += "<li>"
                legend += `<span class="caret columns center_vert leg_toggle" index="${index}">
                            <div class="caret_symbol">&#9654;</div>
                            <div class="indicator" style="background-color: ${child.color}"></div><span>${child.name}${substring}</span>
                        </span>`
                index++;
                legend += '<ul class="nested">'
                child.children.forEach(function (child2) {
                    substring = ''
                    substring = `:<br> ${r2(child2.value)} ` + units
                    if (child2.children == null) {
                        legend += `<li class="columns center_vert leg_toggle"  index="${index}">
                                    <div class="indicator" style="background-color: ${child2.color}"></div><span>${child2.name}${substring}</span>
                                </li>`
                        index++;
                    } else {
                        legend += "<li>"
                        legend += `<span class="caret columns center_vert leg_toggle" index="${index}">
                                    <div class="caret_symbol">&#9654;</div>
                                    <div class="indicator" style="background-color: ${child2.color}"></div><span>${child2.name}${substring}</span>
                                </span>`
                        index++;
                        legend += '<ul class="nested">'
                        child2.children.forEach(function (child3) {
                            substring = ''
                            substring = `:<br> ${r2(child3.value)} ` + units
                            legend += `<li class="columns center_vert leg_toggle"  index="${index}">
                                        <div class="indicator" style="background-color: ${child3.color}"></div><span>${child3.name}${substring}</span>
                                    </li>`
                            index++;
                        })
                        legend += '</ul>'
                        legend += "</li>"
                    }
                })
                legend += '</ul>'
                legend += "</li>"
            }
        })
        legend += '</ul>'
        legend += "</li>"
        document.getElementById(legendID).innerHTML = legend
        $(`#${legendID} .leg_toggle > *:not(.caret_symbol)`).click(function () {
            var _index = parseInt($(this).parent().attr('index'));
            var _at = document.getElementById(lineID).data[_index].visible;
            if (_at == 'legendonly') {
                document.getElementById(lineID).data[_index].visible = true;
                $(this).parent().css('opacity', '1.0');
            } else {
                document.getElementById(lineID).data[_index].visible = 'legendonly'
                $(this).parent().css('opacity', '0.5');
            }
            Plotly.redraw(lineID);
        })
        $(`#${legendID} .leg_toggle > .caret_symbol`).click(function () {
            this.parentElement.parentElement.querySelector(".nested").classList.toggle(
                "active_legend");
            this.parentElement.classList.toggle("caret-down");
        })
        $(`#${legendID} .leg_toggle > .caret_symbol`).first().click()
        if (section == 'material' || section == 'energia') {
            $(`#${legendID} .leg_toggle > .caret_symbol`).first().click()
        }
    })
    $(window).resize();
    $('body').removeClass('loading');
    $('#loader').hide();
    lockedData = false
}

//#endregion