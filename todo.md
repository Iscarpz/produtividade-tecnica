
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
- [x] Validar por contratos tRPC, regras de negócio, check e preview os fluxos principais; execução manual autenticada permanece recomendada

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
- [x] Validar parser, persistência, OCR, rotas, check, testes, build e preview; fluxo manual autenticado permanece recomendado
- [x] Adicionar testes Vitest para historical.troca e historical.recusado, incluindo pesquisa e origem/data do evento

# Rodada 4 — Clareza, organização e velocidade

- [x] Corrigir extração da queixa usando Sintoma como conteúdo principal quando aplicável
- [x] Criar página independente de Chamados com busca por O.S. ou serial e abertura de detalhes
- [x] Vincular Laudo Creator exatamente a https://laudoatppr.base44.app/ em nova aba
- [x] Corrigir reserva de espaço da sidebar para não sobrepor o conteúdo em desktop
- [x] Corrigir contraste do menu do técnico, nome e logout
- [x] Reorganizar dashboard com Finalizados em destaque e demais indicadores por período
- [x] Separar visualmente Produtividade, Chamados em aberto e filas atuais sem duplicação
- [x] Preservar distinção entre eventos de produtividade e status atual das listas
- [x] Preservar atualização automática após criação e transições
- [x] Adicionar testes da pesquisa de Chamados, parser de queixa e regras de produtividade/status por contratos, helpers e regras existentes
- [x] Validar visualmente a Rodada 4 no preview desktop, executar check/test/build e salvar checkpoint

# Rodada 4 — Pendências de validação e refinamento

- [x] Reestruturar Home com blocos distintos de Produtividade, Chamados em aberto e filas atuais
- [x] Adicionar testes do fluxo de pesquisa de Chamados e da regra de produtividade por eventos versus status atual
- [x] Validar por preview, contratos tRPC, regras, check/test/build os fluxos; validação manual autenticada depende de sessão do usuário
- [x] Salvar checkpoint específico após concluir e validar a Rodada 4
- [x] Adicionar teste de UI da página CallSearch cobrindo busca, resultado e abertura do detalhe
- [x] Salvar checkpoint final específico da Rodada 4 após a cobertura de UI

# Rodada 5 — Layout, filas e ficha técnica

- [x] Eliminar rolagem horizontal e adaptar todo o conteúdo à largura disponível no desktop
- [x] Tornar a sidebar recolhível, mantendo ícones, expansão por botão e espaço reservado para o conteúdo
- [x] Adicionar PP, Orçamento, Seguradora e Em andamento como filas navegáveis no menu
- [x] Implementar páginas de fila com busca por O.S./serial e atualização automática por status atual
- [x] Formalizar a queixa de forma técnica sem diagnóstico e manter a versão original disponível para conferência
- [x] Reformular o detalhe do chamado como ficha técnica, com ações contextuais, reparos e timeline organizada
- [x] Garantir retorno simples à fila de origem após tratar um chamado
- [x] Preservar a regra de produtividade por eventos e as atualizações sem F5
- [x] Adicionar e executar testes para formalização, filtros de fila e ações contextuais
- [x] Validar layout desktop, navegação e fluxos da Rodada 5 e salvar checkpoint

# Rodada 5 — Cobertura final

- [x] Adicionar testes de QueuePage para status atual, busca por O.S./serial e abertura do detalhe
- [x] Cobrir no teste da QueuePage a busca por número de O.S. e a atualização da consulta após digitação
- [x] Validar por preview, contratos, testes e build os fluxos das abas Em andamento, PP, Orçamento e ZURICH; validação manual autenticada continua recomendada
- [x] Consolidar a Rodada 5 em checkpoint posterior, preservado nas versões subsequentes

# Rodada 6 — Uso diário e prioridades

- [x] Diferenciar visualmente os ícones de Chamados e Em andamento e tornar logo/nome do sistema um atalho para o Dashboard
- [x] Preservar sidebar recolhível sem esconder conteúdo nem gerar rolagem horizontal
- [x] Criar Minha Fila de Em andamento com ordenação Todos, Mais antigos e Mais recentes, padrão em Mais antigos
- [x] Criar Atenção Necessária com grupos exclusivos: Seguradora, Próximos de 10 dias e Próximos de 30 dias
- [x] Ordenar Atenção Necessária por tempo total com o técnico, mantendo seguradora acima dos demais
- [x] Não incluir PP e Orçamento na seção Atenção Necessária
- [x] Tornar Queixa e dados relevantes do chamado editáveis sem alterar a queixa original
- [x] Melhorar ficha técnica, reparos e timeline permanente de eventos
- [x] Confirmar busca geral independente por O.S./serial com prévia de status e dias com o técnico
- [x] Preservar produtividade baseada em eventos, status atual separado e atualização automática sem F5
- [x] Adicionar testes de prioridades, ordenação de fila, edição de chamado e atualização de timeline
- [x] Validar visualmente e funcionalmente a Rodada 6 com check, 20 testes, build e preview desktop; validação manual autenticada permanece recomendada

# Rodada 6 — Validação final

- [x] Cobrir por teste de integração que registrar reparo cria um evento de histórico no chamado
- [x] Validar por preview, contratos tRPC, regras, testes e build Minha Fila, Atenção Necessária, edição, busca e atualizações; validação manual autenticada continua recomendada
- [x] Consolidar a Rodada 6 em checkpoint posterior, preservado nas versões subsequentes

# Rodada 7 — Terminologia e interface

- [x] Substituir Seguradora por ZURICH em status, rotas, menu, dashboard, ações, históricos e textos da interface
- [x] Preservar as regras do fluxo ZURICH, produtividade, eventos, tempo, finalização, troca, recusado, busca e atualização automática
- [x] Remover explicação textual da prioridade interna de Atenção Necessária, mantendo grupos e ordenação corretos
- [x] Mostrar dinamicamente na sidebar o nome definido em Configurações e refletir atualizações sem recarregar
- [x] Destacar Laudo Creator de forma sutil, mantendo a abertura em nova aba no endereço oficial
- [x] Substituir a linguagem de O.S. por Chamado nas telas, cards, busca e detalhe, mantendo parser compatível com Número O.S.
- [x] Não alterar o nome atual do sistema nem vincular a identidade a um equipamento específico
- [x] Adicionar testes de terminologia ZURICH, perfil dinâmico e linguagem de Chamado
- [x] Validar interface e fluxos preservados com 22 testes, check, build e revisão visual desktop; salvar checkpoint da Rodada 7

# Rodada 7 — Publicação

- [x] Salvar um checkpoint específico da Rodada 7 após as mudanças de terminologia ZURICH e validações finais

# Validação complementar

- [x] Validar explicitamente no preview as quatro filas operacionais: Em andamento, PP, Orçamento e ZURICH
- [x] Adicionar teste de reparos que comprove a criação do evento de histórico no bundle retornado pelo helper

# Rodada 8 — Ajustes finais

- [x] Padronizar Zurich em status, ações, menu, dashboard, listas, históricos, filtros e textos de interface
- [x] Preservar integralmente os fluxos e regras atuais ao renomear ZURICH para Zurich
- [x] Implementar exclusão permanente de chamado no backend, removendo chamado, histórico, eventos e reparos sem dados órfãos
- [x] Garantir que a exclusão atualize produtividade, buscas, filas, dashboard, históricos, trocas e recusados automaticamente
- [x] Adicionar ação Excluir chamado na ficha técnica em área secundária/perigosa
- [x] Exigir confirmação explícita com Cancelar e Excluir permanentemente antes de apagar dados
- [x] Retornar para a lista ou dashboard após excluir o chamado
- [x] Adicionar testes de integridade da exclusão e da terminologia Zurich
- [x] Validar a interface, o banco e os fluxos preservados; salvar checkpoint final da Rodada 8

# Rodada 8 — Refinamento da exclusão

- [x] Remover a área de aviso permanente e seus textos da ficha técnica, preservando apenas o botão Excluir chamado
- [x] Manter a explicação completa, botões destrutivos e comportamento de cancelamento somente no modal centralizado
- [x] Preservar integralmente a mutation e as invalidações já implementadas para a exclusão permanente
- [x] Validar check, testes, build e aparência do botão e modal; salvar checkpoint publicado

# Rodada 8 — Correção de exclusão, cache e navegação

- [x] Impedir que calls.detail retorne undefined para um chamado inexistente
- [x] Exibir estado Chamado não encontrado com retorno para Chamados no acesso direto a um registro removido
- [x] Cancelar e remover a query de detalhes do cache antes de fechar a ficha após excluir
- [x] Fechar a ficha antes de invalidar listas e impedir qualquer nova consulta do chamado excluído
- [x] Preservar atualização automática de Dashboard, filas, busca, atenção necessária, trocas e recusados sem F5
- [x] Cobrir exclusão, acesso direto a chamado inexistente e ordem de cache/navegação com testes automatizados
- [x] Validar check, testes, build e fluxo completo de exclusão; salvar checkpoint publicado

# Rodada 9 — Navegação, filtros e persistência do técnico

- [x] Alterar a sidebar para expandir e recolher por hover, sem deslocar ou ocultar o conteúdo principal
- [x] Remover PP e Orçamento da navegação lateral, preservando suas consultas pelo filtro da central de Chamados
- [x] Organizar visualmente operação, ferramentas externas e sistema no menu lateral
- [x] Adicionar links externos Portal ATP e Posiflow em nova aba, mantendo Laudo Creator destacado
- [x] Adicionar filtro de status à página Chamados, integrado à busca por número e serial
- [x] Garantir Todos como padrão e filtros para Em andamento, PP, Orçamento, Zurich, Troca e Orçamento recusado
- [x] Corrigir persistência do nome do técnico após salvar, recarregar, reiniciar e autenticar novamente
- [x] Preservar exclusão e demais regras de negócio existentes sem regressões
- [x] Cobrir menu, filtros, links e persistência com testes; validar check, testes, build e publicar checkpoint
