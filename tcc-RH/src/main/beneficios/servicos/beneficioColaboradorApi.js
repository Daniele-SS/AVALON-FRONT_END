
 //----------------- CONFIGURAÇÃO DA API --------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//------------- BUSCAR VÍNCULOS DOS BENEFÍCIOS --------------//

async function buscarBeneficiosColaboradores() {

    const token = localStorage.getItem('access_token');

    const resposta = await fetch(
        `${API}/beneficio_Colaborador`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && {
                    Authorization: `Bearer ${token}`
                })
            }
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar os vínculos dos benefícios.'
        );
    }

    return dados.response?.beneficioColaborador || [];
}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarBeneficiosColaboradores;
