import { Component, inject, OnInit, signal } from '@angular/core';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { Router } from '@angular/router';
import { StoreService } from '../../../../core/services/stores/store.service';
import { IStoreView } from '../../../../core/models/store/store.model';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { StoreTable } from '../../components/store-table/store-table';

@Component({
  selector: 'app-stores',
  imports: [Spinner, CardContainer, StoreTable],
  templateUrl: './stores.html',
  styleUrl: './stores.scss',
})
export class Stores implements OnInit {
  stores = signal<IStoreView[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  constructor(
    private router: Router,
    private storeService: StoreService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadStores({
      page: 1,
      limit: 10,
    });
  }

  loadStores(event: { page: number; limit: number }, searchText: string = ''): void {
    this.storeService.findAll(event.page, event.limit, searchText).subscribe({
      next: (response: any) => {
        this.stores.set(response.data ?? []);
        this.totalItems = response.count ?? 0;
      },
      error: (err) => {
        this.notificationService.showError(`Erro ao buscar Lojas: ${err.message || err}`);
      },
    });
  }

  onSearch(value: string): void {
    this.loadStores(
      {
        page: 1,
        limit: 10,
      },
      value,
    );
  }

  navigateToStoreForm(store?: IStoreView) {
    this.router.navigate([`stores/form/${store?.id}`]);
  }
}
