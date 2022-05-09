import qntsim
from qntsim.kernel.timeline import Timeline
from qntsim.kernel.process import Process
from qntsim.kernel.event import Event
from enum import Enum, auto
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..topology.node import QuantumRouter,Node
    from ..components.memory import Memory
from ..message import Message
import itertools
from ..topology.message_queue_handler import ManagerType, ProtocolType,MsgRecieverType
      

class ProtocolMsgType(Enum):

    """Defines possible message types for transport protocol."""

    SYN=auto()
    ACK=auto()
    SYNACK=auto()
    REQ=auto()
    REQACK=auto()
    RETRY=auto()


 
class Message():

    """Message used by Transport layer protocols.
    This message contains all information passed between transport protocol instances.
    Messages of different types contain different information.
    Attributes:
        msg_type (GenerationMsgType): defines the message type.
        receiver (str): name of destination protocol instance.
        src_obj : source node protocol instance
        dest_obj : destination node protocol instance.
    """


    def __init__(self, receiver_type : Enum, receiver : Enum, msg_type , **kwargs) -> None:
        
        self.receiver_type =receiver_type
        self.receiver = receiver
        self.msg_type = msg_type
        self.kwargs = kwargs
              

    
class TransportManager():
    
    """
    Class to define the transport manager.
    Attributes:
        name (str): label for manager instance.
        owner (QuantumRouter): node that transport manager is attached to.
        
    """
    id=itertools.count()
    def __init__(self,owner):
        
        self.name='transport_manager'
        self.owner=owner
        self.transportprotocolmap={}
        

    def request(self, responder, start_time, size,end_time, priority, target_fidelity,timeout):
        """ 
        Fuction to take request from the application layer. It instanstiate protocol for the source node.
        Sends classical message to instantiate destinate protocol.
       
        Attributes:
        responder (str): name of destination node.
        timeout(int) : Timeout for the request.
        start_time(int) : start time for the request.
        size(int) : size for the request.
        target_fidelity(float) : target fidelity for the request
        end_time(int) : end time for the request
        """
        self.tp_id=next(self.id)
        print('create request')
        transport_protocol_src=TransportProtocol(self.owner, responder,start_time,size,end_time,priority,target_fidelity, timeout) #Create source protocol instance
        self.owner.protocols.append(transport_protocol_src)         #Adding the protocol to the list of protocols
        self.transportprotocolmap[self.tp_id]=transport_protocol_src
        message=Message(MsgRecieverType.MANAGER, ManagerType.TransportManager,ProtocolMsgType.REQ,src_obj=transport_protocol_src) 
        print('message',message.msg_type,message.receiver,message.receiver_type)  #Sending msgtype REQ to start destination protocol
        self.owner.message_handler.send_message(responder,message)


    def received_message(self,src,msg: Message):
        
        """Method to receive messages.
        This method receives messages from transport manager.
        Depending on the message, different actions may be taken by the protocol.
        Args:
            src (str): name of the source node sending the message.
            msg (Message): message received.
        """

        msg_type=msg.msg_type
    

        if msg_type is ProtocolMsgType.REQ:
            # print('Session between src and dest',self.owner.name,msg.objsrc.owner.name,msg.objsrc.starttime*1e-12,msg.objsrc.size,msg.objsrc.timeout*1e-12)
            print('Message passing working')
            src_obj=msg.kwargs.get('src_obj')
            print('src obj', src_obj.owner.name,src_obj.starttime,src_obj.endtime,src_obj.size,src_obj.priority,src_obj.target_fidelity)
            transport_protocol_dest=TransportProtocol(self.owner, src_obj.owner.name,src_obj.starttime,src_obj.endtime,src_obj.size,src_obj.priority,src_obj.target_fidelity,src_obj.timeout)  #Creating destination protocol
            self.owner.protocols.append(transport_protocol_dest)
            message=Message(MsgRecieverType.MANAGER, ManagerType.TransportManager,ProtocolMsgType.REQACK,dest_obj=transport_protocol_dest,src_obj=src_obj)
            self.owner.message_handler.send_message(src,message)
            

        elif msg_type is ProtocolMsgType.REQACK:
            print('REQACK recieved from destination node')
            src_obj=msg.kwargs.get('src_obj')
            dest_obj=msg.kwargs.get('dest_obj')
            src_obj.create_session(dest_obj)  #Call create session of the transport protocol after both protocol instance has been created.
            # self.owner.message_handler.manager_is_over(msg.receiver)

    def notify_tm(self,fail_time,tp_id,status):
        '''
        Method to recieve the acknowledgements of Reject,Abort and Approved from link layer.
        '''

        # print('failed inside tranport manager',tp_id,fail_time*1e-12,status)
        for tp_id,tp in self.transportprotocolmap.items():
            # print('id,protocol',tp_id,tp)
            if status == 'REJECT' or status == 'ABORT':
                # print('tm notify reject',(tp.starttime+self.owner.timeline.now())*1e-12)
                # Creating an event for notify method of transport protocol for retrials.

                process=Process(tp,'notify_tp',[fail_time,status])
                event=Event(tp.starttime+self.owner.timeline.now(),process)
                self.owner.timeline.schedule(event)
                break
        


class TransportProtocol(TransportManager):

    """Transport protocol for quantum router.
    Attributes:
        own (QuantumRouter): node that protocol instance is attached to.
        name (str): label for protocol instance.
        other (str): name of destination node.
        timeout(int) : Timeout for the request.
        starttime(int) : start time for the request.
        size(int) : size for the request.
    """

    def __init__(self,owner , other, starttime,size,endtime,priority,targetfidelity,timeout):
        self.owner=owner
        self.other= other
        self.timeout=timeout
        self.starttime=starttime
        self.size=size
        self.endtime=endtime
        self.priority=priority
        self.name="TransportProtocol"
        self.retry=0
        self.target_fidelity = targetfidelity
        self.reqcount=0

    def create_session(self,dest_obj):

        """ 
        Creates a session between source and destination protocol. Sends classical messgae to start 3 way handshake to decide the timeout of the request.
        """

        print('session created',dest_obj.owner.name, self.name)
        message=Message(MsgRecieverType.PROTOCOL,self.name,ProtocolMsgType.SYN,src_obj=self,dest_obj=dest_obj)
        dest_obj.owner.message_handler.send_message(self.owner.name,message)
       
    
    def received_message(self,src,msg: Message):

        """Method to receive messages.
        This method receives messages from transport protocols.
        Depending on the message, different actions may be taken by the protocol.
        Args:
            src (str): name of the source node sending the message.
            msg (Message): message received.
        """


        # print('source owner',src,self.owner.name)
        msg_type=msg.msg_type
        # print('mssg type',msg_type)

        #Timeout to be decided between the source and destination protocol
        # After SYNACK is achieved both protocols will be on the same level
        # 
        # Call network manager for entanglement creation.
        # If the request fails, within the timeout time, go fo retrials.
        

        if msg_type is ProtocolMsgType.SYN:
            print('SYN between',self.owner.name,src)            
            dest_timer=self.owner.timeline.now()
            src_obj=msg.kwargs.get('src_obj')
            dest_obj=msg.kwargs.get('dest_obj')
            message=Message(MsgRecieverType.PROTOCOL,self.name,ProtocolMsgType.SYNACK,src_obj=src_obj,dest_obj=dest_obj,dest_timer=dest_timer)
            # print('ccccc',self.owner.name,src)
            self.owner.message_handler.send_message(src,message)
            # msg.src_obj.create_requests()


        elif msg_type is ProtocolMsgType.SYNACK:
            print('SYNACK received',self.owner.name,src)
            src_timer=self.owner.timeline.now()
            src_obj=msg.kwargs.get('src_obj')
            dest_obj=msg.kwargs.get('dest_obj')
            dest_time=msg.kwargs.get('dest_timer')
            final_timer=src_obj.starttime*1e-12 + self.timeout*1e-12
            # print('final timer', final_timer)
           
            message=Message(MsgRecieverType.PROTOCOL,self.name,ProtocolMsgType.ACK,src_obj=src_obj,dest_obj=dest_obj,final_timer=final_timer)
            self.owner.message_handler.send_message(src,message)

        
        
        elif msg_type is ProtocolMsgType.ACK:
            tn=self.owner.timeline.now()
            print('ACKs time',self.owner.name,src,tn*1e-12,self)
            self.create_requests()
                 
        # elif msg_type is ProtocolMsgType.RETRY:
        #     print('Retry Message')


    def create_requests(self):
        '''
        Method to create request by calling the network manager.
        '''
        # print('reqcount',self.reqcount)
        for id,pro in self.owner.transport_manager.transportprotocolmap.items():
            # print('qq',id,pro,self)
            if self == pro and self.reqcount==0:  # Self.reqcount to stop multiple calls for same request.
                # print('create requestss',self.owner.name,self.other,self.starttime*1e-12,self.endtime*1e-12,self.priority,id)
                nm=self.owner.network_manager
                # process=Process(nm,'request', [self.other,self.starttime,self.endtime,self.size,.5,self.priority,id] )
                # event=Event(8e12,process,0)
                # self.owner.timeline.schedule(event)
                nm.create_request(self.owner.name,self.other, start_time=self.starttime , end_time=self.endtime, memory_size=self.size, target_fidelity=self.target_fidelity,priority=self.priority,tp_id=id)
                self.reqcount+=1

    def notify_tp(self,ftime,status):
        '''
        Notify method of the transport protocol called from notify method of transport manager. Checks if the time for retrial is less than timeout time.
        '''
        
        time_now=self.owner.timeline.now()
        # print('protocol notify',ftime*1e-12,self.starttime*1e-12,self.timeout*1e-12,time_now*1e-12)
        if time_now < self.starttime + self.timeout: #If the current time is less than starttime+timeout go for retriails
            # print('for retrials',self.owner.timeline.now()*1e-12)
            self.retrials(status)



    def retrials(self,status):
        '''
        Method to create request for the retrials.
        '''
        # print('Inside retrials',status,self,self.starttime,self.owner.name,self.other)
        message=Message(ProtocolMsgType.RETRY,None)
        

        # self.owner.message_handler.send_message(self.other,message)
        while status != 'APPROVED' and self.retry < 5:
           
            self.retry +=1
            self.starttime += 0.2e12 #Added value to starttime to stop assertion error for timeline time less than reservation start time.
            # print('retry count',self.retry,self.starttime*1e-12,self.endtime*1e-12,self.owner.timeline.now()*1e-12)
            for id,pro in self.owner.transport_manager.transportprotocolmap.items():
                # print('ww',id,pro)
                if self==pro and self.starttime < self.endtime:
                    
                    # print('retrying',self.owner.name,self.other,self.starttime*1e-12,self.owner.timeline.now()*1e-12)
                    nm=self.owner.network_manager
                    nm.request(self.other, start_time=self.starttime , end_time=self.endtime, memory_size=self.size, target_fidelity=.5,priority=self.priority,tp_id=id)
                    # process=Process(nm,'request',[self.other,self.starttime,self.endtime,self.size,.5,self.priority,id])
                    # event=Event(self.starttime+self.owner.timeline.now(),process,0)
                    # self.owner.timeline.schedule(event)