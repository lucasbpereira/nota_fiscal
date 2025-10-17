import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import Invoice from '../interfaces/invoice';
import Product from '../interfaces/product';
import { environment } from '../../environments/environment.development';
import InvoiceProduct from '../interfaces/invoiceProduct';

const API_URL = environment.API_BILLING_URL;

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  constructor(private http: HttpClient) {  }

  getOpenInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${API_URL}invoices/open`).pipe(
      catchError(error => {
        console.error('Erro ao buscar Notas Fiscais:', error);
        return throwError(() => new Error('Erro ao carregar Notas Fiscais'));
      })
    );
  }
  
  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${API_URL}invoice`, invoice).pipe(
      catchError(error => {
        console.error('Erro ao criar Notas Fiscais:', error);
        return throwError(() => new Error('Erro ao criar Notas Fiscais'));
      })
    );
  }

  updateInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${API_URL}invoices/${invoice.code}/close`, null).pipe(
      catchError(error => {
        console.error('Erro ao atualizar Notas Fiscais:', error);
        return throwError(() => new Error('Erro ao atualizar Notas Fiscais'));
      })
    );
  }

  
}
