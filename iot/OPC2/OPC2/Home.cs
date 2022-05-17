using OpcLabs.EasyOpc.DataAccess;
using OpcLabs.EasyOpc.DataAccess.OperationModel;
using System.Text;
using System.Security.Cryptography.X509Certificates;
using uPLibrary.Networking.M2Mqtt;

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
        const string topic = "diaxPublisher/Messages/";
        string clientId = "diaxPublisher_" + Guid.NewGuid().ToString();

        string[] variables = { "PLC1.ML131", "PLC2.ML131", "PLC3.ML131", "PLC4.ML131", "PLC5.ML131", "PLC6.ML131", "PLC7.ML131", "PLC8.ML131", "PLC9.ML131" };

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
        }

        private void Disconnect_Button_Click(object sender, EventArgs e)
        {
            Unsubscribe_Items();
        }

        private void Subscribe_Items()
        {
            var subscriptions = new DAItemGroupArguments[variables.Length];
            for (int i = 0; i < variables.Length; i++)
            {
                subscriptions[i] = new DAItemGroupArguments("", server, variables[i], 1000, null);
            }
            handleArray = opc.SubscribeMultipleItems(subscriptions);
        }

        private void Unsubscribe_Items()
        {
            opc.UnsubscribeAllItems();
        }

        void OPC_ItemChanged(object sender, EasyDAItemChangedEventArgs e)
        {
            if (e.Succeeded)
            {
                var index = dgv.Rows.Add();
                dgv.Rows[index].Cells[0].Value = e.Arguments.ItemDescriptor.ItemId;
                dgv.Rows[index].Cells[1].Value = e.Vtq.Timestamp;
                dgv.Rows[index].Cells[2].Value = e.Vtq.Quality;
                dgv.Rows[index].Cells[3].Value = e.Vtq.Value;

                if(publish.Checked)
                { 
                    var subtopic = e.Arguments.ItemDescriptor.ItemId.ToString().Replace('.', '/');
                    mqtt.Publish(topic + subtopic, Encoding.UTF8.GetBytes(e.Vtq.Value.ToString()));
                }
            }
        }

    }
}