'''
import pycomm3

from pycomm3 import LogixDrivere

with LogixDriver('192.168.58.156') as plc:
    print(plc)
'''


'''

import win32com.client

# Instantiate the client object 
client = win32com.client.Dispatch('OpcLabs.EasyOpc.DataAccess.EasyDAClient') 

# Perform the operation
value = client.ReadItemValue('', 'UniOPC.Server.1', 'PLC7.MI0(1)')

# Display results
print('value: ', value)

'''





import OpenOPC
print("Start")

opc = OpenOPC.client()
print(opc.servers())
opc.connect('UniOPC.Server.1')
print("Client Connected")
print(opc['PLC7.MI0'])
opc.close()



'''
import OpenOPC
def readopc():
    opchost = 'localhost'
    taglist = ['Random.Int1']
    opc = OpenOPC.open_client(host=opchost)
    opc.connect()
    while True:
        v = opc.read(taglist)
        for i in range(len(v)):
            (name, val, qual, time) = v[i]
            print('% -15s % -15s % -15s % -15s' % (name, val, qual, time))
if __name__ =='__main__':
    readopc()

'''

'''
import win32com.client

# Instantiate the client object 
client = win32com.client.Dispatch('OpcLabs.EasyOpc.DataAccess.EasyDAClient') 

# Perform the operation
value = client.ReadItemValue('', 'UniOPC.Server.1', 'PLC7.MI0(1)')

# Display results
print('value: ', value)

'''


'''

from opcua import Client
client = Client("opc.tcp://127.0.0.1")
client.connect()
print("Client Connected")
ret = client.get_node("ns=2;i=1")
retVal = ret.get_value()
print(retVal)



'''


# ip: 192.168.58.156
# port: 20256
# protocol: tcp
# name: PLC7

'''
import pylogix

from pylogix import PLC

with PLC() as comm:
    comm.IPAddress = '192.168.58.156'
    ret = comm.Read('PLC7.MI0') # MI0 contador
     
    print(ret.TagName, ret.Status, ret.Value)

'''


'''
import modbus_tk
import modbus_tk.defines as cst
import modbus_tk.modbus as modbus
import modbus_tk.modbus_tcp as modbus_tcp
import logging

logger = modbus_tk.utils.create_logger("console", level=logging.DEBUG)

master = modbus_tcp.TcpMaster(host='192.168.58.156', port=20256, timeout_in_sec=5.0)
master.open
actual_bits = master.execute(slave=1, function_code=cst.READ_COILS, starting_address=1, quantity_of_x=1)
print("actual_bits =", actual_bits)

master.close
'''
