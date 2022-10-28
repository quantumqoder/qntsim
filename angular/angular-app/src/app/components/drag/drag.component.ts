import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { error } from 'console';
import * as go from 'gojs'
import { MenuItem, MessageService } from 'primeng/api';
import { ApiServiceService } from 'src/services/api-service.service';
//import { Interface } from 'readline';
import { ConditionsService } from 'src/services/conditions.service';
@Component({
  selector: 'app-drag',
  templateUrl: './drag.component.html',
  styleUrls: ['./drag.component.less'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class DragComponent implements OnInit, AfterViewInit, OnChanges {
  app_id: any
  nodeParams: boolean
  link: boolean
  memory: any = {
    "frequency": 2000, "expiry": 2000, "efficiency": 0, "fidelity": 0.93
  }
  nodeWithKey: any
  paramsSet = new Map()
  topology: any
  nodeKey: any
  spinner: boolean = false
  blocked: boolean = false
  ip1: any
  e91: any
  e2e: any;
  pingPong: any
  teleportation: any
  ghz: any
  firstqsdc: any

  graphModel: any
  nodes: any = []
  selectedNode1: any
  displayPosition: boolean;
  items: MenuItem[];
  position: string;
  node: any = {};
  toolbox = this.fb.group({
    'name': new FormControl(''),
    'noOfMemories': new FormControl(''),
    'memoryFidelity': new FormControl(''),
    'attenuation': new FormControl(''),
    'distance': new FormControl('')
  })
  public selectedNode: any;
  visibleSideNav: boolean
  public myDiagram: go.Diagram
  public myPalette: go.Palette
  public myRotate: go.RotatingTool
  public savedModel: any = {
    class: "go.GraphLinksModel",
    linkFromPortIdProperty: "fromPort",
    linkToPortIdProperty: "toPort",
    nodeDataArray: [
    ],
    linkDataArray: [
    ]
  }


  constructor(private fb: FormBuilder, private con: ConditionsService, private messageService: MessageService, private apiService: ApiServiceService, private _route: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.myDiagram.nodes)
  }
  ngAfterViewInit(): void {
    this.myDiagram.addDiagramListener("ChangedSelection", function (event) {

      // console.log(node.key);
      // console.log(node.name)
    })

    // go.Diagram.inherit(go, go.RotatingTool);
    // this.TopRotatingTool.prototype.updateAdornments = function (part: any) {
    //   go.RotatingTool.prototype.updateAdornments.call(this, part);
    //   var adornment = part.findAdornment("Rotating");
    //   if (adornment !== null) {
    //     adornment.location = part.rotateObject.getDocumentPoint(new go.Spot(0.5, 0, 0, -30));  // above middle top
    //   }
    // };

    // /** @override */
    // this.TopRotatingTool.prototype.rotate = function (newangle: any) {
    //   go.RotatingTool.prototype.rotate.call(this, newangle + 90);
    // };
  }

  ngOnInit(): void {

    // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;
    this.myDiagram = this.initDiagram()

    // when the document is modified, add a "*" to the title and enable the "Save" button
    this.myDiagram.addDiagramListener("Modified", e => {
      var button = document.getElementById("SaveButton") as HTMLButtonElement;
      if (button) button.disabled = !this.myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (this.myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.slice(0, idx);
      }
    });

    // Define a function for creating a "port" that is normally transparent.
    // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
    // and where the port is positioned on the node, and the boolean "output" and "input" arguments
    // control whether the user can draw links from or to the port.
    function makePort(name: any, spot: any, output: any, input: any) {
      // the port is basically just a small transparent square
      return $(go.Shape, "Circle",
        {
          fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
          stroke: null,
          desiredSize: new go.Size(7, 7),
          alignment: spot,  // align the port on the main Shape
          alignmentFocus: spot,  // just inside the Shape
          portId: name,  // declare this object to be a "port"
          fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
          fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
          cursor: "pointer"  // show a different cursor to indicate potential link point
        });
    }
    var nodeSelectionAdornmentTemplate =
      $(go.Adornment, "Auto",
        $(go.Shape, { fill: null, stroke: "blue", strokeWidth: 1.5, strokeDashArray: [2, 2] }),
        $(go.Placeholder)
      );

    var nodeResizeAdornmentTemplate =
      $(go.Adornment, "Spot",
        { locationSpot: go.Spot.Right },
        $(go.Placeholder),
        $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

        $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

        $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
      );

    var nodeRotateAdornmentTemplate =
      $(go.Adornment,
        { locationSpot: go.Spot.Center, locationObjectName: "CIRCLE" },
        $(go.Shape, "Circle", { name: "CIRCLE", cursor: "pointer", desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
      );
    this.myDiagram.nodeTemplate =
      $(go.Node, "Spot",
        {
          click: (e: go.InputEvent, obj: go.GraphObject) => {
            this.nodeClicked(e, obj)
          },
          doubleClick: this.nodeClicked,
          contextMenu:
            $("ContextMenu",
              $("ContextMenuButton",
                $(go.TextBlock, "Properties"),
                { click: this.showProperties })
            )
        },
        { locationSpot: go.Spot.Center },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
        { resizable: false, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
        { rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
        new go.Binding("angle").makeTwoWay(),
        // the main object is a Panel that surrounds a TextBlock with a Shape
        $(go.Panel, "Auto",
          { name: "PANEL" },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          $(go.Shape, "Rectangle",  // default figure
            {
              portId: "", // the default port: if no spot on link data, use closest side
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              fill: "white",  // default color
              strokeWidth: 2
            },
            new go.Binding("figure"),
            new go.Binding("fill")
          ),
          new go.Binding("strokeDashArray", "dash")),
        $(go.TextBlock,
          {
            font: "bold 11pt Helvetica, Arial, sans-serif",
            margin: 8,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: false
          },
          new go.Binding("text").makeTwoWay())
      ),
      // four small named ports, one on each side:
      makePort("T", go.Spot.Top, false, true),
      makePort("L", go.Spot.Left, true, true),
      makePort("R", go.Spot.Right, true, true),
      makePort("B", go.Spot.Bottom, true, false),
    { // handle mouse enter/leave events to show/hide the ports
      mouseEnter: function (e: any, node: any) { showSmallPorts(node, true); },
      mouseLeave: function (e: any, node: any) { showSmallPorts(node, false); }
    }

    var linkSelectionAdornmentTemplate =
      $(go.Adornment, "Link",
        $(go.Shape,
          // isPanelMain declares that this Shape shares the Link.geometry
          { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })  // use selection object's strokeWidth
      );
    this.myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate },
        { relinkableFrom: true, relinkableTo: true, reshapable: false },
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5,
          toShortLength: 4,
          cursor: 'pointer',
          click: (e: any, obj: any) => {
            this.linkClicked(e, obj)
          }
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 2 },
          new go.Binding("stroke", "color")),
        $(go.TextBlock, { segmentOffset: new go.Point(0, -10) },  // centered multi-line text
          new go.Binding("text", "text")),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 2 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "Standard", stroke: null },
          new go.Binding('fill', 'color')),
        $(go.Panel, "Auto",
          new go.Binding("visible", "isSelected").ofObject(),
          $(go.Shape, "RoundedRectangle",  // the link shape
            { fill: "#F8F8F8", stroke: null }),
          $(go.TextBlock,
            {
              // textAlign: segmentOffset: new go.Point(0, -10)",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#919191",
              margin: 2,
              minSize: new go.Size(10, NaN),
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        )
      );
    this.myPalette =
      $(go.Palette, "myPaletteDiv",  // must name or refer to the DIV HTML element
        {
          maxSelectionCount: 1,
          nodeTemplateMap: this.myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
          linkTemplate: // simplify the link template, just in this Palette
            $(go.Link,
              { // because the GridLayout.alignment is Location and the nodes have locationSpot == Spot.Center,
                // to line up the Link in the same manner we have to pretend the Link has the same location spot
                locationSpot: go.Spot.Center,
                selectionAdornmentTemplate:
                  $(go.Adornment, "Link",
                    { locationSpot: go.Spot.Center },
                    $(go.Shape,
                      { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 }),
                    $(go.Shape,  // the arrowhead
                      { toArrow: "Standard", stroke: "grey" })
                    // $(go.Shape,  // the arrowhead
                    // { toArrow: "Standard", stroke: "grey", strokeWidth: 4 }),
                  ),
              },
              {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4
              },
              new go.Binding("points"),
              $(go.Shape,  // the link path shape
                { isPanelMain: true, strokeWidth: 2 }),
              // $(go.Shape,  // the arrowhead
              //   { toArrow: "Standard", stroke: null }),
              // $(go.TextBlock, { segmentOffset: new go.Point(0, -20) },  // centered multi-line text
              //   new go.Binding("text", "text")),
              $(go.Shape,  // the arrowhead
                { toArrow: "Standard", stroke: null, strokeWidth: 2 }),
              $(go.TextBlock, { segmentOffset: new go.Point(0, -10) },  // centered multi-line text
                new go.Binding("text", "text")),
              new go.Binding('fill', 'color'),
            ),
          model: new go.GraphLinksModel([  // specify the contents of the Palette
            { text: "Service", figure: "Circle", fill: "#00AD5F" },
            { text: "End", figure: "Circle", fill: "#CE0620" },
            // { text: "Comment", figure: "RoundedRectangle", fill: "lightyellow" }
          ], [
            // the Palette also has a disconnected Link, which the user can drag-and-drop
            { text: "QC", points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
            // { color: "grey", text: "VC", points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
          ])
        });
    this.myDiagram

    this.e2e = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'startTime': new FormControl(''),
      'size': new FormControl(''),
      'priority': new FormControl(''),
      'targetFidelity': new FormControl(''),
      'timeout': new FormControl('')
    })
    this.e91 = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'keyLength': new FormControl('')
    })
    this.ip1 = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'message': new FormControl('')
    })
    this.pingPong = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'sequenceLength': new FormControl(''),
      'message': new FormControl('')
    })
    this.firstqsdc = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'sequenceLength': new FormControl(''),
      'key': new FormControl('')
    })
    this.teleportation = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'randomQubitAmplitude1': new FormControl(''),
      'randomQubitAmplitude2': new FormControl('')
    })
    this.ghz = this.fb.group({
      'node1': new FormControl(''),
      'node2': new FormControl(''),
      'node3': new FormControl(''),
      'middleNode': new FormControl('')
    })

  }
  selected(): any {
    console.log("selected")
  }
  linkClicked(e: any, obj: any) {
    this.visibleSideNav = true
    //console.log("hello")
    this.nodeParams = false;
    this.link = true
  }
  save() {
    this.app_id = sessionStorage.getItem("app_id")
    //console.log(this.app_id)
    //console.log(this.myDiagram.model.toJson)

    this.saveDiagramProperties();
    this.graphModel = this.myDiagram.model.nodeDataArray
    console.log(this.graphModel)

    //console.log(this.graphModel)
    this.position = 'bottom';
    this.displayPosition = true;
  }
  add() {
    var nodereq;
    var linkreq;
    if (this.nodeParams) {
      var nodesarray = this.savedModel.nodeDataArray
      //let length = nodesarray.length
      nodereq = {
        "Name": this.toolbox.get('name')?.value,
        "Type": this.selectedNode.text,
        "noOfMemories": this.toolbox.get('noOfMemories')?.value,
        "memory": this.memory
      }
      var key = this.selectedNode.key
      console.log(key)
      let positivekey = key.toString().substring(1)
      console.log(positivekey * 2)
      sessionStorage.setItem("selected_node", this.selectedNode.key)
      var indexFromKey = positivekey - 1
      if (this.nodes[indexFromKey] == null)
        this.nodes.splice(indexFromKey, 0, nodereq)
      if (this.nodes[indexFromKey] != null) {
        this.nodes.splice(indexFromKey, 1, nodereq)
      }
      console.log(this.nodes)
      console.log(indexFromKey)
      // console.log(this.nodes)
    }
    if (this.link) {
      //var linksarray = this.savedModel.linkDataArray
      let array = []
      for (let i = 0; i < this.nodes.length; i++) {
        array.push(this.nodes[i].Name)
        console.log(array)
      }
      linkreq = {
        Nodes: array,
        Attenuation: this.toolbox.get('attenuation')?.value,
        Distance: this.toolbox.get('distance')?.value,
      }
      console.log(linkreq)
    }
    this.visibleSideNav = false
  }
  parameters() {
    this.blocked = true
    var e2e = {

      "application": 2,

      "topology": { "nodes": [{ "Name": "n1", "Type": "service", "noOfMemory": 500, "memory": { "frequency": 2000, "expiry": 2000, "efficiency": 0, "fidelity": 0.93 } }, { "Name": "n2", "Type": "end", "noOfMemory": 500, "memory": { "frequency": 2000, "expiry": 2000, "efficiency": 0, "fidelity": 0.93 } }], "quantum_connections": [{ "Nodes": ["n1", "n2"], "Attenuation": 0.00001, "Distance": 70 }], "classical_connections": [{ "Nodes": ["n1", "n1"], "Delay": 0, "Distance": 1000 }, { "Nodes": ["n1", "n2"], "Delay": 1000000000, "Distance": 1000 }, { "Nodes": ["n2", "n1"], "Delay": 1000000000, "Distance": 1000 }, { "Nodes": ["n2", "n2"], "Delay": 0, "Distance": 1000 }] },

      "appSettings": { "sender": "n1", "receiver": "n2", "startTime": "1e12", "size": "6", "priority": "0", "targetFidelity": "0.5", "timeout": "2e12" }

    }
    this.displayPosition = false
    var token = localStorage.getItem('access')
    var topology = { "nodes": [{ "Name": "n1", "Type": "service", "noOfMemory": 500, "memory": { "frequency": 2000, "expiry": 2000, "efficiency": 0, "fidelity": 0.93 } }, { "Name": "n2", "Type": "end", "noOfMemory": 500, "memory": { "frequency": 2000, "expiry": 2000, "efficiency": 0, "fidelity": 0.93 } }], "quantum_connections": [{ "Nodes": ["n1", "n2"], "Attenuation": 0.00001, "Distance": 70 }], "classical_connections": [{ "Nodes": ["n1", "n1"], "Delay": 0, "Distance": 1000 }, { "Nodes": ["n1", "n2"], "Delay": 1000000000, "Distance": 1000 }, { "Nodes": ["n2", "n1"], "Delay": 1000000000, "Distance": 1000 }, { "Nodes": ["n2", "n2"], "Delay": 0, "Distance": 1000 }] }
    var req = {
      "application": 1,
      "topology": topology,
      "appSettings": { "sender": "n1", "receiver": "n2", "keyLength": "7" }
    }
    this.apiService.runApplication(req).subscribe((result: any) => {
      this.con.setResult(result)
      this.spinner = true;
    }, (error) => {
      console.error(error)
    }, () => {
      this._route.navigate(['/results'])
    })
  }
  initDiagram(): go.Diagram {
    var $ = go.GraphObject.make;  // for conciseness in defining templates
    var myDiagram =
      $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
        {
          grid: $(go.Panel, "Grid",
            $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
            $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
            $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
            $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
          ),
          allowDrop: true,  // must be true to accept drops from the Palette
          "draggingTool.dragsLink": true,
          "draggingTool.isGridSnapEnabled": true,
          "linkingTool.isUnconnectedLinkValid": true,
          "linkingTool.portGravity": 20,
          "relinkingTool.isUnconnectedLinkValid": true,
          "relinkingTool.portGravity": 20,
          "relinkingTool.fromHandleArchetype":
            $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
          "relinkingTool.toHandleArchetype":
            $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
          "linkReshapingTool.handleArchetype":
            $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
          // rotatingTool: go.RotatingTool,  // defined below
          // "rotatingTool.snapAngleMultiple": 15,
          // "rotatingTool.snapAngleEpsilon": 15,
          // "undoManager.isEnabled": true
        });
    return myDiagram;
  }
  load() {
    //var savedModel = document.getElementById("mySavedModel") as HTMLInputElement
    this.myDiagram.model = go.Model.fromJson(this.savedModel);
    this.loadDiagramProperties();  // do this after the Model.modelData has been brought into memory
  }
  saveDiagramProperties() {
    this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position);
    //console.log(this.myDiagram.model.modelData.position)
  }
  showPositionDialog() {
    //var savedModel = document.getElementById("mySavedModel") as HTMLInputElement
    this.saveDiagramProperties();  // do this first, before writing to JSON


    //console.log(this.savedModel)
    this.myDiagram.isModified = false;
    this.visibleSideNav = true
    this.messageService.add({
      severity: 'success', summary: 'The graph has been saved.', life: 2000
    })
  }
  loadDiagramProperties() {
    // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
    var pos = this.myDiagram.model.modelData.position;
    if (pos) this.myDiagram.initialPosition = go.Point.parse(pos);
  }
  nodeClicked(e: go.InputEvent, obj: go.GraphObject) {
    // var evt = e.copy();
    // console.log(evt)
    var node = obj.part;
    // console.log(node.data);
    this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position);
    this.savedModel = this.myDiagram.model;
    console.log(this.savedModel.linkDataArray)
    console.log(this.savedModel.linkDataArray[0].from)
    // var array1 = [];
    // array1.push(array)
    // sessionStorage.setItem('node', ...array1)
    // sessionStorage.setItem('nodeName', node.data.text)
    // sessionStorage.setItem('nodeKey', node.data.key)
    // sessionStorage.setItem('figure', node.data.figure)
    // console.log((-1) * (-1))
    this.selectedNode = node.data
    console.log(this.selectedNode);
    var key = this.selectedNode.key
    if (this.nodes.length != 0) {
      let positivekey = key.toString().substring(1)
      // console.log(positivekey * 2)
      var indexFromKey = positivekey - 1
      console.log(this.nodes.length)
      let node
      if (this.nodes.length > indexFromKey) {
        node = this.nodes[indexFromKey]
        console.log(node)
        this.toolbox.get('name')?.patchValue(node.Name)
        this.toolbox.get('noOfMemories')?.patchValue(node.noOfMemories)
      }
      else {
        this.toolbox.get('name')?.patchValue('');
        this.toolbox.get('noOfMemories')?.patchValue('')
      }
    }
    //   for (var i = 0; i < this.nodes.length; i++) {
    //     console.log(this.nodes[i].Type)
    //     console.log(this.nodes[i].Type == this.selectedNode.text)
    //     if (this.nodes[i].Name == this.selectedNode.text) {
    //       this.toolbox.get('name')?.setValue('')
    //     }

    //   }
    this.visibleSideNav = true
    this.nodeParams = true
    this.link = false
  }
  showProperties(e: any, obj: any) {  // executed by ContextMenuButton
    var node = obj.part.adornedPart;
    console.log(obj.part.adornedPart)
    console.log(node)
    var msg = "Context clicked: " + node.data.key + ". ";
    msg += "Selection includes:";

    console.log(msg)
    // this.myDiagram.selection.each(function (part) {
    //   msg += " " + part.toString();
    // });
    // document.getElementById("myStatus").textContent = msg;
  }
}

function showSmallPorts(node: any, show: any) {
  node.ports.each(function (port: any) {
    if (port.portId !== "") {  // don't change the default port, which is the big shape
      port.fill = show ? "rgba(0,0,0,.3)" : null;
    }
  });
}
export class selectedNode {
  name: string;
  key: string;
  figure: string;
}

