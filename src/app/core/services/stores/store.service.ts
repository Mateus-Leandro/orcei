import { Injectable, signal } from '@angular/core';
import { map, tap } from 'rxjs';

import { StoreRepository } from '../../repositories/store/store.repository';
import { IStoreView } from '../../models/store/store.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly SELECTED_STORE_KEY = 'selected_store';

  selectedStore = signal<IStoreView | null>(null);

  constructor(private repository: StoreRepository) {}

  findAll(page: number, limit: number, search: string) {
    return this.repository.findAll(page, limit, search);
  }

  loadSelectedStore(preloadedStores?: IStoreView[]): void {
    const cachedStore = localStorage.getItem(this.SELECTED_STORE_KEY);

    if (cachedStore) {
      this.selectedStore.set(JSON.parse(cachedStore) as IStoreView);
      return;
    }

    if (preloadedStores) {
      const first = preloadedStores[0] ?? null;
      if (first) {
        this.setSelectedStore(first);
      }
      return;
    }

    this.findAll(1, 999, '')
      .pipe(
        map((response) => response.data?.[0] || null),
        tap((store) => {
          if (store) {
            this.setSelectedStore(store);
          }
        }),
      )
      .subscribe();
  }

  setSelectedStore(store: IStoreView): void {
    localStorage.setItem(this.SELECTED_STORE_KEY, JSON.stringify(store));

    this.selectedStore.set(store);
  }

  removeSelectedStore(): void {
    localStorage.removeItem(this.SELECTED_STORE_KEY);

    this.selectedStore.set(null);
  }
}
