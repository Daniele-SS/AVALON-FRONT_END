
import { useEffect, useState } from 'react';

import VisualizarInfo from '../../componentes/visualizarInformacao/visualizarInfo.jsx';

import {
    buscarBeneficiosColaborador
} from './servicos/beneficioColaboradorApi.js';


//----------------- FORMATAR CPF ----------------------------//

function formatarCPF(cpf) {

    if (!cpf) {
        return 'Não informado';
    }

    const numeros = String(cpf).replace(/\D/g, '');

    if (numeros.length !== 11) {
        return cpf;
    }

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );
}


//----------------- FORMATAR TELEFONE -----------------------//

function formatarTelefone(telefone) {

    if (!telefone) {
        return 'Não informado';
    }

    const numeros = String(telefone).replace(/\D/g, '');

    if (numeros.length === 11) {
        return numeros.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
        );
    }

    if (numeros.length === 10) {
        return numeros.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
        );
    }

    return telefone;
}


//----------------- FORMATAR DATA ---------------------------//

function formatarData(data) {

    if (!data) {
        return 'Não informado';
    }

    const valor = String(data).trim();

    // A data já está no formato brasileiro.
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
        return valor;
    }

    // Converte AAAA-MM-DD para DD/MM/AAAA.
    const resultado = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (resultado) {
        return `${resultado[3]}/${resultado[2]}/${resultado[1]}`;
    }

    return valor;
}


//----------------- CALCULAR IDADE --------------------------//

function calcularIdade(dataNascimento) {

    if (!dataNascimento) {
        return null;
    }

    let ano;
    let mes;
    let dia;

    const data = String(dataNascimento).trim();

    // Data no formato DD/MM/AAAA.
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {

        const partes = data.split('/');

        dia = Number(partes[0]);
        mes = Number(partes[1]);
        ano = Number(partes[2]);

    } else {

        // Data no formato AAAA-MM-DD.
        const resultado = data.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (!resultado) {
            return null;
        }

        ano = Number(resultado[1]);
        mes = Number(resultado[2]);
        dia = Number(resultado[3]);
    }

    const nascimento = new Date(ano, mes - 1, dia);

    if (
        nascimento.getFullYear() !== ano ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getDate() !== dia
    ) {
        return null;
    }

    const hoje = new Date();

    let idade = hoje.getFullYear() - ano;

    const aindaNaoFezAniversario =
        hoje.getMonth() < mes - 1 ||
        (
            hoje.getMonth() === mes - 1 &&
            hoje.getDate() < dia
        );

    if (aindaNaoFezAniversario) {
        idade--;
    }

    if (idade < 0) {
        return null;
    }

    return idade;
}


//----------------- DATA DE NASCIMENTO E IDADE --------------//

function formatarDataNascimento(dataNascimento) {

    if (!dataNascimento) {
        return 'Não informado';
    }

    const dataFormatada = formatarData(dataNascimento);
    const idade = calcularIdade(dataNascimento);

    if (idade === null) {
        return dataFormatada;
    }

    return `${dataFormatada} (${idade} ${idade === 1 ? 'ano' : 'anos'})`;
}


//----------------- COMPONENTE ------------------------------//

function VisualizarColaborador({
    colaborador,
    voltar,
    onEditar
}) {

    //----------------- ESTADOS -----------------------------//

    const [beneficiosVinculados, setBeneficiosVinculados] = useState([]);

    const [carregandoBeneficios, setCarregandoBeneficios] = useState(true);

    const [erroBeneficios, setErroBeneficios] = useState('');


    //----------------- CARREGAR BENEFÍCIOS -----------------//

    useEffect(() => {

        if (!colaborador) {
            setCarregandoBeneficios(false);
            return;
        }

        let componenteAtivo = true;

        async function carregarBeneficios() {

            setCarregandoBeneficios(true);
            setErroBeneficios('');

            try {

                const lista = await buscarBeneficiosColaborador();

                const idColaborador =
                    colaborador.id_colaborador ??
                    colaborador.id ??
                    colaborador.idColaborador;

                // Filtrar somente os vínculos deste colaborador.
                const vinculosDoColaborador = lista.filter((vinculo) => {

                    const colaboradoresVinculados = Array.isArray(
                        vinculo.colaborador
                    )
                        ? vinculo.colaborador
                        : [vinculo.colaborador];

                    return colaboradoresVinculados.some((item) => {

                        const idRelacionado =
                            item?.id_colaborador ??
                            item?.id;

                        return String(idRelacionado) === String(idColaborador);

                    });

                });

                // Considerar somente os vínculos ativos.
                const vinculosAtivos = vinculosDoColaborador.filter((vinculo) => {

                    return (
                        vinculo.ativo === true ||
                        vinculo.ativo === 1 ||
                        vinculo.ativo === '1'
                    );

                });

                // Extrair os benefícios de cada vínculo.
                const beneficios = vinculosAtivos.flatMap((vinculo) => {

                    return vinculo.beneficio?.beneficios || [];

                });

                // Evitar exibir benefícios repetidos.
                const beneficiosUnicos = [
                    ...new Map(
                        beneficios.map((beneficio) => [
                            beneficio.id,
                            beneficio
                        ])
                    ).values()
                ];

                if (componenteAtivo) {
                    setBeneficiosVinculados(beneficiosUnicos);
                }

            } catch (erro) {

                console.error(
                    'Erro ao carregar benefícios do colaborador:',
                    erro
                );

                if (componenteAtivo) {
                    setErroBeneficios(
                        'Não foi possível carregar os benefícios vinculados.'
                    );
                }

            } finally {

                if (componenteAtivo) {
                    setCarregandoBeneficios(false);
                }

            }

        }

        carregarBeneficios();

        return () => {
            componenteAtivo = false;
        };

    }, [colaborador]);


    //----------------- VERIFICAR COLABORADOR ----------------//

    if (!colaborador) {

        return (
            <div>
                <button
                    type="button"
                    onClick={voltar}
                >
                    Voltar
                </button>

                <p>Colaborador não encontrado.</p>
            </div>
        );

    }


    //----------------- INFORMAÇÕES DOS BENEFÍCIOS ------------//

    const informacoesBeneficios = carregandoBeneficios
        ? [
            {
                nome: 'Benefícios',
                valor: 'Carregando benefícios...'
            }
        ]
        : erroBeneficios
            ? [
                {
                    nome: 'Benefícios',
                    valor: erroBeneficios
                }
            ]
            : beneficiosVinculados.length > 0
                ? beneficiosVinculados.map((beneficio, indice) => ({
                    nome: `Benefício ${indice + 1}`,
                    valor: beneficio.nome || 'Nome não informado'
                }))
                : [
                    {
                        nome: 'Benefícios',
                        valor: 'Nenhum benefício vinculado.'
                    }
                ];


    //----------------- CARDS DE DETALHES -------------------//

    const cardsDetalhes = [

        {
            titulo: 'Dados pessoais',

            informacoes: [
                {
                    nome: 'Nome completo',
                    valor: colaborador.nome
                },
                {
                    nome: 'CPF',
                    valor: formatarCPF(colaborador.cpf)
                },
                {
                    nome: 'Data de nascimento',
                    valor: formatarDataNascimento(
                        colaborador.data_nascimento
                    )
                },
                {
                    nome: 'Telefone',
                    valor: formatarTelefone(colaborador.telefone)
                },
                {
                    nome: 'E-mail',
                    valor: colaborador.email
                }
            ]
        },

        {
            titulo: 'Dados profissionais',

            informacoes: [
                {
                    nome: 'Matrícula',
                    valor: colaborador.matricula
                },
                {
                    nome: 'Regime de trabalho',
                    valor: colaborador.tipo_vinculo
                },
                {
                    nome: 'Gestor direto',
                    valor: colaborador.gestor_direto || 'Não identificado'
                },
                {
                    nome: 'Data de admissão',
                    valor: formatarData(colaborador.data_admissao)
                }
            ]
        },

        {
            titulo: 'Benefícios vinculados',
            ocuparLinhaToda: true,
            informacoes: informacoesBeneficios
        }

    ];


    //----------------- RETORNO JSX -------------------------//

    return (

        <div className="visualizar-colaborador-pagina">

            <VisualizarInfo

                nome={colaborador.nome}

                foto={colaborador.foto}

                mostrarFoto={true}

                informacoes={[
                    {
                        nome: 'Cargo',
                        valor: colaborador.nome_cargo || colaborador.cargo
                    },
                    {
                        nome: 'Setor',
                        valor: colaborador.nome_setor || colaborador.setor
                    },
                    {
                        nome: 'Status',
                        valor: colaborador.status
                    }
                ]}

                cardsDetalhes={cardsDetalhes}

                textoBotaoDesativar="Desativar colaborador"

                textoBotaoEditar="Editar dados"

                onVoltar={voltar}

                onEditar={onEditar}

            />

        </div>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default VisualizarColaborador;
