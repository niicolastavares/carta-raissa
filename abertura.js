/*
 * Controle isolado da tela de abertura.
 * Não controla o áudio: o clique em #darPlay continua sendo tratado por script.js.
 * Este arquivo impede que gestos de rolagem alterem a posição da carta antes do play.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const abertura = document.getElementById("aberturaMusical");
    const botaoPlay = document.getElementById("darPlay");
    if (!abertura || !botaoPlay) return;

    let liberada = false;
    let scrollOriginal = 0;

    function travarPagina() {
      scrollOriginal = window.scrollY || window.pageYOffset || 0;
      document.body.style.setProperty("--abertura-scroll-y", String(scrollOriginal));
      document.body.classList.add("abertura-scroll-lock");
      // A abertura deve sempre começar no topo, nunca no fim da carta.
      window.scrollTo(0, 0);
    }

    function liberarPagina() {
      if (liberada) return;
      liberada = true;
      document.body.classList.remove("abertura-scroll-lock");
      document.body.style.removeProperty("--abertura-scroll-y");
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function bloquearRolagem(evento) {
      if (liberada) return;
      evento.preventDefault();
    }

    function bloquearTeclas(evento) {
      if (liberada) return;
      const teclasRolagem = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (teclasRolagem.includes(evento.key) && evento.target !== botaoPlay) {
        evento.preventDefault();
      }
    }

    travarPagina();
    window.addEventListener("wheel", bloquearRolagem, { passive: false });
    window.addEventListener("touchmove", bloquearRolagem, { passive: false });
    window.addEventListener("keydown", bloquearTeclas, { passive: false });

    // O listener de script.js continua iniciando o áudio; este só libera a rolagem.
    botaoPlay.addEventListener("click", function () {
      liberarPagina();
      window.removeEventListener("wheel", bloquearRolagem);
      window.removeEventListener("touchmove", bloquearRolagem);
      window.removeEventListener("keydown", bloquearTeclas);
    });
  });
})();
