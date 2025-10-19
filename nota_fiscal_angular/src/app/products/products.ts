import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Product from '../interfaces/product';
import { CurrencyPipe } from '@angular/common';
import Invoice from '../interfaces/invoice';
import { Cart } from '../components/cart/cart';
import InvoiceProduct from '../interfaces/invoiceProduct';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from './products-service';
import { MessageService } from 'primeng/api';
import { BrowserModule } from '@angular/platform-browser';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

type SeverityType = 'success' | 'error' | 'info' | 'warn';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe, Cart, ReactiveFormsModule, ToastModule, FloatLabelModule, InputTextModule, InputNumber, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  providers: [MessageService]
})
export class Products implements OnInit {
  productsList: Product[] = [];
  productForm!: FormGroup;
  productsForm: FormGroup;
  cartItems: InvoiceProduct[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private service: ProductsService, 
    private cdRef: ChangeDetectorRef, 
    private messageService: MessageService
  ) {
    // Formulário para adicionar novo produto
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      balance: ['', [Validators.required, Validators.min(0)]]
    });

    // FormArray para controlar as quantidades dos produtos na lista
    this.productsForm = this.fb.group({
      products: this.fb.array([])
    });
  }

  get productsArray(): FormArray {
    return this.productsForm.get('products') as FormArray;
  }

  // Método para obter o FormGroup de um produto específico
  getProductFormGroup(index: number): FormGroup {
    return this.productsArray.at(index) as FormGroup;
  }

  // Método para obter a quantidade de um produto específico
  getProductAmount(index: number): number {
    return this.getProductFormGroup(index).get('amount')?.value || 0;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // Inicializar o FormArray quando os produtos são carregados
  initializeProductsFormArray(): void {
    // Limpa o array existente
    while (this.productsArray.length !== 0) {
      this.productsArray.removeAt(0);
    }

    // Adiciona um FormGroup para cada produto
    this.productsList.forEach(product => {
      const productGroup = this.fb.group({
        productId: [product.id],
        amount: [0, [Validators.min(0), Validators.max(product.balance)]]
      });
      this.productsArray.push(productGroup);
    });
  }

  addToCart(product: Product, index: number): void {
    console.log(product)
    const amount = this.getProductAmount(index);
    if (amount <= 0) {
      this.showMessage('error', 'Erro', 'Selecione uma quantidade válida');
      return;
    }

    if (product.balance < amount) {
      this.showMessage('error', 'Erro', 'Quantidade solicitada maior que o estoque disponível');
      return;
    }

    // Atualiza o estoque
    product.balance -= amount;
    this.productsList.find(p => p.id === product.id)!.balance = product.balance;

    // Atualiza o validador máximo do FormArray
    this.updateMaxValidator(index, product.balance);

    // Adiciona ao carrinho
    this.addToCartItems(product, amount);

    // Reseta a quantidade no form
    this.getProductFormGroup(index).get('amount')?.setValue(0);

    this.showMessage('success', 'Sucesso', `${amount} ${product.name}(s) adicionado(s) ao carrinho`);
  }

  private addToCartItems(product: Product, amount: number): void {
    const existingItem = this.cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      existingItem.amount += amount;
    } else {
      this.cartItems.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        amount: amount
      });
    }
  }

  private updateMaxValidator(index: number, maxBalance: number): void {
    const amountControl = this.getProductFormGroup(index).get('amount');
    amountControl?.setValidators([Validators.min(0), Validators.max(maxBalance)]);
    amountControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.service.createProduct(this.productForm.value).subscribe({
        next: (product: Product) => {
          this.productsList.push(product);
          // Re-inicializa o FormArray para incluir o novo produto
          this.initializeProductsFormArray();
          this.onReset();
          const successMessage = `Você criou o produto ${product.name}`;
          this.showMessage('success', 'Sucesso', successMessage);
          this.cdRef.detectChanges();
        },
        error: (error: any) => {
          console.error('Erro completo:', error.error.error);
          this.error = error.error;
          this.loading = false;
          this.showMessage('error', 'Erro', error.error.error);
          this.cdRef.detectChanges();
        }
      });
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

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.service.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log('Produtos recebidos da API:', products);
        this.productsList = products;
        // Inicializa o FormArray após carregar os produtos
        this.initializeProductsFormArray();
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

  showMessage(severity: SeverityType, title: string, message: string): void {
    this.messageService.add({ severity: severity, summary: title, detail: message });
  }
}