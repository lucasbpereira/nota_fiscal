import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InvoicesService } from './invoices-service';
import Invoice from '../interfaces/invoice';

@Component({
  selector: 'app-invoices',
  imports: [],
  templateUrl: './invoices.html',
  styleUrl: './invoices.scss'
})
export class Invoices implements OnInit {

  constructor(private service: InvoicesService, private cdRef: ChangeDetectorRef) {}
  
  invoicesList: Invoice[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.error = null;

    this.service.getOpenInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        console.log('Produtos recebidos da API:', invoices);
        console.log('Tipo:', typeof invoices);
        console.log('Quantidade:', invoices.length);
        
        this.invoicesList = invoices;
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

  printInvoice(invoice: Invoice) {
    this.service.updateInvoice(invoice).subscribe({
      next: (invoices: Invoice) => {
        this.loadInvoices();
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro completo:', error);
        this.error = error.message;
        this.loading = false;
        this.cdRef.detectChanges();
      }
    })
  }
}
