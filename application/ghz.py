from qntsim.kernel.timeline import Timeline
Timeline.DLCZ=False
Timeline.bk=True
from qntsim.topology.topology import Topology
from tabulate import tabulate
from qntsim.components.circuit import QutipCircuit
from qiskit import *
from qutip.qip.operations import gate_sequence_product
#from qiskit.ignis.verification import marginal_counts
from qiskit.quantum_info import random_statevector
import math

class GHZ():

    #Requesting transport manager for entanglements
    def request_entanglements(self,endnode1,endnode2,endnode3,middlenode):
        endnode1.transport_manager.request(middlenode.owner.name, 5e12,1, 20e12, 0 , 0.5,2e12) 
        endnode2.transport_manager.request(middlenode.owner.name, 5e12,1, 20e12, 0 , 0.5,2e12) 
        endnode3.transport_manager.request(middlenode.owner.name, 5e12,1, 20e12, 0 , 0.5,2e12) 

        
        return endnode1,endnode2,endnode3,middlenode

    # set's alice , bob ,charlie and middlenode 
    def roles(self,alice,bob,charlie,middlenode):
        endnode1=alice
        endnode2=bob
        endnode3=charlie
        print('endnode1,endnode2,endnode3,middle',endnode1.owner.name,endnode2.owner.name,endnode3.owner.name,middlenode.owner.name)
        return self.request_entanglements(endnode1,endnode2,endnode3,middlenode)

    # Gets alice's entangled memory state
    def alice_keys(self,alice):
        qm_alice = alice.timeline.quantum_manager
        for mem_info in alice.resource_manager.memory_manager:
            if mem_info.state == 'ENTANGLED':
                key=mem_info.memory.qstate_key
                state= qm_alice.get(key)
                print("alice state ",key, state.state)
                return qm_alice,key,state
    # Gets bob's entangled memory state
    def bob_keys(self,bob):
        qm_bob = bob.timeline.quantum_manager
        for mem_info in bob.resource_manager.memory_manager:
            if mem_info.state == 'ENTANGLED':
                key=mem_info.memory.qstate_key
                state= qm_bob.get(key)
                print("bob state",key,state.state)
                return qm_bob,key,state

    # Gets charlie's entangled memory state
    def charlie_keys(self,charlie):
        qm_charlie = charlie.timeline.quantum_manager
        for mem_info in charlie.resource_manager.memory_manager:
            if mem_info.state == 'ENTANGLED':
                key=mem_info.memory.qstate_key
                state= qm_charlie.get(key)
                print("charlie state",key,state.state)
                return qm_charlie,key,state
    
    #Gets middlenode's entangled memory state
    def middle_keys(self,middlenode):
        qm_middle = middlenode.timeline.quantum_manager
        for mem_info in middlenode.resource_manager.memory_manager:
            # print('middle memory info', mem_info)
            if mem_info.state == 'ENTANGLED':
                key=mem_info.memory.qstate_key
                state= qm_middle.get(key)
                print("middlenode state",key,state.state)
                return qm_middle,key,state


    #alice_keys()
    #bob_keys()
    #charlie_keys()
    #middle_keys()

    def run(self,alice,bob,charlie,middlenode):

        qm_alice,alice_key,state=self.alice_keys(alice)
        #print('Alice',qm_alice,alice_key,state)
        qm_bob,bob_key,state=self.bob_keys(bob)
        qm_charlie,charlie_key,state=self.charlie_keys(charlie)
        qm_middle,middle_key,state,middle_entangled_keys=self.middle_keys(middlenode)

        circ = QutipCircuit(3)
        circ.cx(0,2)
        circ.cx(0,1)
        circ.h(0)
        circ.measure(0)
        circ.measure(1)
        circ.measure(2)
        output = qm_middle.run_circuit(circ,middle_entangled_keys)
        print("Output", output)
        ghz_state = qm_middle.get(middle_key).state
        print("\nGHZ State\n",  qm_middle.get(middle_key).state)
        print("\nGHZ State alice\n",  qm_middle.get(alice_key).state)
        print("\nGHZ State bob\n",  qm_middle.get(bob_key).state)
        print("\nGHZ State charlie\n",  qm_middle.get(charlie_key).state)
        res = {
            "alice_state":qm_middle.get(alice_key).state ,
            "bob_state": qm_middle.get(bob_key).state,
            "charlie_state":qm_middle.get(charlie_key).state,
            "ghz_state" : ghz_state
        }

        return res 
        # print("Output", output, qm_middle.get(alice_key))

####################################################################################

#endnode1, endnode2 , endnode3 , middlenode (Type :string)- nodes in topology 
#backend (Type :String) is Qutip (since state vectors are returned in output)
#TODO: Support on Qiskit

# path (Type : String) -Path to config Json file

def ghz1(path,endnode1,endnode2,endnode3,middlenode):
    from qntsim.kernel.timeline import Timeline 
    Timeline.DLCZ=False
    Timeline.bk=True
    from qntsim.topology.topology import Topology
    
    tl = Timeline(20e12,"Qutip")
    network_topo = Topology("network_topo", tl)
    network_topo.load_config(path)
    alice=network_topo.nodes[endnode1]
    bob = network_topo.nodes[endnode2]
    charlie=network_topo.nodes[endnode3]
    middlenode=network_topo.nodes[middlenode]
    ghz= GHZ()
    alice,bob,charlie,middlenode=ghz.roles(alice,bob,charlie,middlenode)
    tl.init()
    tl.run()
    res = ghz.run(alice,bob,charlie,middlenode)
    print(res)
    return res



# jsonConfig (Type : Json) -Json Configuration of network 
"""
def ghz(jsonConfig,endnode1,endnode2,endnode3,middlenode):
    from qntsim.kernel.timeline import Timeline 
    Timeline.DLCZ=False
    Timeline.bk=True
    from qntsim.topology.topology import Topology
    
    tl = Timeline(20e12,"Qutip")
    network_topo = Topology("network_topo", tl)
    network_topo.load_config_json(jsonConfig)
    alice=network_topo.nodes[endnode1]
    bob = network_topo.nodes[endnode2]
    charlie=network_topo.nodes[endnode3]
    middlenode=network_topo.nodes[middlenode]
    ghz= GHZ()
    alice,bob,charlie,middlenode=ghz.roles(alice,bob,charlie,middlenode)
    tl.init()
    tl.run()  
    ghz.run(alice,bob,charlie,middlenode)


conf= {"nodes": [], "quantum_connections": [], "classical_connections": []}

memo = {"frequency": 2e3, "expiry": 0, "efficiency": 1, "fidelity": 1}
node1 = {"Name": "N1", "Type": "end", "noOfMemory": 50, "memory":memo}
node2 = {"Name": "N2", "Type": "end", "noOfMemory": 50, "memory":memo}
node3 = {"Name": "N3", "Type": "end", "noOfMemory": 50, "memory":memo}
node4 = {"Name": "N4", "Type": "service", "noOfMemory": 50, "memory":memo}

conf["nodes"].append(node1)
conf["nodes"].append(node2)
conf["nodes"].append(node3)
conf["nodes"].append(node4)

qc1 = {"Nodes": ["N1", "N4"], "Attenuation": 1e-5, "Distance": 70}
qc2 = {"Nodes": ["N2", "N4"], "Attenuation": 1e-5, "Distance": 70}
qc3 = {"Nodes": ["N3", "N4"], "Attenuation": 1e-5, "Distance": 70}
conf["quantum_connections"].append(qc1)
conf["quantum_connections"].append(qc2)
conf["quantum_connections"].append(qc3)

cc1 = {"Nodes": ["N1", "N1"], "Delay": 0, "Distance": 0}
cc1 = {"Nodes": ["N2", "N2"], "Delay": 0, "Distance": 0}
cc1 = {"Nodes": ["N3", "N3"], "Delay": 0, "Distance": 0}
cc1 = {"Nodes": ["N4", "N4"], "Delay": 0, "Distance": 0}

cc12 = {"Nodes": ["N1", "N2"], "Delay": 1e9, "Distance": 1e3}
cc13 = {"Nodes": ["N1", "N3"], "Delay": 1e9, "Distance": 1e3}
cc14 = {"Nodes": ["N1", "N4"], "Delay": 1e9, "Distance": 1e3}
cc23 = {"Nodes": ["N2", "N3"], "Delay": 1e9, "Distance": 1e3}
cc24 = {"Nodes": ["N2", "N4"], "Delay": 1e9, "Distance": 1e3}
cc34 = {"Nodes": ["N3", "N4"], "Delay": 1e9, "Distance": 1e3}
conf["classical_connections"].append(cc12)
conf["classical_connections"].append(cc13)
conf["classical_connections"].append(cc14)
conf["classical_connections"].append(cc23)
conf["classical_connections"].append(cc24)
conf["classical_connections"].append(cc34)


ghz(conf,"N1","N2","N3","N4")
"""

