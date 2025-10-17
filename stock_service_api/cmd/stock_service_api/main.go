package main

import (
	"log"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/lucasbpereira/stock_service_api/db"
	"github.com/lucasbpereira/stock_service_api/internal/handlers"
)

func main() {
	db.Connect()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: func() string {
			return "http://localhost:4200,http://localhost:3001"
		}(),
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
		MaxAge:           300, 
	}))

	app.Post("/products", handlers.CreateProduct)
	app.Get("/products", handlers.GetProducts)
	app.Put("/products/balance-update", handlers.BalanceUpdate)
	log.Fatal(app.Listen(":3000"))
}
