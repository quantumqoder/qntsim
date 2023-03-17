import { ViewEncapsulation } from '@angular/core';
import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ApiServiceService } from 'src/services/api-service.service';
import { ConditionsService } from 'src/services/conditions.service';
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ResultsComponent implements OnInit, AfterViewInit {
  performance: any
  match: any = []
  alice_r: any
  app_id: any
  items: MenuItem[];
  activeItem: MenuItem;
  data: any
  keyGen: boolean
  keyBits: boolean
  cols: any
  info1: boolean;
  info2: boolean;
  infoqsdc: boolean;
  app: string;
  constructor(private con: ConditionsService, public api: ApiServiceService,
    private router: Router) { }
  ngAfterViewInit(): void {
  }
  ngOnInit(): void {
    this.app_id = this.con.getapp_id()

    if (!this.app_id) {
      this.router.navigate(['/'])
    }
    this.performance = this.con.getResult().performance
    // this.performance.execution_time = this.performance.execution_time.toFixed(3);
    this.performance.latency = this.performance.latency.toFixed(3);
    this.data = this.con.getResult().application;
    if (this.app_id == 1) {
      var length = this.data.sender_basis_list.length
      for (i = 0; i < length; i++) {
        let x = this.data.sender_basis_list[i];
        let y = this.data.receiver_basis_list[i];
        if (x == y) {
          this.match.push(i);
        }
      }
      console.log(this.match)
      var senderKeys: any = []
      var receiverKeys: any = []
      for (var i = 0; i < this.data.sender_keys.length; i++) {
        senderKeys.push(this.data.sender_keys[i])
      }
      for (var i = 0; i < this.data.receiver_keys.length; i++) {
        receiverKeys.push(this.data.receiver_keys[i])
      }
      this.data.sender_keys = senderKeys.join('')
      this.data.receiver_keys = receiverKeys.join('')
    }
    else if (this.app_id == 7) {
      var alice = "Alice_r" + " "
      this.alice_r = this.data[alice]
    }

  }
  info(data: string) {
    switch (data) {
      case 'qsdct':
        // this.qsdct = true;
        break;
    }
  }
  info_1() {
    this.info2 = false;
    this.info1 = true;
  }
  info_2() {
    this.info1 = false;
    this.info2 = true;
  }
  info_qsdc() {
    this.infoqsdc = true
  }
  info_qsdc_1(data: string) {
    this.infoqsdc = true;
    this.app = data;
  }
  senderbasis(index: any) {
    var bool = this.match.includes(index)
    return bool ? "table-success" : "";
  }

}
