package db

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

func Connect() {
	// Try multiple paths for the .env file
	paths := []string{
		"./configs/.env",        // Docker path
		"../configs/.env",       // One level up
		"../../configs/.env",    // Two levels up (original path)
	}
	
	var err error
	envLoaded := false
	
	for _, path := range paths {
		err = godotenv.Load(path)
		if err == nil {
			log.Printf("Arquivo .env carregado com sucesso de %s\n", path)
			envLoaded = true
			break
		}
	}
	
	if !envLoaded {
		log.Println("Arquivo .env não encontrado em nenhum dos caminhos esperados, usando variáveis de ambiente do sistema")
	}

	// URL-encode the password to handle special characters like #
	password := os.Getenv("DB_PASSWORD")
	// Replace # with %23 for URL encoding
	encodedPassword := password
	for i := 0; i < len(encodedPassword); i++ {
		if encodedPassword[i] == '#' {
			encodedPassword = encodedPassword[:i] + "%23" + encodedPassword[i+1:]
			i += 2 // Skip the %23 we just added
		}
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		encodedPassword,
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	DB, err = sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatal("Erro ao conectar no banco:", err)
	}

	fmt.Println("✅ Conectado ao PostgreSQL")
}