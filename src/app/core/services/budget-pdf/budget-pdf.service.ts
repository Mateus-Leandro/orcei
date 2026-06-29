import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format/currency-format.pipe';
import { IBudgetView } from '../../models/budget/budget.model';
import { IStoreView } from '../../models/store/store.model';

interface IBudgetPdfData {
  generatedAt: string;
  storeName: string;
  storePhone: string;
  budgetNumber: string;
  createdAt: string;
  deliveryForecast: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalProducts: number;
  total: number;
  products: {
    code: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

/**
 * Gera o PDF do orçamento em duas vias (loja e cliente)
 */
@Injectable({
  providedIn: 'root',
})
export class BudgetPdfService {
  private readonly LEFT = 12;
  private readonly RIGHT = 198;
  private readonly CENTER = 105;
  private readonly RED: [number, number, number] = [204, 0, 0];
  private readonly currencyFormat = new CurrencyFormatPipe(new CurrencyPipe('pt-BR'));

  // Posições X (em mm) de cada coluna da tabela de produtos.
  private readonly COL = {
    code: 12,
    description: 28,
    unit: 110,
    quantity: 124,
    unitPrice: 150,
    total: 178,
  };

  generate(budget: IBudgetView, store: IStoreView | null): void {
    const data = this.buildData(budget, store);

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    this.renderVia(doc, data, 'loja', 10);
    this.cutSeparator(doc, 151);
    this.renderVia(doc, data, 'cliente', 154);

    this.openOrDownload(doc, `Orçamento_${data.budgetNumber}.pdf`);
  }

  private openOrDownload(doc: jsPDF, fileName: string): void {
    const blobUrl = doc.output('bloburl');
    const tab = window.open(blobUrl, '_blank');

    if (!tab) {
      doc.save(fileName);
    }
  }

  private buildData(budget: IBudgetView, store: IStoreView | null): IBudgetPdfData {
    const customer = budget.customer;

    const products = (budget.products ?? []).map((product) => {
      const quantity = product.quantity ?? 0;
      const unitPrice = product.unitPrice ?? 0;

      return {
        code: product.productCode != null ? String(product.productCode) : '',
        description: product.productName ?? '',
        unit: product.saleUnit?.trim() ? product.saleUnit : 'UN',
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      };
    });

    return {
      generatedAt: this.formatDateTime(new Date()),
      storeName: store?.name ?? '',
      storePhone: this.formatPhone(store?.phone),
      budgetNumber: String(budget.budgetNumber ?? 0).padStart(6, '0'),
      createdAt: this.formatDate(budget.createdAt),
      deliveryForecast: this.formatForecastDate(budget.deliveryForecast),
      customerName: budget.customerName?.trim() || 'Consumidor final',
      customerPhone: this.formatPhone(customer?.phone),
      customerAddress: customer?.address?.trim() ?? '',
      totalProducts: budget.totalProducts ?? products.length,
      total: budget.totalValue ?? products.reduce((acc, product) => acc + product.total, 0),
      products,
    };
  }

  private renderVia(doc: jsPDF, data: IBudgetPdfData, viaLabel: string, top: number): void {
    let y = top + 4;

    // Cabeçalho: identificação da via + título.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`-via ${viaLabel}-`, this.LEFT, y);
    doc.setFontSize(13);
    doc.text('ORÇAMENTO', this.CENTER, y, { align: 'center' });

    y += 2;
    this.separator(doc, y);
    y += 5.5;

    // Data de emissão / loja / telefone.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.generatedAt, this.LEFT, y);
    doc.setFont('helvetica', 'bold');
    doc.text(data.storeName, this.CENTER, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(data.storePhone, this.RIGHT, y, { align: 'right' });

    y += 2;
    this.separator(doc, y);
    y += 6;

    // Bloco de informações do orçamento e do cliente.
    doc.setFontSize(9.5);
    doc.text(`Orçamento Nº: ${data.budgetNumber}`, this.LEFT, y);
    doc.text(`Criado em: ${data.createdAt}`, this.RIGHT, y, { align: 'right' });
    y += 5;
    doc.text(`Cliente: ${data.customerName}`, this.LEFT, y);
    doc.text(`Cel: ${data.customerPhone}`, this.RIGHT, y, { align: 'right' });
    y += 5;
    doc.text(`Endereço: ${data.customerAddress}`, this.LEFT, y);
    doc.text(`Qtd. Produtos: ${data.totalProducts}`, this.RIGHT, y, { align: 'right' });

    y += 3;
    this.separator(doc, y);
    y += 4.5;

    // Cabeçalho da tabela de produtos.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CÓD.', this.COL.code, y);
    doc.text('DESCRIÇÃO', this.COL.description, y);
    doc.text('UN', this.COL.unit, y);
    doc.text('QTD', this.COL.quantity, y);
    doc.text('PR.UNIT.', this.COL.unitPrice, y);
    doc.text('PR.TOTAL', this.COL.total, y);

    y += 1.5;
    this.separator(doc, y);
    y += 4.5;

    // Linhas de produtos.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const descriptionWidth = this.COL.unit - this.COL.description - 2;
    for (const product of data.products) {
      doc.text(product.code, this.COL.code, y);
      doc.text(this.truncate(doc, product.description, descriptionWidth), this.COL.description, y);
      doc.text(product.unit, this.COL.unit, y);
      doc.text(this.formatNumber(product.quantity), this.COL.quantity, y);
      doc.text(this.formatCurrency(product.unitPrice), this.COL.unitPrice, y);
      doc.text(this.formatCurrency(product.total), this.COL.total, y);
      y += 4.2;
    }

    // Rodapé ancorado na base da via (mantém o espaçamento do modelo).
    let footerY = top + 122;
    this.separator(doc, footerY);
    footerY += 5;

    doc.setFontSize(9.5);
    const forecast = data.deliveryForecast
      ? `Previsão de entrega: ${data.deliveryForecast}`
      : 'Previsão de entrega:';
    doc.text(forecast, this.LEFT, footerY);
    doc.text(`Total: ${this.formatCurrency(data.total)}`, this.RIGHT, footerY, { align: 'right' });

    footerY += 2;
    this.separator(doc, footerY);
    footerY += 5;

    // Assinatura (esquerda) e vencimento em destaque (direita).
    doc.setFontSize(9.5);
    const signatureLabel = 'Assinatura do cliente:';
    doc.text(signatureLabel, this.LEFT, footerY);
    const signatureStart = this.LEFT + doc.getTextWidth(signatureLabel) + 1;
    doc.setLineWidth(0.2);
    doc.line(signatureStart, footerY + 0.5, 135, footerY + 0.5);

    doc.setTextColor(...this.RED);
    doc.text('Vencimento:___/___/___', this.RIGHT, footerY, { align: 'right' });

    footerY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(
      'Orçamento válido por até 30 dias. Após esse período os valores podem sofrer alterações.',
      this.LEFT,
      footerY,
    );
    doc.setTextColor(0, 0, 0);
  }

  // Linha sólida que ocupa toda a largura útil da página.
  private separator(doc: jsPDF, y: number): void {
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([], 0);
    doc.line(this.LEFT, y, this.RIGHT, y);
  }

  // Linha pontilhada de recorte, posicionada entre as duas vias.
  private cutSeparator(doc: jsPDF, y: number): void {
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.5, 1.2], 0);
    doc.line(this.LEFT, y, this.RIGHT, y);
    doc.setLineDashPattern([], 0);
  }

  private truncate(doc: jsPDF, text: string, maxWidth: number): string {
    if (doc.getTextWidth(text) <= maxWidth) {
      return text;
    }

    let result = text;
    while (result.length > 1 && doc.getTextWidth(`${result}…`) > maxWidth) {
      result = result.slice(0, -1);
    }
    return `${result}…`;
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatCurrency(value: number): string {
    return this.currencyFormat.transform(value).replace(/[\u00a0\u202f]/g, ' ');
  }

  private formatPhone(value: string | null | undefined): string {
    const digits = String(value ?? '').replace(/\D/g, '');

    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
    }

    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1)$2-$3');
    }

    return value?.trim() ?? '';
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return this.formatDmy(new Date(value));
  }

  private formatDmy(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  // delivery_forecast é DATE (YYYY-MM-DD); formata sem Date() para evitar
  // deslocamento de fuso horário.
  private formatForecastDate(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }

  private formatDateTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${this.formatDmy(date)} - ${hours}:${minutes}:${seconds}`;
  }
}
