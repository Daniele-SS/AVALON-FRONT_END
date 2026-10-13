//----------------- IMPORTAÇÕES ----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import RevisaoSetor from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import './css-setores/cadastroSetor.css';


//----------------- API ------------------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- COMPONENTE -----------------------------//

function EditarSetor({ setor, voltar }) {

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

        async function buscarSetores() {

            try {

                const resposta = await fetch(`${API}/setor`);

                if (!resposta.ok) {
                    throw new Error('Erro ao carregar os setores.');
                }

                const resultado = await resposta.json();

                setSetores(resultado.response?.setor || []);

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        buscarSetores();

    }, []);


    //----------------- VALIDAÇÃO ---------------------------//

    const nomeDuplicado = setores.some(setorAtual =>

        Number(setorAtual.id) !== Number(setor.id) &&

        (setorAtual.nome || '').trim().toLowerCase() ===
        nome.trim().toLowerCase()

    );


    const codigoDuplicado = setores.some(setorAtual =>

        Number(setorAtual.id) !== Number(setor.id) &&

        (setorAtual.codigo || '').trim().toLowerCase() ===
        codigo.trim().toLowerCase()

    );


    const nomeValido = nome.trim() !== '';
    const codigoValido = codigo.trim() !== '';
    const descricaoValida = descricao.trim() !== '';

    const formularioValido =
        nomeValido &&
        codigoValido &&
        descricaoValida &&
        !nomeDuplicado &&
        !codigoDuplicado &&
        !carregando &&
        !salvando;


    //----------------- ATUALIZAR SETOR ---------------------//

    async function salvarAlteracoes(evento) {

        evento.preventDefault();

        setErro('');
        setSucesso('');

        if (!formularioValido) {

            setErro('Verifique o nome, o código e a descrição do setor.');

            return;

        }

        setSalvando(true);

        try {

            const resposta = await fetch(`${API}/setor/${setor.id}`, {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    nome: nome.trim(),
                    codigo: codigo.trim(),
                    descricao: descricao.trim(),
                    status: Number(status)

                })

            });


            const resultado = await resposta.json();


            if (!resposta.ok || Number(resultado.status_code) >= 400) {

                throw new Error(
                    resultado.message ||
                    resultado.mensagem ||
                    'Não foi possível atualizar o setor.'
                );

            }


            setSucesso('Setor atualizado com sucesso!');

            voltar();

        } catch (erroApi) {

            setErro(erroApi.message);

        } finally {

            setSalvando(false);

        }

    }


    //----------------- TELA --------------------------------//

    if (!setor) {

        return <p>Nenhum setor foi selecionado para edição.</p>;

    }


    return (
        <>

            {/* CABEÇALHO */}

            <div className="cabecalho-novo-setor">

                <BotaoCadastro
                    titulo="Editar setor"
                    descricao="Atualize os dados cadastrais e o status do setor."
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
                            Editar setor
                        </span>

                    </nav>

                </BotaoCadastro>

            </div>


            {/* FORMULÁRIO */}

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


                {/* REVISÃO */}

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


                {/* BOTÕES */}

                <BotaoSalvarCancelar
                    voltar={voltar}
                    salvando={salvando}
                    formularioValido={formularioValido}
                    textoBotao="Salvar alterações"
                />

            </form>

        </>
    );

}


//----------------- EXPORTAÇÃO -----------------------------//

export default EditarSetor;