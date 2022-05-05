'''
import pycomm3

from pycomm3 import LogixDriver

with LogixDriver('192.168.58.156') as plc:
    print(plc)
'''
'''

import OpenOPC
opc = OpenOPC.client()
opc.servers()
'''
from opcua import Client
client = Client("opc.tcp://192.168.58.156:20256")
client.connect()
print("Client Connected")
ret = client.get_node("ns=2;i=1")
retVal = ret.get_value()
print(retVal)






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