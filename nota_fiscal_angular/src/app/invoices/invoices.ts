import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InvoicesService } from './invoices-service';
import Invoice from '../interfaces/invoice';
import { Toast, ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type SeverityType = 'success' | 'error' | 'info' | 'warn';

@Component({
  selector: 'app-invoices',
  imports: [ToastModule],
  templateUrl: './invoices.html',
  styleUrl: './invoices.scss',
  providers:[MessageService]
})
export class Invoices implements OnInit {

  constructor(private service: InvoicesService, private cdRef: ChangeDetectorRef, private messageService: MessageService) {}
  
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
        const successMessage = `A nota foi impressa!`;
        this.showMessage('success', 'Sucesso', successMessage);
        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro completo:', error);
        this.error = error.message;
        this.loading = false;
        this.showMessage('error', 'Erro', error);
        this.cdRef.detectChanges();
      }
    })
  }

  showMessage(severity: SeverityType, title: string, message: string): void {
    this.messageService.add({ severity: severity, summary: title, detail: message });
  }
}
