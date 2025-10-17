package validator

import (
	"github.com/go-playground/validator/v10"
)

type CustomValidator struct {
	validator *validator.Validate
}

func New() *CustomValidator {
	return &CustomValidator{validator: validator.New()}
}

func (cv *CustomValidator) Validate(data interface{}) error {
	return cv.validator.Struct(data)
}

// Implement the fiber validator interface
func (cv *CustomValidator) Engine() interface{} {
	return cv.validator
}
