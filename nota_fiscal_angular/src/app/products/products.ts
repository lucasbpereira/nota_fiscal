import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Product from '../interfaces/product';
import { CurrencyPipe } from '@angular/common';
import Invoice from '../interfaces/invoice';
import { Cart } from '../components/cart/cart';
import InvoiceProduct from '../interfaces/invoiceProduct';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from './products-service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe, Cart, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  productsList: Product[] = [];
  productForm!: FormGroup;
  cartItems: InvoiceProduct[] = [];
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private service: ProductsService, private cdRef: ChangeDetectorRef) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      balance: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
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
        product_id: product.id,
        name: product.name,
        price: product.price,
        amount: 1
      });
      return;
    } else {
      this.cartItems.map(item => {
          if (item.id === product.id) {
            item.amount += 1;
          } else {
            this.cartItems.push({
              product_id: product.id,
              name: product.name,
              price: product.price,
              amount: 1
            });
          }
      })
    }
  }

   onSubmit(): void {
    if (this.productForm.valid) {
      // const newProduct: Product = {
      //   ...this.productForm.value
      // };
      this.service.createProduct(this.productForm.value).subscribe({
      next: (product: Product) => {
        this.productsList.push(product);
        this.onReset();
        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro completo:', error);
        this.error = error.message;
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });;
      

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

  loadProducts() {
    this.loading = true;
    this.error = null;

    this.service.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log('Produtos recebidos da API:', products);
        console.log('Tipo:', typeof products);
        console.log('Quantidade:', products.length);
        
        this.productsList = products;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro completo:', error);
        this.error = error.message;
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }
}
