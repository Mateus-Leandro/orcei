import { Component, EventEmitter, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IItensMenuDrawer } from '../../interfaces/item-menu-drawer/item-menu-drawer.interface';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';

@Component({
  selector: 'app-sidenav-menu',
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav-menu.html',
  styleUrl: './sidenav-menu.scss',
})
export class SidenavMenu {
  @Output() closeMenu = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  menuItens: IItensMenuDrawer[] = [
    {
      router: '/stores',
      textNav: 'Lojas',
      icon: 'store',
    },
    {
      router: '/budgets',
      textNav: 'Orçamentos',
      icon: 'assignment',
    },
    {
      router: '/products',
      textNav: 'Produtos',
      icon: 'sell',
    },
    {
      router: '/customers',
      textNav: 'Clientes',
      icon: 'people',
    },
    {
      router: '/users',
      textNav: 'Usuários',
      icon: 'manage_accounts',
    },
  ];

  onItemClick() {
    this.closeMenu.emit();
  }

  logOut() {
    this.authService
      .logOut()
      .pipe()
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao realizar logout: ${err.message || err}`);
        },
      });
  }
}
