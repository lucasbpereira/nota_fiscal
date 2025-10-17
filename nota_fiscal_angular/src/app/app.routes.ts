import { Routes } from '@angular/router';
import { Products } from './products/products';
import { Invoices } from './invoices/invoices';

export const routes: Routes = [
  {
    path: 'products',
    component: Products
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'invoices',
    component: Invoices
  }
];
