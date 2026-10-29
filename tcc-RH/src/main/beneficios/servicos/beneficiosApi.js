
 //----------------- CONFIGURAÇÃO DA API --------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR BENEFÍCIOS -----------------------//

async function buscarBeneficios() {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${API}/beneficio`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar os benefícios.'
        );
    }

    return dados.response?.beneficios || [];
}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarBeneficios;
