# ---- Estágio 1: Build ----
# Usamos um alias "builder" para nos referirmos a este estágio depois.
# ATUALIZADO: Versão do Go alterada para 1.25 para ser compatível com o go.mod do projeto.
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Instala a ferramenta de linha de comando 'migrate' DENTRO deste estágio.
# A ferramenta será instalada em /go/bin/migrate
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Copia e baixa as dependências do Go
COPY go.mod go.sum ./
RUN go mod download

# Copia o resto do código-fonte
COPY . .

# Compila a sua aplicação. O output será um binário chamado 'server'.
RUN go build -o server ./cmd/nota_fiscal_api

# ---- Estágio 2: Final ----
# Começamos com uma imagem Alpine limpa e pequena.
FROM alpine:latest

WORKDIR /app

# Copia os certificados necessários para conexões HTTPS.
RUN apk --no-cache add ca-certificates

# A CORREÇÃO PRINCIPAL:
# Copia a ferramenta 'migrate' do estágio 'builder' para o PATH do estágio final.
COPY --from=builder /go/bin/migrate /usr/local/bin/

# Copia o binário compilado da sua aplicação do estágio 'builder'.
COPY --from=builder /app/server .

# Define o comando padrão para iniciar sua aplicação (usado pelo serviço 'app').
CMD ["./server"]
