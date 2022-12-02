import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

//import { error } from 'console';
import * as go from 'gojs'
import { MenuItem, MessageService } from 'primeng/api';
import { ApiServiceService } from 'src/services/api-service.service';
//import { Interface } from 'readline';
import { ConditionsService } from 'src/services/conditions.service';
// import { GameComponent } from '../game/game.component';
@Component({
  selector: 'app-drag',
  templateUrl: './drag.component.html',
  styleUrls: ['./drag.component.less'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class DragComponent implements OnInit, AfterViewInit, OnChanges {
  position_popover: string = 'top'
  info: boolean;
  link_array: any = []
  app_id: any
  nodeParams: boolean
  link: boolean

  memory: any = {
    "frequency": 2000, "expiry": 2000, "efficiency": 0, "fidelity": 0.93
  }
  popover2: string = "1.Click on component's name to modify its name." + "2.Click a component to modify its settings."
  cc: any = []
  nodeWithKey: any
  paramsSet = new Map()
  topology: any
  appSettings: any
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
  game: boolean
  graphModel: any
  nodes: any = []
  selectedNode1: any
  displayPosition: boolean;
  items: MenuItem[];
  position: string;
  node: any = {};
  toolbox = this.fb.group({
    'name': new FormControl(''),
    'noOfMemories': new FormControl('500'),
    'memoryFidelity': new FormControl('0.98'),
    'attenuation': new FormControl('0.00001'),
    'distance': new FormControl('70')
  })
  public selectedNode: any;
  public selectedLink: any
  visibleSideNav: boolean
  public myDiagram: go.Diagram
  public myPalette: go.Palette
  public linksModel: go.GraphLinksModel
  public myRotate: go.RotatingTool
  public savedModel1: any = {
    class: "go.GraphLinksModel",
    linkFromPortIdProperty: "fromPort",
    linkToPortIdProperty: "toPort",
    nodeDataArray: [],
    linkDataArray: []
  }
  public savedModel: any = {
    class: "go.GraphLinksModel",
    linkFromPortIdProperty: "fromPort",
    linkToPortIdProperty: "toPort",
    nodeDataArray: [{ figure: "Ellipse", fill: "#00AD5F", key: -1, loc: "790 230", text: "node1", __gohashid: 1282 },
    { figure: "Circle", fill: "#CE0620", key: -2, loc: "390 100", text: "node2", __gohashid: 2055 },
    { figure: "Circle", fill: "#CE0620", key: -3, loc: "1160 100", text: "node3", __gohashid: 3087 },
    { figure: "Circle", fill: "#CE0620", key: -4, loc: "790 460", text: "node4", __gohashid: 4088 }],
    linkDataArray: [{
      "points": {
        "__gohashid": 4712,
        "P": true,
        "n": [{ "x": 441, "y": 100 }, { "x": 451, "y": 100 }, { "x": 590, "y": 100 }, { "x": 590, "y": 230 }, { "x": 729, "y": 230 }, { "x": 739, "y": 230 }], "F": 8, "Gb": null, "Ti": null
      },
      "__gohashid": 4047,
      "from": -2,
      "to": -1
    },
    {
      "points": {
        "__gohashid": 13600,
        "P": true,
        "n": [
          {
            "x": 790,
            "y": 281
          },
          {
            "x": 790,
            "y": 291
          },
          {
            "x": 790,
            "y": 345
          },
          {
            "x": 800,
            "y": 345
          },
          {
            "x": 800,
            "y": 399
          },
          {
            "x": 800,
            "y": 409
          }
        ],
        "F": 8,
        "Gb": null,
        "Ti": null
      },
      "__gohashid": 12833,
      "from": -1,
      "to": -4
    },
    {
      "points": {
        "__gohashid": 19084,
        "P": true,
        "n": [
          {
            "x": 841,
            "y": 230
          },
          {
            "x": 851,
            "y": 230
          },
          {
            "x": 975,
            "y": 230
          },
          {
            "x": 975,
            "y": 100
          },
          {
            "x": 1099,
            "y": 100
          },
          {
            "x": 1109,
            "y": 100
          }
        ],
        "F": 8,
        "Gb": null,
        "Ti": null
      },
      "__gohashid": 17651,
      "from": -1,
      "to": -3
    }
    ]
  }
  links: any = [];
  application: any;
  constructor(private fb: FormBuilder, private con: ConditionsService, private messageService: MessageService, private apiService: ApiServiceService, private _route: Router, private modal: NgbModal) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.myDiagram.nodes)
  }
  ngAfterViewInit(): void {
    this.myDiagram.addDiagramListener("ChangedSelection", function (event) {
      console.log("selection changed")
    })
    var nodesarray = this.savedModel.nodeDataArray
    let linkArray = this.savedModel.linkDataArray
    var nodereq
    console.log(nodesarray)
    var nodelength = nodesarray.length
    // console.log(linkArray)
    for (var i = 0; i < nodelength; i++) {
      var type;
      if (nodesarray[i].figure == "Ellipse") {
        type = 'service'
      } else {
        type = 'end'
      }
      console.log(type)
      var namevar = {
        0: 'node1',
        1: 'node2',
        2: 'node3',
        3: 'node4'
      }
      nodereq = {
        "Name": namevar[i],
        "Type": type,
        "noOfMemory": Number(this.toolbox.get('noOfMemories')?.value),
        "memory": this.memory
      }

      this.nodes.push(nodereq)
    }
    let array = []
    var linkreq
    let chunk = 2;
    for (var i = 0; i < linkArray.length; i++) {
      var from = linkArray[i].from
      var to = linkArray[i].to
      let positiveFromkey = from.toString().substring(1)
      // console.log(positivekey * 2)
      let positivetoKey = to.toString().substring(1)
      var fromKey = positiveFromkey - 1;
      let toKey = positivetoKey - 1;
      array.push(this.nodes[fromKey].Name)
      array.push(this.nodes[toKey].Name)
      console.log(array)
      linkreq = {
        Nodes: array,
        Attenuation: Number(this.toolbox.get('attenuation')?.value),
        Distance: Number(this.toolbox.get('distance')?.value),
      }
      array = []
      this.links.push(linkreq)
    }
    this.topology = {
      nodes: this.nodes,
      quantum_connections: this.links,
      classical_connections: this.cc,
    }
    var cc = []
    for (var i = 0; i < this.nodes.length; i++) {
      for (var j = 0; j < this.nodes.length; j++) {
        cc.push([this.nodes[i].Name, this.nodes[j].Name]);
      }
    }
    if (cc.length != 0) {
      var distance
      var delay
      for (var i = 0; i < cc.length; i++) {
        if (cc[i][0] == cc[i][1]) {
          distance = 0;
          delay = 0;
        } else {
          distance = 1000;
          delay = 1000000000;
        }
        let ccreq = {
          Nodes: cc[i],
          Delay: delay,
          Distance: distance
        }
        this.cc.push(ccreq)
      }
    }
    console.log(this.links)
    console.log(this.nodes)
    this.load()
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
        $(go.Shape, { fill: null, stroke: "", strokeWidth: 0, strokeDashArray: [2, 2] }),
        $(go.Placeholder)
      );

    var nodeResizeAdornmentTemplate =
      $(go.Adornment, "Spot",
        { locationSpot: go.Spot.Right },
        $(go.Placeholder),
      );

    var nodeRotateAdornmentTemplate =
      $(go.Adornment,
        { locationSpot: go.Spot.Center, locationObjectName: "CIRCLE" },
        $(go.Shape, "Circle", { name: "CIRCLE", cursor: "pointer", desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        $(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
      );
    // var myToolTip = $(go.HTMLInfo, {
    //   show: showToolTip,
    //   hide: hideToolTip
    // });
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
                $(go.TextBlock, "Delete"),
                {
                  click: (e: go.InputEvent, obj: go.GraphObject) => { this.showProperties(e, obj) },
                })
            )
        },
        { locationSpot: go.Spot.Center },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
        { resizable: false, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
        { rotatable: false, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
        new go.Binding("angle").makeTwoWay(),
        // the main object is a Panel that surrounds a TextBlock with a Shape
        $(go.Panel, "Auto",
          {
            name: "PANEL",
            // toolTip: myToolTip
          },
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
            wrap: go.TextBlock.WrapDesiredSize,
            editable: false
          },
          new go.Binding("text", "text").makeTwoWay()),
      );
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
          { isPanelMain: true, fill: null, stroke: "", strokeWidth: 0 })  // use selection object's strokeWidth
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
            console.log(obj);
            // this.linkClicked(e, obj)
          },
          contextMenu:
            $("ContextMenu",
              $("ContextMenuButton",
                $(go.TextBlock, "Delete"),
                {
                  click: (e: go.InputEvent, obj: go.GraphObject) => { this.deleteLink(e, obj) },
                })
            )
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, strokeWidth: 2 },
          new go.Binding("stroke", "color")),
        $(go.TextBlock, {
          segmentOffset: new go.Point(0, -10),
          editable: false,
        },
          // centered multi-line text
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
              editable: false
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
                  ),
              },
              {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4,
                click: (e: any, obj: any) => {
                  console.log("palette")
                },
              },
              new go.Binding("points"),
              $(go.Shape,  // the link path shape
                { isPanelMain: true, strokeWidth: 2 }),
              $(go.Shape,  // the arrowhead
                { toArrow: "Standard", stroke: null, strokeWidth: 2 }),
              $(go.TextBlock, { segmentOffset: new go.Point(0, -10) },  // centered multi-line text
                new go.Binding("text", "text")),
              new go.Binding('fill', 'color'),
            ),
          model: new go.GraphLinksModel([  // specify the contents of the Palette
            { text: "Service", figure: "Ellipse", fill: "#00AD5F" },
            { text: "End", figure: "Circle", fill: "#CE0620" },

          ], [
            // the Palette also has a disconnected Link, which the user can drag-and-drop
            { points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
            // { color: "grey", text: "VC", points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
          ])
        });
    this.app_id = localStorage.getItem('app_id')
    this.application = localStorage.getItem('app')

    this.e2e = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'startTime': new FormControl('1'),
      'size': new FormControl('2'),
      // 'priority': new FormControl(''),
      'targetFidelity': new FormControl('0.98'),
      'timeout': new FormControl('1')
    })
    this.e91 = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'keyLength': new FormControl('5')
    })
    this.ip1 = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'message': new FormControl('10011100')
    })
    this.pingPong = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'sequenceLength': new FormControl('2'),
      'message': new FormControl('10011100')
    })
    this.firstqsdc = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'sequenceLength': new FormControl('3'),
      'key': new FormControl('0101110111')
    })
    this.teleportation = this.fb.group({
      'sender': new FormControl(''),
      'receiver': new FormControl(''),
      'amplitude1': new FormControl('0.70710678118+0j'),
      'amplitude2': new FormControl('0-0.70710678118j')
    })
    this.ghz = this.fb.group({
      'node1': new FormControl(''),
      'node2': new FormControl(''),
      'node3': new FormControl(''),
      'middlenode': new FormControl('')
    })
    this.showBottomCenter()
    // this.load()
  }
  info_demo() {
    this.info = true;
  }
  selected(): any {
    console.log("selected")
  }

  linkClicked(e: any, obj: any) {
    var link = obj.part;
    console.log(link)
    this.selectedLink = link.data
    console.log(this.selectedLink)
    this.savedModel = this.myDiagram.model;
    this.visibleSideNav = true
    //console.log("hello")
    this.nodeParams = false;
    this.link = true
  }
  save() {
    this.app_id = localStorage.getItem('app_id')
    //console.log(this.app_id)
    this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position);
    this.savedModel = this.myDiagram.model;
    var memory = [];
    console.log(this.savedModel.nodeDataArray)
    this.graphModel = this.myDiagram.model.nodeDataArray
    console.log(this.savedModel.nodeDataArray.length)
    console.log(this.nodes.length)
    if (this.graphModel.length != this.nodes.length) {
      alert("Nodes settings are not set properly!!");
      return
    }
    this.links = []
    var linkarray: any[]
    if (this.savedModel.linkDataArray.length > this.links.length) {
      for (var i = 0; i < this.savedModel.linkDataArray.length; i++) {
        linkarray = []
        var from = this.myDiagram.model.findNodeDataForKey(this.savedModel.linkDataArray[i].from).text
        var to = this.myDiagram.model.findNodeDataForKey(this.savedModel.linkDataArray[i].to).text
        linkarray.push(from);
        linkarray.push(to);
        let linkData = {
          Nodes: linkarray,
          Attenuation: 0.00001,
          Distance: 70
        }
        this.links.push(linkData)
      }
    }


    this.position = 'bottom';
    this.displayPosition = true;

    console.log(this.graphModel)
    console.log(this.savedModel.linkDataArray)
    console.log(this.links)
    //console.log(this.graphModel)
  }
  add() {
    var nodereq;
    var linkreq;
    var cc = []
    this.cc = []
    this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position);
    console.log(this.myDiagram.model)
    // this.myDiagram.model = new go.GraphLinksModel(this.savedModel.nodeDataArray, this.savedModel.linkDataArray)
    this.savedModel = this.myDiagram.model;
    var nodesarray = this.savedModel.nodeDataArray
    let linkArray = this.savedModel.linkDataArray
    console.log(nodesarray)
    var nodelength = nodesarray.length
    console.log(linkArray)
    console.log(this.nodes)
    if (this.nodeParams) {
      let type;
      console.log(this.toolbox.get('noOfMemories')?.value)
      console.log(nodesarray)
      var key = this.selectedNode.key
      console.log(key)
      let positivekey = key.toString().substring(1)
      var indexFromKey = positivekey - 1
      if (this.selectedNode.figure === "Ellipse") {
        type = 'service'
      } else {
        type = 'end'
      }
      var node = this.myDiagram.model.findNodeDataForKey(key)
      this.myDiagram.model.startTransaction('modified property');
      this.myDiagram.model.set(node, "text", this.toolbox.get('name')?.value);
      this.myDiagram.model.commitTransaction('modified property');
      // this.myDiagram.model.nodeDataArray.splice(indexFromKey, 1, this.savedModel.nodeDataArray[indexFromKey])
      // this.myDiagram.model = go.Model.fromJson(this.savedModel);
      console.log(this.selectedNode.text)
      nodereq = {
        "Name": this.selectedNode.text,
        "Type": type,
        "noOfMemory": Number(this.toolbox.get('noOfMemories')?.value),
        "memory": this.memory
      }
      localStorage.setItem("selected_node", this.selectedNode.key)
      console.log(this.savedModel.nodeDataArray)
      // console.log(this.savedModel.nodeDataArray[indexFromKey].text)
      // console.log(this.toolbox.get('name')?.value)
      this.savedModel.nodeDataArray[indexFromKey].text = this.toolbox.get('name')?.value
      // console.log(this.savedModel.nodeDataArray[indexFromKey].text)
      var allNodes = this.myDiagram.nodes
      var nodeLinkStr

      // while (allNodes.next()) {
      //   var i = 0;
      //   i += 1;
      //   var node
      //   node = allNodes.value
      //   nodeLinkStr += node.data.text; //node text
      //   var linkIt = node.findLinksOutOf();
      //   console.log(i + ":" + linkIt)
      //   while (linkIt.next()) { // for each link get the link text and toNode text
      //     var link = linkIt.value;
      //     nodeLinkStr += link.data.text;
      //     console.log(nodeLinkStr)
      //     nodeLinkStr += link.toNode.data.text;
      //     console.log(nodeLinkStr)
      //   }
      // }
      if (this.nodes[indexFromKey] == null)
        this.nodes.splice(indexFromKey, 0, nodereq)
      if (this.nodes[indexFromKey] != null) {
        this.nodes.splice(indexFromKey, 1, nodereq)
      }
      console.log(this.nodes)
      console.log(indexFromKey)
      // this.myDiagram.model = go.Model.fromJson(this.savedModel);

      console.log(this.myDiagram.model)
      // this.loadDiagramProperties();
      // console.log("ok");

      // this.myDiagram.model = go.Model.fromJson(this.savedModel);

      // console.log(this.myDiagram.model)
      // var pos = this.myDiagram.model.modelData.position;
      // if (pos) this.myDiagram.initialPosition = go.Point.parse(pos);
    }
    if (this.link) {
      let array = []
      var from = this.selectedLink.from
      var to = this.selectedLink.to
      if (from == null || to == null)
        alert("Connections are not proper.Please check!!")
      else
        if (from !== null && to != null) {
          let positiveFromkey = from.toString().substring(1)
          let positivetoKey = to.toString().substring(1)
          var fromKey = positiveFromkey - 1;
          let toKey = positivetoKey - 1;
          array.push(this.nodes[fromKey].Name)
          array.push(this.nodes[toKey].Name)
          linkreq = {
            Nodes: array,
            Attenuation: Number(this.toolbox.get('attenuation')?.value),
            Distance: Number(this.toolbox.get('distance')?.value),
          }
          console.log(typeof (linkreq.Distance))
          this.links.push(linkreq)
          array = []
        }
    }
    if (this.nodes.length != 0) {
      for (var i = 0; i < this.nodes.length; i++) {
        for (var j = 0; j < this.nodes.length; j++) {
          cc.push([this.nodes[i].Name, this.nodes[j].Name]);
        }
      }
      if (cc.length != 0) {
        var distance
        var delay
        for (var i = 0; i < cc.length; i++) {
          if (cc[i][0] == cc[i][1]) {
            distance = 0;
            delay = 0;
          } else {
            distance = 1000;
            delay = 1000000000;
          }
          let ccreq = {
            Nodes: cc[i],
            Delay: delay,
            Distance: distance
          }
          this.cc.push(ccreq)
        }
      }
    }
    this.topology = {
      nodes: this.nodes,
      quantum_connections: this.links,
      classical_connections: this.cc,
    }
    console.log(this.topology)
    console.log(this.nodes)
    console.log(this.links)
    this.visibleSideNav = false
  }
  showBottomCenter() {
    // console.log("hi")
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message Content' });
  }
  parameters() {
    this.app_id = this.con.getapp_id()
    console.log(this.app_id)
    console.log(typeof (this.app_id))
    this.blocked = true
    this.displayPosition = false
    var token = localStorage.getItem('access')
    // console.log(this.finalNodes)
    this.topology = {
      nodes: this.nodes,
      quantum_connections: this.links,
      classical_connections: this.cc,
    }
    switch (this.app_id) {
      case 1: this.appSettings = {
        sender: this.e91.get('sender')?.value,
        receiver: this.e91.get('receiver')?.value,
        keyLength: Number(this.e91.get('keyLength')?.value)
      }
        break;
      case 2: this.appSettings = {
        sender: this.e2e.get('sender')?.value,
        receiver: this.e2e.get('receiver')?.value,
        startTime: 1e12,
        size: this.e2e.get('size')?.value,
        priority: 0,
        targetFidelity: 0.5,
        timeout: this.e2e.get('timeout')?.value + 'e12'
      }
        break;
      case 3: this.appSettings = {
        endnode1: this.ghz.get('node1')?.value,
        endnode2: this.ghz.get('node2')?.value,
        endnode3: this.ghz.get('node3')?.value,
        middlenode: this.ghz.get('middlenode')?.value,
      }
        break;
      case 4: this.appSettings = {
        sender: this.teleportation.get('sender')?.value,
        receiver: this.teleportation.get('receiver')?.value,
        amplitude1: this.teleportation.get('amplitude1')?.value,
        amplitude2: this.teleportation.get('amplitude2')?.value
      }
        break;
      case 5:
        this.appSettings = {
          sender: this.firstqsdc.get('sender')?.value,
          receiver: this.firstqsdc.get('receiver')?.value,
          sequenceLength: this.firstqsdc.get('sequenceLength')?.value,
          key: this.firstqsdc.get('key')?.value
        }
        break;
      case 6:
        this.appSettings = {
          sender: this.ip1.get('sender')?.value,
          receiver: this.ip1.get('receiver')?.value,
          message: this.ip1.get('message')?.value
        }
        break;
      case 7:
        console.log(this.pingPong.get('sender')?.value)
        this.appSettings = {
          sender: this.pingPong.get('sender')?.value,
          receiver: this.pingPong.get('receiver')?.value,
          sequenceLength: this.pingPong.get('sequenceLength')?.value,
          message: this.pingPong.get('message')?.value,
        }
        break;
    }
    console.log(this.appSettings)
    var req = {
      "application": this.con.getapp_id(),
      "topology": this.topology,
      "appSettings": this.appSettings
    }
    this.apiService.runApplication(req).subscribe((result: any) => {
      this.spinner = true;
      console.log(this.spinner)
      this.con.setResult(result)
    }, (error) => {
      this.spinner = false
      console.error(error)
    }, () => {
      this.spinner = false
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
          "panningTool.isEnabled": false
        });
    return myDiagram;
  }
  load() {
    //var savedModel = document.getElementById("mySavedModel") as HTMLInputElement
    // this.myDiagram.model.nodeDataArray = this.savedModel.nodeDataArray;
    this.myDiagram.model = go.Model.fromJson(this.savedModel)

    console.log(this.myDiagram.model)
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
    this.selectedNode = node.data
    console.log(this.selectedNode.text)
    console.log(node.data);
    this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position);
    this.savedModel = this.myDiagram.model;
    // if (node.data.text == 'Service' || node.data.text == 'End') {
    //   alert("Configure your Node Name inorder to modify its settings.")
    // }
    // else {
    // this.saveDiagramProperties();
    this.graphModel = this.myDiagram.model.nodeDataArray
    console.log(this.savedModel.linkDataArray)

    console.log(this.selectedNode);
    var key = this.selectedNode.key
    if (this.nodes.length != 0) {
      let positivekey = key.toString().substring(1)
      // console.log(positivekey * 2)
      var indexFromKey = positivekey - 1
      console.log(indexFromKey)
      console.log(this.nodes.length)
      let node
      if (this.nodes.length > indexFromKey) {
        node = this.nodes[indexFromKey]
        console.log(node)
        console.log(node.noOfMemory)
        this.toolbox.get('name')?.patchValue(node.Name)
        this.toolbox.get('noOfMemories')?.patchValue(node.noOfMemory)
      }
      else {
        this.toolbox.get('name')?.patchValue('');
        this.toolbox.get('noOfMemories')?.patchValue('500')
      }
    }

    this.visibleSideNav = true
    this.nodeParams = true
    this.link = false
  }
  reload() {
    this.savedModel = this.savedModel1;
    this.nodes = []
    this.links = []
    this.load();
  }
  deleteLink(e: any, obj: any) {
    console.log(obj)
    console.log(obj.part)
    var link = obj.part.data
    var link1 = this.myDiagram.findLinkForData(link)
    this.myDiagram.startTransaction("remove link");
    this.myDiagram.remove(link1);
    this.myDiagram.commitTransaction("remove link");
  }
  showProperties(e: any, obj: any) {  // executed by ContextMenuButton
    console.log(obj)
    var node = obj.part.adornedPart;
    // console.log(obj.part.adornedPart)
    // console.log(node)
    var selectedNode = this.myDiagram.findNodeForKey(node.data.key)
    console.log(selectedNode)
    if (selectedNode != null) {
      this.myDiagram.startTransaction();
      this.myDiagram.remove(selectedNode);
      this.myDiagram.commitTransaction('Removed Node!')
      console.log("Removed!!")
    }
  }
  setSpinner(value: boolean) {
    this.spinner = value
  }
  getSpinner() {
    return this.spinner
  }
}
function showToolTip(obj: any, diagram: any, tool: any) {
  console.log(obj.part.data)
  var toolTipDIV = document.getElementById('toolTipDIV')!;
  var pt = diagram.lastInput.viewPoint;
  console.log(pt)
  toolTipDIV.style.left = (pt.x) - 13 + "px";
  document.getElementById('toolTipParagraph')!.textContent = "" + obj.part.data.text;
  toolTipDIV.style.display = "block";
}
function hideToolTip(diagram: any, tool: any) {
  var toolTipDIV = document.getElementById('toolTipDIV')!;
  toolTipDIV.style.display = "none";
}
function showSmallPorts(node: any, show: any) {
  node.ports.each(function (port: any) {
    if (port.portId !== "") {  //don't change the default port, which is the big shape
      port.fill = show ? "rgba(0,0,0,.3)" : null;
    }
  });
}
export class selectedNode {
  name: string;
  key: string;
  figure: string;
}
