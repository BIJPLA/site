 // Dados da tabela conforme solicitado
        const tabelaEnvios = [
            {
                nome: "CAVA Lagoa de Carapicuíba",
                endereco: "Rua Jose Manoel Nicoli 2896  embu das artes",
                preco: 20.04
            },
            {
                nome: "Imbulix",
                endereco: "Estrada Comendador, 26 - Jardim Magali, Embu das Artes - SP, 06833-070",
                preco: 21.29
            },
            {
                nome: "Itaquareia",
                endereco: "Av Vereador Almiro Dias de Oliveira, 1112, Jardim Nova Itaqua",
                preco: 18.39
            },
            {
                nome: "LARA Ambiental",
                endereco: "Avenida Guaraciaba, 430, Mauá",
                preco: 22.82
            },
            {
                nome: "ESSENCIS",
                endereco: "Rod. dos Bandeirantes, km. 33, Caieiras",
                preco: 25.97
            },
            {
                nome: "UVR Paineiras",
                endereco: "Estr. do Schmidt, 74118 - Grajaú",
                preco: 34.76
            }
        ];

        // Função para atualizar o campo Endereço 2 conforme o tipo selecionado
        function atualizarEndereco2() {
            const tipo = document.getElementById('tipoEnvio').value;
            const containerEnd2 = document.getElementById('labelEnd2');
            const end2 = document.getElementById('end2');

            if(tipo === 'envio') {
                // Trocar o campo end2 para SELECT populado com os nomes
                const select = document.createElement('select');
                select.id = 'end2';
                select.style.width = "90%";
                select.style.padding = "10px 12px";
                select.style.marginTop = "6px";
                select.style.border = "2px solid #ccc";
                select.style.borderRadius = "8px";
                select.style.fontSize = "1rem";
                select.onchange = () => { /* recalcular ao mudar? */ };

                // Limpar qualquer input anterior
                if(end2.tagName.toLowerCase() === 'input') {
                    end2.parentNode.replaceChild(select, end2);
                } else {
                    // já é select, limpar opções
                    select.innerHTML = "";
                }

                // Adicionar opções da tabela
                tabelaEnvios.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.nome; // valor para buscar endereço
                    option.textContent = item.nome;
                    select.appendChild(option);
                });

            } else {
                // Trocar o campo end2 para input texto editável
                if(end2.tagName.toLowerCase() === 'select') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = 'end2';
                    input.placeholder = 'Digite o endereço 2';
                    input.style.width = "90%";
                    input.style.padding = "10px 12px";
                    input.style.marginTop = "6px";
                    input.style.border = "2px solid #ccc";
                    input.style.borderRadius = "8px";
                    input.style.fontSize = "1rem";

                    end2.parentNode.replaceChild(input, end2);
                }
            }
        }

        // Executar para definir estado inicial (Aterro Zero)
        atualizarEndereco2();

        // Função para geocodificar endereço, mesma do original
        async function geocodificar(endereco) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco + ', Brasil')}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            } else {
                throw new Error(`Endereço não encontrado: ${endereco}`);
            }
        }

        function formatarDuracaoParaHorasMinutos(duracaoMin) {
            const horas = Math.floor(duracaoMin / 60);
            const minutos = Math.round(duracaoMin % 60);
            return `${horas}h ${minutos}min`;
        }

        async function calcularDistancia() {
            const end1 = document.getElementById('end1').value.trim();
            let end2Field = document.getElementById('end2');
            const tipo = document.getElementById('tipoEnvio').value;

            if (!end1) {
                alert("Por favor, preencha o Endereço 1.");
                return;
            }
            if (!end2Field.value.trim()) {
                alert("Por favor, preencha o Endereço 2.");
                return;
            }

            // Obter endereço 2 conforme tipo
            let endereco2Completo = "";

            if (tipo === 'envio') {
                // end2Field é select, pegar o nome selecionado
                const selecionado = end2Field.value;
                // Buscar endereço completo e preço na tabela
                const itemTabela = tabelaEnvios.find(i => i.nome === selecionado);
                if (!itemTabela) {
                    alert("Erro: endereço do envio não encontrado na tabela.");
                    return;
                }
                endereco2Completo = itemTabela.endereco;
            } else {
                // Aterro Zero, endereço editável
                endereco2Completo = end2Field.value.trim();
            }

            // Construir array de endereços (só 2 pois End3 e 4 removidos)
            const enderecos = [end1, endereco2Completo];

            try {
                const coordenadas = [];
                for (let endereco of enderecos) {
                    const coord = await geocodificar(endereco);
                    coordenadas.push(coord);
                }

                const apiKey = '5b3ce3597851110001cf62489ba64b90dd6d4ab8bcc92d787f377d8d';
                const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': apiKey
                    },
                    body: JSON.stringify({ coordinates: coordenadas })
                });
                const data = await response.json();
                const distanciaKm = data.routes[0].summary.distance / 1000;
                const duracaoMin = data.routes[0].summary.duration / 60;

                let custoPorKm = 21.71; // padrão aterro zero
                if (tipo === 'envio') {
                    // pegar preco da tabela para o envio selecionado
                    const selecionado = document.getElementById('end2').value;
                    const itemTabela = tabelaEnvios.find(i => i.nome === selecionado);
                    if (itemTabela) {
                        custoPorKm = itemTabela.preco;
                    }
                }

                const precoTotal = distanciaKm * custoPorKm;

                document.getElementById('resultadoBox').style.display = "block";
                document.getElementById('distanciaCaixa').innerHTML = `Distância total: ${distanciaKm.toFixed(2)} km`;
                document.getElementById('tempoCaixa').innerHTML = `Tempo estimado: ${formatarDuracaoParaHorasMinutos(duracaoMin)}`;
                document.getElementById('precoCaixa').innerHTML = `Preço total: R$ ${precoTotal.toFixed(2)}`;

                document.getElementById('custoKm').innerHTML = `<i class="fas fa-dollar-sign"></i> Custo por Km: R$ ${custoPorKm.toFixed(2)}`;

                const rotaLink = `https://www.google.com/maps/dir/${coordenadas.map(c => c[1] + ',' + c[0]).join('/')}`;
                document.getElementById('linkRota').innerHTML = `<a href="${rotaLink}" target="_blank"><i class="fas fa-map-signs"></i> Ver rota no Google Maps</a>`;
            } catch (error) {
                document.getElementById('resultadoBox').style.display = "none";
                document.getElementById('linkRota').textContent = "";
                alert(`Erro: ${error.message}`);
            }
        }