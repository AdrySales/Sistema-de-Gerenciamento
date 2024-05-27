
import pg from 'pg';
import fs from 'fs';
import { promisify } from 'util';
import http from 'http';
import path from 'path';



//___________________________________ Código do servidor HTTP____________________________________//
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join( 'grafico.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.url === '/resultado') {
    fs.readFile(path.join( 'resultado.json'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.end(data);
      }
    });
    
  }else if (req.url === '/grafico-de-barras.png') {
    fs.readFile(path.join( 'grafico-de-barras.png'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'png' });
        res.end('Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'png' });
        res.end(data);
      }
    });
  }else if (req.url === '/tabela.png') {
    fs.readFile(path.join( 'tabela.png'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'png' });
        res.end('Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'png' });
        res.end(data);
      }
    });
  }else if (req.url === '/tabela') {
    fs.readFile(path.join( 'tabela.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada');
  }
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

//_____________________________________ Conexão com o banco de dados ___________________]_______________//
const client = new pg.Client({
  user: 'vinicius',
  host: '193.123.112.21',
  database: 'ava',
  password: 'Vinicius@2023',
  port: 55432, 
});
await client.connect();
const appendFileAsync = promisify(fs.appendFile);



//______________________ funcao para pegar a quantidade de linhas da Regional Geral_____________________//
async function obterQuantidadeDeLinhasRegionalGeral(regional) {
  try {
    const resultGeral = await client.query("SELECT COUNT(id), external_id FROM (SELECT DISTINCT ea.id, ar.external_id FROM evaluation_applications ea INNER JOIN community_rooms_users cru ON ea.user_id = cru.user_id INNER JOIN community_rooms cr ON cru.room_id = cr.id INNER JOIN access_regions ar ON cr.region_id = ar.id WHERE ea.list_id IN (4281, 4265, 4267, 4282, 4285, 4289, 4291, 4293, 4306, 4290,4313,4317,4317,4308,4313,4308,4313,4325,4318,4308,4316,4336,4337,4338,4335,4335,4339,4342,4343,4344,4345,4346) AND ar.external_id = $1 AND ea.end IS NOT NULL  AND ea.deleted_at IS NULL AND cru.deleted_at IS NULL AND cr.deleted_at IS NULL AND ar.deleted_at is NULL) AS unique_rows GROUP BY external_id", [regional]);
    console.log(regional + " :" +resultGeral)
    if (resultGeral.rows.length === 0) {
      return 0; // or any default value you prefer
    }
    return resultGeral.rows[0].count;
  } catch (error) {
    console.error('Erro ao obter quantidade de linhas:', error);
    throw error;
  }
}


//______________________ funcao para pegar a quantidade de linhas da Regional Dia_______________________//
async function obterQuantidadeDeLinhasRegionalDia(regional) {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;
    const resultDia = await client.query("SELECT COUNT(id), external_id FROM (SELECT DISTINCT ea.id, ar.external_id FROM evaluation_applications ea INNER JOIN community_rooms_users cru ON ea.user_id = cru.user_id INNER JOIN community_rooms cr ON cru.room_id = cr.id INNER JOIN access_regions ar ON cr.region_id = ar.id WHERE ea.list_id IN (4281, 4265, 4267, 4282, 4285, 4289, 4291, 4293, 4306, 4290,4313,4317,4317,4308,4313,4308,4313,4325,4318,4308,4316,4336,4337,4338,4335,4335,4339,4342,4343,4344,4345,4346) AND ar.external_id = $1 AND ea.end IS NOT NULL AND ea.end <= $3 AND ea.start >= $2 AND ea.deleted_at IS NULL AND cru.deleted_at IS NULL AND cr.deleted_at IS NULL AND ar.deleted_at is NULL) AS unique_rows GROUP BY external_id", [regional, dataHoje + ' 00:00:01', dataHoje + ' 23:59:00']);       
    if (resultDia.rows.length === 0) {
      return 0; // or any default value you prefer
    }
    return resultDia.rows[0].count;
  } catch (error) {
    console.error('Erro ao obter quantidade de linhas:', error);
    throw error;
  }
}
//______________________ funcao para pegar a quantidade de linhas da Regional Noite___________________________//
async function obterQuantidadeDeLinhasRegionalNoite(regional) {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;
    const dataOntem = `${ano}-${mes}-${dia-1}`;
    const resultNoite = await client.query("SELECT COUNT(id), external_id FROM (SELECT DISTINCT ea.id, ar.external_id FROM evaluation_applications ea INNER JOIN community_rooms_users cru ON ea.user_id = cru.user_id INNER JOIN community_rooms cr ON cru.room_id = cr.id INNER JOIN access_regions ar ON cr.region_id = ar.id WHERE ea.list_id IN (4281, 4265, 4267, 4282, 4285, 4289, 4291, 4293, 4306, 4290,4313,4317,4317,4308,4313,4308,4313,4325,4318,4308,4316,4336,4337,4338,4335,4335,4339,4342,4343,4344,4345,4346) AND ar.external_id = $1 AND ea.end IS NOT NULL AND ea.end <= $3 AND ea.start >= $2 AND ea.deleted_at IS NULL AND cru.deleted_at IS NULL AND cr.deleted_at IS NULL AND ar.deleted_at is NULL) AS unique_rows GROUP BY external_id", [regional, dataHoje + ' 18:00:00', dataHoje + ' 22:00:00']);       
    if (resultNoite.rows.length === 0) {
      return 0; // or any default value you prefer
    }
    return resultNoite.rows[0].count;
  } catch (error) {
    console.error('Erro ao obter quantidade de linhas:', error);
    throw error;
  } finally {
    
  }
}
//______________________ funcao para pegar a quantidade de linhas da Regional Manha__________________________//
async function obterQuantidadeDeLinhasRegionalManha(regional) {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;
    const resultManha = await client.query("SELECT COUNT(id), external_id FROM (SELECT DISTINCT ea.id, ar.external_id FROM evaluation_applications ea INNER JOIN community_rooms_users cru ON ea.user_id = cru.user_id INNER JOIN community_rooms cr ON cru.room_id = cr.id INNER JOIN access_regions ar ON cr.region_id = ar.id WHERE ea.list_id IN (4281, 4265, 4267, 4282, 4285, 4289, 4291, 4293, 4306, 4290,4313,4317,4317,4308,4313,4308,4313,4325,4318,4308,4316,4336,4337,4338,4335,4335,4339,4342,4343,4344,4345,4346) AND ar.external_id = $1 AND ea.end IS NOT NULL AND ea.end <= $3 AND ea.start >= $2 AND ea.deleted_at IS NULL AND cru.deleted_at IS NULL AND cr.deleted_at IS NULL AND ar.deleted_at is NULL) AS unique_rows GROUP BY external_id", [regional, dataHoje + ' 07:00:00', dataHoje + ' 13:00:00']);       
    if (resultManha.rows.length === 0) {
      return 0; // or any default value you prefer
    }
    return resultManha.rows[0].count;
   
  } catch (error) {
    console.error('Erro ao obter quantidade de linhas:', error);
    throw error;
  } finally {
    
  }
}
//______________________ funcao para pegar a quantidade de linhas da Regional Tarde________________________//
async function obterQuantidadeDeLinhasRegionalTarde(regional) {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHoje = `${ano}-${mes}-${dia}`;
    const resultTarde = await client.query("SELECT COUNT(id), external_id FROM (SELECT DISTINCT ea.id, ar.external_id FROM evaluation_applications ea INNER JOIN community_rooms_users cru ON ea.user_id = cru.user_id INNER JOIN community_rooms cr ON cru.room_id = cr.id INNER JOIN access_regions ar ON cr.region_id = ar.id WHERE ea.list_id IN (4281, 4265, 4267, 4282, 4285, 4289, 4291, 4293, 4306, 4290,4313,4317,4317,4308,4313,4308,4313,4325,4318,4308,4316,4336,4337,4338,4335,4335,4339,4342,4343,4344,4345,4346) AND ar.external_id = $1 AND ea.end IS NOT NULL AND ea.end <= $3 AND ea.start >= $2 AND ea.deleted_at IS NULL AND cru.deleted_at IS NULL AND cr.deleted_at IS NULL AND ar.deleted_at is NULL) AS unique_rows GROUP BY external_id", [regional, dataHoje + ' 13:00:00', dataHoje + ' 18:00:00']);       
    if (resultTarde.rows.length === 0) {
      return 0; // or any default value you prefer
    }
    return resultTarde.rows[0].count;
  } catch (error) {
    console.error('Erro ao obter quantidade de linhas:', error);
    throw error;
  } finally {
    
  }
}
//______________________ funcao para pegar a quantidade de linhas da Regional MADRUGADA________________________//
async function obterQuantidadeDeLinhasRegionalMadrugada(regional) {
  try {
    const hoje = new Date();

    // Armazenando a data de hoje
    const anoHoje = hoje.getFullYear();
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaHoje = String(hoje.getDate()).padStart(2, '0');
    const dataHoje = `${anoHoje}-${mesHoje}-${diaHoje}`;
    
    // Criando uma nova data representando ontem
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    // Armazenando a data de ontem
    const anoOntem = ontem.getFullYear();
    const mesOntem = String(ontem.getMonth() + 1).padStart(2, '0');
    const diaOntem = String(ontem.getDate()).padStart(2, '0');
    const dataOntem = `${anoOntem}-${mesOntem}-${diaOntem}`;

    
    const resultMadrugada = await client.query("SELECT COUNT(id), external_id FROM (SELECT DISTINCT ea.id, ar.external_id FROM evaluation_applications ea INNER JOIN community_rooms_users cru ON ea.user_id = cru.user_id INNER JOIN community_rooms cr ON cru.room_id = cr.id INNER JOIN access_regions ar ON cr.region_id = ar.id WHERE ea.list_id IN (4281, 4265, 4267, 4282, 4285, 4289, 4291, 4293, 4306, 4290,4313,4317,4317,4308,4313,4308,4313,4325,4318,4308,4316,4336,4337,4338,4335,4335,4339,4342,4343,4344,4345,4346) AND ar.external_id = $1 AND ea.end IS NOT NULL AND ea.end <= $3 AND ea.start >= $2 AND ea.deleted_at IS NULL AND cru.deleted_at IS NULL AND cr.deleted_at IS NULL AND ar.deleted_at is NULL) AS unique_rows GROUP BY external_id", [regional, dataOntem + ' 22:00:01', dataHoje + ' 07:00:00']);       
    if (resultMadrugada.rows.length === 0) {
      return 0; // or any default value you prefer
    }
    return resultMadrugada.rows[0].count;
  } catch (error) {
    console.error('Erro ao obter quantidade de linhas:', error);
    throw error;
  } finally {
    
  }
}
//____________________________________________ Enviar dados para o csv___________________________________//
async function lerLinhaCSV(numeroLinha) {
  try {
   
    const conteudo = await fs.promises.readFile('resultado.csv', 'utf-8');
    const linhas = conteudo.trim().split('\n');
    
    // Obtém a linha desejada
    const linhaDesejada = linhas[numeroLinha-1];
    const campos = linhaDesejada.split(',');
    const terceiroCampo = campos[2];
      
    return terceiroCampo
  } catch (error) {
    console.error('Erro ao ler o arquivo CSV:', error);
  }
}


//_____________________________________________ Apagar linhas do csv _______________________________________//


async function apagarLinhasCSV() {
  try {
    // Abre o arquivo em modo de escrita
    await fs.promises.writeFile('./resultado.csv', '');
  } catch (error) {
    console.error('Erro ao apagar linhas do arquivo CSV:', error);
  }
}


//______________________________________ Funcao de alteracao no csv_______________________________________//
async function salvarResultadoCSV() {
  apagarLinhasCSV();
  try {
   
    const nomes = [2,3,4,5,6,7,8,9,10,11,12,13,14];

   
    for (let nome of nomes) {
      
      const quantidadeDeLinhasGeral = await obterQuantidadeDeLinhasRegionalGeral(nome);
      const quantidadeDeLinhasDia = await obterQuantidadeDeLinhasRegionalDia(nome);
      const quantidadeDeLinhasManha = await obterQuantidadeDeLinhasRegionalManha(nome);
      const quantidadeDeLinhasTarde = await obterQuantidadeDeLinhasRegionalTarde(nome);
      const quantidadeDeLinhasNoite = await obterQuantidadeDeLinhasRegionalNoite(nome);
      const quantidadeDeLinhasMadrugada = await obterQuantidadeDeLinhasRegionalMadrugada(nome);
      // Cria os dados CSV
      const agora = new Date();
      //const timestamp = agora.toISOString().replace(/:/g, '-').split('.')[0];
      const dadosCSV = 
`1,${nome},${quantidadeDeLinhasGeral},${agora.toLocaleString()}
2,${nome},${quantidadeDeLinhasDia},${agora.toLocaleString()}
3,${nome},${quantidadeDeLinhasManha},${agora.toLocaleString()}
4,${nome},${quantidadeDeLinhasTarde},${agora.toLocaleString()}
5,${nome},${quantidadeDeLinhasNoite},${agora.toLocaleString()}
6,${nome},${quantidadeDeLinhasMadrugada},${agora.toLocaleString()}\n`;
    
      const caminhoArquivo = 'resultado.csv';
      await appendFileAsync(caminhoArquivo, dadosCSV);
     
    }



    console.log(`Atualização concluida com sucesso`);
  } catch (error) {
    console.error('Erro ao salvar resultados em CSV:', error);
  }



  testar();
}


salvarResultadoCSV()




async function lerCSV() {
  try {
    const conteudo = await fs.promises.readFile('resultado.csv', 'utf-8');
    const linhas = conteudo.trim().split('\n');

    const arrays = [[], [], [], [], [],[]]; // Cria os 5 arrays vazios

    linhas.forEach(linha => {
      const campos = linha.split(',');
      const terceiroCampo = campos[2];
      
      // Adiciona o terceiro campo ao array correspondente
      arrays[parseInt(campos[0]) - 1].push(terceiroCampo);
    });

    return arrays;
  } catch (error) {
    console.error('Erro ao ler o arquivo CSV:', error);
    throw error;
  }
}

async function salvarJSON(arrays) {
  try {
    await fs.promises.writeFile('resultado.json', JSON.stringify(arrays, null, 2));
    console.log('Dados salvos em resultado.json');
  } catch (error) {
    console.error('Erro ao salvar dados em JSON:', error);
    throw error;
  }
}

async function atualizarJSON() {
  try {
    const arrays = await lerCSV();
    await salvarJSON(arrays);
  } catch (error) {
    console.error('Erro ao atualizar JSON:', error);
    throw error;
  }
}

// Função para testar
async function testar() {
  try {
    await atualizarJSON();
    console.log('Dados atualizados no JSON com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}


setInterval(salvarResultadoCSV, 10* 60 * 1000); // 15 minutos * 60 segundos * 1000 milissegundos

setInterval(testar, 15* 60 * 1000);// 1 minutos * 60 segundos * 1000 milissegundos
