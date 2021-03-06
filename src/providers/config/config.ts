import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

@Injectable()
export class ConfigProvider {
  applicationName: string = 'Minne';

  constructor(public http: Http) {
  }

  /**
   * Get the user's time zone. When null is returned, the system's default time zone should be used.
   */
  getTimeZone() {
    return 'Europe/Paris';
  }

  getLocale() {
    return 'en-US';
  }

}
