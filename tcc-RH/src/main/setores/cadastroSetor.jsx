
//----------------- IMPORTAÇÕES -----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import Revisao from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import {
    buscarDadosCadastro,
    cadastrarSetor
} from './servicos/cadastroSetorApi.js';

import validarSetor from './funcoes/cadastroSetor/validarSetor.js';

import './css-setores/cadastroSetor.css';


//----------------- COMPONENTE ------------------------------//

function CadastroSetor({ voltar }) {

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


    //----------------- BUSCAR DADOS ------------------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                const dadosSetores = await buscarDadosCadastro();

                setSetores(dadosSetores);

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, []);


    //----------------- VALIDAÇÃO ---------------------------//

    const validacao = validarSetor(nome, codigo, setores);

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


    //----------------- SALVAR SETOR ------------------------//

    async function salvarSetor(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

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

            await cadastrarSetor(dadosSetor);

            setSucesso('Setor cadastrado com sucesso!');

            const dadosSetores = await buscarDadosCadastro();

            setSetores(dadosSetores);

            setNome('');
            setCodigo('');
            setDescricao('');
            setStatus(1);

        } catch (erroApi) {

            setErro(erroApi.message);

        } finally {

            setSalvando(false);

        }

    }


    //----------------- TELA --------------------------------//

    return (

        <>

            <div className="cabecalho-novo-setor">

                <BotaoCadastro
                    titulo="Novo setor"
                    descricao="Gerencie dados cadastrais, vínculos funcionais e status operacionais dos colaboradores."
                >

                    <nav className="caminho-cadastro-setor">

                        <button
                            type="button"
                            onClick={voltar}
                        >
                            Setores
                        </button>

                        <span className="seta">&gt;</span>

                        <span className="pagina-atual-setor">
                            Novo setor
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            <form onSubmit={salvarSetor}>

                <Informacoes
                    titulo="Informações do setor"
                    descricaoCard="Dados de identificação institucional e classificação organizacional."
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


                <Revisao
                    nome={nome}
                    codigo={codigo}
                    descricao={descricao}
                    status={status}

                    tituloNome="Nome do setor"
                    tituloCodigo="Código do setor"

                    mostrarResponsavel={false}

                    erro={erro}
                    sucesso={sucesso}
                />


                <BotaoSalvarCancelar
                    voltar={voltar}
                    salvando={salvando}
                    formularioValido={formularioValido}
                />

            </form>


            {carregando && (
                <p>Carregando dados...</p>
            )}

        </>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CadastroSetor;
