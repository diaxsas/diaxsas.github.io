import pylogix

from pylogix import PLC

with PLC() as comm:
    comm.IPAddress = '192.168.0.156'
    ret = comm.Read('CONTADOR') # MI0 contador
     
    print(ret.TagName, ret.Status, ret.Value)