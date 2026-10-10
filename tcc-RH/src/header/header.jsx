import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import campainhaIcone from './img/campainha-icon.svg';
import perfilIcone from './img/perfil-icon.svg';
import './css-header/header.css';

function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
     const navegar = useNavigate();

    function alternarMenu() {
        setMenuAberto(!menuAberto);
    }

    function verMeuPerfil() {
        console.log('Abrir meu perfil');
        setMenuAberto(false);
    }

    function sair() {
       
        setMenuAberto(false);
        navegar('/login');
    }

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
                        <img src={perfilIcone} alt="Perfil" />
                    </div>

                    <div className="informacoes">
                        <h4>Vitor Isidio</h4>
                        <p>RH</p>
                    </div>

                    <button
                        type="button"
                        className={`seta-perfil ${menuAberto ? 'seta-aberta' : ''}`}
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