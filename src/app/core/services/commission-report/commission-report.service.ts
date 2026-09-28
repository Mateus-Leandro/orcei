import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { map } from 'rxjs';
import { BudgetService } from '../budget/budget.service';

interface ICommissionReportBudget {
  id: string;
  budget_number: number;
  created_at: string;
  payment_type: string | null;
  customer:
  | { name: string; surname: string | null }
  | { name: string; surname: string | null }[]
  | null;
  budgets_products: {
    quantity: number;
    unit_price: number;
    product:
    | { code: number; name: string; commission: boolean }
    | { code: number; name: string; commission: boolean }[]
    | null;
  }[];
}

interface ICommissionReportRow {
  number: number;
  createdAt: Date;
  paymentLabel: string;
  customerName: string;
  productQuantity: number;
  total: number;
  commissionBase: number;
  commission: number;
  products: {
    code: number;
    name: string;
    quantity: number;
    total: number;
    commissionable: boolean;
  }[];
}

@Injectable({ providedIn: 'root' })
export class CommissionReportService {
  constructor(private budgetService: BudgetService) { }

  generate(
    sellerName: string,
    sellerId: string,
    startDate: string,
    endDate: string,
    cashRate: number,
    installmentRate: number,
    showProducts: boolean,
  ): import('rxjs').Observable<URL> {
    return this.budgetService.findForCommissionReport(sellerId, startDate, endDate).pipe(
      map((budgets: unknown) => {
        const rows = (budgets as ICommissionReportBudget[]).map((budget) => {
          let total = 0;
          let commissionBase = 0;
          let productQuantity = 0;
          const products: ICommissionReportRow['products'] = [];

          for (const item of budget.budgets_products ?? []) {
            const itemTotal = Number(item.quantity ?? 0) * Number(item.unit_price ?? 0);
            total += itemTotal;
            productQuantity += Number(item.quantity ?? 0);
            const product = Array.isArray(item.product) ? item.product[0] : item.product;
            const commissionable = product?.commission === true;
            if (commissionable) {
              commissionBase += itemTotal;
            }
            products.push({
              code: product?.code ?? 0,
              name: product?.name ?? 'Produto removido',
              quantity: Number(item.quantity ?? 0),
              total: itemTotal,
              commissionable,
            });
          }

          const isCash = budget.payment_type === 'CASH';
          const rate = isCash ? cashRate : installmentRate;
          const customer = Array.isArray(budget.customer) ? budget.customer[0] : budget.customer;

          return {
            number: budget.budget_number,
            createdAt: new Date(budget.created_at),
            paymentLabel: isCash ? 'À vista' : 'A prazo',
            customerName: customer
              ? `${customer.name ?? ''}${customer.surname ? ` ${customer.surname}` : ''}`.trim()
              : 'Consumidor final',
            productQuantity,
            total,
            commissionBase,
            commission: (commissionBase * rate) / 100,
            products,
          } satisfies ICommissionReportRow;
        });

        return this.createPdf(
          sellerName,
          startDate,
          endDate,
          cashRate,
          installmentRate,
          rows,
          showProducts,
        );
      }),
    );
  }

  private createPdf(
    sellerName: string,
    startDate: string,
    endDate: string,
    cashRate: number,
    installmentRate: number,
    rows: ICommissionReportRow[],
    showProducts: boolean,
  ): URL {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const left = 12;
    const right = 285;
    let y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Relatório de comissão por vendedor', left, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Vendedor: ${sellerName}`, left, y);
    y += 5;
    doc.text(
      `Período: ${this.formatDateString(startDate)} a ${this.formatDateString(endDate)}`,
      left,
      y,
    );
    y += 5;
    doc.text(`À vista: ${cashRate}%    A prazo: ${installmentRate}%`, left, y);
    y += 8;

    const columns = [
      { label: 'Orçamento', x: 12, align: 'left' as const },
      { label: 'Criação', x: 38, align: 'left' as const },
      { label: 'Cliente', x: 64, align: 'left' as const },
      { label: 'Qtd. produtos', x: 137, align: 'right' as const },
      { label: 'Pagamento', x: 152, align: 'left' as const },
      { label: 'Total', x: 211, align: 'right' as const },
      { label: 'Base comissão', x: 251, align: 'right' as const },
      { label: 'Comissão', x: 285, align: 'right' as const },
    ];

    const drawTableHeader = () => {
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

    drawTableHeader();
    let totalValue = 0;
    let totalCommissionBase = 0;
    let totalCommission = 0;

    for (const row of rows) {
      const requiredSpace = 5 + (showProducts ? row.products.length * 4 : 0);
      if (y + requiredSpace > 178 && y > 60) {
        doc.addPage();
        y = 16;
        drawTableHeader();
      }

      totalValue += row.total;
      totalCommissionBase += row.commissionBase;
      totalCommission += row.commission;

      doc.text(String(row.number), columns[0].x, y);
      doc.text(this.formatDate(row.createdAt), columns[1].x, y);
      doc.text(this.truncate(doc, row.customerName, 62), columns[2].x, y);
      doc.text(this.formatNumber(row.productQuantity), columns[3].x, y, { align: 'right' });
      doc.text(row.paymentLabel, columns[4].x, y);
      doc.text(this.formatCurrency(row.total), columns[5].x, y, { align: 'right' });
      doc.text(this.formatCurrency(row.commissionBase), columns[6].x, y, { align: 'right' });
      doc.text(this.formatCurrency(row.commission), columns[7].x, y, { align: 'right' });
      y += 5;

      if (showProducts) {
        for (const product of row.products) {
          if (y > 185) {
            doc.addPage();
            y = 16;
            drawTableHeader();
            doc.setFontSize(8);
            doc.text(`Orçamento ${row.number} - produtos (continuação)`, left, y);
            y += 5;
          }

          doc.setTextColor(95, 95, 95);
          const description = `|${product.code} - ${product.name}`;
          doc.text(`  ${this.truncate(doc, description, 64)}`, columns[2].x, y);
          doc.text(this.formatNumber(product.quantity), columns[3].x, y, { align: 'right' });
          doc.text(this.formatCurrency(product.total), columns[5].x, y, { align: 'right' });
          if (product.commissionable) {
            doc.setTextColor(0, 128, 0);
          } else {
            doc.setTextColor(204, 0, 0);
          }
          doc.text(product.commissionable ? 'Comissionável' : 'Sem comissão', columns[6].x, y, {
            align: 'right',
          });
          doc.setTextColor(0, 0, 0);
          y += 4;
        }
      }
    }

    if (y > 175) {
      doc.addPage();
      y = 16;
    }
    doc.setLineWidth(0.3);
    doc.line(left, y, right, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Orçamentos: ${rows.length}`, left, y);
    y += 6;
    doc.text(`Total dos orçamentos: ${this.formatCurrency(totalValue)}`, left, y);
    y += 5;
    doc.text(`Base comissionável: ${this.formatCurrency(totalCommissionBase)}`, left, y);
    y += 5;
    doc.text(`Total de comissão: ${this.formatCurrency(totalCommission)}`, left, y);

    return doc.output('bloburl');
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  private truncate(doc: jsPDF, text: string, maxWidth: number): string {
    if (doc.getTextWidth(text) <= maxWidth) return text;
    let result = text;
    while (result.length > 1 && doc.getTextWidth(`${result}…`) > maxWidth) {
      result = result.slice(0, -1);
    }
    return `${result}…`;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  private formatDateString(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}
