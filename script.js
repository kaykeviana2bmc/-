const botoes = document.querySelectorAll('.produto button');

botoes.forEach(botao => {
  botao.addEventListener('click', () => {
    alert('Produto adicionado ao carrinho!');
  });
});