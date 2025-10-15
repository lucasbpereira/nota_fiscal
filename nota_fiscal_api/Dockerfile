FROM golang:1.25.1-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o server ./cmd/nota_fiscal_api

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/server .

EXPOSE 3000

CMD ["./server"]