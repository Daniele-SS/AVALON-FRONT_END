
 //----------------- IMPORTAÇÕES -----------------------------//

import './cardJornada.css';

import entradaIcone from '../img/entrada-icon.svg';
import saidaIcone from '../img/saida-icon.svg';


//----------------- COMPONENTE ------------------------------//

function CardJornada({
    jornada,
    diasSemana = [],
    onVerDetalhes
}) {

    //----------------- DADOS DA JORNADA --------------------//

    const ativa = Number(jornada.status) === 1;

    const horaInicio = String(
        jornada.hora_inicio || ''
    ).slice(0, 5);

    const horaFim = String(
        jornada.hora_fim || ''
    ).slice(0, 5);

    const noturna = Boolean(
        horaInicio &&
        horaFim &&
        horaFim < horaInicio
    );


    //----------------- DIAS DA SEMANA ----------------------//

    const dias = [
        { nome: 'Segunda-feira', sigla: 'SEG', inicial: 'S' },
        { nome: 'Terça-feira', sigla: 'TER', inicial: 'T' },
        { nome: 'Quarta-feira', sigla: 'QUA', inicial: 'Q' },
        { nome: 'Quinta-feira', sigla: 'QUI', inicial: 'Q' },
        { nome: 'Sexta-feira', sigla: 'SEX', inicial: 'S' },
        { nome: 'Sábado', sigla: 'SAB', inicial: 'S' },
        { nome: 'Domingo', sigla: 'DOM', inicial: 'D' }
    ];


    //----------------- TELA --------------------------------//

    return (

        <article className="card-jornada">

            {/* CABEÇALHO */}

            <div className="cabecalho-card-jornada">

                <h3 className="titulo-card-jornada">
                    {jornada.nome}
                </h3>

                <span
                    className={
                        ativa
                            ? 'status-jornada status-jornada-ativo'
                            : 'status-jornada status-jornada-inativo'
                    }
                >
                    ● {ativa ? 'ativo' : 'inativo'}
                </span>

            </div>


            {/* DESCRIÇÃO */}

            <p className="descricao-card-jornada">
                {jornada.descricao || 'Nenhuma descrição informada.'}
            </p>


            {/* HORÁRIOS */}

            <div className="horarios-card-jornada">

                <div className="linha-horarios-jornada">

                    {/* HORÁRIO DE ENTRADA */}

                    <div className="horario-jornada">

                        <span className="icone-horario-jornada">

                            <img
                                src={entradaIcone}
                                alt="Ícone de entrada"
                            />

                        </span>

                        <span>
                            {horaInicio || '--:--'} entrada
                        </span>

                    </div>


                    {/* HORÁRIO DE SAÍDA */}

                    <div className="horario-jornada">

                        <span>
                            {horaFim || '--:--'} saída
                        </span>

                        <span className="icone-horario-jornada">

                            <img
                                src={saidaIcone}
                                alt="Ícone de saída"
                            />

                        </span>

                    </div>

                </div>


                {/* BARRA DE HORÁRIO */}

                <div className="barra-fundo-jornada">

                    <div
                        className={
                            noturna
                                ? 'barra-preenchida-jornada barra-jornada-noturna'
                                : 'barra-preenchida-jornada'
                        }
                    />

                </div>


                {/* LEGENDA */}

                <div className="legenda-horarios-jornada">

                    <span>
                        {horaInicio || '--:--'} entrada
                    </span>

                    <span>
                        {horaFim || '--:--'} saída
                    </span>

                </div>

            </div>


            {/* RODAPÉ */}

            <div className="rodape-card-jornada">

                {/* DIAS DA SEMANA */}

                <div className="dias-semana-jornada">

                    {dias.map((dia) => {

                        const diaAtivo = diasSemana.some((item) => {

                            const idJornadaDireto =
                                item.id_jornada_escala;

                            const jornadaDoDia =
                                item.jornada_escala?.jornadaEscala || [];

                            const pertencePeloObjeto =
                                Array.isArray(jornadaDoDia) &&
                                jornadaDoDia.some(
                                    (jornadaRelacionada) =>
                                        Number(jornadaRelacionada.id) ===
                                        Number(jornada.id)
                                );

                            const pertencePeloId =
                                idJornadaDireto !== undefined &&
                                idJornadaDireto !== null &&
                                Number(idJornadaDireto) ===
                                Number(jornada.id);

                            const mesmoDia =
                                String(item.dia_sigla || '')
                                    .trim()
                                    .toUpperCase() === dia.sigla;

                            const ativo = Number(item.ativo) === 1;

                            return (
                                (pertencePeloId || pertencePeloObjeto) &&
                                mesmoDia &&
                                ativo
                            );

                        });


                        return (

                            <span
                                className={
                                    diaAtivo
                                        ? 'dia-semana-jornada dia-semana-ativo'
                                        : 'dia-semana-jornada'
                                }
                                title={dia.nome}
                                key={dia.sigla}
                            >
                                {dia.inicial}
                            </span>

                        );

                    })}

                </div>


                {/* VER DETALHES */}

                <span
                    className="detalhes-card-jornada"
                    onClick={() => onVerDetalhes(jornada)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(evento) => {
                        if (
                            evento.key === 'Enter' ||
                            evento.key === ' '
                        ) {
                            evento.preventDefault();
                            onVerDetalhes(jornada);
                        }
                    }}
                >
                    Ver detalhes
                </span>

            </div>

        </article>

    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default CardJornada;
