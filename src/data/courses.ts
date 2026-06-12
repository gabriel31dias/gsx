import { Course } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'react-masterclass',
    title: 'React & Vite Masterclass: Do Zero ao Avançado',
    description: 'Aprenda a construir aplicações web escaláveis, modernas e de altíssima performance utilizando React 18+, TypeScript, Tailwind CSS e Vite. Domine estado global, otimizações e ecossistema.',
    instructor: 'Heitor Neto',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    duration: '42h',
    category: 'Frontend',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    isTrending: true,
    isPopular: true,
    modules: [
      {
        id: 'react-m1',
        title: 'Módulo 1: Fundamentos e Setup de Alta Performance',
        lessons: [
          {
            id: 'react-l1',
            title: '1. Introdução ao Ecossistema React & Vite',
            duration: '15:20',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // fallback embedding
            description: 'Nesta aula vamos aprender as vantagens cruciais de se utilizar o Vite ao invés do Create React App clássico, estruturando as pastas de maneira extremamente profissional.',
            materials: [
              { title: 'Slides de Arquitetura.pdf', url: '#', isDownloadable: true },
              { title: 'Anotações do Professor', url: '#', isDownloadable: false }
            ],
            comments: [
              { id: 'c1', userName: 'Guilherme Silva', content: 'Excelente didática! A velocidade do Vite é sensacional.', date: '30/05/2026' },
              { id: 'c2', userName: 'Beatriz Costa', content: 'Minha estrutura de projeto nunca ficou tão limpa!', date: '31/05/2026' }
            ]
          },
          {
            id: 'react-l2',
            title: '2. Configurando TypeScript e ESLint rigorosos',
            duration: '18:45',
            videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
            description: 'Evite bugs em produção estruturando tipos estritos em TypeScript, criando contratos sólidos de dados para sua equipe de frontend.',
            materials: [
              { title: 'tsconfig.json Recomendado', url: '#', isDownloadable: true }
            ],
            comments: []
          }
        ],
        quiz: {
          id: 'quiz-react-m1',
          title: 'Quiz: Fundamentos de React & Estilização',
          minScoreToPass: 75,
          questions: [
            {
              id: 'q-r1',
              question: 'Qual a principal vantagem de utilizar o Vite para desenvolvimento local com React?',
              options: [
                'Ele compila tudo em assembly do browser',
                'Utiliza ES Modules nativos no navegador para Hot Module Replacement instantâneo',
                'Ele dispensa completamente o uso de JavaScript',
                'Não há vantagens perceptíveis se comparado ao Webpack comum'
              ],
              correctOptionIndex: 1
            },
            {
              id: 'q-r2',
              question: 'No TypeScript, qual é a principal finalidade do compilador tsconfig na regra options "isolatedModules"?',
              options: [
                'Impedir que módulos usem variáveis globais sem exportar explicitamente',
                'Assegurar compatibilidade com transpiladores que processam um único arquivo por vez (como esbuild / babel)',
                'Forçar todas as funções a serem declaradas como Arrow Functions',
                'Gerar módulos físicos separados no disco de forma assíncrona'
              ],
              correctOptionIndex: 1
            }
          ]
        }
      },
      {
        id: 'react-m2',
        title: 'Módulo 2: Gerenciamento Avançado de Estado',
        lessons: [
          {
            id: 'react-l3',
            title: '3. Dominando Context API e custom Hooks',
            duration: '22:10',
            videoUrl: 'https://www.youtube.com/embed/35lXWvCuSTo',
            description: 'Entenda quando usar a Context API para dados que variam raramente e saiba como evitar re-renderizações desnecessárias encapsulando lógicas em Hooks.',
            materials: [
              { title: 'Repositório de Exemplos Estado', url: '#', isDownloadable: false }
            ],
            comments: [
              { id: 'c3', userName: 'Ruan Mendes', content: 'Sempre tive problemas de renderização infinita com Context. A explicação resolveu!', date: '29/05/2026' }
            ]
          },
          {
            id: 'react-l4',
            title: '4. Integração Definitiva com Custom State Stores',
            duration: '31:15',
            videoUrl: 'https://www.youtube.com/embed/F627pLN_-N0',
            description: 'Crie stores atómicas super Performáticas sem Boilerplates exagerados.',
            materials: [
              { title: 'Gabarito da Aula 4', url: '#', isDownloadable: true }
            ],
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 'uidesign-essence',
    title: 'UI/UX Design de Interfaces Premium: Do Layout ao Protótipo',
    description: 'Crie interfaces magnéticas que retêm e encantam o usuário. Aplique design system, grids de alta precisão, fáceis layouts modernos em Tailwind e os segredos do dark mode de plataformas como Netflix.',
    instructor: 'Marina Rocha',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    duration: '28h',
    category: 'Design',
    coverImage: 'https://images.unsplash.com/photo-1541462608141-27b286cbd7a6?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    isTrending: true,
    isPopular: false,
    modules: [
      {
        id: 'design-m1',
        title: 'Módulo 1: Teoria das Cores e Contraste em Dark Themes',
        lessons: [
          {
            id: 'design-l1',
            title: '1. Psicologia do Dark Mode e Alinhamento de Contraste',
            duration: '19:40',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Aprenda as diretrizes fundamentais da W3C para acessibilidade de contraste em telas escuras. Como compor paletas de cinza escuro no lugar do preto puro para evitar fadiga ocular.',
            materials: [
              { title: 'Tabela de Contraste WCAG.xlsx', url: '#', isDownloadable: true }
            ],
            comments: [
              { id: 'c10', userName: 'Pedro Alencar', content: 'Gostei muito da explicação sobre por que não usar #000 como cor de fundo primordial!', date: '25/05/2026' }
            ]
          },
          {
            id: 'design-l2',
            title: '2. Tipografia Display e Hierarquias Visuais',
            duration: '22:15',
            videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
            description: 'Como combinar fontes grotescas modernas para títulos e fontes limpas de corpo de texto, melhorando drasticamente o aspecto de portais de conteúdo.',
            materials: [
              { title: 'Guia de Fontes do Google Recomendadas.pdf', url: '#', isDownloadable: true }
            ],
            comments: []
          }
        ],
        quiz: {
          id: 'quiz-design-m1',
          title: 'Quiz: Interface Dark e Tipografia',
          minScoreToPass: 80,
          questions: [
            {
              id: 'q-d1',
              question: 'Por que os especialistas recomendam usar tons de cinza escuro (#121212) no lugar de preto puro (#000000) nos fundos dark mode?',
              options: [
                'Para gastar mais bateria de telas OLED',
                'Para atenuar o brilho extremo e fadiga visual, permitindo leitura confortável e percepção rica de profundidade',
                'Porque o preto puro é proibido pelas leis de copyright de software de streaming',
                'Apenas por preferência estética aleatória sem embasamento fisiológico'
              ],
              correctOptionIndex: 1
            },
            {
              id: 'q-d2',
              question: 'O que dita o padrão WCAG de acessibilidade sobre o contraste mínimo para textos regulares?',
              options: [
                'Requer contraste de no mínimo 4.5:1 com o fundo',
                'Requer contraste de no mínimo 1.5:1 com o fundo',
                'Apenas recomenda o uso de cores brilhantes sem medição numérica',
                'Dita que o texto deve sempre ser maior que 40 pixels'
              ],
              correctOptionIndex: 0
            }
          ]
        }
      }
    ]
  },
  {
    id: 'node-architecture',
    title: 'Node.js, Express e APIs REST com Robustez Suprema',
    description: 'Construa servidores incrivelmente seguros e ágeis. Conecte com bancos de dados relacionais e não-relacionais, gerencie JWT de forma profissional e estruture sua API para aguentar milhões de requisições de alunos.',
    instructor: 'Alexandre Lima',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    duration: '35h',
    category: 'Backend',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    isTrending: false,
    isPopular: true,
    modules: [
      {
        id: 'node-m1',
        title: 'Módulo 1: Arquitetura em Camadas (Layered Architecture)',
        lessons: [
          {
            id: 'node-l1',
            title: '1. Controllers, Services e Modelos Separados',
            duration: '26:50',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Fuja de controladores gigantes de código espaguete. Iremos estruturar cada endpoint em fluxos lógicos isolados de validação, regras de negócio e escrita no banco.',
            materials: [
              { title: 'Template de Projeto Layered.zip', url: '#', isDownloadable: true }
            ],
            comments: []
          }
        ]
      }
    ]
  },
  {
    id: 'ai-development',
    title: 'Engenharia de Prompt e IA com SDK Gemini e TypeScript',
    description: 'Transforme qualquer portal ou SaaS clássico adicionando recursos de IA generativa de forma limpa. Aprenda chamadas estruturadas, streaming de respostas, geração inteligente de resumos e curadoria.',
    instructor: 'Dr. Lucas Ferreira',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    duration: '18h',
    category: 'Data & AI',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    isTrending: true,
    isPopular: true,
    modules: [
      {
        id: 'ai-m1',
        title: 'Módulo 1: Chamadas Práticas e Extração Estruturada',
        lessons: [
          {
            id: 'ai-l1',
            title: '1. Integrando o SDK @google/genai com Node.js',
            duration: '18:10',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Inicie perfeitamente com a IA oficial da Google, conectando chaves de segurança ocultas e obtendo respostas concisas ou JSON estruturado para alimentar painéis dinâmicos.',
            materials: [
              { title: 'Cheat Sheet de Engenharia de Prompt', url: '#', isDownloadable: false }
            ],
            comments: [
              { id: 'c20', userName: 'Carla Alencar', content: 'Uso fantástico do Gemini no backend, extremamente rápido.', date: '20/05/2026' }
            ]
          }
        ]
      }
    ]
  }
];
