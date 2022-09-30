import string
from main.simulator.constants import *


def load_topology(network_config_json, backend):
    from qntsim.kernel.timeline import Timeline
    Timeline.DLCZ=False
    Timeline.bk=True
    from qntsim.topology.topology import Topology
    #from qntsim.topology.node import force_import
    #force_import("bk")
    print(f'Loading Topology: {network_config_json}')
    
    tl = Timeline(20e12,backend)
    # print('Timeline', tl)

    network_topo = Topology("network_topo", tl)
    network_topo.load_config_json(network_config_json)
    all_pair_dist, G = network_topo.all_pair_shortest_dist()
    # print('all pair distance', all_pair_dist, G)

    # print(f'Topology Graph: {network_topo}')

    
    return network_config_json,tl,network_topo
    
   