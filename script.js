/*
 * Carta para Raissa — interações, trilha sonora e animações ligadas à rolagem.
 * As animações são reversíveis: subir e descer a página desfaz/refaz o movimento.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const botaoAbrirCarta = document.querySelector("#abrirCarta");
    const introducao = document.querySelector(".introducao");
    const telaInicial = document.querySelector("#aberturaMusical");
    const botaoPlay = document.querySelector("#darPlay");
    const vinil = document.querySelector("#vinil");
    const audio = document.querySelector("#trilhaSonora");
    const controleMusica = document.querySelector("#controleMusica");
    const iconeMusica = document.querySelector(".controle-musica__icone");
    const textoControle = document.querySelector(".controle-musica__texto");
    const controleVolume = document.querySelector("#volumeMusica");
    const painelVolume = document.querySelector("#controleVolume");
    const botaoVolume = document.querySelector("#botaoVolume");
    const valorVolume = document.querySelector("#valorVolume");
    const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");

    function encerrarAbertura() {
      if (telaInicial) telaInicial.classList.add("is-encerrada");
      document.body.classList.remove("experiencia-bloqueada");
    }

    if (telaInicial) document.body.classList.add("experiencia-bloqueada");

    function atualizarEstadoMusica() {
      if (!audio) return;
      const tocando = !audio.paused && !audio.ended;
      if (vinil) vinil.classList.toggle("is-tocando", tocando);
      if (controleMusica) {
        controleMusica.hidden = false;
        controleMusica.setAttribute("aria-pressed", String(tocando));
        controleMusica.setAttribute("aria-label", tocando ? "Pausar música" : "Continuar música");
      }
      if (iconeMusica) iconeMusica.textContent = tocando ? "Ⅱ" : "▶";
      if (textoControle) textoControle.textContent = tocando ? "Pausar música" : "Continuar música";
    }

    async function iniciarMusica() {
      encerrarAbertura();
      if (!audio) {
        console.error("Não foi encontrado o elemento de áudio da trilha sonora.");
        return;
      }
      audio.loop = true;
      if (controleMusica) controleMusica.hidden = false;
      if (controleVolume) audio.volume = Number(controleVolume.value) / 100;
      try {
        await audio.play();
      } catch (erro) {
        console.warn("O navegador não conseguiu iniciar a música. Verifique o arquivo de áudio e tente novamente.", erro);
      }
      atualizarEstadoMusica();
    }

    if (botaoPlay) botaoPlay.addEventListener("click", iniciarMusica);

    if (audio) {
      audio.loop = true;
      audio.volume = controleVolume ? Number(controleVolume.value) / 100 : 0.7;
      ["play", "playing", "pause", "ended"].forEach(function (evento) {
        audio.addEventListener(evento, atualizarEstadoMusica);
      });
      audio.addEventListener("error", function () {
        atualizarEstadoMusica();
        console.error("Falha ao carregar assets/andança-beth-carvalho.mpeg.");
      });
    }

    if (controleMusica && audio) {
      controleMusica.addEventListener("click", async function () {
        if (audio.paused || audio.ended) {
          try { await audio.play(); }
          catch (erro) { console.warn("Não foi possível retomar a trilha sonora.", erro); }
        } else {
          audio.pause();
        }
        atualizarEstadoMusica();
      });
    }

    function fecharPainelVolume() {
      if (!painelVolume || !botaoVolume) return;
      painelVolume.hidden = true;
      botaoVolume.setAttribute("aria-expanded", "false");
      botaoVolume.setAttribute("aria-label", "Abrir controle de volume");
    }

    if (botaoVolume && painelVolume) {
      botaoVolume.addEventListener("click", function () {
        const abrir = painelVolume.hidden;
        painelVolume.hidden = !abrir;
        botaoVolume.setAttribute("aria-expanded", String(abrir));
        botaoVolume.setAttribute("aria-label", abrir ? "Fechar controle de volume" : "Abrir controle de volume");
      });
      document.addEventListener("click", function (evento) {
        if (!painelVolume.hidden && !painelVolume.contains(evento.target) && !botaoVolume.contains(evento.target)) {
          fecharPainelVolume();
        }
      });
      document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && painelVolume && !painelVolume.hidden) {
          fecharPainelVolume();
          botaoVolume.focus();
        }
      });
    }

    if (controleVolume && audio) {
      function atualizarVolume() {
        const volume = Number(controleVolume.value);
        audio.volume = volume / 100;
        if (valorVolume) valorVolume.textContent = volume + "%";
        controleVolume.setAttribute("aria-valuetext", volume + "%");
      }
      controleVolume.addEventListener("input", atualizarVolume);
      atualizarVolume();
    }

    if (botaoAbrirCarta && introducao) {
      botaoAbrirCarta.addEventListener("click", function () {
        introducao.scrollIntoView({ behavior: movimentoReduzido.matches ? "auto" : "smooth", block: "start" });
      });
    }

    // Fallback: se a biblioteca externa não carregar, todo o conteúdo permanece visível.
    if (movimentoReduzido.matches || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
      document.documentElement.classList.remove("js-motion");
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("js-motion");

    // Hero: a composição entra suavemente, mas a posição responde à rolagem reversivelmente.
    [".hero__topo", ".hero__conteudo", ".hero__rodape"].forEach(function (seletor, indice) {
      const elemento = document.querySelector(seletor);
      if (!elemento) return;
      gsap.fromTo(elemento, { autoAlpha: 0.35, y: indice === 0 ? -12 : 18 }, {
        autoAlpha: 1, y: 0, ease: "none",
        scrollTrigger: { trigger: ".hero", start: indice === 0 ? "top top" : "top 78%", end: "bottom 45%", scrub: 0.65 }
      });
    });

    // Elementos de leitura: o reveal acompanha a rolagem e reverte quando a pessoa retorna.
    gsap.utils.toArray(".reveal").forEach(function (elemento) {
      gsap.fromTo(elemento, { autoAlpha: 0.38, y: 22 }, {
        autoAlpha: 1, y: 0, ease: "none",
        scrollTrigger: { trigger: elemento, start: "top 92%", end: "top 62%", scrub: 0.7 }
      });
    });

    // Parallax delicado nos fundos: hero e encerramento respondem ao movimento da página.
    const imagemHero = document.querySelector(".hero__imagem");
    if (imagemHero) {
      gsap.fromTo(imagemHero, { yPercent: -2, scale: 1.02 }, {
        yPercent: 5, scale: 1.08, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 }
      });
    }
    const imagemFinal = document.querySelector(".final__imagem");
    if (imagemFinal) {
      gsap.fromTo(imagemFinal, { yPercent: -4, scale: 1.04 }, {
        yPercent: 4, scale: 1.1, ease: "none",
        scrollTrigger: { trigger: ".final", start: "top bottom", end: "bottom top", scrub: 0.9 }
      });
    }

    // Os painéis das músicas são revelados conforme o progresso da rolagem e recolhem ao subir.
    gsap.utils.toArray(".musica").forEach(function (card) {
      const painel = card.querySelector(".musica__painel");
      const direita = card.classList.contains("musica--direita");
      if (!painel) return;
      gsap.fromTo(painel,
        { clipPath: direita ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", x: direita ? 24 : -24 },
        { clipPath: "inset(0 0% 0 0%)", x: 0, ease: "none",
          scrollTrigger: { trigger: card, start: "top 88%", end: "center 48%", scrub: 0.8 }
        }
      );
      gsap.fromTo(card.querySelector(".musica__capa"),
        { scale: 0.96, y: 12 },
        { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: card, start: "top 88%", end: "center 48%", scrub: 0.8 } }
      );
    });

    // Atualiza medidas após o carregamento das fontes/imagens para evitar desalinhamento.
    window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  });
})();
