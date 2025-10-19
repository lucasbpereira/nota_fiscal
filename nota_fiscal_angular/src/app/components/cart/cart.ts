import { Component, Input } from '@angular/core';
import Product from '../../interfaces/product';
import InvoiceProduct from '../../interfaces/invoiceProduct';
import { CurrencyPipe } from '@angular/common';
import { InvoicesService } from '../../invoices/invoices-service';
import Invoice from '../../interfaces/invoice';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type SeverityType = 'success' | 'error' | 'info' | 'warn';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, ToastModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  providers: [MessageService]
})
export class Cart {
  @Input() cartItems: InvoiceProduct[] = [];

  constructor(private invoiceService: InvoicesService, private messageService: MessageService){}

  get total(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.amount), 0);
  }

  generateInvoice(invoiceProducts: InvoiceProduct[]) {
    console.log('Gerar nota fiscal', invoiceProducts);
    let invoice: Invoice = {
      products: invoiceProducts
    }

    this.invoiceService.createInvoice(invoice).subscribe({
      next: (invoice: Invoice) => {
       console.log(invoice)
       this.showMessage('success', 'Sucesso', 'A nota foi aberta!')
       this.cartItems = []
      },
      error: (error: any) => {
        console.error('Erro completo:', error);
        this.showMessage('error', 'Erro', error.error.error)
      }
      })
  }

    showMessage(severity: SeverityType, title: string, message: string): void {
    this.messageService.add({ severity: severity, summary: title, detail: message });
  }
}
