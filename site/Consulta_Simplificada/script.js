function Preco(km) {
  let fator = 0;
  if (km <= 6) return 12.00;
  else if (km <= 10) fator = 1.75;
  else if (km <= 15) fator = 1.70;
  else if (km <= 20) fator = 1.65;
  else if (km <= 25) fator = 1.60;
  else if (km <= 30) fator = 1.55;
  else if (km <= 35) fator = 1.50;
  else if (km <= 40) fator = 1.45;
  else return 0;
  return km * fator;
}

function calcularDMT(distancia) {
  if (distancia <= 6) return 12.00;
  if (distancia <= 10) return 1.75;
  if (distancia <= 15) return 1.70;
  if (distancia <= 20) return 1.65;
  if (distancia <= 25) return 1.60;
  if (distancia <= 30) return 1.55;
  if (distancia <= 35) return 1.50;
  return 1.45;
}

function Preço(km) {
  let fator = 0;
  if (km <= 6) {
    return 12.00; // valor fixo
  } else if (km <= 10) {
    fator = 1.75;
  } else if (km <= 15) {
    fator = 1.70;
  } else if (km <= 20) {
    fator = 1.65;
  } else if (km <= 25) {
    fator = 1.60;
  } else if (km <= 30) {
    fator = 1.55;
  } else if (km <= 35) {
    fator = 1.50;
  } else if (km <= 40) {
    fator = 1.45;
  } else {
    return 0;
  }
  return km * fator;
}



const DMT = {
  "Athene": { "Norte": 1.2, "Oeste": 1.2, "Leste": 1.25, "Sul": 1.2 },
  "CAVA Lagoa de Carapicuíba": { "Norte": 1.2, "Oeste": 1.2, "Leste": 1.2, "Sul": 1.2 },
  "Eleven": { "Norte": 1.1, "Oeste": 1.1, "Leste": 1.1, "Sul": 1.1 },
  "Empreiterra": { "Norte": 1.2, "Oeste": 1.2, "Leste": 1.25, "Sul": 1.2 },
  "Essencis": { "Norte": 1.35, "Oeste": 1.3, "Leste": 1.3, "Sul": 1.3 },
  "Imbulix": { "Norte": 1.2, "Oeste": 1.2, "Leste": 2.0, "Sul": 1.2 },
  "Itaquareia": { "Norte": 1.1, "Oeste": 1.1, "Leste": 1.1, "Sul": 1.1 },
  "Ambiental": { "Norte": 1.35, "Oeste": 1.3, "Leste": 1.3, "Sul": 1.35 },
  "Olifar": { "Norte": 2.0, "Oeste": 1.5, "Leste": 2.0, "Sul": 1.5 },
  "UVR Grajau": { "Norte": 2.0, "Oeste": 1.5, "Leste": 2.0, "Sul": 1.5 },
  "Temari": { "Norte": 1.2, "Oeste": 1.2, "Leste": 1.25, "Sul": 1.2 },
};

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
  
  const titulo = document.getElementById("tituloResultado").innerText.trim();
  const nomeArquivo = titulo ? `${titulo}.xlsx` : "rotas.xlsx";
  XLSX.writeFile(wb, nomeArquivo);

}

async function calcularRotas() {const end1 = document.getElementById('end1').value.trim();
  if (!end1) {
    alert("Por favor, digite o endereço de origem.");
    return;

    const distanciaKm = distancia.toFixed(2);
    const dmtCalculado = calcularDMT(distancia);
    document.getElementById("resultado").innerHTML = `Distância: ${distanciaKm} km<br>DMT: R$ ${dmtCalculado.toFixed(2)} /m³`;
    }

  const destinos = [
    { nome: "CAVA Lagoa de Carapicuíba", endereco: "Av. Marginal Direita, 900", preco: 20.04 },
    { nome: "Imbulix", endereco: "Estrada Comendador, 26 - Jardim Magali, Embu das Artes - SP, 06833-070", preco: 21.29 },
    { nome: "Itaquareia", endereco: "Estrada Governador Mario Covas Júnior 1000", preco: 18.39 },
    { nome: "Lara Ambiental", endereco: "Avenida Guaraciaba, 430, Mauá", preco: 22.82 },
    { nome: "Olifar", endereco: "Avenida Carlos Barbosa Santos, 1460", preco: 25.97 },
    { nome: "Essencis", endereco: "Rod. dos Bandeirantes, km. 33, Caieiras", preco: 25.97 },
    { nome: "Temari", endereco: "Avenida Candea, 113", preco: 25.97 },
    { nome: "UVR Grajau", endereco: "Av. Paulo Guilguer Reimberg, 3920", preco: 25.97 },
    { nome: "Empreiterra Ambiental", endereco: "R. Dr. Passos, 121 Itapegica", preco: 25.97 },
    { nome: "UVR Paineiras", endereco: "Estr. do Schmidt, 74118 - Grajaú", preco: 34.76 },
    { nome: "Eleven", endereco: "Estr de São Bento 4971", preco: 34.76 },
    { nome: "Athene", endereco: "Rua José Marques Ribeiro Cajamar", preco: 34.76 }
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
      const distanciaKm = Number(data.routes[0].summary.distance / 1000);
      const duracaoMin = data.routes[0].summary.duration / 60;
      const zona = document.getElementById('zona').value;
      const equipamento = document.getElementById('equipamento').value;
      const regiao = document.getElementById('regiao').value;

      let dmtBase = DMT[destino.nome] ? DMT[destino.nome][zona] : 1.0;
      if (regiao === "Bairro") dmtBase += 0.05;
      if (equipamento === "Grande Porte") dmtBase += 0.15;

      const preco = calcularValorAterroZero(distanciaKm);
      const rotaURL = `https://www.google.com/maps/dir/${origemCoord[1]},${origemCoord[0]}/${destinoCoord[1]},${destinoCoord[0]}`;

      
const linha = "<tr>" +
"<td>" + destino.nome + "</td>" +
"<td>" + distanciaKm.toFixed(2) + " km</td>" +
"<td>" + Math.round(duracaoMin) + " min</td>" +
"<td>" + (distanciaKm <= 6 ? "--" : (
  distanciaKm <= 10 ? "1.75" :
  distanciaKm <= 15 ? "1.70" :
  distanciaKm <= 20 ? "1.65" :
  distanciaKm <= 25 ? "1.60" :
  distanciaKm <= 30 ? "1.55" :
  distanciaKm <= 35 ? "1.50" :
  distanciaKm <= 40 ? "1.45" : "Fora da faixa")) + "</td>" +
"<td>R$ " + preco.toFixed(2).replace(".", ",") + "</td>" +
"<td>R$ " + calcularValorAterroZero(3).toFixed(2).replace(".", ",") + "</td>" +
"<td>R$ " + calcularValorAterroZero(5).toFixed(2).replace(".", ",") + "</td>" +
"</tr>";
destinosCalculados.push({
  nomeObra: document.getElementById("obra").value.trim(),
  enderecoOrigem: document.getElementById("end1").value.trim(),
  destino: destino.nome,
  enderecoDestino: (function() {
    const mapa = {
      "CAVA Lagoa de Carapicuíba": "Av. Marginal Direita, 900",
      "Imbulix": "Estrada Comendador, 26 - Jardim Magali, Embu das Artes - SP, 06833-070",
      "Itaquareia": "Estrada Governador Mario Covas Júnior 1000",
      "Lara Ambiental": "Avenida Guaraciaba, 430, Mauá",
      "Olifar": "Avenida Carlos Barbosa Santos, 1460",
      "Essencis": "Rod. dos Bandeirantes, km. 33, Caieiras",
      "Temari": "Avenida Candea, 113",
      "UVR Grajau": "Av. Paulo Guilguer Reimberg, 3920",
      "Empreiterra Ambiental": "R. Dr. Passos, 121 Itapegica",
      "UVR Paineiras": "Estr. do Schmidt, 74118 - Grajaú",
      "Eleven": "Estr de São Bento 4971",
      "Athene": "Rua José Marques Ribeiro Cajamar"
    };
    return mapa[destino.nome] || "";
  })(),
  distancia: distanciaKm.toFixed(2) + " km",
  dmt: dmtBase.toFixed(2),
  preco: "R$ " + preco.toFixed(2),
  tresKm: "R$ " + ((distanciaKm + 3) * dmtBase).toFixed(2),
  cincoKm: "R$ " + ((distanciaKm + 5) * dmtBase).toFixed(2),
  rota: rotaURL
});

      tabelaBody.insertAdjacentHTML('beforeend', linha);
      L.marker([destinoCoord[1], destinoCoord[0]]).addTo(map).bindPopup(destino.nome);
    } catch (err) {
      console.error(err);
    }
  }

  document.getElementById('resultadoBox').style.display = 'block';

  const nomeObra = document.getElementById('obra').value.trim();
  const endereco = document.getElementById('end1').value.trim();
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const titulo = `${nomeObra} - ${endereco} - ${dataAtual}`;
  document.getElementById('tituloResultado').innerText = titulo;

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

// NOVA FUNÇÃO EXPORTAR DEFINITIVA

let destinosCalculados = []; // Global para armazenar os dados calculados

function exportarXLSX() {
  const wb = XLSX.utils.book_new();
  const data = [['Nome da Obra', 'Endereço da Origem', 'Destino', 'Endereço de destino', 'Distância', 'DMT', 'Preço', '3 Km', '5 Km', 'Rota']];

  destinosCalculados.forEach(item => {
    data.push([
      item.nomeObra,
      item.enderecoOrigem,
      item.destino,
      item.enderecoDestino,
      item.distancia,
      item.dmt,
      item.preco,
      item.tresKm,
      item.cincoKm,
      item.rota
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Rotas');
  const titulo = document.getElementById("tituloResultado").innerText.trim();
  const nomeArquivo = titulo ? `${titulo}.xlsx` : "rotas.xlsx";
  XLSX.writeFile(wb, nomeArquivo);
}

const linha = "<tr>" +
"<td>" + destino.nome + "</td>" +
"<td>" + distanciaKm.toFixed(2) + " km</td>" +
"<td>" + Math.round(duracaoMin) + " min</td>" +
"<td>" + (distanciaKm <= 6 ? "--" : (
  distanciaKm <= 10 ? "1.75" :
  distanciaKm <= 15 ? "1.70" :
  distanciaKm <= 20 ? "1.65" :
  distanciaKm <= 25 ? "1.60" :
  distanciaKm <= 30 ? "1.55" :
  distanciaKm <= 35 ? "1.50" :
  distanciaKm <= 40 ? "1.45" : "Fora da faixa")) + "</td>" +
"<td>R$ " + preco.toFixed(2).replace(".", ",") + "</td>" +
"<td>R$ " + calcularValorAterroZero(3).toFixed(2).replace(".", ",") + "</td>" +
"<td>R$ " + calcularValorAterroZero(5).toFixed(2).replace(".", ",") + "</td>" +
"</tr>";

function atualizarTabela(origemNome, origemEndereco, destinoNome, destinoEndereco, distancia) {
  const tabela = document.getElementById("resultado");
  const novaLinha = tabela.insertRow();

  const cel1 = novaLinha.insertCell(0);
  const cel2 = novaLinha.insertCell(1);
  const cel3 = novaLinha.insertCell(2);
  const cel4 = novaLinha.insertCell(3);
  const cel5 = novaLinha.insertCell(4);
  const cel6 = novaLinha.insertCell(5);

  cel1.innerHTML = origemNome;
  cel2.innerHTML = origemEndereco;
  cel3.innerHTML = destinoNome;
  cel4.innerHTML = destinoEndereco;
  cel5.innerHTML = distancia.toFixed(2) + " km";
  cel6.innerHTML = "R$ " + Preco(distancia).toFixed(2);
}