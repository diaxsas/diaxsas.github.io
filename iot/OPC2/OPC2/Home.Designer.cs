namespace OPC2
{
    partial class DiaxOPC
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(DiaxOPC));
            this.dgv = new System.Windows.Forms.DataGridView();
            this.variable = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.timestamp = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.quality = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.value = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.Connect_Button = new System.Windows.Forms.Button();
            this.Disconnect_Button = new System.Windows.Forms.Button();
            this.publish = new System.Windows.Forms.CheckBox();
            this.minTimer = new System.Windows.Forms.Timer(this.components);
            ((System.ComponentModel.ISupportInitialize)(this.dgv)).BeginInit();
            this.SuspendLayout();
            // 
            // dgv
            // 
            this.dgv.AllowUserToAddRows = false;
            this.dgv.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgv.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgv.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.variable,
            this.timestamp,
            this.quality,
            this.value});
            this.dgv.Location = new System.Drawing.Point(12, 53);
            this.dgv.Name = "dgv";
            this.dgv.ReadOnly = true;
            this.dgv.RowTemplate.Height = 25;
            this.dgv.Size = new System.Drawing.Size(776, 385);
            this.dgv.TabIndex = 1;
            // 
            // variable
            // 
            this.variable.HeaderText = "Variable";
            this.variable.Name = "variable";
            this.variable.ReadOnly = true;
            // 
            // timestamp
            // 
            this.timestamp.HeaderText = "Timestamp";
            this.timestamp.Name = "timestamp";
            this.timestamp.ReadOnly = true;
            // 
            // quality
            // 
            this.quality.HeaderText = "Quality";
            this.quality.Name = "quality";
            this.quality.ReadOnly = true;
            // 
            // value
            // 
            this.value.HeaderText = "Value";
            this.value.Name = "value";
            this.value.ReadOnly = true;
            // 
            // Connect_Button
            // 
            this.Connect_Button.Location = new System.Drawing.Point(12, 12);
            this.Connect_Button.Name = "Connect_Button";
            this.Connect_Button.Size = new System.Drawing.Size(79, 35);
            this.Connect_Button.TabIndex = 3;
            this.Connect_Button.Text = "Start";
            this.Connect_Button.UseVisualStyleBackColor = true;
            this.Connect_Button.Click += new System.EventHandler(this.Connect_Button_Click);
            // 
            // Disconnect_Button
            // 
            this.Disconnect_Button.Enabled = false;
            this.Disconnect_Button.Location = new System.Drawing.Point(97, 12);
            this.Disconnect_Button.Name = "Disconnect_Button";
            this.Disconnect_Button.Size = new System.Drawing.Size(79, 35);
            this.Disconnect_Button.TabIndex = 4;
            this.Disconnect_Button.Text = "Stop";
            this.Disconnect_Button.UseVisualStyleBackColor = true;
            this.Disconnect_Button.Click += new System.EventHandler(this.Disconnect_Button_Click);
            // 
            // publish
            // 
            this.publish.AutoSize = true;
            this.publish.Location = new System.Drawing.Point(682, 21);
            this.publish.Name = "publish";
            this.publish.Size = new System.Drawing.Size(106, 19);
            this.publish.TabIndex = 5;
            this.publish.Text = "Publish to AWS";
            this.publish.UseVisualStyleBackColor = true;
            // 
            // minTimer
            // 
            this.minTimer.Interval = 60000;
            this.minTimer.Tick += new System.EventHandler(this.minTimer_Tick);
            // 
            // DiaxOPC
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.publish);
            this.Controls.Add(this.Disconnect_Button);
            this.Controls.Add(this.Connect_Button);
            this.Controls.Add(this.dgv);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MaximizeBox = false;
            this.Name = "DiaxOPC";
            this.ShowIcon = false;
            this.SizeGripStyle = System.Windows.Forms.SizeGripStyle.Hide;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "DIAX OPC";
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.Home_FormClosed);
            this.Load += new System.EventHandler(this.Home_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dgv)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private DataGridView dgv;
        private DataGridViewTextBoxColumn variable;
        private DataGridViewTextBoxColumn timestamp;
        private DataGridViewTextBoxColumn quality;
        private DataGridViewTextBoxColumn value;
        private Button Connect_Button;
        private Button Disconnect_Button;
        private CheckBox publish;
        private System.Windows.Forms.Timer minTimer;
    }
}