import sequence
from numpy import random
from qntsim.components.circuit import Circuit
from qntsim.kernel.timeline import Timeline
from qntsim.kernel.quantum_manager import QuantumManager, QuantumManagerKet
from qntsim.protocol import Protocol
from qntsim.topology.node import *
from qntsim.topology.topology import Topology
from qntsim.network_management.reservation import Reservation
from qntsim.resource_management.memory_manager import MemoryInfo

# from sequence.kernel.timeline import Timeline
# from sequence.topology.topology import Topology
# from sequence.topology.node import *
import math, sys
import networkx as nx
import matplotlib.pyplot as plt

random.seed(0)
# network_config = "2-node.json"
# network_config = "3-node.json"
network_config = "4-node.json"

#network_config = "../example/linear_test_topology.json"

tl = Timeline(20e12, 'Qiskit')
network_topo = Topology("network_topo", tl)
network_topo.load_config(network_config)

def set_parameters(topology: Topology):
    # set memory parameters
    MEMO_FREQ = 2e3
    MEMO_EXPIRE = 0
    MEMO_EFFICIENCY = 1
    MEMO_FIDELITY = 0.9349367588934053
    #MEMO_FIDELITY = 0.99
    for node in topology.get_nodes_by_type("QuantumRouter"):
        node.memory_array.update_memory_params("frequency", MEMO_FREQ)
        node.memory_array.update_memory_params("coherence_time", MEMO_EXPIRE)
        node.memory_array.update_memory_params("efficiency", MEMO_EFFICIENCY)
        node.memory_array.update_memory_params("raw_fidelity", MEMO_FIDELITY)

    # set detector parameters
    #DETECTOR_EFFICIENCY = 0.9
    DETECTOR_EFFICIENCY = 0.99
    DETECTOR_COUNT_RATE = 5e7
    DETECTOR_RESOLUTION = 100
    for node in topology.get_nodes_by_type("BSMNode"):
        node.bsm.update_detectors_params("efficiency", DETECTOR_EFFICIENCY)
        node.bsm.update_detectors_params("count_rate", DETECTOR_COUNT_RATE)
        node.bsm.update_detectors_params("time_resolution", DETECTOR_RESOLUTION)
        
    # set entanglement swapping parameters
    #SWAP_SUCC_PROB = 0.90
    #SWAP_SUCC_PROB = 0.99
    SWAP_SUCC_PROB = 0.95
    #SWAP_SUCC_PROB = 1
    
    #SWAP_DEGRADATION = 0.99
    #SWAP_DEGRADATION = 1
    SWAP_DEGRADATION = 0.99
    
    # for node in topology.get_nodes_by_type("QuantumRouter"):
    #     node.network_manager.protocol_stack[1].set_swapping_success_rate(SWAP_SUCC_PROB)
    #     node.network_manager.protocol_stack[1].set_swapping_degradation(SWAP_DEGRADATION)
        
    # set quantum channel parameters
    ATTENUATION = 1e-5
    #ATTENUATION = 1e-10
    #ATTENUATION = 1e-8
    QC_FREQ = 1e11
    for qc in topology.qchannels:
        qc.attenuation = ATTENUATION
        qc.frequency = QC_FREQ



    
set_parameters(network_topo)

tl.init()

nm2 = network_topo.nodes['v0'].network_manager
nm2.create_request('v0','v7', start_time=5e12, end_time=20e12, memory_size=10, target_fidelity=0.9,priority =1, tp_id = 1)

tl.run()



#Along with this we'll print the fidelity too

print('tl.time= ',tl.time)

print("v0 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:\tState:")
for info in network_topo.nodes["v0"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))
                                        
print("v1 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v1"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

print("v2 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v2"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

print("v3 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v3"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

print("v4 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v4"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

print("v5 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v5"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

print("v6 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v6"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

print("v7 memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["v7"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))                                

"""
print("C memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["c"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))

print("D memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:\tState:")
for info in network_topo.nodes["d"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))

print("E memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["e"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))

print("F memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["f"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))
                                        
print("G memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["g"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))


print("J memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["j"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state)))
print("K memories")
print("Index:\tEntangled Node:\tFidelity:\tEntanglement Time:")
for info in network_topo.nodes["k"].resource_manager.memory_manager:
    print("{:6}\t{:15}\t{:9}\t{}\t{}".format(str(info.index), str(info.remote_node),
                                        str(info.fidelity), str(info.entangle_time * 1e-12),str(info.state))) 
                                        

#Obtaining the physical graph
nx_graph = network_topo.generate_nx_graph()
#nx.draw(nx_graph, with_labels = True)
#plt.show()
network_topo.plot_graph(nx_graph)

#Obtaining the virtual graph
virt_graph = network_topo.get_virtual_graph()

network_topo.plot_graph(virt_graph)





    for other in network_topo.nodes.keys():

        #Check if this is middle node then skip it
        if type(network_topo.nodes[other]) == BSMNode:
            continue

        if node == other:
            continue

"""