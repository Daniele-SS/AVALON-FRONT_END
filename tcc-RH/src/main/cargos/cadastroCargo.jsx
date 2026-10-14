//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';

import {
    buscarDadosCadastro,
    cadastrarCargo
} from './servicos/cadastroCargoApi.js';

import validarCargo from './funcoes/cadastroCargo/validarCargo.js';

import './css-cargos/cadastroCargo.css';

//----------------- COMPONENTE ------------------------------//

function CadastroCargo({ voltar }) {

    const [cargos, setCargos] = useState([]);

    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('1');

    const [erros, setErros] = useState({});
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [salvando, setSalvando] = useState(false);

    //----------------- CARREGAR CARGOS ---------------------//

    useEffect(() => {
        async function carregarCargos() {
            try {
                const dados = await buscarDadosCadastro();
                setCargos(dados);
            } catch (erro) {
                setErro(erro.message);
            }
        }

        carregarCargos();
    }, []);

    //----------------- VALIDAR FORMULÁRIO ------------------//

    function validarFormulario() {
        const resultado = validarCargo(
            { nome, codigo, descricao, status },
            cargos
        );

        setErros(resultado.erros);

        return resultado.valido;
    }

    //----------------- CADASTRAR ---------------------------//

    async function salvarCargo() {
        setErro('');
        setSucesso('');

        if (!validarFormulario()) {
            return;
        }

        setSalvando(true);

        try {
            await cadastrarCargo({
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim(),
                status: Number(status)
            });

            setSucesso('Cargo cadastrado com sucesso!');

            setNome('');
            setCodigo('');
            setDescricao('');
            setStatus('1');
            setErros({});

            const dadosAtualizados = await buscarDadosCadastro();
            setCargos(dadosAtualizados);
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setSalvando(false);
        }
    }

    //----------------- ATUALIZAR CAMPOS --------------------//

    function atualizarCampo(campo, valor) {
        if (campo === 'nome') setNome(valor);
        if (campo === 'codigo') setCodigo(valor);
        if (campo === 'descricao') setDescricao(valor);
        if (campo === 'status') setStatus(valor);

        setErros({
            ...erros,
            [campo]: ''
        });
    }

    //----------------- RENDERIZAR --------------------------//

    return (
        <div className="pagina-cadastro-cargo">

            <BotaoCadastro
                titulo="Cadastrar cargo"
                descricao="Preencha as informações para cadastrar um novo cargo."
                textoBotao="Voltar"
                onClick={voltar}
            />

            {erro && (
                <Alerta
                    tipo="erro"
                    mensagem={erro}
                />
            )}

            {sucesso && (
                <Alerta
                    tipo="sucesso"
                    mensagem={sucesso}
                />
            )}

            <Informacoes
                titulo="Informações do cargo"
                descricaoCard="Preencha os dados do cargo."
                nomeEntidade="cargo"
                nome={nome}
                setNome={valor => atualizarCampo('nome', valor)}
                codigo={codigo}
                setCodigo={valor => atualizarCampo('codigo', valor)}
                descricao={descricao}
                setDescricao={valor => atualizarCampo('descricao', valor)}
                status={status}
                setStatus={valor => atualizarCampo('status', valor)}
                campos={['nome', 'codigo', 'descricao', 'status']}
                erros={erros}
            />

            <Revisao
                nome={nome}
                codigo={codigo}
                descricao={descricao}
                status={status}
                nomeEntidade="cargo"
                mostrarResponsavel={false}
                erro={erro}
                sucesso={sucesso}
            />

            <BotaoSalvarCancelar
                voltar={voltar}
                salvando={salvando}
                formularioValido={
                    nome.trim() !== '' &&
                    codigo.trim() !== '' &&
                    descricao.trim() !== ''
                }
                textoBotao="Salvar cargo"
                onClickSalvar={salvarCargo}
            />

        </div>
    );
}

//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroCargo;