package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/lucasbpereira/nota_fiscal_api/internal/handlers"
)

func main() {
	app := fiber.New()

	app.Get("/posts", handlers.GetProducts)

	log.Fatal(app.Listen(":3000"))
}
