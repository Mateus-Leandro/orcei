import { Component, inject } from '@angular/core';
import { Spinner } from '../../shared/components/spinner/spinner';
import { LoadingService } from '../../core/services/loading/loading.service';

@Component({
  selector: 'app-auth-layout',
  imports: [Spinner],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  loading = inject(LoadingService).loading;
}
