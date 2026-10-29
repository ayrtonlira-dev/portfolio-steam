import photo from "./assets/images/profile/ayrton-lira.webp";
import resumePdf from "./assets/curriculo-ayrton-lira.pdf?url";
import cityArt from "./assets/images/art/city-dusk.png";
import roomArt from "./assets/images/art/room-night.png";

import gamerboxxCatalogo from "./assets/images/projects/gamerboxx/catalogo.webp";
import gamerboxxCatalogoThumb from "./assets/images/projects/gamerboxx/catalogo-thumb.webp";
import gamerboxxDetalhes from "./assets/images/projects/gamerboxx/detalhes.webp";
import gamerboxxDetalhesThumb from "./assets/images/projects/gamerboxx/detalhes-thumb.webp";
import gamerboxxListas from "./assets/images/projects/gamerboxx/listas.webp";
import gamerboxxListasThumb from "./assets/images/projects/gamerboxx/listas-thumb.webp";

import studioCarInicio from "./assets/images/projects/studiocar/inicio.webp";
import studioCarInicioThumb from "./assets/images/projects/studiocar/inicio-thumb.webp";
import studioCarServicos from "./assets/images/projects/studiocar/servicos.webp";
import studioCarServicosThumb from "./assets/images/projects/studiocar/servicos-thumb.webp";

import portfolioDesktop from "./assets/images/projects/portfolio/desktop.webp";
import portfolioDesktopThumb from "./assets/images/projects/portfolio/desktop-thumb.webp";
import portfolioMobile from "./assets/images/projects/portfolio/mobile.webp";
import portfolioProjectDialog from "./assets/images/projects/portfolio/projeto-aberto.webp";

export const profile = {
  name: "Ayrton Lira",
  handle: "@ayrtonlira-dev",
  location: "Recife, Brasil",
  education: "Análise e Desenvolvimento de Sistemas",
  educationInstitution: "UNINASSAU",
  educationStatus: "em andamento",
  role: "Desenvolvedor em formação",
  focus: "React · JavaScript · Integração de APIs",
  bio: "Desenvolvo interfaces em React e integro APIs em projetos colaborativos.",
  availability: "Buscando estágio",
  availabilityText:
    "Busco meu primeiro estágio em desenvolvimento, com interesse em evoluir para fullstack.",
  aboutLead:
    "Curso Análise e Desenvolvimento de Sistemas na UNINASSAU e busco meu primeiro estágio em desenvolvimento fullstack.",
  interests:
    "Evoluir em desenvolvimento fullstack, com foco em interfaces e APIs.",
  locationNote:
    "Recife, Brasil. Buscando meu primeiro estágio em desenvolvimento fullstack.",
  workingStyle:
    "No GAMERBOXX, trabalho nas interfaces e integro o front-end aos endpoints existentes, com orientação de um amigo engenheiro de software sênior, responsável pelo backend. Nosso objetivo é transformar o projeto em um produto. No Studio Car Recife, identifiquei a necessidade, defini o conteúdo com o cliente e conduzi a entrega do site, incluindo domínio, Cloudflare e publicação.",
  contactIntro:
    "Busco meu primeiro estágio em desenvolvimento fullstack. Se quiser trocar ideia ou falar de uma vaga, me chama.",
  photo,
  resume: resumePdf,
  resumeFileName: "Ayrton-Lira-Curriculo.pdf",
  email: "ayrtonslira@gmail.com",
  github: "https://github.com/ayrtonlira-dev",
  githubLabel: "github.com/ayrtonlira-dev",
  linkedin: "https://www.linkedin.com/in/ayrton-lira-658b873b9/",
  linkedinLabel: "ayrton-lira",
};

// O bloco de atualizações só aparece quando existir conteúdo real aqui.
// Exemplo: { date: "2026-11", title: "Novo case publicado", text: "..." }
export const recentActivity = [];

export const technologies = [
  {
    id: "react",
    name: "React",
    icon: "react",
    context: "GAMERBOXX e este portfólio.",
    shortContext: "GAMERBOXX + portfólio",
    projects: ["gamerboxx", "portfolio"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "javascript",
    context: "APIs no GAMERBOXX e interações aqui.",
    shortContext: "Integração de APIs",
    projects: ["gamerboxx", "portfolio"],
  },
  {
    id: "vite",
    name: "Vite",
    icon: "vite",
    context: "Build e desenvolvimento deste portfólio.",
    shortContext: "Este portfólio",
    projects: ["portfolio"],
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    icon: "web",
    context: "Estrutura e estilos deste portfólio.",
    shortContext: "Este portfólio",
    projects: ["portfolio"],
  },
  {
    id: "apis",
    name: "APIs REST",
    icon: "api",
    context: "Endpoints integrados no GAMERBOXX.",
    shortContext: "GAMERBOXX",
    projects: ["gamerboxx"],
  },
  {
    id: "git",
    name: "Git & GitHub",
    icon: "git",
    context: "Versionamento dos projetos.",
    shortContext: "Versionamento",
    projects: ["portfolio"],
  },
];

export const projects = [
  {
    id: "gamerboxx",
    number: "01",
    title: "GAMERBOXX",
    category: "Desenvolvimento web",
    status: { label: "Em desenvolvimento", tone: "progress" },
    tagline: "Construindo um produto para quem joga.",
    cardDescription:
      "Minha atuação: interfaces em React e integração com endpoints existentes.",
    cardTech: "React · APIs",
    summary:
      "Plataforma para registrar, avaliar e organizar jogos, criada em colaboração. Segue em desenvolvimento, ainda sem publicação em produção, com o objetivo de virar um produto.",
    technologies: ["React", "JavaScript", "CSS", "APIs REST"],
    thumbnail: gamerboxxCatalogoThumb,
    images: [
      {
        src: gamerboxxCatalogo,
        thumb: gamerboxxCatalogoThumb,
        alt: "Catálogo de jogos do GAMERBOXX com capas e informações de cada jogo.",
        caption: "Catálogo de jogos",
        description: "Exploração do catálogo conectado ao backend.",
      },
      {
        src: gamerboxxDetalhes,
        thumb: gamerboxxDetalhesThumb,
        alt: "Tela de detalhes de um jogo no GAMERBOXX, com nota, status e ações de avaliação.",
        caption: "Detalhes e avaliação",
        description: "Ficha do jogo com status, nota e listas.",
      },
      {
        src: gamerboxxListas,
        thumb: gamerboxxListasThumb,
        alt: "Tela de listas do GAMERBOXX mostrando uma lista de jogos Souls-like.",
        caption: "Listas",
        description: "Organização de jogos em uma lista pública.",
      },
    ],
    contribution: {
      title: "Minha atuação",
      items: [
        "Interfaces em React para catálogo, perfil, listas e estados da conta.",
        "Integração da interface com a API.",
        "Adaptação das interfaces aos endpoints existentes do backend, com orientação de um amigo engenheiro de software sênior.",
        "Uso IA para explorar soluções, implementar e revisar partes do front-end. Avalio as alterações em relação aos contratos da API e valido os fluxos da aplicação com o backend local.",
      ],
    },
    otherContribution: {
      title: "Contribuição de outra pessoa",
      text: "Backend e orientação técnica: meu amigo, engenheiro de software sênior, é responsável pela estrutura principal do backend e me orienta no projeto.",
    },
    implemented: [],
    links: [],
    unavailableLink: "Sem link público nesta fase.",
    contactSubject: "GAMERBOXX",
  },
  {
    id: "studiocar",
    number: "02",
    title: "Studio Car Recife",
    category: "Web",
    status: { label: "Publicado", tone: "live" },
    tagline: "Da oportunidade identificada ao site publicado.",
    cardDescription: "Do contato com o cliente à definição do conteúdo, domínio e publicação.",
    cardTech: "HTML · Cloudflare",
    summary:
      "A oficina não tinha site institucional. Identifiquei a oportunidade, conversei com o cliente sobre o conteúdo e conduzi a publicação em domínio próprio. O site reúne serviços, avaliações do Google, mapa e contato.",
    technologies: ["HTML", "CSS", "Cloudflare"],
    thumbnail: studioCarInicioThumb,
    images: [
      {
        src: studioCarInicio,
        thumb: studioCarInicioThumb,
        alt: "Página inicial do Studio Car Recife, com o letreiro da oficina e chamada de orçamento.",
        caption: "Página inicial",
        description: "Apresentação da oficina, serviços e contato.",
      },
      {
        src: studioCarServicos,
        thumb: studioCarServicosThumb,
        alt: "Seção de serviços do site Studio Car Recife, com pintura, funilaria e martelinho de ouro.",
        caption: "Serviços",
        description: "Detalhamento dos serviços e chamada para orçamento.",
      },
    ],
    contribution: {
      title: "Minha atuação",
      items: [
        "Identifiquei a necessidade e defini o conteúdo com o cliente.",
        "Conduzi a entrega do site, incluindo domínio, Cloudflare e publicação.",
      ],
    },
    otherContribution: {
      title: "Outra contribuição",
      text: "O layout e o código foram gerados com o Codex. Minha atuação foi conduzir a proposta, definir o conteúdo com o cliente e colocar o site no ar.",
    },
    implemented: [],
    links: [
      {
        label: "Visitar o site",
        href: "https://studiocarrecife.com.br/",
        external: true,
      },
    ],
    unavailableLink: "",
    contactSubject: "Studio Car Recife",
  },
  {
    id: "portfolio",
    number: "03",
    title: "Este portfólio",
    category: "Projeto pessoal",
    status: { label: "Implementado", tone: "built" },
    tagline: "Uma proposta visual transformada em experiência navegável.",
    cardDescription: "Direção visual, decisões de interação e validação da implementação com IA.",
    cardTech: "React · Vite",
    summary:
      "Meu portfólio pessoal: a direção visual aprovada virou uma aplicação em React e Vite com painéis de projeto, galeria ampliável e controle de movimento.",
    technologies: ["React", "Vite", "JavaScript", "CSS"],
    thumbnail: portfolioDesktopThumb,
    images: [
      {
        src: portfolioDesktop,
        thumb: portfolioDesktopThumb,
        alt: "Tela do portfólio no desktop, com cabeçalho, vitrine em pixel art e projetos.",
        caption: "Perfil no desktop",
        description: "Visão geral do perfil, da vitrine e da biblioteca.",
      },
      {
        src: portfolioMobile,
        alt: "Tela do portfólio no mobile, com identidade, navegação e projetos em uma coluna.",
        caption: "Perfil no mobile",
        description: "A mesma experiência reorganizada em uma coluna.",
      },
      {
        src: portfolioProjectDialog,
        alt: "Painel de projeto aberto sobre o portfólio, com galeria de capturas e a ficha do GAMERBOXX.",
        caption: "Projeto aberto",
        description: "Painel acessível com galeria, contexto e ampliação.",
      },
    ],
    contribution: {
      title: "Minha atuação",
      items: [
        "Definição da referência, do conteúdo e das decisões de interação.",
        "Validação da proposta visual e revisão dos textos do perfil.",
        "Escolha da stack React, Vite e JavaScript para a implementação.",
      ],
    },
    otherContribution: {
      title: "Apoio de implementação",
      text: "A implementação foi assistida por IA, com direção, revisão e validação minhas.",
    },
    implemented: [
      "Painel de projeto com galeria e ampliação",
      "Navegação com a seção atual indicada",
      "Contexto das tecnologias por toque ou foco",
      "Controle de movimento e respeito a movimento reduzido",
    ],
    links: [],
    unavailableLink: "",
    contactSubject: "Este portfólio",
  },
];

export const art = {
  city: cityArt,
  room: roomArt,
};
