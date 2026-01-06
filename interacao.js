let botao = document.getElementById("botao")
let conteudo = document.getElementById("conteudo")

let light = document.getElementById("light")
let dark = document.getElementById("dark")

let conteudos = [""]

botao.addEventListener("click", adcionarConteudo)

light.addEventListener("click", () => clicar(modo()))  // só executa a função se eu clicar no radio button
dark.addEventListener("click", () => clicar(modo()))

function clicar(modo) {
    alert(modo)
}

function adcionarConteudo() {

    conteudos.push(conteudo.value)

    conteudos.forEach((conteudo, i) => {
        alert(`Conteúdo ${i} = ${conteudo}`)
    })

    conteudo.value = ""
}


function modo() {
    let theme = light.checked ? "claro" : "escuro"
    return theme
}
