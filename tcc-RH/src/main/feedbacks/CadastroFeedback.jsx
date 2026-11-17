
/********************************************************************************
 * Objetivo: Tela de cadastro de um novo Feedback.
 ********************************************************************************/

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';

import {
    buscarColaboradoresAtivos,
    cadastrarFeedback
} from './servicos/cadastroFeedbackApi';

import './css-feedbacks/cadastroFeedback.css';
import '../../componentes/cardNomePag/nomePag.css';

function CadastroFeedback({ onVoltar, onSucesso }) {

    //----------------- ESTADOS ---------------------------//

    const [colaboradores, setColaboradores] = useState([]);

    const [formulario, setFormulario] = useState({
        id_colaborador_destinatario: '',
        tipo: '',
        data_feedback: new Date().toLocaleDateString('en-CA'),
        descricao: ''
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    //----------------- TIPOS DE FEEDBACK -----------------//

    const tiposFeedback = [
        { id: 'RECONHECIMENTO', nome: 'Reconhecimento' },
        { id: 'DESENVOLVIMENTO', nome: 'Desenvolvimento' },
        { id: 'COMUNICACAO', nome: 'Comunicação' },
        { id: 'COLABORACAO', nome: 'Colaboração' }
    ];

    //----------------- BUSCAR COLABORADORES -------------//

    useEffect(() => {

        async function carregarColaboradores() {

            try {

                setCarregando(true);
                setErro('');

                const dados = await buscarColaboradoresAtivos();

                setColaboradores(dados);

            } catch (erro) {

                console.error('Erro ao buscar colaboradores:', erro);

                setErro(
                    erro.message || 'Não foi possível carregar os colaboradores.'
                );

            } finally {

                setCarregando(false);

            }

        }

        carregarColaboradores();

    }, []);

    //----------------- ATUALIZAR CAMPOS ------------------//

    function atualizarCampo(evento) {

        const { name, value } = evento.target;

        setFormulario(dadosAnteriores => ({
            ...dadosAnteriores,
            [name]: value
        }));

    }

    //----------------- VALIDAR FORMULÁRIO ---------------//

    function validarFormulario() {

        if (!formulario.id_colaborador_destinatario) {
            return 'Selecione o colaborador que receberá o feedback.';
        }

        if (!formulario.tipo) {
            return 'Selecione o tipo do feedback.';
        }

        if (!formulario.data_feedback) {
            return 'Informe a data do feedback.';
        }

        if (formulario.descricao.trim().length > 1000) {
            return 'A descrição deve possuir no máximo 1000 caracteres.';
        }

        return '';

    }

    //----------------- SALVAR FEEDBACK -------------------//

    async function salvarFeedback(evento) {

        evento.preventDefault();

        const mensagemValidacao = validarFormulario();

        if (mensagemValidacao) {
            setErro(mensagemValidacao);
            setSucesso('');
            return;
        }

        try {

            setSalvando(true);
            setErro('');
            setSucesso('');

            // Busca os dados do usuário autenticado.
            const usuarioSalvo = localStorage.getItem('usuario');

            if (!usuarioSalvo) {
                throw new Error(
                    'Não foi possível identificar o usuário autenticado. Faça login novamente.'
                );
            }

            const usuario = JSON.parse(usuarioSalvo);

            const idRemetente = Number(usuario.id_colaborador);

            if (!idRemetente || isNaN(idRemetente)) {
                throw new Error(
                    'O usuário autenticado não possui um colaborador vinculado.'
                );
            }

            // Monta os dados para enviar ao backend.
            const dadosFeedback = {
                id_colaborador_remetente: idRemetente,
                id_colaborador_destinatario: Number(
                    formulario.id_colaborador_destinatario
                ),
                tipo: formulario.tipo,
                descricao: formulario.descricao.trim() || null,
                data_feedback: formulario.data_feedback,
                ativo: 1
            };

            await cadastrarFeedback(dadosFeedback);

            setSucesso('Feedback cadastrado com sucesso!');

            await onSucesso();

        } catch (erro) {

            console.error('Erro ao cadastrar feedback:', erro);

            setErro(
                erro.message || 'Não foi possível cadastrar o feedback.'
            );

        } finally {

            setSalvando(false);

        }

    }

    //----------------- RETORNAR TELA ---------------------//

    return (

        <div className="pagina-cadastro-feedback">

            <BotaoCadastro
                titulo="Novo Feedback"
                descricao="Registre um feedback para reconhecer, orientar e contribuir com o desenvolvimento de um colaborador."
                textoBotao="Voltar"
                onClick={onVoltar}
            />

            {/*----------------- FORMULÁRIO -----------------*/}

            <form
                className="formulario-feedback"
                onSubmit={salvarFeedback}
            >

                <div className="cabecalho-formulario-feedback">

                    <div>
                        <h2>Informações do Feedback</h2>

                        <p>
                            Preencha os campos abaixo para registrar um novo feedback.
                        </p>
                    </div>

                    <span className="campo-obrigatorio-feedback">
                        * Campos obrigatórios
                    </span>

                </div>

                {/* DESTINATÁRIO */}

                <div className="campo-feedback">

                    <label htmlFor="destinatario-feedback">
                        Colaborador destinatário *
                    </label>

                    <select
                        id="destinatario-feedback"
                        name="id_colaborador_destinatario"
                        value={formulario.id_colaborador_destinatario}
                        onChange={atualizarCampo}
                        disabled={carregando || salvando}
                        required
                    >

                        <option value="">
                            {carregando
                                ? 'Carregando colaboradores...'
                                : 'Selecione um colaborador'}
                        </option>

                        {colaboradores.map(colaborador => (

                            <option
                                key={colaborador.id}
                                value={colaborador.id}
                            >
                                {colaborador.nome}
                            </option>

                        ))}

                    </select>

                    {!carregando && colaboradores.length === 0 && !erro && (

                        <small>
                            Não existem outros colaboradores ativos disponíveis.
                        </small>

                    )}

                </div>

                {/* TIPO E DATA */}

                <div className="campos-duplos-feedback">

                    <div className="campo-feedback">

                        <label htmlFor="tipo-feedback">
                            Tipo de feedback *
                        </label>

                        <select
                            id="tipo-feedback"
                            name="tipo"
                            value={formulario.tipo}
                            onChange={atualizarCampo}
                            disabled={salvando}
                            required
                        >

                            <option value="">
                                Selecione o tipo
                            </option>

                            {tiposFeedback.map(tipo => (

                                <option
                                    key={tipo.id}
                                    value={tipo.id}
                                >
                                    {tipo.nome}
                                </option>

                            ))}

                        </select>

                    </div>

                    <div className="campo-feedback">

                        <label htmlFor="data-feedback">
                            Data do feedback *
                        </label>

                        <input
                            type="date"
                            id="data-feedback"
                            name="data_feedback"
                            value={formulario.data_feedback}
                            onChange={atualizarCampo}
                            disabled={salvando}
                            required
                        />

                    </div>

                </div>

                {/* DESCRIÇÃO */}

                <div className="campo-feedback">

                    <label htmlFor="descricao-feedback">
                        Descrição do feedback
                    </label>

                    <textarea
                        id="descricao-feedback"
                        name="descricao"
                        value={formulario.descricao}
                        onChange={atualizarCampo}
                        placeholder="Descreva o feedback que deseja registrar..."
                        rows="6"
                        maxLength="1000"
                        disabled={salvando}
                    />

                    <small>
                        {formulario.descricao.length}/1000 caracteres
                    </small>

                </div>

                {/* MENSAGENS */}

                {erro && (
                    <div className="mensagem-formulario-feedback erro-feedback">
                        {erro}
                    </div>
                )}

                {sucesso && (
                    <div className="mensagem-formulario-feedback sucesso-feedback">
                        {sucesso}
                    </div>
                )}

                {/* BOTÕES */}

                <div className="rodape-formulario-feedback">

                    <button
                        type="button"
                        className="botao-cancelar-feedback"
                        onClick={onVoltar}
                        disabled={salvando}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="botao-salvar-feedback"
                        disabled={
                            salvando ||
                            carregando ||
                            colaboradores.length === 0
                        }
                    >
                        {salvando ? 'Salvando...' : 'Salvar Feedback'}
                    </button>

                </div>

            </form>

        </div>

    );

}

export default CadastroFeedback;
