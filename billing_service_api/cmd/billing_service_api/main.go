package main

import (
	"log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2"
	"github.com/lucasbpereira/billing_service_api/db"
	"github.com/lucasbpereira/billing_service_api/internal/handlers"
)

func main() {

	db.Connect()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:4200", // URL do seu Angular
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	app.Post("/invoice", handlers.CreateInvoice)
	app.Get("/invoices/open", handlers.GetOpenInvoices)
	app.Put("/invoices/:code/close", handlers.UpdateInvoiceStatus)

	log.Fatal(app.Listen(":3001"))
}
