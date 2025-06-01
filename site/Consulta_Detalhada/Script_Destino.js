function exportarXLSX() {
  const rows = document.querySelectorAll('#tabelaResultados tbody tr');
  const wb = XLSX.utils.book_new();
  const data = [['Destino', 'Endereço', 'Distância', 'Duração', 'Preço', 'Rota']];
  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
    data.push(cols);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Rotas');
  XLSX.writeFile(wb, 'rotas.xlsx');
}

async function calcularRotas() {
  const end1 = document.getElementById('end1').value.trim();
  if (!end1) {
    alert("Por favor, digite o endereço de origem.");
    return;
  }

  const destinos = [
    { nome: "CAVA Lagoa de Carapicuíba", endereco: "Rua Jose Manoel Nicoli 2896, Embu das Artes", preco: 20.04 },
    { nome: "Imbulix", endereco: "Estrada Comendador, 26 - Jardim Magali, Embu das Artes - SP, 06833-070", preco: 21.29 },
    { nome: "Itaquareia", endereco: "Av Vereador Almiro Dias de Oliveira, 1112, Jardim Nova Itaqua", preco: 18.39 },
    { nome: "LARA Ambiental", endereco: "Avenida Guaraciaba, 430, Mauá", preco: 22.82 },
    { nome: "ESSENCIS", endereco: "Rod. dos Bandeirantes, km. 33, Caieiras", preco: 25.97 },
    { nome: "UVR Paineiras", endereco: "Estr. do Schmidt, 74118 - Grajaú", preco: 34.76 }
  ];

  const geocodificar = async endereco => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco + ', Brasil')}`);
    const data = await response.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    throw new Error(`Endereço não encontrado: ${endereco}`);
  };

  const origemCoord = await geocodificar(end1);
  const tabelaBody = document.querySelector('#tabelaResultados tbody');
  tabelaBody.innerHTML = "";

  const map = L.map('map').setView([origemCoord[1], origemCoord[0]], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  L.marker([origemCoord[1], origemCoord[0]]).addTo(map).bindPopup("Origem").openPopup();

  for (let destino of destinos) {
    try {
      const destinoCoord = await geocodificar(destino.endereco);
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '5b3ce3597851110001cf62489ba64b90dd6d4ab8bcc92d787f377d8d'
        },
        body: JSON.stringify({ coordinates: [origemCoord, destinoCoord] })
      });
      const data = await response.json();
      const distanciaKm = data.routes[0].summary.distance / 1000;
      const duracaoMin = data.routes[0].summary.duration / 60;
      const preco = distanciaKm * destino.preco;
      const rotaURL = `https://www.google.com/maps/dir/${origemCoord[1]},${origemCoord[0]}/${destinoCoord[1]},${destinoCoord[0]}`;

      const linha = `<tr><td>${destino.nome}</td><td>${destino.endereco}</td><td>${distanciaKm.toFixed(2)} km</td><td>${Math.round(duracaoMin)} min</td><td>R$ ${preco.toFixed(2)}</td><td><a href="${rotaURL}" target="_blank">Ver rota</a></td></tr>`;
      tabelaBody.insertAdjacentHTML('beforeend', linha);
      L.marker([destinoCoord[1], destinoCoord[0]]).addTo(map).bindPopup(destino.nome);
    } catch (err) {
      console.error(err);
    }
  }

  document.getElementById('resultadoBox').style.display = 'block';
}

let ordemAscendente = {};

function ordenarTabela(colIndex) {
  const tabela = document.getElementById('tabelaResultados');
  let linhas = Array.from(tabela.querySelectorAll('tbody tr'));
  let tipoNumerico = colIndex === 2 || colIndex === 4;
  ordemAscendente[colIndex] = !ordemAscendente[colIndex];

  linhas.sort((a, b) => {
    let valA = a.cells[colIndex].innerText.replace(/[^0-9,.-]+/g, '').replace(',', '.');
    let valB = b.cells[colIndex].innerText.replace(/[^0-9,.-]+/g, '').replace(',', '.');

    if (tipoNumerico) {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
      return ordemAscendente[colIndex] ? valA - valB : valB - valA;
    } else {
      return ordemAscendente[colIndex] ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
  });

  for (let linha of linhas) {
    tabela.tBodies[0].appendChild(linha);
  }
}
