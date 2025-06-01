let pontoIndex = 2;

function adicionarDestino() {
  const container = document.getElementById('destinosContainer');
  const letra = String.fromCharCode(65 + pontoIndex);
  const div = document.createElement('div');
  div.className = 'destino';
  div.innerHTML = `
    <span>Ponto ${letra}</span>
    <input type="text" class="enderecoDestino" placeholder="Endereço do destino" />
  `;
  container.appendChild(div);
  pontoIndex++;
}

function exportarXLSX() {
  const rows = document.querySelectorAll('#tabelaResultados tbody tr');
  const wb = XLSX.utils.book_new();
  const data = [['De → Para', 'Endereço', 'Distância', 'Duração', 'Preço', 'Rota']];
  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
    data.push(cols);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Rotas');
  XLSX.writeFile(wb, 'rotas.xlsx');
}

async function calcularRotas() {
  document.getElementById('map').innerHTML = "";
    document.getElementById('tabelaResultados').querySelector('tbody').innerHTML = "";
  document.getElementById('rotaLink').innerHTML = "";
  document.getElementById('tituloTabela').innerText = "";
  
  const end1 = document.getElementById('end1').value.trim();
  if (!end1) {
    alert("Por favor, digite o endereço de origem.");
    return;
  }

  const enderecoInputs = document.querySelectorAll('.enderecoDestino');
  const enderecos = Array.from(enderecoInputs).map(input => input.value.trim()).filter(e => e !== "");

  if (enderecos.length === 0) {
    alert("Adicione pelo menos um destino.");
    return;
  }

  const geocodificar = async endereco => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco + ', Brasil')}`);
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    } else {
      throw new Error(`Endereço não encontrado: ${endereco}`);
    }
  };

  const tabelaBody = document.querySelector('#tabelaResultados tbody');
  tabelaBody.innerHTML = "";

  const coordenadas = [end1, ...enderecos];
  const coordsGeo = [];

  for (let i = 0; i < coordenadas.length; i++) {
    coordsGeo.push(await geocodificar(coordenadas[i]));
  }

  document.getElementById('map').innerHTML = "";
  const map = L.map('map').setView([coordsGeo[0][1], coordsGeo[0][0]], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  L.marker([coordsGeo[0][1], coordsGeo[0][0]]).addTo(map).bindPopup("Origem").openPopup();

  let coordenadasParaRota = [];
  let totalKm = 0;
  let totalMin = 0;
  let totalPreco = 0;

  const select = document.getElementById('tipoCaminhao');
  const precoKm = parseFloat(select.options[select.selectedIndex].dataset.preco);
  const precoAjudante = parseFloat(select.options[select.selectedIndex].dataset.ajudante);
  const ajudantes = parseInt(document.getElementById('ajudantes').value) || 0;

  for (let i = 1; i < coordenadas.length; i++) {
    const de = i === 1 ? 'Origem' : `Ponto ${String.fromCharCode(64 + i)}`;
    const para = `Ponto ${String.fromCharCode(64 + i + 1)}`;
    const deCoord = coordsGeo[i - 1];
    const paraCoord = coordsGeo[i];
    coordenadasParaRota.push(`${deCoord[1]},${deCoord[0]}`);

    const apiKey = '5b3ce3597851110001cf62489ba64b90dd6d4ab8bcc92d787f377d8d';
    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({ coordinates: [deCoord, paraCoord] })
    });
    const data = await response.json();
    const distanciaKm = data.routes[0].summary.distance / 1000;
    const duracaoMin = data.routes[0].summary.duration / 60;
    // valores já definidos antes do loop, reutilizando-os aqui
    const preco = (distanciaKm * precoKm) + (ajudantes * precoAjudante);

    totalKm += distanciaKm;
    totalMin += duracaoMin;
    totalPreco += preco;

    const rotaURL = `https://www.google.com/maps/dir/${deCoord[1]},${deCoord[0]}/${paraCoord[1]},${paraCoord[0]}`;
    const linha = `<tr>
      <td>${de} → ${para}</td>
      <td>${coordenadas[i]}</td>
      <td>${distanciaKm.toFixed(2)} km</td>
      <td>${Math.round(duracaoMin)} min</td>
      <td>R$ ${preco.toFixed(2)}</td>
      <td><a href="${rotaURL}" target="_blank">Ver rota</a></td>
    </tr>`;
    tabelaBody.insertAdjacentHTML('beforeend', linha);

    L.marker([paraCoord[1], paraCoord[0]]).addTo(map).bindPopup(para);
  }

  coordenadasParaRota.push(`${coordsGeo[coordsGeo.length - 1][1]},${coordsGeo[coordsGeo.length - 1][0]}`);

  const totalLinha = `<tr class="total-row">
    <td colspan="2">Total</td>
    <td>${totalKm.toFixed(2)} km</td>
    <td>${Math.round(totalMin)} min</td>
    <td>R$ ${totalPreco.toFixed(2)}</td>
    <td>–</td>
  </tr>`;
  tabelaBody.insertAdjacentHTML('beforeend', totalLinha);

  const linkGoogleMapsMulti = `https://www.google.com/maps/dir/${coordenadasParaRota.join('/')}`;
  
  const tipo = select.options[select.selectedIndex].value;
  const origem = document.getElementById('end1').value;
  document.getElementById('tituloTabela').innerText = `${origem} - ${tipo} - ${ajudantes} ajudante(s)`;
  document.getElementById('rotaLink').innerHTML = `<strong>🛍️ Rota Completa:</strong> <a href="${linkGoogleMapsMulti}" target="_blank">${linkGoogleMapsMulti}</a>`;
  
  document.getElementById('resultadoBox').style.display = 'block';
}
