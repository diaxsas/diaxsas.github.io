using OpcLabs.EasyOpc.DataAccess;
using OpcLabs.EasyOpc.DataAccess.OperationModel;
using System.Text;
using System.Security.Cryptography.X509Certificates;
using uPLibrary.Networking.M2Mqtt;
using Newtonsoft.Json;

namespace OPC2
{
    public partial class DiaxOPC : Form
    {
        EasyDAClient opc;
        MqttClient mqtt;
        X509Certificate caCert;
        X509Certificate2 clientCert;
        EasyDAItemChangedEventHandler eventHandler;
        int[] handleArray;

        const int brokerPort = 8883;
        const string server = "UniOPC.Server.1";
        const string iotEndpoint = "a3ke8mnvd8qmyj-ats.iot.us-east-1.amazonaws.com";
        const string topic = "diaxPublisher/plcs/";
        string clientId = "diaxPublisher_" + Guid.NewGuid().ToString();

        string[] plcs = {
            "PLC1",
            "PLC2",
            "PLC3",
            "PLC4",
            "PLC5",
            "PLC6",
            "PLC7",
            "PLC8",
            "PLC9" };

        string[] variables = {
            "ML1",
            "ML3",
            "ML5",
            "MI18",
            "MI19",
            "MF12",
            "MF13",
            "MF14",
            "MF15",
            "MF16",
            "MF17",
            "MF18",
            "MI100",
            "MI99",
            "MF8",
            "MF9",
            "MF1",
            "MI121",
            "MI122",
            "MI124",
            "MI127",
            "MI128",
            "MI123",
            "ML0",
            "MI101",
            "MI102",
            "ML131",
            "MF5" };

        public DiaxOPC()
        {
            opc = new EasyDAClient();
            eventHandler = new EasyDAItemChangedEventHandler(OPC_ItemChanged);
            opc.ItemChanged += eventHandler;
            caCert = X509Certificate.CreateFromCertFile(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "certificates/AmazonRootCa1.crt"));
            clientCert = new X509Certificate2(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "certificates/certificate.cert.pfx"));
            mqtt = new MqttClient(iotEndpoint, brokerPort, true, caCert, clientCert, MqttSslProtocols.TLSv1_2);
            mqtt.Connect(clientId);
            InitializeComponent();
        }
        private void Home_Load(object sender, EventArgs e)
        {
            //Subscribe_Items();
        }

        private void Home_FormClosed(object sender, FormClosedEventArgs e)
        {
            Unsubscribe_Items();
            opc.ItemChanged -= eventHandler;
            mqtt.Disconnect();
        }

        private void Connect_Button_Click(object sender, EventArgs e)
        {
            Unsubscribe_Items();
            Subscribe_Items();
            minTimer.Start();
        }

        private void Disconnect_Button_Click(object sender, EventArgs e)
        {
            Unsubscribe_Items();
            minTimer.Stop();
        }

        private void Subscribe_Items()
        {
            var subscriptions = new DAItemGroupArguments[variables.Length * plcs.Length];
            var count = 0;
            for (int i = 0; i < plcs.Length; i++)
            {
                for (int j = 0; j < variables.Length; j++)
                {
                    subscriptions[count] = new DAItemGroupArguments("", server, plcs[i]+ variables[j], 60 * 1000, null);
                    count++;
                }
            }
            handleArray = opc.SubscribeMultipleItems(subscriptions);
        }

        private void Unsubscribe_Items()
        {
            opc.UnsubscribeAllItems();
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

        List<DataPoint> minuteData = new List<DataPoint>();
        int dvRowCount = 0;
        void OPC_ItemChanged(object sender, EasyDAItemChangedEventArgs e)
        {
            if (e.Succeeded)
            {
                if(dvRowCount > 100)
                {
                    dgv.Rows.Clear();
                    dgv.Refresh();
                    dvRowCount = 0;
                }
                var index = dgv.Rows.Add();
                dgv.Rows[index].Cells[0].Value = e.Arguments.ItemDescriptor.ItemId;
                dgv.Rows[index].Cells[1].Value = e.Vtq.Timestamp;
                dgv.Rows[index].Cells[2].Value = e.Vtq.Quality;
                dgv.Rows[index].Cells[3].Value = e.Vtq.Value;
                dvRowCount++;

                DataPoint dataPoint = new DataPoint { 
                    plc = e.Arguments.ItemDescriptor.ItemId.ToString().Split('.')[0],
                    variable = e.Arguments.ItemDescriptor.ItemId.ToString().Split('.')[1],
                    timeStamp = e.Vtq.Timestamp.ToString(),
                    quality = e.Vtq.Quality.ToString(),
                    value = e.Vtq.Value.ToString()
                };
                minuteData.Add(dataPoint);

            }
        }

        private void minTimer_Tick(object sender, EventArgs e)
        {
            if (publish.Checked)
            {
                mqtt.Publish(topic, Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(minuteData)));
            }
            minuteData.Clear();
        }
    }
}