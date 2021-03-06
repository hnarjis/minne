import { Component, ElementRef } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams, Platform } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { ConfigProvider} from '../../providers/config/config';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import * as moment from 'moment-timezone';

@IonicPage({
  name: 'add'
})
@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
})
export class AddPage {

  note: any = {'content': ''};
  isEvent: boolean;
  isTodo: boolean;
  hideTodo: boolean;

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public authProvider: AuthProvider,
    public config: ConfigProvider,
    public googleAnalytics: GoogleAnalytics,
    public platform: Platform,
  ) {
    let startDay = this.navParams.get("startDay");
    this.isTodo = !!this.navParams.get("todo");
    this.hideTodo = !!this.navParams.get("hideTodo");
    if (startDay == moment().startOf('day').format()) {
      this.note['date'] = moment();
    } else {
      this.note['date'] = moment(this.navParams.get("startDay")).add(8, 'hours');
    }
    this.note['endDate'] = moment(this.note['date']).add(1, 'hours');
    this.googleAnalytics.trackView('AddPage');
  }

  changeDate(newDate) {
    this.note.date = newDate;
    this.note['endDate'] = moment(newDate).add(1, 'hours');
  }

  saveNote() {
    // TODO: move all this note logic to a provider or something
    this.note['user'] = this.authProvider.getUser().uid;
    this.note['archived'] = !!this.note['archived'];
    var timezone = this.config.getTimeZone();
    var date = moment(this.note['date']);
    var endDate = moment(this.note['endDate']);
    if (timezone) {
      date = date.tz(timezone);
      endDate = endDate.tz(timezone);
    }
    this.note['date'] = date.format();
    this.note['endDate'] = endDate.format();
    this.note['isEvent'] = this.isEvent ? true : false;
    this.note['isTodo'] = this.isTodo ? true : false;
    this.note['isChecked'] = !!this.note['isChecked'];
    this.firebaseProvider.addItem(this.note);
    this.viewCtrl.dismiss();
  }

  dismiss() {
    this.navCtrl.pop();
  }

  navigate() {
    let location = encodeURIComponent(this.note['location']);
    this.platform.ready().then(() => {
      if (this.platform.is('core') || this.platform.is('mobileweb')) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${location}`);
      } else if (this.platform.is('ios')) {
        window.open(`maps://?q=${location}`, '_system');
      } else if (this.platform.is('android')) {
        window.open(`geo://?q=${location}`, '_system');
      };
    });
  }

}
