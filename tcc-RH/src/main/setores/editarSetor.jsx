
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import RevisaoSetor from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import { buscarDadosCadastro } from './servicos/cadastroSetorApi.js';
import { atualizarSetor } from './servicos/editarSetorApi.js';

import validarSetor from './funcoes/editarSetor/validarSetor.js';

import './css-setores/cadastroSetor.css';


//----------------- COMPONENTE ------------------------------//

function EditarSetor({ setor, voltar }) {

    //----------------- ESTADOS -----------------------------//

    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(1);

    const [setores, setSetores] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');


    //----------------- CARREGAR SETOR ----------------------//

    useEffect(() => {

        if (setor) {
            setNome(setor.nome || '');
            setCodigo(setor.codigo || '');
            setDescricao(setor.descricao || '');
            setStatus(Number(setor.status));
        }

    }, [setor]);


    //----------------- BUSCAR SETORES ----------------------//

    useEffect(() => {

        async function carregarSetores() {

            try {

                const dadosSetores = await buscarDadosCadastro();
                setSetores(dadosSetores);

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarSetores();

    }, []);


    //----------------- VALIDAÇÃO ---------------------------//

    const validacao = validarSetor(
        nome,
        codigo,
        setores,
        setor?.id ?? null
    );

    const nomeValido = validacao.nomeValido;
    const codigoValido = validacao.codigoValido;

    const nomeDuplicado = validacao.nomeDuplicado;
    const codigoDuplicado = validacao.codigoDuplicado;

    const formularioValido =
        nomeValido &&
        codigoValido &&
        !nomeDuplicado &&
        !codigoDuplicado &&
        !carregando &&
        !salvando;


    //----------------- ATUALIZAR SETOR ---------------------//

    async function salvarAlteracoes(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

        if (!setor) {
            setErro('Nenhum setor foi selecionado para edição.');
            return;
        }

        if (!formularioValido) {
            setErro('Verifique o nome e o código do setor.');
            return;
        }

        setSalvando(true);

        try {

            const dadosSetor = {
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim() || 'Nenhuma descrição informada.',
                status: Number(status)
            };

            await atualizarSetor(setor.id, dadosSetor);

            setSucesso('Setor atualizado com sucesso!');

            voltar();

        } catch (erroApi) {

            setErro(erroApi.message);

        } finally {

            setSalvando(false);

        }

    }


    //----------------- VERIFICAR SETOR ---------------------//

    if (!setor) {
        return <p>Nenhum setor foi selecionado para edição.</p>;
    }


    //----------------- TELA --------------------------------//

    return (

        <>

            <div className="cabecalho-novo-setor">

                <BotaoCadastro
                    titulo="Editar setor"
                    descricao="Atualize os dados cadastrais e o status do setor."
                >

                    <nav className="caminho-cadastro-setor">

                        <button type="button" onClick={voltar}>
                            Setores
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-setor">
                            Editar setor
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            <form onSubmit={salvarAlteracoes}>

                <Informacoes
                    titulo="Informações do setor"
                    descricaoCard="Edite os dados de identificação e classificação do setor."
                    nomeEntidade="setor"
                    nome={nome}
                    setNome={setNome}
                    codigo={codigo}
                    setCodigo={setCodigo}
                    descricao={descricao}
                    setDescricao={setDescricao}
                    status={status}
                    setStatus={setStatus}
                    campos={['nome', 'codigo', 'descricao', 'status']}
                />


                <RevisaoSetor
                    nome={nome}
                    codigo={codigo}
                    descricao={descricao}
                    status={status}
                    responsavel=""
                    colaboradores={[]}
                    nomeValido={nomeValido}
                    codigoValido={codigoValido}
                    nomeDuplicado={nomeDuplicado}
                    codigoDuplicado={codigoDuplicado}
                    erro={erro}
                    sucesso={sucesso}
                />


                <BotaoSalvarCancelar
                    voltar={voltar}
                    salvando={salvando}
                    formularioValido={formularioValido}
                    textoBotao="Salvar alterações"
                />

            </form>


            {carregando && (
                <p>Carregando dados...</p>
            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default EditarSetor;
