import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
import { Plugins } from '@capacitor/core';
const { SplashScreen, StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    StatusBar.setBackgroundColor({ color: '#c1a172' });
    StatusBar.setOverlaysWebView({ overlay: false });

    SplashScreen.hide();

    // Test via a getter in the options object to see if the passive property is accessed
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function () {
          supportsPassive = true;
        }
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (e) { }

    // workaround to make scroll prevent work in iOS Safari > 10
    try {
      const isPolyfill = polyfill({
        // use this to make use of the scroll behaviour
        dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
      });
      console.log('IsPolyFill: ', isPolyfill);
      if (supportsPassive) {
        window.addEventListener('touchmove', function () { }, { passive: false });
      } else {
        window.addEventListener('touchmove', function () { });
      }
    } catch (e) { }
  }
}
