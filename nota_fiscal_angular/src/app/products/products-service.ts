import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, catchError, throwError } from 'rxjs';
import Product from '../interfaces/product';

const API_URL = environment.API_STOCK_URL;

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  
  constructor(private http: HttpClient) {  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}products`).pipe(
      catchError(error => {
        console.error('Erro ao buscar produtos:', error);
        return throwError(() => new Error('Erro ao carregar produtos'));
      })
    );
  }
  
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${API_URL}products`, product).pipe(
      catchError(error => {
        console.error('Erro ao buscar produtos:', error);
        return throwError(() => new Error('Erro ao carregar produtos'));
      })
    );
  }
}
