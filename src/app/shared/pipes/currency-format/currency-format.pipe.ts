import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number | null | undefined): string {
    return this.currencyPipe.transform(value ?? 0, 'BRL', 'symbol', '1.2-2', 'pt-BR') || 'R$ 0,00';
  }
}
