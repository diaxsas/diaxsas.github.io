using OpcLabs.EasyOpc.DataAccess;
using OpcLabs.EasyOpc.DataAccess.OperationModel;
using System;
using System.Text;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using uPLibrary.Networking.M2Mqtt;
using System.IO;

namespace OPC2
{
    public partial class DiaxOPC : Form
    {
        EasyDAClient client;
        EasyDAItemChangedEventHandler eventHandler;
        const int uploadInterval = 5 * 60 * 1000;
        const string server = "UniOPC.Server.1";
        string[] variables = { "PLC7.MI0"};
        int[] handleArray;

        public DiaxOPC()
        {
            client = new EasyDAClient();
            eventHandler = new EasyDAItemChangedEventHandler(client_ItemChanged);
            client.ItemChanged += eventHandler;
            InitializeComponent();
            timerUpload.Interval = uploadInterval;
        }
        private void Form1_Load(object sender, EventArgs e)
        {/*
            var subscriptions = new DAItemGroupArguments[variables.Length];
            for (int i = 0; i < variables.Length; i++)
            {
                subscriptions[i] = new DAItemGroupArguments("", server, variables[i], 1000, null);
            }
            handleArray = client.SubscribeMultipleItems(subscriptions);*/
        }

        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            client.UnsubscribeAllItems();
            client.ItemChanged -= eventHandler;
        }

        void client_ItemChanged(object sender, EasyDAItemChangedEventArgs e)
        {
            if (e.Succeeded)
            {
                var index = dgv.Rows.Add();
                dgv.Rows[index].Cells[0].Value = e.Arguments.ItemDescriptor.ItemId;
                dgv.Rows[index].Cells[1].Value = e.Vtq.Timestamp;
                dgv.Rows[index].Cells[2].Value = e.Vtq.Quality;
                dgv.Rows[index].Cells[3].Value = e.Vtq.Value;
            }
        }

        private void timerUpload_Tick(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            string iotEndpoint = "a3ke8mnvd8qmyj-ats.iot.us-east-1.amazonaws.com";
            int brokerPort = 8883;

            string topic = "diaxPublisher/Messages";
            string message = "Test message";

            var caCert = X509Certificate.CreateFromCertFile("C:/Users/Daniel/Desktop/Repos/opc/OPC2/OPC2/certificates/AmazonRootCa1.crt");
            var clientCert = new X509Certificate2("C:/Users/Daniel/Desktop/Repos/opc/OPC2/OPC2/certificates/certificate.cert.pfx"); //AppDomain.CurrentDomain.BaseDirectory, "certificates /certificate.cert.pfx"), "");

            var client = new MqttClient(iotEndpoint, brokerPort, true, caCert, clientCert, MqttSslProtocols.TLSv1_2);

            string clientId = "diaxPublisher";//Guid.NewGuid().ToString();
            client.Connect(clientId);

            client.Publish(topic, Encoding.UTF8.GetBytes(message));
            //client.Disconnect();

        }

        private void button2_Click(object sender, EventArgs e)
        {
            var subscriptions = new DAItemGroupArguments[variables.Length];
            for (int i = 0; i < variables.Length; i++)
            {
                subscriptions[i] = new DAItemGroupArguments("", server, variables[i], 1000, null);
            }
            handleArray = client.SubscribeMultipleItems(subscriptions);

        }

        private void button3_Click(object sender, EventArgs e)
        {
            client.UnsubscribeAllItems();
            client.ItemChanged -= eventHandler;
        }
    }
}