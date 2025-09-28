// CONFIG: coloque aqui seu número no formato internacional sem + e sem espaços.
// Exemplo para Brasil (21) 98282-6340 => 5521982826340
const WHATSAPP_NUMBER = "5521982826340";

// --- PRODUTOS (edite/adicione) ---
const PRODUCTS = [
  { id: 1, name: "Combo X - Hambúrguer + Bebida", price: 27.90, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Caixinha Doce", price: 15.00, img: "https://images.unsplash.com/photo-1606756792985-7f2e6b8f5fb3?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Refrigerante Lata", price: 6.50, img: "https://images.unsplash.com/photo-1585238342028-4a3d6d7b8e3f?q=80&w=800&auto=format&fit=crop" }
];

// estado do carrinho
let cart = {};

// util
const q = sel => document.querySelector(sel);
const qa = sel => Array.from(document.querySelectorAll(sel));

// inicializa UI
function formatPrice(v){ return Number(v).toFixed(2); }

function renderProducts(){
  const wrap = q("#products");
  wrap.innerHTML = "";
  PRODUCTS.forEach(p=>{
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p class="price">R$ ${formatPrice(p.price)}</p>
      <div class="actions">
        <div class="qty">
          <button data-action="dec" data-id="${p.id}">-</button>
          <span id="qty-${p.id}">1</span>
          <button data-action="inc" data-id="${p.id}">+</button>
        </div>
        <button class="btn add" data-id="${p.id}">Adicionar</button>
      </div>
    `;
    wrap.appendChild(div);
  });
}

// manipula clicks
function attachEvents(){
  // aumentar/diminuir quantidade antes de adicionar
  document.addEventListener("click", (e)=>{
    const t = e.target;
    if(t.dataset.action === "inc" || t.dataset.action === "dec"){
      const id = t.dataset.id;
      const el = q(`#qty-${id}`);
      let val = parseInt(el.textContent,10);
      if(t.dataset.action === "inc") val++;
      else val = Math.max(1, val-1);
      el.textContent = val;
    }

    if(t.classList.contains("add")){
      const id = Number(t.dataset.id);
      const qty = Number(q(`#qty-${id}`).textContent);
      addToCart(id, qty);
    }
  });

  // abrir/fechar carrinho
  q("#open-cart").addEventListener("click", ()=> q("#cart-modal").classList.remove("hidden"));
  q("#close-cart").addEventListener("click", ()=> q("#cart-modal").classList.add("hidden"));

  // whatsapp float
  q("#whatsapp-float").addEventListener("click", (e)=>{
    // o link é atualizado automaticamente, mas deixo preventDefault para manter target _blank funcionando
  });

  // link do whatsapp no modal
  q("#whatsapp-order").addEventListener("click", ()=>{
    // nada extra aqui; o href já é atualizado em updateCartUI()
  });
}

function addToCart(productId, qty = 1){
  if(!cart[productId]) cart[productId] = 0;
  cart[productId] += qty;
  updateCartUI();
  // feedback rápido
  q("#open-cart").classList.add("pulsar");
  setTimeout(()=> q("#open-cart").classList.remove("pulsar"), 600);
}

function removeFromCart(productId){
  delete cart[productId];
  updateCartUI();
}

function updateCartUI(){
  const itemsWrap = q("#cart-items");
  itemsWrap.innerHTML = "";
  let total = 0;
  let count = 0;
  for(const idStr of Object.keys(cart)){
    const id = Number(idStr);
    const product = PRODUCTS.find(p=>p.id===id);
    const qty = cart[id];
    const subtotal = qty * product.price;
    total += subtotal;
    count += qty;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div style="flex:1">
        <div style="font-weight:700">${product.name}</div>
        <div>R$ ${formatPrice(product.price)} × ${qty} = R$ ${formatPrice(subtotal)}</div>
      </div>
      <div>
        <button data-remove="${id}" class="btn small remove">Remover</button>
      </div>
    `;
    itemsWrap.appendChild(div);
  }

  // eventos de remover
  qa("[data-remove]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      removeFromCart(btn.dataset.remove);
    });
  });

  q("#cart-total").textContent = formatPrice(total);
  q("#cart-count").textContent = count;

  // atualizar link whatsapp (mensagem já formatada)
  const text = buildWhatsAppText();
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  q("#whatsapp-order").setAttribute("href", waHref);
  q("#whatsapp-float").setAttribute("href", waHref);
}

// monta a mensagem rápida pro WhatsApp
function buildWhatsAppText(){
  const lines = [];
  lines.push("Olá! Quero fazer um pedido:");
  for(const idStr of Object.keys(cart)){
    const id = Number(idStr);
    const p = PRODUCTS.find(x=>x.id===id);
    const qty = cart[id];
    lines.push(`- ${p.name} x${qty} (R$ ${formatPrice(p.price)} cada)`);
  }
  const total = Object.keys(cart).reduce((acc,k)=> acc + cart[k] * (PRODUCTS.find(p=>p.id===Number(k)).price), 0);
  lines.push(`Total: R$ ${formatPrice(total)}`);
  lines.push("");
  lines.push("Nome: __________________");
  lines.push("Endereço/Retirada: __________________");
  lines.push("Telefone: __________________");
  return lines.join("\n");
}

// inicializa
function init(){
  // renderiza
  renderProducts();

  // adiciona evento para remover quando clicar no botão de remover criado dinamicamente:
  document.body.addEventListener('click', (e)=>{
    if(e.target.matches('[data-remove]')){
      const id = e.target.getAttribute('data-remove');
      removeFromCart(Number(id));
    }
  });

  attachEvents();

  // link whatsapp flutuante já inicializado com mensagem vazia (ou com carrinho)
  // Se quiser carregar um texto padrão (ex.: menu), edite buildWhatsAppText ou WHATSAPP_NUMBER.
  updateCartUI();
}

init();