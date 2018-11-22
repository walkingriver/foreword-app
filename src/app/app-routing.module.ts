import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'Start', pathMatch: 'full' },
  { path: 'home/:order', loadChildren: './home/home.module#HomePageModule' },
  { path: 'Start', loadChildren: './start/start.module#StartPageModule' },
  { path: 'Intro', loadChildren: './intro/intro.module#IntroPageModule' },
  { path: 'Privacy', loadChildren: './privacy/privacy.module#PrivacyPageModule' },
  { path: 'Terms', loadChildren: './terms/terms.module#TermsPageModule' },
  { path: 'About', loadChildren: './about/about.module#AboutPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
