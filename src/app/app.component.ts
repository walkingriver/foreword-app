import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#C1A172');
      this.splashScreen.hide();

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
          dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
          iterationInterval: 2,
          // forceApply: true
        });
        console.log('IsPolyFill: ', isPolyfill);
        if (supportsPassive) {
          window.addEventListener('touchmove', function () { }, { passive: false });
        } else {
          window.addEventListener('touchmove', function () { });
        }
      } catch (e) { }
    });
  }


}
