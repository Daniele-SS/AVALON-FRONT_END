
/********************************************************************************
 * Objetivo: Buscar e reunir todos os dados utilizados na tela Indicadores.
 ********************************************************************************/

import { buscarSetoresIndicadores } from './setoresIndicadoresApi';

import {
    buscarRespostasIndicadores,
    buscarParticipacoesIndicadores,
    buscarRegrasIndicadores
} from './respostasIndicadoresApi';

const URL_API = 'http://localhost:8080/v1/senai/avalon';

async function requisicaoIndicadores(endpoint) {
    const token = localStorage.getItem('access_token');

    const resposta = await fetch(`${URL_API}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && {
                Authorization: `Bearer ${token}`
            })
        }
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        throw new Error(`Não foi possível buscar ${endpoint}.`);
    }

    return resposta.json();
}

export async function buscarDadosIndicadores() {
    const resultados = await Promise.allSettled([
        requisicaoIndicadores('/avaliacao'),
        buscarParticipacoesIndicadores(),
        buscarRespostasIndicadores(),
        buscarRegrasIndicadores(),
        buscarSetoresIndicadores(),
        requisicaoIndicadores('/resposta_feedback')
    ]);

    // Se uma API falhar, as outras ainda podem fornecer dados
    const obterResultado = (indice, caminho) => {
        const resultado = resultados[indice];

        if (resultado.status !== 'fulfilled') {
            return [];
        }

        const valor = resultado.value;

        if (Array.isArray(valor)) {
            return valor;
        }

        return caminho
            .split('.')
            .reduce((objeto, chave) => objeto?.[chave], valor) || [];
    };

    return {
        avaliacoes: obterResultado(0, 'response.avaliacoes'),
        participacoes: obterResultado(1, ''),
        respostas: obterResultado(2, ''),
        regras: obterResultado(3, ''),
        setores: obterResultado(4, ''),
        feedbacks: obterResultado(5, 'response.respostas')
    };
}
