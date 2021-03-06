import {Component, OnInit} from '@angular/core';
import {Inject} from '@angular/core';
import {Headers, RequestOptions} from '@angular/http';
import {Router} from '@angular/router';

import {Alerts} from './alerts.service';
import {Dlg} from './dlg.service';
import {DateTimeServices} from './datetime.service';
import {TaigaAPIServices} from './taigaapi.service';
import {AppDetailsServices} from './app.details.service';

@Component({
  selector: 'login',
  templateUrl: 'app/login.component.html',
})

export class Login implements OnInit {

  private dlgModel: any = null;
  private checkModel: any = null;

  private appVersion: any = null;

  private dtStart: Date = null;
  private dtEnd: Date = null;
  private dtMinDate: Date = null;

  /**
   * ----------------------------------------------------------------------------------
   */
  constructor(private appDetails: AppDetailsServices, private taigaAPI: TaigaAPIServices, private alerts: Alerts, private dlg: Dlg, private dt: DateTimeServices, private router: Router) {

    this.dlgModel = dlg.getDlgModel();
    this.checkModel = dlg.getCheckModel();

    dt.setStartMonth();
    this.dtStart = dt.getStartDate();
    this.dtEnd = dt.getEndDate();

    this.dlgModel.radio = '1';

    this.appDetails.getAppVersion(this, this.getVersionResults);

  };

  /**
   * ----------------------------------------------------------------------------------
   */
  ngOnInit() {

    this.alerts.clearAlerts();
    this.taigaAPI.clearAuthToken();

  };

  /**
   * ----------------------------------------------------------------------------------
   * Prevent end date from preceeding start date
   */
  onClickDateStart() {

    this.dtMinDate = this.dtStart;

    if (this.dtEnd < this.dtMinDate) {
      this.dtEnd = this.dtStart;
    }

  };

  /**
   * ----------------------------------------------------------------------------------
   * Reset dialog state
   */
  onClickReset() {

    this.dlg.resetModels();
    this.dtStart = this.dt.getStartDate();
    this.dtEnd = this.dt.getEndDate();

  };

  /**
   * ----------------------------------------------------------------------------------
   * Process dialog on OK
   */
  onClickOK() {

    var startDate = this.dt.toTaigaFormat(this.dtStart);

    // make sure end date includes entire time of day
    this.dtEnd.setHours(23, 59, 59, 999);

    var endDate = this.dt.toTaigaFormat(this.dtEnd);
    var users = [];

    // add users
    for (var key in this.checkModel) {
      if (this.checkModel[key]) {
        users.push(key);
      }
    }

    // set taiga object used in most of the taiga API calls
    this.taigaAPI.setTaigaParams({
      website: this.dlgModel.projecturl,        // the taiga website where projects exist
      projectName: this.dlgModel.projectname,   // project name
      adminUsername: this.dlgModel.username,    // project user with admin permissions (to access task details)
      adminPassword: this.dlgModel.password,    // project user password
      startDate: startDate,                     // user story start date range
      endDate: endDate,                         // user story end date range
      showIncompleteTasks: this.dlgModel.radio, // whether to include incomplete tasks in results
      users: users,                             // list of users to gather task summaries
    });

    // check for valid username/password (returning token), then confirm project name
    this.taigaAPI.getAuthToken(this, this.checkProjectName);

  };

  /**
   * ----------------------------------------------------------------------------------
   * Callback function on completion of getAuthToken()
   */
  checkProjectName(self: any) {
    self.taigaAPI.getProjectIDfromName(self, self.showResults);
  };

  /**
   * ----------------------------------------------------------------------------------
   * Callback function on completion of getProjectIDfromName()
   */
  showResults(self: any) {
    self.router.navigate(['/results']);
  };

  /**
   * ----------------------------------------------------------------------------------
   * Callback function on completion of getAppVersion()
   */
  getVersionResults(self: any, result: any) {
    self.appVersion = result;
  };

  /**
   * ----------------------------------------------------------------------------------
   * Validate dialog fields to enable/disable OK button
   */
  validateDlg() {

    for (var key in this.checkModel) {
      if (this.checkModel[key]) {
        return !(this.dlgModel.projectname.length && this.dlgModel.projecturl.length && this.dlgModel.username.length && this.dlgModel.password.length);
      }
    }
    return true;

  };

}
