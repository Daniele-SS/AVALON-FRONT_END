
//----------------- API DO MOTOR DE REGRAS -----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

}


//----------------- BUSCAR REGRAS ---------------------------//

async function buscarDadosMotorRegras() {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(
        `${API}/motor_regras`,
        {
            headers: configuracao
        }
    );


    //----------------- VERIFICAR AUTENTICAÇÃO ---------------//

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- VERIFICAR RESPOSTA -------------------//

    if (!resposta.ok) {

        throw new Error(
            'Não foi possível carregar as regras do motor.'
        );

    }


    //----------------- CONVERTER RESPOSTA -------------------//

    const dados = await resposta.json();


    //----------------- ORGANIZAR REGRAS ---------------------//

    const regras =
        dados.response?.motorRegras ??
        dados.motorRegras ??
        [];


    //----------------- CONFERIR DADOS -----------------------//

    console.log('Regras carregadas:', regras);


    //----------------- RETORNAR DADOS -----------------------//

    return regras;

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosMotorRegras;
