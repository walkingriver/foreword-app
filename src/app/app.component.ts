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

      // workaround to make scroll prevent work in iOS Safari > 10
      try {
        const isPolyfill = polyfill({
          // use this to make use of the scroll behaviour
          dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
        });
        console.log('IsPolyFill: ', isPolyfill);
        window.addEventListener('touchmove', function () { }, { passive: false });
      } catch (e) { }
    });
  }
}
