package models

import (
	"github.com/google/uuid"
)

type InvoiceProduct struct {
	ID          uuid.UUID `json:"id" db:"id"`
	InvoiceCode string    `json:"invoice_code" db:"invoice_code"`
	ProductID   string    `json:"product_id" db:"product_id"`
	Amount      int       `json:"amount" db:"amount"`
	CreatedAt   string    `json:"created_at,omitempty" db:"created_at"`
}
