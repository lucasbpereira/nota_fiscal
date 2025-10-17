import InvoiceProduct from "./invoiceProduct";

export default interface Invoice {
  id?: string;
  code?: string;
  status?: string;
  totalValue?: number;
  products: InvoiceProduct[];
}
