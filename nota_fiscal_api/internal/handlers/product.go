package handlers

import (
	"github.com/gofiber/fiber/v2"
)

func GetProducts(c *fiber.Ctx) error {

	return c.JSON(nil)
}
