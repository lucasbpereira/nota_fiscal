package models

type ProdutoNota struct {
	ProdutoID     string  `json:"produto_id"`
	Quantidade    int     `json:"quantidade"`
	ValorUnitario float64 `json:"valor_unitario"`
	NomeProduto   string  `json:"nome_produto,omitempty"` // Preenchido via serviço de estoque
}
