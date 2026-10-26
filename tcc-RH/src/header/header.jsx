import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import campainhaIcone from './img/campainha-icon.svg';
import perfilIcone from './img/perfil-icon.svg';
import './css-header/header.css';

function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [usuario, setUsuario] = useState(null);

    const navegar = useNavigate();

    useEffect(() => {
        const usuarioSalvo =
            localStorage.getItem('usuario');

        if (!usuarioSalvo) {
            return;
        }

        try {
            const usuarioConvertido =
                JSON.parse(usuarioSalvo);

            setUsuario(usuarioConvertido);

            console.log(
                'Usuário carregado no Header:',
                usuarioConvertido
            );

        } catch (erro) {
            console.error(
                'Erro ao ler usuário:',
                erro
            );
        }
    }, []);

    function alternarMenu() {
        setMenuAberto(!menuAberto);
    }

    function verMeuPerfil() {
        setMenuAberto(false);

        navegar('/perfil');
    }

    function sair() {
        localStorage.removeItem('usuario');
        localStorage.removeItem('usuarioLogin');
        localStorage.removeItem('access_token');
        localStorage.removeItem('menus');

        setMenuAberto(false);

        navegar('/login');
    }

    const nomeUsuario =
        usuario?.nome ||
        'Usuário';

    const nivelAcesso =
        usuario?.nivel_acesso?.nome ||
        'Usuário';

    return (
        <header>

            <div className="acoes-header">

                <img
                    className="campainha"
                    src={campainhaIcone}
                    alt="Notificações"
                />

                <div className="pefil">

                    <div className="foto-perfil">

                        <img
                            src={perfilIcone}
                            alt="Perfil"
                        />

                    </div>

                    <div className="informacoes">

                        <h4>
                            {nomeUsuario}
                        </h4>

                        <p>
                            {nivelAcesso}
                        </p>

                    </div>

                    <button
                        type="button"
                        className={`seta-perfil ${
                            menuAberto
                                ? 'seta-aberta'
                                : ''
                        }`}
                        onClick={alternarMenu}
                        aria-label="Abrir menu do perfil"
                        aria-expanded={menuAberto}
                    >
                        ⌄
                    </button>

                    {menuAberto && (

                        <div className="dropdown-perfil">

                            <button
                                type="button"
                                onClick={verMeuPerfil}
                            >
                                Ver meu perfil
                            </button>

                            <button
                                type="button"
                                className="botao-sair"
                                onClick={sair}
                            >
                                Sair
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Header;