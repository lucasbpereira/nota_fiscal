FROM golang:1.25.1-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git

# Copiar mod files primeiro (para cache de dependências)
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar código fonte
COPY . .

# Build da aplicação
RUN go build -o main ./cmd/billing_service_api

# Expor porta
EXPOSE 3001

# Comando para rodar a aplicação
CMD ["./main"]