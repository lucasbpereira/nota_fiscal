package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/lucasbpereira/stock_service_api/db"
	"github.com/lucasbpereira/stock_service_api/internal/handlers"
)

func main() {
	db.Connect()

	app := fiber.New()
	app.Post("/products", handlers.CreateProduct)
	app.Get("/products", handlers.GetProducts)
	app.Put("/products/balance-update", handlers.BalanceUpdate)
	log.Fatal(app.Listen(":3000"))
}
