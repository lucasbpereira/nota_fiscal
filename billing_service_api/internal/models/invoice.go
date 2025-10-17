package models

import (
	"github.com/google/uuid"
)

type StatusNota string

const (
	StatusAberto  StatusNota = "ABERTO"
	StatusFechado StatusNota = "FECHADA"
)

type Invoice struct {
	ID         uuid.UUID        `json:"id" db:"id"`
	Code       string           `json:"code" db:"code"`
	Status     StatusNota       `json:"status" db:"status"`
	TotalValue float64          `json:"totalValue" db:"total_value"`
	Products   []InvoiceProduct `json:"products"`
	CreatedAt  string           `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt  string           `json:"updated_at,omitempty" db:"updated_at"`
}