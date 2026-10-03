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
  sellerName: string;
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
  private readonly PAGE_HEIGHT = 297;
  private readonly ROW_HEIGHT = 4.2;
  // Máximo de linhas que cabem em meia folha (limitado pela via cliente).
  private readonly MAX_HALF_PAGE_ROWS = 18;
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

    if (data.products.length <= this.MAX_HALF_PAGE_ROWS) {
      // Cabe em meia folha: as duas vias ficam na mesma página.
      this.renderHalfPageVia(doc, data, 'loja', 10);
      this.cutSeparator(doc, 151);
      this.renderHalfPageVia(doc, data, 'cliente', 154);
    } else {
      // Muitos itens: cada via ocupa uma ou mais páginas inteiras.
      this.renderFullPageVia(doc, data, 'loja', false);
      this.renderFullPageVia(doc, data, 'cliente', true);
    }

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
      sellerName: budget.sellerName?.trim() ?? '',
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

  private renderHalfPageVia(doc: jsPDF, data: IBudgetPdfData, viaLabel: string, top: number): void {
    let y = this.renderHeader(doc, data, viaLabel, top);
    y = this.renderTableHeader(doc, y);

    for (const product of data.products) {
      this.renderProductRow(doc, product, y);
      y += this.ROW_HEIGHT;
    }

    // Rodapé ancorado na base da via (mantém o espaçamento do modelo).
    this.renderFooter(
      doc,
      data,
      top + (viaLabel === 'cliente' ? 118 : 122),
      viaLabel === 'cliente',
    );
  }

  private renderFullPageVia(
    doc: jsPDF,
    data: IBudgetPdfData,
    viaLabel: string,
    newPage: boolean,
  ): void {
    if (newPage) {
      doc.addPage();
    }

    const firstPage = doc.getNumberOfPages();
    const footerTop = this.PAGE_HEIGHT - 32;
    const pageBottom = this.PAGE_HEIGHT - 12;

    let y = this.renderHeader(doc, data, viaLabel, 10);
    y = this.renderTableHeader(doc, y);

    const footerLimit = footerTop - 2.5;
    data.products.forEach((product, index) => {
      const remainingRows = data.products.length - index;
      const lastRowY = y + (remainingRows - 1) * this.ROW_HEIGHT;

      // Quebra a página quando ela acaba ou quando os itens restantes terminariam
      // nesta página sem deixar espaço para o rodapé: assim eles seguem junto
      // com o rodapé na próxima página, em vez de o rodapé ficar sozinho.
      if (y > pageBottom || (y > footerLimit && lastRowY <= pageBottom)) {
        doc.addPage();
        y = this.renderHeader(doc, data, viaLabel, 10);
        y = this.renderTableHeader(doc, y);
      }
      this.renderProductRow(doc, product, y);
      y += this.ROW_HEIGHT;
    });

    this.renderFooter(doc, data, footerTop, viaLabel === 'cliente');
    this.renderPageNumbers(doc, firstPage, doc.getNumberOfPages());
  }

  // Cabeçalho completo da via; retorna o Y onde a tabela de produtos começa.
  private renderHeader(doc: jsPDF, data: IBudgetPdfData, viaLabel: string, top: number): number {
    let y = top + 4;

    // Identificação da via + título.
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
    return y + 4.5;
  }

  // Cabeçalho da tabela de produtos; retorna o Y da primeira linha.
  private renderTableHeader(doc: jsPDF, y: number): number {
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
    return y + 4.5;
  }

  private renderProductRow(
    doc: jsPDF,
    product: IBudgetPdfData['products'][number],
    y: number,
  ): void {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const descriptionWidth = this.COL.unit - this.COL.description - 2;
    doc.text(product.code, this.COL.code, y);
    doc.text(this.truncate(doc, product.description, descriptionWidth), this.COL.description, y);
    doc.text(product.unit, this.COL.unit, y);
    doc.text(this.formatNumber(product.quantity), this.COL.quantity, y);
    doc.text(this.formatCurrency(product.unitPrice), this.COL.unitPrice, y);
    doc.text(this.formatCurrency(product.total), this.COL.total, y);
  }

  private renderFooter(doc: jsPDF, data: IBudgetPdfData, top: number, showContact: boolean): void {
    let footerY = top;
    this.separator(doc, footerY);
    footerY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const sellerLabel = `Vendedor: ${data.sellerName}`;
    doc.text(sellerLabel, this.LEFT, footerY);

    const forecast = data.deliveryForecast
      ? `Previsão de entrega: ${data.deliveryForecast}`
      : 'Previsão de entrega:';
    doc.text(forecast, this.CENTER, footerY, { align: 'center' });
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

    if (showContact) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        'Precisa de um sistema como esse? Entre em contato: 31 98444-8086',
        this.RIGHT,
        top + 22,
        { align: 'right' },
      );
    }
  }

  // Numeração "Página x de y" relativa às páginas da via.
  private renderPageNumbers(doc: jsPDF, firstPage: number, lastPage: number): void {
    const total = lastPage - firstPage + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    for (let page = firstPage; page <= lastPage; page++) {
      doc.setPage(page);
      doc.text(`Página ${page - firstPage + 1} de ${total}`, this.RIGHT, 14, { align: 'right' });
    }
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
