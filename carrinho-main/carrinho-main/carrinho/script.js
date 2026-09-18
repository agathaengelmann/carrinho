// Array com os dados iniciais padrão do estoque
const estoquePadrao = [
    {codigo: 101, descricao: "Teclado Mecânico", preco: 180.00, estoque: 10, quantidadeEmEstoque: 10},
    {codigo: 102, descricao: "Mouse Gamer", preco: 95.50, estoque: 15, quantidadeEmEstoque: 15},
    {codigo: 103, descricao:"Monitor 24'", preco: 750.00, estoque: 5, quantidadeEmEstoque: 5},
    {codigo: 104, descricao: "HeadSet Sem Fio", preco: 180.00, estoque: 20, quantidadeEmEstoque: 20},
    {codigo: 105, descricao: "Notebook 16 GB Ram", preco: 3000.00, estoque: 12, quantidadeEmEstoque: 12},
    {codigo: 106, descricao:"Microfone Gamer RGB", preco: 850.00, estoque: 10, quantidadeEmEstoque: 10}
];

// Carrega o estoque com as quantidades padrão sempre que a página é aberta
function carregarDadosdoEstoque(){
    localStorage.setItem("estoque-etec", JSON.stringify(estoquePadrao));
    return JSON.parse(JSON.stringify(estoquePadrao));
}

// Carrega os cupons persistidos ou grava o padrão inicial
function carregarCuponsStorage() {
    const dadosSalvos = localStorage.getItem("cupons-etec");

    if (dadosSalvos == null) {
        const cuponsIniciais = [
            { codigo: "DESCONTO20", desconto: 20 },
            { codigo: "MAMAE10", desconto: 10 }
        ];
        localStorage.setItem("cupons-etec", JSON.stringify(cuponsIniciais));
        return cuponsIniciais;
    }
    return JSON.parse(dadosSalvos);
}

// Variáveis globais do sistema
let estoque = carregarDadosdoEstoque();
let cupons = carregarCuponsStorage();
let carrinho = [];
let cupomAtivo = null;

// Função para sincronizar as alterações do estoque no localStorage
function sincronizarEstoqueStorage(){
    localStorage.setItem("estoque-etec", JSON.stringify(estoque));    
}

// Renderiza o estoque aplicando o filtro de busca de forma integrada
function carregarEstoque() {
    const termoBusca = (document.getElementById("filtro-busca")?.value || "").toLowerCase().trim();
    
    const produtosFiltrados = estoque.filter(prod =>
        prod.descricao.toLowerCase().includes(termoBusca)
    );
    
    const tbodyEstoque = document.getElementById("tabela-estoque");
    tbodyEstoque.innerHTML = "";

    produtosFiltrados.forEach(prod => {
        tbodyEstoque.innerHTML += `  
        <tr>
            <td>${prod.codigo}</td>
            <td>${prod.descricao}</td>
            <td>${prod.preco.toFixed(2)}</td>
            <td><strong>${prod.quantidadeEmEstoque}</strong></td>
        </tr>
        `;
    });
}

// Adiciona item selecionado ao carrinho com validação e baixa no estoque
function adicionarAoCarrinho() {
    const codigo = Number(document.getElementById("input-codigo").value);
    const quantidade = Number(document.getElementById("input-qtd").value);

    if (!codigo || quantidade <= 0) {
        alert("Informe um código válido e uma quantidade maior que 0");
        return;
    }

    const produtoEncontrado = estoque.find(p => p.codigo === codigo);

    if (!produtoEncontrado) {
        alert("Produto não encontrado no catálogo");
        return;
    }

    if (quantidade > produtoEncontrado.quantidadeEmEstoque) {
        alert("Quantidade indisponível em estoque!");
        return;
    }

    produtoEncontrado.quantidadeEmEstoque -= quantidade;
    sincronizarEstoqueStorage();
    carregarEstoque();

    const itemExistente = carrinho.find(item => item.codigo === codigo);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subTotal = itemExistente.quantidade * itemExistente.precoUnitario;
    } else {
        carrinho.push({
            codigo: produtoEncontrado.codigo,
            descricao: produtoEncontrado.descricao,
            precoUnitario: produtoEncontrado.preco,
            quantidade: quantidade,
            subTotal: produtoEncontrado.preco * quantidade
        });
    }

    atualizarTabelaCarrinho();

    document.getElementById("input-codigo").value = "";
    document.getElementById("input-qtd").value = "";
}

// Atualiza a tabela do carrinho e recalcula o subtotal
function atualizarTabelaCarrinho() {
    const tbodyCarrinho = document.getElementById("tabela-carrinho");
    tbodyCarrinho.innerHTML = "";

    if (carrinho.length === 0) {
        tbodyCarrinho.innerHTML = `<tr><td colspan="5" style="text-align: center;">Carrinho Vazio</td></tr>`;
        atualizarTotal();
        return;
    }

    carrinho.forEach((item, index) => {
        tbodyCarrinho.innerHTML += `
        <tr>
            <td>${item.descricao}</td>
            <td>${item.quantidade}</td>
            <td>${item.precoUnitario.toFixed(2)}</td>          
            <td>${item.subTotal.toFixed(2)}</td>
            <td><button onclick="removerDoCarrinho(${index})">Remover</button></td>
        </tr>
        `;
    });

    atualizarTotal();
}

// Recalcula e exibe o total, aplicando o desconto do cupom se houver um ativo
function atualizarTotal() {
    const subtotal = carrinho.reduce((acumulador, item) => acumulador + item.subTotal, 0);

    if (subtotal <= 0) {
        document.getElementById("resultado-total").innerHTML = "";
        return;
    }

    if (cupomAtivo) {
        const valorFinal = subtotal - (subtotal * cupomAtivo.desconto) / 100;
        document.getElementById("resultado-total").innerText = `Subtotal Parcial: R$ ${valorFinal.toFixed(2)}`;
        return;
    }

    document.getElementById("resultado-total").innerText = `Subtotal Parcial: R$ ${subtotal.toFixed(2)}`;
}

// Remove item do carrinho, devolve quantidade ao estoque e sincroniza
function removerDoCarrinho(index) {
    const item = carrinho[index];
    const produto = estoque.find(p => p.codigo === item.codigo);
    
    if (produto) {
        produto.quantidadeEmEstoque += item.quantidade;
        sincronizarEstoqueStorage();
        carregarEstoque();
    }
    
    carrinho.splice(index, 1);
    atualizarTabelaCarrinho();
}

// Finaliza a compra, grava pedido no localStorage e emite o extrato
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Adicione itens ao carrinho antes de finalizar");
        return; 
    }

    const subtotal = carrinho.reduce((acumulador, item) => acumulador + item.subTotal, 0);

    let valorDesconto = 0;
    let textoCupom = "Nenhum cupom aplicado";

    if (cupomAtivo) {
        valorDesconto = (subtotal * cupomAtivo.desconto) / 100;
        textoCupom = `Cupom ${cupomAtivo.codigo} (-${cupomAtivo.desconto}%): -R$ ${valorDesconto.toFixed(2)}`;
    }

    const valorFinal = subtotal - valorDesconto;

    // Persistência do histórico de pedidos no localStorage
    const pedidosSalvos = JSON.parse(localStorage.getItem("pedidos-etec")) || [];
    pedidosSalvos.push({
        data: new Date().toLocaleString(),
        itens: [...carrinho],
        subtotal: subtotal,
        cupom: cupomAtivo ? cupomAtivo.codigo : null,
        desconto: valorDesconto,
        total: valorFinal
    });
    localStorage.setItem("pedidos-etec", JSON.stringify(pedidosSalvos));

    // Limpa o carrinho e reseta o cupom após a compra concluída
    carrinho = [];
    cupomAtivo = null;
    atualizarTabelaCarrinho();

    // Exibição do extrato financeiro completo
    document.getElementById("resultado-total").innerHTML = `
        <p><strong>Subtotal da Compra:</strong> R$ ${subtotal.toFixed(2)}</p>
        <p><strong>Cupom Aplicado:</strong> ${textoCupom}</p>
        <p><strong>Valor Final a Pagar:</strong> R$ ${valorFinal.toFixed(2)}</p>
    `;
}

// Cadastro de cupom garantindo armazenamento em maiúsculas no localStorage
function cadastrarCupom() {
    const codigo = document.getElementById("input-cupom-codigo").value.trim().toUpperCase();
    const desconto = Number(document.getElementById("input-cupom-desconto").value);

    if (!codigo || desconto < 1 || desconto > 100) {
        alert("Digite um código e um desconto entre 1 e 100!");
        return;
    }

    const cupomExistente = cupons.find(c => c.codigo === codigo);
    if (cupomExistente) {
        alert("Este cupom já está cadastrado!");
        return;
    }

    cupons.push({
        codigo: codigo,
        desconto: desconto
    });

    localStorage.setItem("cupons-etec", JSON.stringify(cupons));
    carregarCupons();

    alert("Cupom adicionado com sucesso!");

    document.getElementById("input-cupom-codigo").value = "";
    document.getElementById("input-cupom-desconto").value = "";
}

// Renderiza a lista de cupons ativos
function carregarCupons() {
    const tbodyCupons = document.getElementById("tabela-cupons");
    if (!tbodyCupons) return;
    tbodyCupons.innerHTML = "";

    cupons.forEach((cupom, index) => {
        tbodyCupons.innerHTML += `
        <tr>
            <td>${cupom.codigo}</td>
            <td>${cupom.desconto}%</td>
            <td><button onclick="excluirCupom(${index})">Excluir</button></td>
        </tr>
        `;
    });
}

// Exclui cupom e atualiza o localStorage
function excluirCupom(index) {
    cupons.splice(index, 1);
    localStorage.setItem("cupons-etec", JSON.stringify(cupons));
    carregarCupons();
}

// Valida e ativa o cupom na finalização da compra
function aplicarCupom() {
    const codigoDigitado = document.getElementById("input-cupom-compra").value.trim().toUpperCase();

    if (!codigoDigitado) {
        alert("Por favor, digite o código do cupom!");
        return;
    }

    const cupomEncontrado = cupons.find(c => c.codigo.toUpperCase() === codigoDigitado);

    if (!cupomEncontrado) {
        alert("Cupom inválido ou não encontrado. Verifique o código e tente novamente!");
        cupomAtivo = null;
        return;
    }

    cupomAtivo = cupomEncontrado;
    atualizarTotal();
    alert(`Cupom ${cupomAtivo.codigo} de ${cupomAtivo.desconto}% aplicado com sucesso!`);
}


const campoBusca = document.getElementById("filtro-busca");
if (campoBusca) {
    campoBusca.addEventListener("input", carregarEstoque);
}

// Inicializações da página
carregarEstoque();
carregarCupons();