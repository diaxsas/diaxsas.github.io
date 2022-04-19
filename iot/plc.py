
import pycomm3

from pycomm3 import LogixDriver

with LogixDriver('192.168.58.156') as plc:
    print(plc)


'''
import pylogix

from pylogix import PLC

with PLC() as comm:
    comm.IPAddress = '192.168.58.156'
    ret = comm.Read('Start') # MI0 contador
     
    print(ret.TagName, ret.Status, ret.Value)
'''