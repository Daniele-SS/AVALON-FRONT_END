
import VisualizarInfo from '../../componentes/visualizarInformacao/visualizarInfo.jsx';


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


//----------------- TELA DE VISUALIZAÇÃO --------------------//

function VisualizarColaborador({
    colaborador,
    voltar,
    onEditar
}) {

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
            informacoes: [
                {
                    nome: 'Benefício 1',
                    valor: 'Plano de saúde'
                },
                {
                    nome: 'Benefício 2',
                    valor: 'Gympass'
                }
            ]
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

export default VisualizarColaborador;
