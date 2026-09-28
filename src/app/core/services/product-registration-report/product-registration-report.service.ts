import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Observable, map, of, switchMap } from 'rxjs';
import { IProductStoreReportRow } from '../../models/product/product.model';
import { IStoreView } from '../../models/store/store.model';
import { ProductService } from '../product/product.service';

@Injectable({ providedIn: 'root' })
export class ProductRegistrationReportService {
  private readonly pageSize = 1000;

  constructor(private productService: ProductService) {}

  generate(store: IStoreView): Observable<URL> {
    return this.loadPage(1, [], store.id).pipe(map((products) => this.createPdf(products, store)));
  }

  private loadPage(
    page: number,
    products: IProductStoreReportRow[],
    storeId: string,
  ): Observable<IProductStoreReportRow[]> {
    return this.productService.findForStoreRegistrationReport(page, this.pageSize, storeId).pipe(
      switchMap((response) => {
        const allProducts = [...products, ...(response.data ?? [])];
        return (response.data?.length ?? 0) === this.pageSize
          ? this.loadPage(page + 1, allProducts, storeId)
          : of(allProducts);
      }),
    );
  }

  private createPdf(products: IProductStoreReportRow[], store: IStoreView): URL {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const left = 12;
    const right = 285;
    let y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Relatório de cadastro de produtos', left, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Loja: ${store.name}`, left, y);
    doc.text(`Gerado em: ${new Intl.DateTimeFormat('pt-BR').format(new Date())}`, 130, y);
    doc.text(`Produtos: ${products.length}`, right, y, { align: 'right' });
    y += 7;

    const columns = [
      { label: 'Código', x: 12, align: 'left' as const },
      { label: 'Produto', x: 32, align: 'left' as const },
      { label: 'Unidade', x: 120, align: 'left' as const },
      { label: 'Fracionado', x: 140, align: 'left' as const },
      { label: 'Comissão', x: 166, align: 'left' as const },
      { label: 'Custo', x: 198, align: 'right' as const },
      { label: 'Margem praticada', x: 226, align: 'right' as const },
      { label: 'Preço de venda', x: 258, align: 'right' as const },
    ];

    const drawHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      columns.forEach((column) => doc.text(column.label, column.x, y, { align: column.align }));
      y += 2;
      doc.setLineWidth(0.3);
      doc.line(left, y, right, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    };

    drawHeader();

    for (const product of products) {
      const barcodes = product.barcodes.join(', ') || '—';
      const rowHeight = product.barcodes.length ? 9 : 5;
      if (y + rowHeight > 195) {
        doc.addPage();
        y = 16;
        drawHeader();
      }

      doc.text(String(product.code), columns[0].x, y);
      doc.text(this.truncate(doc, product.name, 82), columns[1].x, y);
      doc.text(product.saleUnit ?? 'UN', columns[2].x, y);
      doc.text(product.isFractional ? 'Sim' : 'Não', columns[3].x, y);
      doc.text(product.commission ? 'Sim' : 'Não', columns[4].x, y);
      doc.text(
        product.costPrice === null ? '—' : this.formatCurrency(product.costPrice),
        columns[5].x,
        y,
        { align: 'right' },
      );
      doc.text(this.formatPracticedMargin(product.costPrice, product.salePrice), columns[6].x, y, {
        align: 'right',
      });
      doc.text(
        product.salePrice === null ? '—' : this.formatCurrency(product.salePrice),
        columns[7].x,
        y,
        { align: 'right' },
      );
      y += 5;
      if (product.barcodes.length) {
        doc.setFontSize(7);
        doc.text(`Códigos de barras: ${this.truncate(doc, barcodes, 240)}`, columns[1].x, y);
        doc.setFontSize(8);
        y += 4;
      }
    }

    return doc.output('bloburl');
  }

  private truncate(doc: jsPDF, text: string, maxWidth: number): string {
    if (doc.getTextWidth(text) <= maxWidth) return text;
    let result = text;
    while (result.length > 1 && doc.getTextWidth(`${result}…`) > maxWidth) {
      result = result.slice(0, -1);
    }
    return `${result}…`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  private formatPracticedMargin(costPrice: number | null, salePrice: number | null): string {
    if (costPrice === null || salePrice === null) return '—';
    if (!costPrice) return '0%';

    const margin = ((salePrice - costPrice) / costPrice) * 100;
    return `${this.formatNumber(margin)}%`;
  }
}
