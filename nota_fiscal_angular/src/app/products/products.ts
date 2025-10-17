import { Component } from '@angular/core';
import Product from '../interfaces/product';
import { CurrencyPipe } from '@angular/common';
import Invoice from '../interfaces/invoice';
import { Cart } from '../components/cart/cart';
import InvoiceProduct from '../interfaces/invoiceProduct';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe, Cart, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {
  productsList: Product[] = [{
    id: "dft7sd5f7s-d87sf5sd68f5sd-sd7f6s78df",
    name: 'Caneta Esferografica',
    price: 0.99,
    description: 'descrição do produto 1',
    balance: 5
  }];
  productForm!: FormGroup;
  cartItems: InvoiceProduct[] = [];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      balance: ['', [Validators.required, Validators.min(0)]]
    });
  }

  addToCart(product: Product) {
    if (product.balance > 0) {
      product.balance -= 1;
      this.productsList.find(p => p.id === product.id)!.balance = product.balance;
    } else {
      return
    }

    // this.cartItems.push({...product, balance: 1});
    if(this.cartItems.length === 0) {
      this.cartItems.push({
        id: product.id,
        name: product.name,
        value: product.price,
        amount: 1
      });
      return;
    } else {
      this.cartItems.map(item => {
          if (item.id === product.id) {
            item.amount += 1;
          } else {
            this.cartItems.push({
              id: product.id,
              name: product.name,
              value: product.price,
              amount: 1
            });
          }
      })
    }
  }

   onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = {
        ...this.productForm.value
      };

      this.productsList.push(newProduct);
      this.onReset();

      console.log('Produto adicionado:', newProduct);
    } else {
      this.markFormGroupTouched();
    }
  }

  onReset(): void {
    this.productForm.reset();
  }

  markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }
}
