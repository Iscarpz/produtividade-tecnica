
# Projeto TODO

- [x] Implementar cadastro rápido por colagem com parser de O.S., serial, modelo e queixa
- [x] Impedir O.S. duplicada e oferecer abertura do chamado existente
- [x] Implementar estados exatos: EM ANDAMENTO, AGUARDANDO PP, AGUARDANDO ORÇAMENTO e AGUARDANDO SEGURADORA
- [x] Implementar ações contextuais exatas, incluindo confirmação para Finalizar
- [x] Implementar contador de dias corridos do ciclo do chamado
- [x] Implementar registros múltiplos de reparos e peças com seriais opcionais e digitação livre
- [x] Implementar timeline cronológica completa e imutável
- [x] Implementar dashboard por eventos com filtros de período e sem gráficos
- [x] Implementar pesquisa global por O.S. e serial
- [x] Implementar autenticação Manus OAuth e proteção das rotas de dados
- [x] Estruturar banco para múltiplos técnicos futuros com user_id nas entidades
- [x] Implementar sidebar e interface desktop profissional, rápida e com diferenciação visual por status
- [x] Cobrir com Vitest o parser, contagem de dias e regras de transição; testes de integração de persistência ficam para a próxima iteração
- [x] Validar build, fluxos de sucesso/erro e aparência no navegador
- [x] Manter fora da V1: catálogo/estoque, CRM, financeiro, integrações externas, mobile, gráficos, metas e múltiplos técnicos na interface atual
- [x] Restringir ações do detalhe por status final e validar transições também no backend
- [x] Implementar filtro de período personalizado no dashboard de produtividade
- [x] Validar no preview a proteção de login e a renderização autenticada do dashboard; fluxos de dados dependem de sessão do usuário
- [x] Corrigir o rótulo dos cards para suportar período personalizado sem erro de runtime
- [x] Validar em sessão autenticada a renderização do dashboard com sidebar, cards, filtros e listas
- [ ] Validar em navegador autenticado os fluxos principais de dados: cadastro por colagem, duplicidade, transições, finalização, reparos e pesquisa

# Correções de usabilidade — rodada 2

- [x] Melhorar contraste da sidebar azul escura e garantir texto legível em todos os estados
- [x] Adicionar entrada de print com OCR e tela de conferência antes de salvar
- [x] Tornar o parser de texto copiado mais tolerante a variações de rótulos, acentuação e linhas
- [x] Melhorar fluxo de recebimento e destinação entre filas, com ações de retorno claras e atualização automática sem F5
- [x] Aproveitar melhor a sidebar com resumo de filas, contagens e navegação contextual
- [x] Adicionar testes para parser tolerante e OCR com mock do LLM; a validação OCR real depende de uma imagem fornecida no uso
- [x] Validar visualmente a correção em desktop e validar check, testes e build
- [x] Validar em sessão autenticada a renderização real do dashboard e sidebar corrigidos no preview gerenciado
- [x] Adicionar teste automatizado do OCR com mock do LLM e validar o contrato do fluxo por print
- [x] Validar visualmente em desktop a interface autenticada corrigida e revisar o fluxo de cadastro
- [x] Adicionar teste automatizado do fluxo por print cobrindo mutation e preenchimento de conferência
- [x] Validar no preview a interface desktop corrigida e o fluxo de cadastro; a validação manual com imagem real depende da sessão do usuário
- [x] Registrar evidência visual do dashboard/sidebar corrigidos no preview desktop
- [x] Cobrir o fluxo de print até a mutation e conferência com testes de contrato; interação manual de arquivo permanece recomendada

# Rodada 3 — Correções e melhorias

- [x] Corrigir parser para o formato tabular real e extrair O.S., serial, modelo e queixa exatamente
- [x] Garantir criação persistente com status EM ANDAMENTO e dataFinalizacao NULL
- [x] Testar efetivamente o texto real fornecido no prompt com teste automatizado de parser
- [x] Implementar Ctrl+V de imagem no modal de cadastro, coexistindo com upload tradicional
- [x] Manter OCR com conferência explícita antes da criação
- [x] Garantir atualização automática das listas após criação e transições sem F5
- [x] Reorganizar sidebar para Dashboard, Chamados, Trocas, Orçamentos recusados, Laudo Creator e Configurações
- [x] Abrir Laudo Creator em nova aba com URL configurável em um único ponto
- [x] Criar página histórica de Trocas com origem e datas relevantes
- [x] Criar página histórica de Orçamentos recusados com origem e datas relevantes
- [x] Reduzir repetição visual da página principal e separar produtividade de acompanhamento
- [x] Criar página simples de configurações com nome, preferências básicas e logout
- [x] Garantir opção clara de Sair/Logout
- [x] Adicionar rodapé discreto com “Desenvolvido por Vinicius Scarpeta”
- [x] Adicionar testes de parser, persistência, OCR/mutation, transições e consultas históricas tRPC
- [ ] Validar fluxo real completo com sessão autenticada e salvar novo checkpoint
- [x] Adicionar testes Vitest para historical.troca e historical.recusado, incluindo pesquisa e origem/data do evento
