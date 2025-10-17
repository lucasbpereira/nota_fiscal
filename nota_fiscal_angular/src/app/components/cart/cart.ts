import { Component, Input } from '@angular/core';
import Product from '../../interfaces/product';
import InvoiceProduct from '../../interfaces/invoiceProduct';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  @Input() cartItems: InvoiceProduct[] = [];

  get total(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.value * item.amount), 0);
  }

  generateInvoice(invoiceProducts: InvoiceProduct[]) {
    console.log('Gerar nota fiscal', invoiceProducts);
  }
}
