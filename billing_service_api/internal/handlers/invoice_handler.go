package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/lucasbpereira/billing_service_api/db"
	"github.com/lucasbpereira/billing_service_api/internal/models"
)

type StockUpdateRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type StockUpdateResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	FailedField string `json:"failedField"`
	Tag         string `json:"tag"`
	Value       string `json:"value"`
}

type Product struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Balance     int       `json:"balance"`
}

type CreateInvoiceRequest struct {
	Products []models.InvoiceProduct `json:"products" validate:"required,min=1,dive"`
}

type APIClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewAPIClient(baseURL string) *APIClient {
	return &APIClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func CreateInvoice(c *fiber.Ctx) error {
	var request CreateInvoiceRequest

	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parsing request: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid invoice data", "details": err.Error()})
	}

	if len(request.Products) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "At least one product is required"})
	}

	code, err := generateInvoiceCode()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error generating invoice code"})
	}

	totalValue, err := calculateInvoiceTotalValue(request.Products)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error calculating invoice total value"})
	}

	invoice := models.Invoice{
		ID:         uuid.New(),
		Code:       code,
		Status:     models.StatusAberto,
		TotalValue: totalValue,
		CreatedAt:  time.Now().Format(time.RFC3339),
		UpdatedAt:  time.Now().Format(time.RFC3339),
	}

	validate := validator.New()
	if err := validate.Struct(invoice); err != nil {
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

	tx, err := db.DB.Beginx()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error starting transaction"})
	}

	query := `INSERT INTO invoices (id, code, status, total_value, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = tx.Exec(query, invoice.ID, invoice.Code, invoice.Status, invoice.TotalValue, invoice.CreatedAt, invoice.UpdatedAt)
	if err != nil {
		tx.Rollback()
		log.Printf("Error inserting invoice: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error creating invoice", "details": err.Error()})
	}

	var invoiceProducts []models.InvoiceProduct
	productQuery := `INSERT INTO invoice_products (invoice_code, product_id, amount, created_at) VALUES ($1, $2, $3, $4) RETURNING id`

	for _, product := range request.Products {
		product.InvoiceCode = invoice.Code
		product.CreatedAt = time.Now().Format(time.RFC3339)

		var productID uuid.UUID
		err = tx.QueryRow(productQuery, product.InvoiceCode, product.ProductID, product.Amount, product.CreatedAt).Scan(&productID)
		if err != nil {
			tx.Rollback()
			log.Printf("Error inserting invoice product: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error creating invoice products", "details": err.Error()})
		}

		product.ID = productID
		invoiceProducts = append(invoiceProducts, product)
	}

	invoice.Products = invoiceProducts

	if err := tx.Commit(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error committing transaction"})
	}

	return c.Status(fiber.StatusCreated).JSON(invoice)
}

func GetOpenInvoices(c *fiber.Ctx) error {
	var invoices []models.Invoice

	err := db.DB.Select(&invoices, "SELECT * FROM invoices WHERE status = 'ABERTO' ORDER BY created_at DESC")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error getting open invoices"})
	}

	for i := range invoices {
		var invoiceProducts []models.InvoiceProduct

		err = db.DB.Select(&invoiceProducts, "SELECT * FROM invoice_products WHERE invoice_code = $1", invoices[i].Code)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error getting invoice products"})
		}

		invoices[i].Products = invoiceProducts
	}

	return c.JSON(invoices)
}

func UpdateInvoiceStatus(c *fiber.Ctx) error {
	code := c.Params("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invoice code is required"})
	}

	var invoice models.Invoice
	err := db.DB.Get(&invoice, "SELECT * FROM invoices WHERE code = $1", code)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Invoice not found"})
	}

	if invoice.Status == models.StatusFechado {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invoice is already closed"})
	}

	var invoiceProducts []models.InvoiceProduct
	err = db.DB.Select(&invoiceProducts, "SELECT * FROM invoice_products WHERE invoice_code = $1", code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching invoice products"})
	}

	query := `UPDATE invoices SET status = $1, updated_at = $2 WHERE code = $3`
	_, err = db.DB.Exec(query, models.StatusFechado, time.Now().Format(time.RFC3339), code)
	if err != nil {
		log.Printf("Error updating invoice status: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error updating invoice status"})
	}

	apiClient := NewAPIClient("http://stock_service_api:3000")
	err = apiClient.UpdateStockProducts(invoiceProducts, "/products/balance-update")
	if err != nil {
		_, rollbackErr := db.DB.Exec("UPDATE invoices SET status = $1, updated_at = $2 WHERE code = $3",
			models.StatusAberto, time.Now().Format(time.RFC3339), code)
		if rollbackErr != nil {
			log.Printf("Error rolling back invoice status: %v", rollbackErr)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Error updating stock, invoice reopened",
			"details": err.Error(),
		})
	}

	var updatedInvoice models.Invoice
	err = db.DB.Get(&updatedInvoice, "SELECT * FROM invoices WHERE code = $1", code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching updated invoice"})
	}

	updatedInvoice.Products = invoiceProducts

	return c.JSON(fiber.Map{
		"message": "Invoice successfully closed and stock updated",
		"invoice": updatedInvoice,
	})
}

func generateInvoiceCode() (string, error) {
	currentDate := time.Now().Format("20060102")

	var count int
	query := `SELECT COUNT(*) FROM invoices WHERE code LIKE $1 || '%'`
	err := db.DB.QueryRow(query, currentDate).Scan(&count)
	if err != nil {
		return "", err
	}

	nextNumber := count + 1

	log.Println(fmt.Sprintf("%s%d", currentDate, nextNumber))
	return fmt.Sprintf("%s%d", currentDate, nextNumber), nil
}

func calculateInvoiceTotalValue(invoiceProducts []models.InvoiceProduct) (float64, error) {
	totalValue := 0.0
	apiClient := NewAPIClient("http://stock_service_api:3000")

	log.Printf("Calculating total value for %d products", len(invoiceProducts))

	for i, invoiceProduct := range invoiceProducts {
		// DEBUG: Log para verificar o ProductID
		log.Printf("Processing product %d: ProductID=%+v, Type=%T", i, invoiceProduct.ProductID, invoiceProduct.ProductID)

		// Buscar produto na API
		product, err := apiClient.GetProduct(invoiceProduct.ProductID)
		if err != nil {
			log.Printf("Error getting product %s from API: %v", invoiceProduct.ProductID, err)
			return 0, fmt.Errorf("error getting product %s: %v", invoiceProduct.ProductID, err)
		}
		log.Printf("Product retrieved: Name=%s, Price=%.2f", product.Name, product.Price)

		// Calcular subtotal
		subtotal := float64(invoiceProduct.Amount) * product.Price
		totalValue += subtotal

		log.Printf("Product %d: Amount=%d, Price=%.2f, Subtotal=%.2f", i, invoiceProduct.Amount, product.Price, subtotal)
	}

	log.Printf("Total invoice value: %.2f", totalValue)
	return totalValue, nil
}

func (c *APIClient) UpdateStockProducts(products []models.InvoiceProduct, endpoint string) error {
	var stockUpdates []StockUpdateRequest
	for _, product := range products {
		stockUpdates = append(stockUpdates, StockUpdateRequest{
			ProductID: product.ProductID,
			Quantity:  product.Amount,
		})
	}

	jsonData, err := json.Marshal(stockUpdates)
	if err != nil {
		return fmt.Errorf("error marshaling stock data: %v", err)
	}

	stockServiceURL := os.Getenv("STOCK_SERVICE_URL")
	if stockServiceURL == "" {
		stockServiceURL = "http://stock_service_api:3000"
	}
	url := stockServiceURL + endpoint

	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Usa o client do APIClient em vez de criar um novo
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("error calling stock service: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error reading response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Error string `json:"error"`
		}
		if err := json.Unmarshal(body, &errorResp); err == nil && errorResp.Error != "" {
			return fmt.Errorf("stock service returned error: %s - %s", resp.Status, errorResp.Error)
		}
		return fmt.Errorf("stock service returned error: %s - %s", resp.Status, string(body))
	}

	var response struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return fmt.Errorf("error decoding stock service response: %v", err)
	}

	if !response.Success {
		return fmt.Errorf("stock service reported failure: %s", response.Message)
	}

	log.Printf("Stock successfully updated for %d products", len(products))
	return nil
}

func (c *APIClient) GetProduct(productID string) (*Product, error) {
	stockServiceURL := os.Getenv("STOCK_SERVICE_URL")
	if stockServiceURL == "" {
		stockServiceURL = "http://stock_service_api:3000"
	}
	url := fmt.Sprintf("%s/product/%s", stockServiceURL, productID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error calling product service: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Error string `json:"error"`
		}
		if err := json.Unmarshal(body, &errorResp); err == nil && errorResp.Error != "" {
			return nil, fmt.Errorf("product service returned error: %s - %s", resp.Status, errorResp.Error)
		}
		return nil, fmt.Errorf("product service returned error: %s - %s", resp.Status, string(body))
	}

	var product Product
	if err := json.Unmarshal(body, &product); err != nil {
		return nil, fmt.Errorf("error decoding product service response: %v", err)
	}

	log.Printf("Product successfully retrieved: %s", productID)
	return &product, nil
}
