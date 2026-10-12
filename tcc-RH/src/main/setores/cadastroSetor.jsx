//----------------- IMPORTAÇÕES ----------------------------//

import { useEffect, useState } from 'react';

import BotaoCadastro from '../../componentes/cardNomePag/nomePag.jsx';
import Informacoes from '../../componentes/cardInformacoes/informacoes.jsx';
import ResponsavelSetor from '../../componentes/cardResponsavel/responsavel.jsx';
import RevisaoSetor from '../../componentes/cardRevisao/revisao.jsx';
import BotaoSalvarCancelar from '../../componentes/botoes/botaoSalvarCancelar.jsx';

import './css-setores/cadastroSetor.css';


//----------------- API ------------------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- COMPONENTE -----------------------------//

function CadastroSetor({ voltar }) {

    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState(1);

    const [responsavel, setResponsavel] = useState('');
    const [colaboradores, setColaboradores] = useState([]);
    const [nivelGestor, setNivelGestor] = useState(null);

    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');


    //----------------- BUSCAR DADOS ------------------------//

    useEffect(() => {

        async function carregarDados() {

            try {

                const respostaSetores = await fetch(`${API}/setor`);
                const dadosSetores = await respostaSetores.json();

                if (!respostaSetores.ok) {
                    throw new Error('Erro ao carregar setores.');
                }

                setSetores(dadosSetores.response?.setor || []);

                const respostaUsuarios = await fetch(`${API}/usuario`);
                const dadosUsuarios = await respostaUsuarios.json();

                if (!respostaUsuarios.ok) {
                    throw new Error('Erro ao carregar gestores.');
                }

                const gestores = [];

                (dadosUsuarios.response?.usuario || []).forEach((usuario) => {

                    const niveis = usuario.nivel_acesso?.nivel_acesso || [];

                    if (niveis.some((nivel) => nivel.nome === 'Gestor' && Number(nivel.status) === 1)) {

                        (usuario.colaborador || []).forEach((colaborador) => {

                            if (colaborador.status === 'Ativo') {
                                gestores.push({
                                    id: colaborador.id,
                                    nome: colaborador.nome
                                });
                            }

                        });

                    }

                });

                setColaboradores(gestores);
                setNivelGestor({ id: 2, nome: 'Gestor' });

            } catch (erroApi) {

                setErro(erroApi.message);

            } finally {

                setCarregando(false);

            }

        }

        carregarDados();

    }, []);


    //----------------- VALIDAÇÃO ---------------------------//

    const nomeDuplicado = setores.some((setor) =>
        setor.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    const codigoDuplicado = setores.some((setor) =>
        setor.codigo.trim().toLowerCase() === codigo.trim().toLowerCase()
    );

    const nomeValido = nome.trim() !== '';
    const codigoValido = codigo.trim() !== '';

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

            const resposta = await fetch(`${API}/setor`, {
                method: 'POST',
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

            if (!resposta.ok || resultado.status_code >= 400) {
                throw new Error(
                    resultado.message ||
                    resultado.mensagem ||
                    'Não foi possível cadastrar o setor.'
                );
            }

            setSucesso('Setor cadastrado com sucesso!');

            setSetores([...setores, {
                nome: nome.trim(),
                codigo: codigo.trim(),
                descricao: descricao.trim(),
                status: Number(status)
            }]);

            setNome('');
            setCodigo('');
            setDescricao('');
            setStatus(1);
            setResponsavel('');

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
                        <button type="button" onClick={voltar}>
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

                <ResponsavelSetor
                    responsavel={responsavel}
                    setResponsavel={setResponsavel}
                    colaboradores={colaboradores}
                    nivelGestor={nivelGestor}
                    carregando={carregando}
                />

                <RevisaoSetor
                    nome={nome}
                    codigo={codigo}
                    descricao={descricao}
                    status={status}
                    responsavel={responsavel}
                    colaboradores={colaboradores}
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
                />

            </form>
        </>
    );

}

export default CadastroSetor;