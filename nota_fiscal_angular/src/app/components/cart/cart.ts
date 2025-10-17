import { Component, Input } from '@angular/core';
import Product from '../../interfaces/product';
import InvoiceProduct from '../../interfaces/invoiceProduct';
import { CurrencyPipe } from '@angular/common';
import { InvoicesService } from '../../invoices/invoices-service';
import Invoice from '../../interfaces/invoice';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  @Input() cartItems: InvoiceProduct[] = [];

  constructor(private invoiceService: InvoicesService){}

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
      },
      error: (error: any) => {
        console.error('Erro completo:', error);
      }
      })
  }
}
