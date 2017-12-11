import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

declare var gapi;

@Component({
  selector: 'tab-import',
  templateUrl: 'tab-import.html',
})
export class TabImport {

  googleAccessToken: string = null;
  importing: boolean = true;
  importStatus: string = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private firebaseProvider: FirebaseProvider
  ) {
    firebaseProvider.getUserField('googleAccessToken').forEach(token => {this.googleAccessToken = token;});
    firebaseProvider.getUserField('importing').forEach(importing => {this.importing = !!importing;});
    firebaseProvider.getUserField('importStatus').forEach(importStatus => {this.importStatus = importStatus;});    
  }

  importGoogleCal() {
    this.firebaseProvider.addJob('import', {googleAccessToken: this.googleAccessToken})
      .then(job => {
        this.firebaseProvider.setUserField('importing', true);
      });
  }
}
