package models

import (
	"github.com/google/uuid"
	_ "github.com/google/uuid"
)

type Product struct {
	ID          uuid.UUID `db:"id" json:"id"`
	Name        string    `db:"name" json:"name" validate:"required"`
	Description string    `db:"description" json:"description"`
	Price       float64   `db:"price" json:"price" validate:"gte=0"`
	Balance     int       `db:"balance" json:"balance" validate:"gte=0"`
}
