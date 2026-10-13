//----------------- API DOS SETORES -------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR DADOS ----------------------------//

async function buscarDadosSetores() {

    const respostaSetores = await fetch(`${API}/setor`);
    const respostaColaboradores = await fetch(`${API}/colaborador`);
    const respostaUsuarios = await fetch(`${API}/usuario`);

    if (
        !respostaSetores.ok ||
        !respostaColaboradores.ok ||
        !respostaUsuarios.ok
    ) {
        throw new Error('Não foi possível carregar os dados.');
    }

    const dadosSetores = await respostaSetores.json();
    const dadosColaboradores = await respostaColaboradores.json();
    const dadosUsuarios = await respostaUsuarios.json();

    return {
        setores: dadosSetores.response?.setor || [],
        colaboradores: dadosColaboradores.response?.colaborador || [],
        usuarios: dadosUsuarios.response?.usuario || []
    };

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosSetores;