function criarBotoes() {
    const itens = document.querySelectorAll("li")
    const conteudos = ["Texto", "Vídeo", "Código","Execercíos"]

    itens.forEach(li => {
        conteudos.forEach(valor => {
            const botao = document.createElement("button")
            botao.textContent = valor
            li.appendChild(botao)
        })
    })
}

criarBotoes()
