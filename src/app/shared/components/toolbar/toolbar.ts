import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IconButton } from '../icon-button/icon-button';
import { ISelectOptions, Select } from '../select/select';
import { StoreService } from '../../../core/services/stores/store.service';
import { IStoreView } from '../../../core/models/store/store.model';
import { NotificationService } from '../../../core/services/notification-service/notification.service';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, IconButton, Select],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  storeOptions: ISelectOptions<IStoreView>[] = [];

  constructor(
    public storeService: StoreService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.storeService.findAll(1, 999, '').subscribe({
      next: (response) => {
        this.storeOptions = response.data.map((store) => ({
          value: store,
          label: store.name,
        }));
        this.storeService.loadSelectedStore(response.data);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao buscar lojas: ${error.message || error}`);
      },
    });
  }

  setSelectedStore(option: ISelectOptions<IStoreView>) {
    this.storeService.setSelectedStore(option.value);
  }

  openOrCloseMenu() {
    this.toggleMenu.emit();
  }
}
