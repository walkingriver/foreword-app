import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'Start', pathMatch: 'full' },
  { path: 'home/:order', loadChildren: './home/home.module#HomePageModule' },
  { path: 'Start', loadChildren: './start/start.module#StartPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
