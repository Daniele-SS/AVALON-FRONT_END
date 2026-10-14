//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';
import Alerta from '../../componentes/cardAlerta/alerta.jsx';

import {
    buscarDadosCadastro,
    atualizarCargo
} from './servicos/editarCargoApi.js';

import validarCargo from './funcoes/editarCargo/validarCargo.js';

import './css-cargos/cadastroCargo.css';

//----------------- COMPONENTE ------------------------------//

function EditarCargo({ cargo, voltar }) {

    const [cargos, setCargos] = useState([]);

    const [nome, setNome] = useState(cargo?.nome || cargo?.nome_cargo || '');
    const [codigo, setCodigo] = useState(cargo?.codigo || '');
    const [descricao, setDescricao] = useState(cargo?.descricao || '');
    const [status, setStatus] = useState(String(cargo?.status ?? '1'));

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

    //----------------- VALIDAR FORMULÁRIO ------------------//

    function validarFormulario() {
        const resultado = validarCargo(
            { nome, codigo, descricao, status },
            cargos,
            cargo?.cargo_id ?? cargo?.id
        );

        setErros(resultado.erros);

        return resultado.valido;
    }

    //----------------- SALVAR ALTERAÇÕES -------------------//

    async function salvarAlteracoes() {
        setErro('');
        setSucesso('');

        if (!validarFormulario()) {
            return;
        }

        setSalvando(true);

        try {
            await atualizarCargo(cargo?.cargo_id ?? cargo?.id, {
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim(),
                status: Number(status)
            });

            setSucesso('Cargo atualizado com sucesso!');
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setSalvando(false);
        }
    }

    //----------------- RENDERIZAR --------------------------//

    return (
        <div className="pagina-cadastro-cargo">

            <BotaoCadastro
                titulo="Editar cargo"
                descricao="Consulte e altere as informações deste cargo."
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
                descricaoCard="Altere os dados do cargo."
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
                textoBotao="Salvar alterações"
                onClickSalvar={salvarAlteracoes}
            />

        </div>
    );
}

//----------------- EXPORTAÇÃO ------------------------------//

export default EditarCargo;