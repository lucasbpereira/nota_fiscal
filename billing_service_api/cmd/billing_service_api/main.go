package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/lucasbpereira/billing_service_api/db"
	"github.com/lucasbpereira/billing_service_api/internal/handlers"
)

func main() {

	db.Connect()

	app := fiber.New()
	app.Post("/invoice", handlers.CreateInvoice)
	app.Get("/invoices/open", handlers.GetOpenInvoices)
	app.Put("/invoices/:code/close", handlers.UpdateInvoiceStatus)
		
	log.Fatal(app.Listen(":3001"))
}
