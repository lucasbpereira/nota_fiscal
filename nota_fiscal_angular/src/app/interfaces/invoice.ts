import InvoiceProduct from "./invoiceProduct";

export default interface Invoice {
  id: string;
  code: number;
  totalValue: number;
  products: InvoiceProduct[];
}
