import { HoldingDataService } from 'src/services/holding-data.service';

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as go from 'gojs'
import { ConfirmationService, MenuItem, Message, MessageService } from 'primeng/api';
import { ApiServiceService } from 'src/services/api-service.service';

import { ConditionsService } from 'src/services/conditions.service';

@Component({
  selector: 'app-drag',
  templateUrl: './drag.component.html',
  styleUrls: ['./drag.component.less'],
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class DragComponent implements OnInit, AfterViewInit {
  @ViewChild('diagramContainer') private diagramRef: ElementRef;
  private addButtonAdornment: go.Adornment;
  link_array: any = []
  app_id: any
  checked: boolean = false;
  nodesData: any = {}
  serviceNodes: any[] = []
  endNodes: any[] = []
  step: any
  popover2: string = "Click on component's name to modify its name."
  cc: any = []
  nodeWithKey: any
  paramsSet = new Map()
  topology: any
  appSettings: any
  nodeKey: any
  spinner: boolean = false
  e2e: any;
  graphModel: any
  nodes: any = []
  selectedNode1: any
  displayPosition: boolean;
  items: MenuItem[];
  position: string;
  node: any = {};
  toolbox = this.fb.group({
    'attenuation': new FormControl('0.1'),
    'distance': new FormControl('70')
  })
  breadcrumbItems: MenuItem[]
  public selectedNode: any;
  public selectedLink: any
  public myDiagram: any
  public myPalette: go.Palette
  public savedModel: any
  links: any = [];
  application: any;
  activeIndex: number;
  appSettingsForm = this.fb.group({
    'sender': ['', Validators.required],
    'receiver': ['', Validators.required],
    'startTime': new FormControl('1'),
    'size': new FormControl('6'),
    'targetFidelity': new FormControl('0.5'),
    'timeout': new FormControl('1'),
    'keyLength': new FormControl('5'),
    'message': new FormControl('10011100', evenLengthValidator),
    'sequenceLength': new FormControl('2'),
    'amplitude1': new FormControl('0.70710678118+0j'),
    'amplitude2': new FormControl('0-0.70710678118j'),
    'endnode1': new FormControl(''),
    'endnode2': new FormControl(''),
    'endnode3': new FormControl(''),
    'middleNode': new FormControl(''),
    'message1': new FormControl(''),
    'message2': new FormControl(''),
    'num_photons': new FormControl(''),
    'attack': new FormControl(''),
    'senderId': new FormControl(''),
    'receiverId': new FormControl(''),
    'numCheckBits': new FormControl(''),
    'numDecoy': new FormControl(''),
    'inputMessage': new FormControl('')
  })
  constructor(private fb: FormBuilder, private con: ConditionsService, private messageService: MessageService, private apiService: ApiServiceService, private holdingData: HoldingDataService, private _route: Router, private modal: NgbModal, private confirmationService: ConfirmationService) {
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.step = 0;
  }
  ngAfterViewInit(): void {
    this.initDiagram();
  }
  e2eChange(data: string) {
    if (data == 'target') {
      this.e2e.targetFidelity = this.appSettingsForm.get('targetFidelity')?.value;
    }
    else if (data == 'size') {
      this.e2e.size = this.appSettingsForm.get('size')?.value;
    }
  }
  allowBitsInput($event: any) {
    if ($event.key.match(/[0-1]*/)['0']) { }
    else {
      $event.preventDefault();
    }
  }
  updateNodes() {
    var nodesArray = this.myDiagram.model.nodeDataArray
    this.serviceNodes = [];
    this.endNodes = [];
    this.nodes = [];
    for (let i = 0; i < nodesArray.length; i++) {
      const nodereq = {
        "Name": nodesArray[i].name,
        "Type": nodesArray[i].properties[0].propValue.toLowerCase(),
        "noOfMemory": nodesArray[i].properties[1].propValue,
        "memory": {
          'frequency': nodesArray[i].memory[0].propValue,
          'expiry': nodesArray[i].memory[1].propValue,
          'efficiency': nodesArray[i].memory[2].propValue,
          'fidelity': nodesArray[i].memory[3].propValue
        }
      };
      this.nodesData[nodesArray[i].key] = nodereq;
      if ((this.myDiagram.model.nodeDataArray[i] as any).key in this.nodesData) {
        this.nodes.push(this.nodesData[(this.myDiagram.model.nodeDataArray[i] as any).key])
      }
    }
    for (const [key, value] of Object.entries(this.nodesData)) {
      if (value["Type"].toLowerCase() == 'end') {
        this.endNodes.push(value)
      } else if (value["Type"].toLowerCase() == 'service') {
        this.serviceNodes.push(value)
      }
    }
  }
  ngOnInit(): void {
    this.e2e = {
      targetFidelity: 0.5,
      size: 6
    }
    // init for these samples -- you don't need to call this
    this.activeIndex = 0
    this.app_id = localStorage.getItem('app_id')
    this.application = localStorage.getItem('app')
    this.breadcrumbItems = [{
      label: '1.Setup Topology', command: () => {
        this.activeIndex = 0;
      }
    }, {
      label: '2.Configuration', command: () => {
        this.activeIndex = 1
      }
    },
    {
      label: '3.Application Settings', command: () => {
        this.activeIndex = 2
      }
    }]
  }
  parameters() {
    this.app_id = localStorage.getItem('app_id')
    if (this.app_id == 5 || this.app_id == 6 || this.app_id == 10 || this.app_id == 7) {
      if (this.appSettingsForm.get('message')?.value.length % 2 != 0) {
        alert("Message length should be even ");
        // this.spinner = false
        return
      }
    }
    if (this.app_id == 9) {
      if (this.appSettingsForm.get('inputMessage')?.value == '') {
        alert("Message is required");
        return
      }
    }
    if (this.app_id != 4) {
      if (this.appSettingsForm.get('sender')?.value == '') {
        alert("Please select a sender")
        return
      }
      else if (this.appSettingsForm.get('receiver')?.value == '') {
        alert("Please select a receiver.")
        return;
      }
      else if (this.appSettingsForm.get('sender')?.value == this.appSettingsForm.get('receiver')?.value) {
        alert("Sender and Receiver cannot be same node");
        return;
      }
    }
    if (this.app_id == 4) {
      let endnode1 = this.appSettingsForm.get('endnode1')?.value
      let endnode2 = this.appSettingsForm.get('endnode2')?.value
      let endnode3 = this.appSettingsForm.get('endnode3')?.value
      let middleNode = this.appSettingsForm.get('middleNode')?.value
      if (endnode1 == '' || endnode2 == '' || endnode3 == '' || middleNode == '') {
        alert('Please select End Nodes.')
        return;
      }
      if (endnode1 == endnode2 || endnode2 == endnode3 || endnode3 == endnode1) {
        alert("End Nodes cannot be same node");
        return;
      }
    }
    for (let i = 0; i < this.myDiagram.model.nodeDataArray.length; i++) {
      if (!((this.myDiagram.model.nodeDataArray[i] as any).key in this.nodesData)) {

        alert("Please configure the node named:" + (this.myDiagram.model.nodeDataArray[i] as any).text);
        return;
      };
    }
    this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position);
    this.savedModel = this.myDiagram.model;
    this.graphModel = this.myDiagram.model.nodeDataArray
    this.links = []
    var linkarray: any[]
    if (this.savedModel.linkDataArray.length > this.links.length) {
      for (var i = 0; i < this.savedModel.linkDataArray.length; i++) {
        linkarray = []
        var from = this.myDiagram.model.findNodeDataForKey(this.savedModel.linkDataArray[i].from).name
        var to = this.myDiagram.model.findNodeDataForKey(this.savedModel.linkDataArray[i].to).name
        linkarray.push(from);
        linkarray.push(to);
        let linkData = {
          Nodes: linkarray,
          Attenuation: 0.1,
          Distance: 70
        }
        this.links.push(linkData)
      }
    }
    this.nodes = []
    for (const [key, value] of Object.entries(this.nodesData)) {
      this.nodes.push(value)
    }

    this.spinner = true;
    this.displayPosition = false
    this.app_id = localStorage.getItem('app_id')
    if (!this.app_id) {
      this._route.navigate(['/applications'])
    }
    this.app_id = Number(this.app_id)
    this.cc = []
    this.cc = this.holdingData.getClassicalConnections(this.nodes)
    this.topology = {
      nodes: this.nodes,
      quantum_connections: this.links,
      classical_connections: this.cc,
    }
    const appConfig =
    {
      1: {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        keyLength: Number(this.appSettingsForm.get('keyLength')?.value)
      },

      2: {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        startTime: 1e12,
        size: this.appSettingsForm.get('size')?.value,
        priority: 0,
        targetFidelity: this.e2e.targetFidelity,
        timeout: this.appSettingsForm.get('timeout')?.value + 'e12'
      }
      , 4: {
        endnode1: this.appSettingsForm.get('endnode1')?.value,
        endnode2: this.appSettingsForm.get('endnode2')?.value,
        endnode3: this.appSettingsForm.get('endnode3')?.value,
        middlenode: this.appSettingsForm.get('middleNode')?.value,
      }, 3: {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        amplitude1: this.appSettingsForm.get('amplitude1')?.value,
        amplitude2: this.appSettingsForm.get('amplitude2')?.value
      }, 5:
      {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        sequenceLength: this.appSettingsForm.get('sequenceLength')?.value,
        key: this.appSettingsForm.get('message')?.value
      }, 7:
      {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        message: this.appSettingsForm.get('message')?.value
      }, 6:

      {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        sequenceLength: this.appSettingsForm.get('sequenceLength')?.value,
        message: this.appSettingsForm.get('message')?.value,
      },
      8:
      {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        message1: this.appSettingsForm.get('message1')?.value,
        message2: this.appSettingsForm.get('message2')?.value,
        attack: ''
      }, 9:
      {
        sender: this.appSettingsForm.get('sender')?.value,
        receiver: this.appSettingsForm.get('receiver')?.value,
        message: this.appSettingsForm.get('inputMessage')?.value,
        attack: this.appSettingsForm.get('attack')?.value
      }, 10:
      {
        alice_attrs: {
          sender: this.appSettingsForm.get('sender')?.value,
          receiver: this.appSettingsForm.get('receiver')?.value,
          message: this.appSettingsForm.get('message')?.value,
          id: "1010",
          check_bits: 4
        },
        bob_id: "0111",
        threshold: 0.2,
        num_decoy: 4
      }
    }
    this.appSettings = appConfig[this.app_id]
    var req = {
      "application": this.app_id,
      "topology": this.topology,
      "appSettings": this.appSettings
    }
    this.apiService.runApplication(req).subscribe((result: any) => {
      this.spinner = true;
      this.con.setResult(result)
    }, (error) => {
      this.spinner = false
      console.error(error)
      // alert("Error has occurred:" + "" + error.status + "-" + error.statusText)
    }, () => {
      this.spinner = false
      this._route.navigate(['/results'])
    })
  }
  addNode(adornedPart: go.Part) {
    const newNode = {
      key: this.myDiagram.nodes.count + 1,
      name: `node${this.myDiagram.nodes.count + 1}`,
      properties: [
        { propName: "Type", propValue: adornedPart.data.properties[0].propValue == 'Service' ? 'End' : adornedPart.data.properties[0].propValue == 'End' ? 'Service' : null, nodeType: true },
        { propName: "No of Memories", propValue: 500, numericValueOnly: true }
      ],
      memory: [
        { propName: "frequency(hz)", propValue: 2000, numericValueOnly: true },
        { propName: "expiry(ms)", propValue: 2000, numericValueOnly: true },
        { propName: "efficiency", propValue: 1, decimalValueAlso: true },
        { propName: "fidelity", propValue: 0.93, decimalValueAlso: true }
      ]
    };
    this.myDiagram.startTransaction('Add node and link');
    this.myDiagram.model.addNodeData(newNode);
    this.myDiagram.model.addLinkData({ from: adornedPart.data.key, to: newNode.key });
    this.myDiagram.commitTransaction('Add node and link');
  }
  load() {
    this.myDiagram.model = go.Model.fromJson(this.savedModel)
    this.loadDiagramProperties();  // do this after the Model.modelData has been brought into memory
  }
  loadDiagramProperties() {
    var pos = this.myDiagram.model.modelData.position;
    if (pos) this.myDiagram.initialPosition = go.Point.parse(pos);
    this.myDiagram.contentAlignment = go.Spot["Center"];
  }

  deleteLink(e: any, obj: any) {
    var link = obj.part.data
    var link1 = this.myDiagram.findLinkForData(link)
    this.myDiagram.startTransaction("remove link");
    this.myDiagram.remove(link1);
    this.myDiagram.commitTransaction("remove link");
  }

  activeindex(data: any) {
    this.updateNodes();
    if (data == 'next') {
      if (this.activeIndex <= 1) {
        this.activeIndex++;
      }

    } else if (data == 'prev') {
      if (this.activeIndex >= 1) {
        this.activeIndex--;
      }
    }
  }
  get sender() {
    return this.appSettingsForm.get('sender')
  }
  get receiver() {
    return this.appSettingsForm.get('receiver')
  }
  get node1() {
    return this.appSettingsForm.get('endnode1')
  }
  get node2() {
    return this.appSettingsForm.get('endnode2')
  }
  get node3() {
    return this.appSettingsForm.get('endnode3')
  }
  get middlenode() {
    return this.appSettingsForm.get('middleNode')
  }
  get keyLength() {
    return this.appSettingsForm.get('keyLength')
  }
  get key() {
    return this.appSettingsForm.get('key')
  }
  initDiagram() {
    const $ = go.GraphObject.make;

    this.myDiagram = $(go.Diagram, this.diagramRef.nativeElement, {
      'undoManager.isEnabled': true,
      'initialAutoScale': go.Diagram.Uniform, // Ensures the myDiagram fits the viewport
      'allowZoom': false, // Disables zooming
      // layout: $(go.GridLayout,
      //   { // this only lays out in trees nodes connected by "generalization" links
      //     // angle: 90,
      //     // path: go.GridLayout.PathSource,  // links go from child to parent
      //     // setsPortSpot: false,  // keep Spot.AllSides for link connection spot
      //     // setsChildPortSpot: false,  // keep Spot.AllSides
      //     // nodes not connected by "generalization" links are laid out horizontally
      //     // arrangement: go.TreeLayout.ArrangementHorizontal
      //   })
    });
    this.addButtonAdornment = $(go.Adornment, 'Spot',
      $(go.Panel, 'Auto',
        $(go.Shape, { fill: null, strokeWidth: 0 }),
        $(go.Placeholder)
      ),
      $(go.Panel, 'Spot', { alignment: go.Spot.Right, alignmentFocus: go.Spot.Left, cursor: 'pointer' },
        { click: (e: any, obj: any) => this.addNode(obj.part.adornedPart) },
        $(go.TextBlock, '+', { font: 'bold 10pt sans-serif', margin: new go.Margin(0, 5, 0, 0) })
      )
    );

    function isPositiveNumber(val: any) {
      console.log(val)
      const regex = /^\d+$/;
      return regex.test(val);
    }
    function isDecimalNumber(val: any) {
      const regex = /^\d+(\.\d*)?$/;
      return regex.test(val);
    }

    var memoryTemplate =
      $(go.Panel, "Horizontal",
        $(go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "propName").makeTwoWay(),
          new go.Binding("isUnderline", "scope", s => s[0] === 'c')),
        // property type, if known
        $(go.TextBlock, "",
          new go.Binding("text", "propValue", t => t ? ": " : "")),
        $(go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "propValue").makeTwoWay()),
        // property default value, if any
        $(go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "default", s => s ? " = " + s : ""))
      );
    var propertyTemplate =
      $(go.Panel, "Horizontal",
        $(go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "propName").makeTwoWay(),
          new go.Binding("isUnderline", "scope", s => s[0] === 'c')),
        // property type, if known
        $(go.TextBlock, "",
          new go.Binding("text", "propValue", t => t ? ": " : "")),
        $(go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "propValue").makeTwoWay()),
        // property default value, if any
        $(go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "default", s => s ? " = " + s : ""))
      );
    this.myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides
        },
        $(go.Shape, {
          fill: 'lightyellow'
        }),
        $(go.Panel, "Table",
          { defaultRowSeparatorStroke: "black" },
          // header
          $(go.TextBlock,
            {
              row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
              font: "bold 12pt sans-serif",
              isMultiline: false, editable: true
            },
            new go.Binding("text", "name").makeTwoWay()),
          // properties
          $(go.TextBlock, "Properties",
            { row: 1, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", v => !v).ofObject("PROPERTIES")),
          $(go.Panel, "Vertical", { name: "PROPERTIES" },
            new go.Binding("itemArray", "properties"),
            {
              row: 1, margin: 3, stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left, background: "lightyellow",
              itemTemplate: propertyTemplate
            }
          ),
          $("PanelExpanderButton", "PROPERTIES",
            { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "properties", arr => arr.length > 0)),
          // methods
          $(go.TextBlock, "Memory",
            { row: 2, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", v => !v).ofObject("MEMORY")),
          $(go.Panel, "Vertical", { name: "MEMORY" },
            new go.Binding("itemArray", "memory"),
            {
              row: 2, margin: 3, stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left, background: "lightyellow",
              itemTemplate: memoryTemplate
            }
          ),
          $("PanelExpanderButton", "MEMORY",
            { row: 2, column: 1, alignment: go.Spot.Right, visible: false },
            new go.Binding("visible", "memory", arr => arr.length > 0)),
          $(go.Panel, 'Spot',
            {
              alignment: go.Spot.Right,
              alignmentFocus: go.Spot.Left,
              click: (e: any, obj: any) => this.addNode(obj.part)
            },
            $(go.Shape,
              {
                figure: 'Circle',
                spot1: new go.Spot(0, 0, 1, 1), spot2: new go.Spot(1, 1, -1, -1),
                fill: 'white', strokeWidth: 0,
                desiredSize: new go.Size(20, 20),
                mouseEnter: (e: any, obj: any) => {
                  obj.fill = 'rgba(128,128,128,0.7)';
                },
                mouseLeave: (e: any, obj: any) => {
                  obj.fill = 'white';
                }
              }
            ),
            $(go.TextBlock, '+', { font: 'bold 10pt sans-serif', margin: new go.Margin(0, 5, 0, 0) })
          )
        )
      );
    this.myDiagram.linkTemplate =
      $(go.Link,
        $(go.Shape),
        $(go.Shape, { toArrow: 'Standard' })
      );
    var nodeDataArray = [
      {
        key: 1,
        name: "node1",
        color: "blue",
        properties: [
          { propName: "Type", propValue: "End", nodeType: true },
          { propName: "NoOfMemories", propValue: 500, numericValueOnly: true }
        ],
        memory: [
          { propName: "frequency(hz)", propValue: 2000, numericValueOnly: true },
          { propName: "expiry(ms)", propValue: 2000, numericValueOnly: true },
          { propName: "efficiency", propValue: 1, decimalValueAlso: true },
          { propName: "fidelity", propValue: 0.93, decimalValueAlso: true }
        ]
      }
    ];
    this.myDiagram.model = new go.GraphLinksModel(nodeDataArray, []);
    this.myDiagram.addDiagramListener("TextEdited", (e: any) => {
      const tb = e.subject;
      const nodeData = tb.part && tb.part.data;
      if (nodeData && nodeData.properties) {
        const editedProperty = nodeData.properties.find((prop: any) => prop.propValue.toString() === tb.text);
        if (editedProperty && editedProperty.numericValueOnly) {
          if (!isPositiveNumber(tb.text)) {
            tb.text = e.parameter; // Revert to the previous text value
          }
        }
        if (editedProperty && editedProperty.nodeType) {
          if (tb.text != 'Service' || tb.text != 'End') {
            tb.text = e.parameter
          }
        }
      }
      if (nodeData && nodeData.memory) {
        const editedProperty = nodeData.memory.find((prop: any) => prop.propValue.toString() === tb.text);
        if (editedProperty && editedProperty.decimalValueAlso) {
          if (!isDecimalNumber(tb.text)) {
            tb.text = e.parameter; // Revert to the previous text value
          }
        }
        if (editedProperty && editedProperty.numericValueOnly) {
          if (!isPositiveNumber(tb.text)) {
            tb.text = e.parameter; // Revert to the previous text value
          }
        }
      }
    });
  }
}
function evenLengthValidator(control: FormControl) {
  const value = control.value;
  if (value.length % 2 !== 0) {
    return { evenLength: true };
  }
  return null;
}


