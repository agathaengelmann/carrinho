//criar um array de objetos que representara o nosso estoque
const estoque = [
    {codigo: 101, descricao: "Teclado Mecânico", preco: 180.00},
    {codigo: 102, descricao: "Mouse Gamer", preco: 95.50},
    {codigo: 103, descricao:"Monitor 24'", preco: 750.00},
    {codigo: 104, descricao: "HeadSet Sem Fio", preco: 180.00},
    {codigo: 105, descricao: "Notebook 16 GB Ram", preco: 3000.00},
    {codigo: 106, descricao:"Microfone Gamer RGB", preco: 850.00}
];

//criar um carrinho
let carrinho = [];

//renderizar o estoque
function carregarEstoque () {
    const tbodyEstoque = document.getElementById("tabela-estoque");
    tbodyEstoque.innerHTML = "";

    estoque.forEach(prod => { //o apostrofo converte em valor
      tbodyEstoque.innerHTML += `  
      <tr>
        <td>${prod.codigo}</td>
        <td>${prod.descricao}</td>
        <td>${prod.preco}</td>
      </tr>
      `;
});
}

//adicionar item selecionado ao carrinho
function adicionarAoCarrinho () {
const codigo  = Number(document.getElementById("input-codigo").value);
const quantidade = Number(document.getElementById("input-qtd").value);

if (!codigo || quantidade <=0 ) {
    alert("Informe um código valido e uma quantidade maior que 0");
    return;
}

const produtoEncontrado = estoque.find(p => p.codigo === codigo); // quando 2 iguais ele compara os valores se for 3 compara valor e tipo, e um so ele atibui valor.

if (!produtoEncontrado){
    alert("Produto não encontrado no catálogo");
    return;

}

const itemExistente = carrinho.find(item => item.codigo === codigo);
if (itemExistente){
    itemExistente.quantidade += quantidade;
    itemExistente.subTotal = itemExistente.quantidade * itemExistente.precoUnitario;
} else {
    // inserir novo item no carrinho 
    carrinho.push({
        codigo: produtoEncontrado.codigo,
        descricao: produtoEncontrado.descricao,
        precoUnitario: produtoEncontrado.preco,
        quantidade: quantidade,
        subTotal: produtoEncontrado.preco * quantidade
    });
}

atualizarTabelaCarrinho();

//limpar os campos após inserção

document.getElementById("input-codigo").value = "";
document.getElementById("input-qtd").value = "";
document.getElementById("resultado-total").innerHTML ="";
}

function atualizarTabelaCarrinho(){                                                                  //tr table ROW = linha - td table DETAIL = detalhe.
    const tbodyCarrinho = document.getElementById("tabela-carrinho");
    tbodyCarrinho.innerHTML = "";

    if (carrinho.length === 0){
        tbodyCarrinho.innerHTML = `<tr><td colspan="4" style="text-align: center;">Carrinho Vazio</td></tr>`  //quando carrinho estiver zerado será essa anotação.
        return;
    }

    carrinho.forEach(item => {
        tbodyCarrinho.innerHTML += `
        <tr>
        <td>${item.descricao}</td>
        <td>${item.quantidade}</td>
        <td>${item.precoUnitario.toFixed(2)}</td>          
        <td>${item.subTotal.toFixed(2)}</td>
        </tr>
        `;
    });  //comando do forEach primeiro o array.forEach.

}

function finalizarCompra(){
    if(carrinho.length === 0){
        alert("Adicione items ao carrinho antes de finalizar");
        return; 
    }

    const totalGeral = carrinho.reduce((acumulador, item) => acumulador + item.subTotal, 0); //reduce ela soma independente de quantos tiver sem precisar percorrer o arrey.

    document.getElementById("resultado-total").innerText = `Compra finalizada com sucesso. Valor Total: R$ ${totalGeral.toFixed(2)}`;
}
carregarEstoque();