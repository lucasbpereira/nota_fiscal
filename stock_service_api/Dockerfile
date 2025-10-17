FROM golang:1.25.1-alpine

WORKDIR /app

# Instala dependências do sistema
RUN apk add --no-cache git

# Copia os arquivos de dependências primeiro
COPY go.mod go.sum ./

# Baixa todas as dependências
RUN go mod download && go mod verify

# Copia o código fonte
COPY . .

# Build da aplicação
RUN go build -o main ./cmd/stock_service_api

# Expor porta
EXPOSE 3000

# Comando para executar a aplicação
CMD ["./main"]