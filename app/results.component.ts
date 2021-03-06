import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Alerts} from './alerts.service';
import {TaigaAPIServices} from './taigaapi.service';

@Component({
  selector: 'login',
  templateUrl: 'app/results.component.html'
})

export class Results implements OnInit {

  chartObjects: Object = [];

  /**
   * ----------------------------------------------------------------------------------
   *
   */
  constructor(private taigaAPI: TaigaAPIServices, private alerts: Alerts, private router: Router) { };

  /**
   * ----------------------------------------------------------------------------------
   *
   */
  ngOnInit() {

    this.alerts.clearAlerts();

    // generate charting results through the taiga API (the first call after authentication)
    this.taigaAPI.processUsers(this, this.plotChart);

  };

  /**
   * ----------------------------------------------------------------------------------
   * Callback function on completion of processUsers()
   */
  plotChart(self: any, index: number) {
    self.chartObjects[index] = self.taigaAPI.getChartObjects(index);
  };

}
