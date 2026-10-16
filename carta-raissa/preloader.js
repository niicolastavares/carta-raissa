/*
 * Nova capa de entrada do site.
 * Não inicia a música nem altera o comportamento do vinil: apenas revela a abertura original.
 */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    const capa = document.getElementById("preloaderEntrada");
    const botao = document.getElementById("entrarNaPagina");
    const aberturaOriginal = document.getElementById("aberturaMusical");
    if (!capa || !botao) return;

    function entrar() {
      if (capa.classList.contains("is-saindo")) return;
      capa.classList.add("is-saindo");
      capa.setAttribute("aria-hidden", "true");
      botao.setAttribute("tabindex", "-1");
      if (aberturaOriginal) {
        aberturaOriginal.setAttribute("aria-hidden", "false");
      }
      const removerCapa = function () {
        capa.hidden = true;
        capa.removeEventListener("transitionend", aoTerminar);
        const botaoPlay = document.getElementById("darPlay");
        if (botaoPlay) botaoPlay.focus({ preventScroll: true });
      };
      const aoTerminar = function (evento) {
        if (evento.target === capa && evento.propertyName === "opacity") removerCapa();
      };
      capa.addEventListener("transitionend", aoTerminar);
      window.setTimeout(removerCapa, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 30 : 1000);
    }

    botao.addEventListener("click", entrar);
  });
})();
