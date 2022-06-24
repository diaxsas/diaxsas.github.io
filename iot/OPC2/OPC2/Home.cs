using System.Text;
using System.Security.Cryptography.X509Certificates;
using uPLibrary.Networking.M2Mqtt;
using Newtonsoft.Json;
using TitaniumAS.Opc.Client.Common;
using TitaniumAS.Opc.Client.Da;

namespace OPC2
{
    public partial class DiaxOPC : Form
    {
        MqttClient mqtt;
        X509Certificate caCert;
        X509Certificate2 clientCert;
        OpcDaServer _opc;

        const int brokerPort = 8883;
        const string server = "UniOPC.Server.1";
        const string iotEndpoint = "a3ke8mnvd8qmyj-ats.iot.us-east-1.amazonaws.com";
        const string topic = "diaxPublisher/plcs/";
        string clientId = "diaxPublisher_" + Guid.NewGuid().ToString();


       /* string[] plcs = {
            "PLC7"
        };
        string[] variables = {
            "MI0",
            "SI30"
        };
        string[] states = {
            //"MI0"
        };*/

        string[] plcs = {
            "PLC1",
            "PLC2",
            "PLC3",
            "PLC4",
            "PLC5",
            "PLC6",
            "PLC7",
            "PLC8",
            "PLC9"
        };

        string[] variables = {
            "ML1", // orden
            "ML3", // color
            "ML5", // lote
            "MI18", // operario
            "MI19", // tipoMaterial
            "MF12", // Peso Inyección
            "MF13", // Peso Cavidad 1
            "MF14", // Peso Cavidad 2
            "MF15", // Peso Cavidad 3
            "MF16", // Peso Cavidad 4
            "MF17", // Peso cavidad 5
            "MF18", // Peso cavidad 6
            "MI100", // Consumo energía motor kw
            "MI99", // consumo total máquina kw
            "MF8", // Tiempo puerta
            "MF9", // Tiempo máquina
            "MF1", // Tiempo Inyección
            "MI121", // Contador por matto máquina
            "MI122", // Contador por matto molde
            "MI124", // Contador por sin operario
            "MI127", // Contador por material
            "MI128", // Contador por calidad
            "MI123", // Contador por montaje
            "ML0", // Tiempo motor
            "MI101", // Defecto inicio turno
            "MI102", // Defecto lluvia
            "ML131", // Contador inyecciones
            "MF5", // Ciclo estándar
            "MF6", // Ciclo estándar +
            "MF7" // Ciclo estándar -
        };
        
        string[] states = {
            //"ML1", // orden
            //"ML3", // color
            //"ML5", // lote
            //"MI18", // operario
            //"MI19" // tipoMaterial
        };

        public DiaxOPC()
        {
            Uri url = UrlBuilder.Build(server);
            _opc = new OpcDaServer(url);
            _opc.Connect();
            caCert = X509Certificate.CreateFromCertFile(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "certificates/AmazonRootCa1.crt"));
            clientCert = new X509Certificate2(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "certificates/certificate.cert.pfx"));
            mqtt = new MqttClient(iotEndpoint, brokerPort, true, caCert, clientCert, MqttSslProtocols.TLSv1_2);
            InitializeComponent();
        }
        private void Home_Load(object sender, EventArgs e)
        {

        }

        private void Home_FormClosed(object sender, FormClosedEventArgs e)
        {
            Unsubscribe_Items();
        }

        private void Connect_Button_Click(object sender, EventArgs e)
        {
            Subscribe_Items();
            minTimer.Start();
            Connect_Button.Enabled = false;
            Disconnect_Button.Enabled = true;
        }

        private void Disconnect_Button_Click(object sender, EventArgs e)
        {
            Unsubscribe_Items();
            minTimer.Stop();
            Connect_Button.Enabled = true;
            Disconnect_Button.Enabled = false;
        }

        OpcDaGroup group;
        OpcDaGroup groupVariables;
        private void Subscribe_Items()
        {
            // Create a group with items.
            group = _opc.AddGroup("Items");
            group.IsActive = true;
            OpcDaItemDefinition[] definitions = new OpcDaItemDefinition[plcs.Length * variables.Length];
            var count = 0;
            for (int i = 0; i < plcs.Length; i++)
            {
                for (int j = 0; j < variables.Length; j++)
                {
                    var definition = new OpcDaItemDefinition
                    {
                        ItemId = plcs[i] + '.' + variables[j],
                        IsActive = true
                    };
                    definitions[count] = definition;
                    count++;
                }
            }
            OpcDaItemResult[] results = group.AddItems(definitions);
            foreach (OpcDaItemResult result in results)
                if (result.Error.Failed)
                    Console.WriteLine("Error adding items: {0}", result.Error);

            // Create a group with variables
            groupVariables = _opc.AddGroup("Variables");
            groupVariables.IsActive = true;
            OpcDaItemDefinition[] definitionsVariables = new OpcDaItemDefinition[plcs.Length * states.Length];
            count = 0;
            for (int i = 0; i < plcs.Length; i++)
            {
                for (int j = 0; j < states.Length; j++)
                {
                    var definition = new OpcDaItemDefinition
                    {
                        ItemId = plcs[i] + '.' + states[j],
                        IsActive = true
                    };
                    definitionsVariables[count] = definition;
                    count++;
                }
            }
            OpcDaItemResult[] resultsVariables = groupVariables.AddItems(definitionsVariables);
            foreach (OpcDaItemResult result in resultsVariables)
                if (result.Error.Failed)
                    Console.WriteLine("Error adding items: {0}", result.Error);


            // Subscribe to the items
            groupVariables.ValuesChanged += OPC_ItemChanged;
            groupVariables.UpdateRate = TimeSpan.FromMilliseconds(1000);

            minuteData.Clear();
            //getDataSlice();
        }

        private void Unsubscribe_Items()
        {
            try
            {
                _opc.RemoveGroup(groupVariables);
                _opc.RemoveGroup(group);
            }
            catch (Exception)
            {
            }
            minuteData.Clear();
            groupVariables = null;
            group = null;
        }

        class DataPoint
        {
            public string plc
            {
                get;
                set;
            }
            public string variable
            {
                get;
                set;
            }
            public string timeStamp
            {
                get;
                set;
            }
            public string quality
            {
                get;
                set;
            }
            public string value
            {
                get;
                set;
            }
        }
        class DataSlice
        {
            public string timeStamp
            {
                get;
                set;
            }
            public Dictionary<string, PLC> plcs
            {
                get;
                set;
            }
        }
        class PLC
        {
            public Dictionary<string, PLCVariable> variables
            {
                get;
                set;
            }
        }
        class PLCVariable
        {
            public string quality
            {
                get;
                set;
            }
            public string value
            {
                get;
                set;
            }
        }

        List<DataSlice> minuteData = new List<DataSlice>();
        void OPC_ItemChanged(object sender, OpcDaItemValuesChangedEventArgs args)
        {
            foreach (OpcDaItemValue value in args.Values)
            {
                if (value.Error.Succeeded)
                {
                    var _variable = value.Item.ItemId.ToString().Split('.')[1];
                    if (states.Any(_variable.Contains))
                    {
                        DataPoint dataPoint = new DataPoint
                        {
                            plc = value.Item.ItemId.ToString().Split('.')[0],
                            variable = value.Item.ItemId.ToString().Split('.')[1],
                            timeStamp = DateTime.Now.ToString(),
                            quality = value.Quality.ToString(),
                            value = value.Value.ToString()
                        };
                        printData(dataPoint);
                        //minuteData.Add(dataPoint);
                    }
                }
            }
        }

        private void printData(DataPoint dataPoint)
        {
            dgv.Invoke(new Action(() => { dgv.Rows.Insert(0, dataPoint.plc + '.' + dataPoint.variable, dataPoint.timeStamp, dataPoint.quality, dataPoint.value); }));
        }

        DataSlice dataSlice = new DataSlice();
        private void getDataSlice()
        {
            OpcDaItemValue[] valueResults = group.Read(group.Items, OpcDaDataSource.Device);
            dataSlice = new DataSlice();
            dataSlice.timeStamp = DateTime.Now.ToString();
            dataSlice.plcs = new Dictionary<string, PLC>();
            for (int k = 0; k < valueResults.Length; k++)
            {
                OpcDaItemValue valueResult = valueResults[k];
                if (valueResult.Error.Succeeded)
                {

                    string _plc = valueResult.Item.ItemId.ToString().Split('.')[0];
                    if (!dataSlice.plcs.ContainsKey(_plc))
                    {
                        PLC _plcTemp = new PLC();
                        _plcTemp.variables = new Dictionary<string, PLCVariable>();
                        dataSlice.plcs.Add(_plc, _plcTemp);
                    }
                    PLCVariable _var = new PLCVariable();
                    _var.value = valueResult.Value.ToString();
                    _var.quality = valueResult.Quality.ToString();
                    string _varName = valueResult.Item.ItemId.ToString().Split('.')[1];
                    DataPoint dataPoint = new DataPoint
                    {
                        plc = valueResult.Item.ItemId.ToString().Split('.')[0],
                        variable = valueResult.Item.ItemId.ToString().Split('.')[1],
                        timeStamp = DateTime.Now.ToString(),
                        quality = valueResult.Quality.ToString(),
                        value = valueResult.Value.ToString()
                    };
                    dataSlice.plcs[_plc].variables.Add(_varName, _var);
                    printData(dataPoint);
                }
            }
            minuteData.Add(dataSlice);
        }

        private void minTimer_Tick(object sender, EventArgs e)
        {
            if (clear.Checked)
            {
                dgv.Rows.Clear();
                dgv.Refresh();
            }
            getDataSlice();
            if (publish.Checked)
            {
                if (!mqtt.IsConnected)
                    mqtt.Connect(clientId);
                mqtt.Publish(topic, Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(minuteData)));
            }
            minuteData.Clear();
            dgv.Invoke(new Action(() => { dgv.Rows.Insert(0); }));
            //getDataSlice();
        }
    }
}
