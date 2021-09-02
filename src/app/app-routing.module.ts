import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'Start', pathMatch: 'full' },
  { path: 'home/:order/:level', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'Start', loadChildren: () => import('./start/start.module').then(m => m.StartPageModule) },
  { path: 'Intro', loadChildren: () => import('./intro/intro.module').then(m => m.IntroPageModule) },
  { path: 'Privacy', loadChildren: () => import('./privacy/privacy.module').then(m => m.PrivacyPageModule) },
  { path: 'Terms', loadChildren: () => import('./terms/terms.module').then(m => m.TermsPageModule) },
  { path: 'About', loadChildren: () => import('./about/about.module').then(m => m.AboutPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
