//----------------- API DOS CARGOS --------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';

//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosCargos() {
    const respostaCargos = await fetch(`${API}/cargo`);
    const respostaColaboradores = await fetch(`${API}/colaborador`);
    const respostaSetores = await fetch(`${API}/setor`);

    if (
        !respostaCargos.ok ||
        !respostaColaboradores.ok ||
        !respostaSetores.ok
    ) {
        throw new Error('Não foi possível carregar os dados dos cargos.');
    }

    const dadosCargos = await respostaCargos.json();
    const dadosColaboradores = await respostaColaboradores.json();
    const dadosSetores = await respostaSetores.json();

    return {
        cargos: dadosCargos.response?.classificacao || [],
        colaboradores: dadosColaboradores.response?.colaborador || [],
        setores: dadosSetores.response?.setor || []
    };
}

//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosCargos;