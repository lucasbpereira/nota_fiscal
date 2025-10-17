package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/lucasbpereira/stock_service_api/db"
	"github.com/lucasbpereira/stock_service_api/internal/models"
)

type ErrorResponse struct {
	FailedField string `json:"failedField"`
	Tag         string `json:"tag"`
	Value       string `json:"value"`
}

func CreateProduct(c *fiber.Ctx) error {
	product := new(models.Product)

	if err := c.BodyParser(product); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product data"})
	}

	// Create a new validator instance
	validate := validator.New()

	// Validate the product
	if err := validate.Struct(product); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			var errors []ErrorResponse
			for _, err := range validationErrors {
				var el ErrorResponse
				el.FailedField = err.StructNamespace()
				el.Tag = err.Tag()
				el.Value = err.Param()
				errors = append(errors, el)
			}
			return c.Status(fiber.StatusUnprocessableEntity).JSON(errors)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Validation failed"})
	}

	var existingCount int
	checkQuery := `SELECT COUNT(*) FROM product WHERE name = $1`
	err := db.DB.QueryRow(checkQuery, product.Name).Scan(&existingCount)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error checking product existence"})
	}

	if existingCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Product with this name already exists",
		})
	}

	query := `INSERT INTO product (name, description, price, balance) VALUES ($1, $2, $3, $4) RETURNING id`
	err = db.DB.QueryRow(query, product.Name, product.Description, product.Price, product.Balance).Scan(&product.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creating product"})
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

func GetProducts(c *fiber.Ctx) error {
	var product []models.Product
	err := db.DB.Select(&product, "SELECT * FROM product ORDER BY name ASC")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error getting products"})
	}
	return c.JSON(product)
}
