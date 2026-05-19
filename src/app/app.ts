import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DateFormatPipe } from './shared/pipes/date-pipe/date.pipe';
import { CurrencyPipe } from '@angular/common';
import { CurrencyFormatPipe } from './shared/pipes/currency-format/currency-format.pipe';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [
    DateFormatPipe,
    CurrencyPipe,
    CurrencyFormatPipe,
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('orcei');
}
