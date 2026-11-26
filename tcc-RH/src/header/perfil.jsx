
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import VisualizarColaborador from '../main/colaboradores/visualizarColaborador';

const API_BASE = 'http://localhost:8080/v1/senai/avalon';


//----------------- NORMALIZAR TEXTO -------------------------//

function normalizarTexto(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}


//----------------- OBTER USUÁRIO LOGADO ---------------------//

function obterUsuarioLogado() {
    try {
        const salvo =
            localStorage.getItem('usuario') ||
            localStorage.getItem('usuarioLogin');

        if (!salvo) {
            return {};
        }

        const convertido = JSON.parse(salvo);

        return (
            convertido?.usuario ??
            convertido?.response?.usuario ??
            convertido
        );
    } catch {
        return {};
    }
}


//----------------- OBTER LISTA DA API -----------------------//

function obterLista(resposta, chaves) {
    if (Array.isArray(resposta)) {
        return resposta;
    }

    if (!resposta || typeof resposta !== 'object') {
        return [];
    }

    // Procura primeiro pelas chaves conhecidas.
    for (const chave of chaves) {
        if (Array.isArray(resposta[chave])) {
            return resposta[chave];
        }
    }

    // Procura listas dentro de objetos aninhados.
    for (const valor of Object.values(resposta)) {
        if (Array.isArray(valor)) {
            return valor;
        }

        if (valor && typeof valor === 'object') {
            const listaEncontrada = obterLista(valor, chaves);

            if (listaEncontrada.length > 0) {
                return listaEncontrada;
            }
        }
    }

    return [];
}


//----------------- OBTER ID COLABORADOR ---------------------//

function obterIdColaborador(colaborador) {
    const id =
        colaborador?.id_colaborador ??
        colaborador?.colaborador?.id_colaborador ??
        colaborador?.id;

    return id == null ? null : String(id);
}


//----------------- ENCONTRAR COLABORADOR DO LOGIN ----------//

function encontrarColaboradorLogado(
    usuarioLogado,
    colaboradores
) {
    // O login já fornece o ID do colaborador.
    const idColaboradorLogado =
        usuarioLogado?.id_colaborador ??
        usuarioLogado?.colaborador?.id_colaborador;

    if (idColaboradorLogado != null) {
        const colaboradorPorId = colaboradores.find(
            (item) =>
                obterIdColaborador(item) ===
                String(idColaboradorLogado)
        );

        if (colaboradorPorId) {
            return colaboradorPorId;
        }
    }

    // Fallback caso o login não tenha id_colaborador.
    const idUsuarioLogado =
        usuarioLogado?.id_usuario ??
        usuarioLogado?.id;

    if (idUsuarioLogado != null) {
        const colaboradorPorUsuario = colaboradores.find(
            (item) =>
                String(
                    item?.id_usuario ??
                    item?.usuario?.id_usuario ??
                    item?.usuario?.id ??
                    ''
                ) === String(idUsuarioLogado)
        );

        if (colaboradorPorUsuario) {
            return colaboradorPorUsuario;
        }
    }

    // Fallback por e-mail, se existir.
    const emailLogado = normalizarTexto(
        usuarioLogado?.email
    );

    if (emailLogado) {
        return (
            colaboradores.find((item) => {
                const emailColaborador = normalizarTexto(
                    item?.email ??
                    item?.usuario?.email
                );

                return emailColaborador === emailLogado;
            }) ?? null
        );
    }

    return null;
}


//----------------- COMPONENTE PERFIL ------------------------//

function Perfil() {
    const navegar = useNavigate();

    const [colaborador, setColaborador] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const usuarioLogado = obterUsuarioLogado();

    const nivelAcesso = normalizarTexto(
        usuarioLogado?.nivel_acesso?.nome ??
        usuarioLogado?.nivel_acesso ??
        usuarioLogado?.nivel ??
        ''
    );

    const ehRH = nivelAcesso === 'rh';


    //----------------- CARREGAR PERFIL ----------------------//

    useEffect(() => {
        let componenteAtivo = true;

        async function carregarPerfil() {
            try {
                setCarregando(true);
                setErro('');

                const token =
                    localStorage.getItem('access_token');

                const cabecalho = {
                    'Content-Type': 'application/json',
                };

                if (token) {
                    cabecalho.Authorization =
                        `Bearer ${token}`;
                }

                const respostaColaboradores = await fetch(
                    `${API_BASE}/colaborador`,
                    {
                        method: 'GET',
                        headers: cabecalho,
                    }
                );

                if (!respostaColaboradores.ok) {
                    throw new Error(
                        'Não foi possível buscar os colaboradores.'
                    );
                }

                const dadosColaboradores =
                    await respostaColaboradores.json();

                const colaboradores = obterLista(
                    dadosColaboradores,
                    [
                        'colaboradores',
                        'colaborador',
                        'responseColaboradores',
                        'listaColaboradores',
                    ]
                );

                console.log(
                    'ID DO COLABORADOR NO LOGIN:',
                    usuarioLogado?.id_colaborador
                );

                console.log(
                    'COLABORADORES EXTRAÍDOS:',
                    colaboradores
                );

                const colaboradorEncontrado =
                    encontrarColaboradorLogado(
                        usuarioLogado,
                        colaboradores
                    );

                if (!colaboradorEncontrado) {
                    throw new Error(
                        'Não foi encontrado um colaborador com o ID vinculado ao usuário logado.'
                    );
                }

                if (componenteAtivo) {
                    setColaborador(colaboradorEncontrado);
                }
            } catch (erroCarregamento) {
                console.error(
                    'Erro ao carregar perfil:',
                    erroCarregamento
                );

                if (componenteAtivo) {
                    setErro(
                        erroCarregamento.message ||
                        'Erro ao carregar seu perfil.'
                    );
                }
            } finally {
                if (componenteAtivo) {
                    setCarregando(false);
                }
            }
        }

        carregarPerfil();

        return () => {
            componenteAtivo = false;
        };
    }, []);


    //----------------- VOLTAR -------------------------------//

    function voltar() {
        navegar(-1);
    }


    //----------------- EDITAR PERFIL -------------------------//

    function editarPerfil() {
        if (!ehRH || !colaborador) {
            return;
        }

        navegar('/colaboradores', {
            state: {
                tela: 'edicao',
                colaborador,
                idColaborador:
                    obterIdColaborador(colaborador),
            },
        });
    }


    //----------------- CARREGAMENTO --------------------------//

    if (carregando) {
        return (
            <div className="visualizar-colaborador-pagina">
                <p>Carregando seu perfil...</p>
            </div>
        );
    }


    //----------------- ERRO ---------------------------------//

    if (erro) {
        return (
            <div className="visualizar-colaborador-pagina">

                <button
                    type="button"
                    onClick={voltar}
                >
                    Voltar
                </button>

                <p>{erro}</p>

            </div>
        );
    }


    //----------------- VISUALIZAÇÃO --------------------------//

    return (
        <VisualizarColaborador
            colaborador={colaborador}
            voltar={voltar}
            onEditar={ehRH ? editarPerfil : undefined}
            mostrarBotaoEditar={ehRH}
        />
    );
}

export default Perfil;
