
import { useState } from 'react';

import './JornadaEscala.css';

function JornadaEscala({ dados, setDados, jornadas = [] }) {

    //----------------- ESTADOS -----------------------------//

    const [listaAberta, setListaAberta] = useState(false);


    //----------------- FUNÇÕES -----------------------------//

    function atualizarJornada(jornada) {
        setDados({
            ...dados,
            idJornadaEscala:
                jornada.id_jornada_escala ?? jornada.id
        });

        setListaAberta(false);
    }


    function formatarHorario(horario) {
        if (!horario) {
            return '--:--';
        }

        return String(horario).slice(0, 5);
    }


    function formatarDias(jornada) {
        const dias = jornada.dias_semana || jornada.dias || [];

        if (typeof dias === 'string') {
            return dias;
        }

        if (!Array.isArray(dias) || dias.length === 0) {
            return '';
        }

        const nomesDias = dias.map((dia) => {
            if (typeof dia === 'string') {
                return dia;
            }

            return (
                dia.nome ||
                dia.dia_semana ||
                dia.nome_dia ||
                dia.nome_dia_semana ||
                ''
            );
        }).filter(Boolean);

        const abreviacoes = {
            'Segunda-feira': 'Seg',
            'Terça-feira': 'Ter',
            'Quarta-feira': 'Qua',
            'Quinta-feira': 'Qui',
            'Sexta-feira': 'Sex',
            'Sábado': 'Sáb',
            'Domingo': 'Dom'
        };

        return nomesDias
            .map((dia) => abreviacoes[dia] || dia)
            .join(', ');
    }


    function nomeJornada(jornada) {
        return (
            jornada.nome ||
            jornada.nome_jornada ||
            jornada.descricao ||
            'Jornada'
        );
    }


    function horarioJornada(jornada) {

        // A API retorna hora_inicio e hora_fim.
        // Os outros nomes ficam como alternativas.
        const horarioEntrada =
            jornada.hora_inicio ||
            jornada.horario_entrada ||
            jornada.hora_entrada ||
            jornada.inicio;

        const horarioSaida =
            jornada.hora_fim ||
            jornada.horario_saida ||
            jornada.hora_saida ||
            jornada.fim;

        const entrada = formatarHorario(horarioEntrada);
        const saida = formatarHorario(horarioSaida);

        return `${entrada} às ${saida}`;
    }


    function diasJornada(jornada) {
        const dias = formatarDias(jornada);

        return dias ? `(${dias})` : '';
    }


    //----------------- JORNADA SELECIONADA ------------------//

    const jornadaSelecionada = jornadas.find((jornada) => {
        const idJornada =
            jornada.id_jornada_escala ?? jornada.id;

        return (
            String(idJornada) ===
            String(dados.idJornadaEscala)
        );
    });


    //----------------- TELA --------------------------------//

    return (
        <section className="card-jornada-escala">

            <div className="cabecalho-jornada-escala">

                <div>
                    <h2>Jornada e escala</h2>

                    <p>
                        Turnos, Carga horária semanal e Feriados
                    </p>
                </div>

                <span className="etapa-jornada-escala">
                    Etapa essencial
                </span>

            </div>


            <div className="conteudo-jornada-escala">

                <label className="rotulo-jornada-escala">
                    Jornada de trabalho
                </label>


                <div className="seletor-jornada-escala">

                    <button
                        type="button"
                        className="botao-jornada-escala"
                        onClick={() => setListaAberta(!listaAberta)}
                        aria-expanded={listaAberta}
                    >

                        <div className="texto-jornada-selecionada">

                            <span className="nome-jornada-selecionada">
                                {jornadaSelecionada
                                    ? nomeJornada(jornadaSelecionada)
                                    : 'Selecione uma jornada'}
                            </span>

                            {jornadaSelecionada && (
                                <span className="detalhes-jornada-selecionada">
                                    {horarioJornada(jornadaSelecionada)}
                                    {' '}
                                    {diasJornada(jornadaSelecionada)}
                                </span>
                            )}

                        </div>

                        <span
                            className={`seta-jornada-escala ${
                                listaAberta ? 'aberta' : ''
                            }`}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6 9L12 15L18 9"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>

                    </button>


                    {listaAberta && (
                        <div className="lista-jornadas-escala">

                            {jornadas.length > 0 ? (

                                jornadas.map((jornada) => {

                                    const idJornada =
                                        jornada.id_jornada_escala ??
                                        jornada.id;

                                    const selecionada =
                                        String(idJornada) ===
                                        String(dados.idJornadaEscala);

                                    return (
                                        <button
                                            type="button"
                                            key={idJornada}
                                            className={`opcao-jornada-escala ${
                                                selecionada ? 'selecionada' : ''
                                            }`}
                                            onClick={() =>
                                                atualizarJornada(jornada)
                                            }
                                        >

                                            <span className="icone-relogio-jornada">
                                                <svg
                                                    width="19"
                                                    height="19"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="9"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                    />

                                                    <path
                                                        d="M12 7V12L15 14"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </span>


                                            <span className="texto-opcao-jornada">

                                                <span className="nome-opcao-jornada">
                                                    {nomeJornada(jornada)}
                                                </span>

                                                <span className="detalhes-opcao-jornada">
                                                    {horarioJornada(jornada)}
                                                    {' '}
                                                    {diasJornada(jornada)}
                                                </span>

                                            </span>


                                            {selecionada && (
                                                <span className="confirmacao-jornada">
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            d="M5 12L10 17L19 7"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </span>
                                            )}

                                        </button>
                                    );
                                })

                            ) : (

                                <p className="mensagem-sem-jornada">
                                    Nenhuma jornada disponível.
                                </p>

                            )}

                        </div>
                    )}

                </div>

            </div>

        </section>
    );
}

export default JornadaEscala;
