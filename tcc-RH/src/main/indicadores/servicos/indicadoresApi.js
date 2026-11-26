/********************************************************************************
 * Objetivo:
 * Buscar e reunir os dados utilizados na tela Indicadores.
 * Identificar o setor do Gestor pelo cadastro do próprio colaborador.
 *
 * Não cria nem utiliza endpoint novo.
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
        throw new Error(
            `Não foi possível buscar ${endpoint}. Código: ${resposta.status}`
        );
    }

    return resposta.json();
}

/**
 * Extrai o cadastro de colaborador de diferentes formatos
 * possíveis de resposta da API.
 */
function extrairColaborador(dados) {
    const response = dados?.response || dados;

    if (Array.isArray(response?.colaborador)) {
        return response.colaborador[0] || null;
    }

    if (response?.colaborador) {
        return response.colaborador;
    }

    if (Array.isArray(response?.colaboradores)) {
        return response.colaboradores[0] || null;
    }

    if (response?.colaboradores) {
        return response.colaboradores;
    }

    return response?.id_colaborador || response?.id
        ? response
        : null;
}

/**
 * Extrai o setor do cadastro do colaborador.
 */
function extrairSetor(colaborador) {
    if (!colaborador) {
        return null;
    }

    const setor = Array.isArray(colaborador.setor)
        ? colaborador.setor[0]
        : colaborador.setor;

    const idSetor = Number(
        colaborador.id_setor ??
        setor?.id ??
        colaborador.setor_id
    );

    if (!Number.isFinite(idSetor) || idSetor <= 0) {
        return null;
    }

    return {
        ...(setor || {}),
        id: idSetor,
        nome:
            setor?.nome ||
            colaborador.nome_setor ||
            'Meu setor'
    };
}

/**
 * Busca o próprio cadastro do Gestor.
 *
 * Tenta os identificadores existentes no objeto de login.
 * Não usa participações de pesquisas para descobrir o setor.
 */
async function buscarSetorDoGestor(usuario = {}) {
    const setorSalvo = extrairSetor(
        usuario.colaborador || usuario
    );

    if (setorSalvo) {
        return setorSalvo;
    }

    const idsPossiveis = [
        usuario.id_colaborador,
        usuario.colaborador?.id_colaborador,
        usuario.colaborador?.id,
        usuario.id
    ]
        .map(Number)
        .filter(id => Number.isFinite(id) && id > 0);

    const idsUnicos = [...new Set(idsPossiveis)];

    for (const id of idsUnicos) {
        try {
            const dados = await requisicaoIndicadores(
                `/colaborador/${id}`
            );

            const colaborador = extrairColaborador(dados);
            const setor = extrairSetor(colaborador);

            if (setor) {
                return setor;
            }
        } catch (error) {
            /*
             * Tenta o próximo identificador.
             * Se nenhum funcionar, retorna null.
             */
            console.warn(
                `Não foi possível consultar o colaborador ${id}:`,
                error.message
            );
        }
    }

    return null;
}

export async function buscarDadosIndicadores(usuario = {}) {
    /*
     * Promise.all não transforma falhas em arrays vazios.
     * Assim, um erro de permissão ou API aparece na tela.
     */
    const [
        dadosAvaliacoes,
        participacoes,
        respostas,
        regras,
        setores,
        dadosFeedbacks,
        setorGestor
    ] = await Promise.all([
        requisicaoIndicadores('/avaliacao'),
        buscarParticipacoesIndicadores(),
        buscarRespostasIndicadores(),
        buscarRegrasIndicadores(),
        buscarSetoresIndicadores(),
        requisicaoIndicadores('/resposta_feedback'),
        buscarSetorDoGestor(usuario)
    ]);

    return {
        avaliacoes:
            dadosAvaliacoes.response?.avaliacoes || [],
        participacoes,
        respostas,
        regras,
        setores,
        feedbacks:
            dadosFeedbacks.response?.respostas || [],
        setorGestor
    };
}