import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { UserTable } from '../../components/user-table/user-table';
import { IUserView } from '../../../../core/models/user/user.model';
import { UserService } from '../../../../core/services/user/user.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CardContainer, UserTable, Spinner],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  users = signal<IUserView[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  private currentPage = 1;
  private currentLimit = 10;
  private currentSearch = '';

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers({ page: this.currentPage, limit: this.currentLimit }, this.currentSearch);
  }

  get pageIndex(): number {
    return this.currentPage - 1;
  }

  loadUsers(event: { page: number; limit: number }, searchText: string = ''): void {
    this.currentPage = event.page;
    this.currentLimit = event.limit;
    this.currentSearch = searchText;

    this.userService.findAll(event.page, event.limit, searchText).subscribe({
      next: (response) => {
        this.users.set(response.data ?? []);
        this.totalItems = response.count ?? 0;
      },
      error: (err) => {
        this.notificationService.showError(`Erro ao buscar usuários: ${err.message || err}`);
      },
    });
  }

  onSearch(value: string): void {
    this.loadUsers({ page: 1, limit: 10 }, value);
  }

  navigateToUserForm(user?: { id?: string }): void {
    this.router.navigate([`users/form${user?.id ? `/${user.id}` : ''}`]);
  }
}
