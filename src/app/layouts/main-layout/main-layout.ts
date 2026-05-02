import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from '../../shared/components/toolbar/toolbar';
import { SidenavMenu } from '../../shared/components/sidenav-menu/sidenav-menu';

@Component({
  selector: 'app-main-layout',
  imports: [Toolbar, SidenavMenu, MatSidenavModule, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
