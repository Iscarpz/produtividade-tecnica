
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

# Rodada 9 — Contadores nos filtros

- [x] Exibir a quantidade total de chamados em um badge ao lado de Todos e de cada filtro de status
- [x] Manter as contagens independentes da busca digitada e atualizá-las junto com a lista
- [x] Cobrir contagens por filtro com testes e validar check, testes, build e checkpoint publicado

# Rodada 10 — Habilidade, Finalizados e criticidade visual

- [x] Criar e validar uma habilidade reutilizável para evoluções seguras de sistemas internos de produtividade técnica
- [x] Adicionar o filtro Finalizados à central de Chamados com badge de quantidade total
- [x] Aplicar cores semânticas aos badges para diferenciar status normais, de atenção e críticos
- [x] Preservar busca, contagens independentes e filtros existentes sem regressões
- [x] Cobrir Finalizados e estilos de criticidade com testes; validar check, testes, build e checkpoint publicado

# Rodada 10 — Exportação de Finalizados

- [x] Definir colunas e gerar CSV UTF-8 compatível com Excel para chamados Finalizados
- [x] Adicionar botão de exportação somente quando o filtro Finalizados estiver selecionado
- [x] Cobrir a geração do CSV e validar check, testes, build e checkpoint publicado

# Rodada 11 — Usuários, convites e autorização

- [x] Remover a exportação CSV de Finalizados e todas as funções, testes e textos relacionados
- [x] Remover as cores específicas dos indicadores de quantidade dos filtros, mantendo badges neutros e legíveis
- [x] Preservar os chamados existentes e sua propriedade vinculada ao administrador inicial
- [x] Criar esquema de usuários com papéis Administrador/Técnico e estados pendente, aguardando autorização, ativo, recusado e revogado
- [x] Criar convites únicos, expirados e revogáveis, com token seguro, nome e e-mail do técnico
- [x] Criar procedures protegidas para gerenciamento administrativo de usuários, convites, autorização, recusa e revogação
- [x] Aplicar autorização no backend para bloquear contas não ativas e impedir ações administrativas por técnicos
- [x] Garantir isolamento de chamados, reparos, histórico e produtividade por usuário autenticado
- [x] Criar rota pública de aceite de convite e cadastro do técnico com e-mail vinculado ao convite
- [x] Criar área Configurações → Usuários exclusiva do administrador, com usuários, pendências e convites
- [x] Criar telas de acesso aguardando autorização, recusado e revogado
- [x] Validar os fluxos operacionais existentes em sessão autenticada após a introdução da autorização multiusuário
- [x] Cobrir o fluxo multiusuário completo, incluindo autorização e primeiro login do técnico aprovado
- [x] Cobrir isolamento real com dois usuários distintos para chamados, detalhes, históricos, produtividade e buscas
- [x] Preservar todas as funcionalidades operacionais existentes sem painel ou relatórios de equipe
- [x] Cobrir fluxo completo de convite, autorização, bloqueios e isolamento com testes; validar check, testes, build e checkpoint publicado

# Rodada 11 — Validação real multiusuário

- [x] Registrar e-mail controlado pelo usuário para o convite de validação, mantendo expiração de 7 dias
- [x] Gerar convite real e validar aceite, cadastro e bloqueio enquanto a conta estiver pendente
- [x] Validar autorização pelo OWNER e primeiro acesso do técnico autorizado
- [x] Validar configuração e persistência do nome do técnico após F5
- [x] Validar criação, movimentação e produtividade de chamado pertencente somente ao técnico
- [x] Validar pelo banco e pela interface o isolamento bilateral entre os dados do OWNER e do técnico
- [x] Validar bloqueios de pendente, recusado e revogado quando possível, sem alterar a arquitetura
- [x] Registrar o resultado do protocolo sem criar dashboard gerencial, relatórios de equipe ou exportação

# Correção de validação — Papel do OWNER

- [x] Corrigir a sincronização do papel do OWNER para impedir que a sessão autenticada seja rebaixada para Técnico
- [x] Validar que o OWNER autenticado retorna role admin e acessa Configurações → Usuários
- [x] Preservar papéis e bloqueios dos técnicos durante a correção de sincronização do OWNER
- [x] Fazer a página Usuários confirmar autorização administrativa no backend, sem depender exclusivamente do cache de perfil do navegador

# Correção — Cadastro de chamados após validação multiusuário

- [x] Reproduzir e identificar a causa raiz do erro de inserção em calls para novo chamado
- [x] Conferir schema, banco, procedures e tipos de todos os campos persistidos na criação
- [x] Corrigir dataFinalizacao para persistir NULL em chamados novos, preservando status EM ANDAMENTO
- [x] Preservar queixa formalizada e queixaOriginal bruta no fluxo OCR e texto
- [x] Preservar userId do usuário autenticado e o isolamento multiusuário na criação
- [x] Ajustar o layout da confirmação OCR para manter Confirmar chamado acessível em 100% de zoom
- [x] Permitir scroll somente no conteúdo da confirmação, mantendo ações visíveis e legíveis
- [x] Testar criação real por OCR/print e por texto, incluindo atualização imediata das filas e dashboard
- [x] Cobrir persistência, dataFinalizacao, queixaOriginal e responsividade com testes; validar check, testes, build e checkpoint publicado

# Correção crítica — Parser de entrada por texto

- [x] Extrair Número O.S., Numero O.S. e Nº O.S. como número obrigatório de Chamado, tolerando espaços, TABs e quebras de linha
- [x] Extrair serial, modelo e descrição/sintoma sem depender da posição ou ordem dos campos
- [x] Preservar somente a parte relevante do Sintoma/Descrição como queixa antes da formalização existente
- [x] Manter OCR independente e preservar queixaOriginal e queixa formalizada no fluxo textual
- [x] Exibir e exigir o preenchimento manual do Chamado quando o parser não o identificar
- [x] Criar testes para as cinco variações de Número O.S. e o texto completo do sistema oficial
- [x] Validar check, testes, build, conferência e atualização do chamado criado; salvar checkpoint publicado

# Correção crítica — Persistência do chamado textual

- [x] Investigar o desalinhamento apresentado na inspeção do chamado 60006451515, preservando o registro real sem alteração
- [x] Proteger a criação para gravar somente Chamado, serial, modelo, queixas, status, datas e userId em suas colunas corretas
- [x] Criar teste de persistência da criação textual com todos os campos e não alterar o registro real de validação
- [x] Validar o fluxo real, check, testes, build e checkpoint publicado

# Rodada 14 — Laudo Creator e melhorias do chamado

- [x] Exibir a pergunta “Necessário gerar um laudo?” antes da transição de Em andamento para Orçamento ou Zurich
- [x] Fazer NÃO concluir somente a transição já existente, preservando produtividade e histórico
- [x] Fazer SIM abrir o Laudo Creator em nova aba sem transicionar automaticamente o chamado
- [x] Destacar Chamado, queixa, status, modelo e serial na hierarquia visual da ficha técnica
- [x] Permitir editar uma peça existente no mesmo formulário, sem criar duplicidade e com histórico preservado
- [x] Permitir excluir uma peça com confirmação, persistência e registro no histórico existente
- [x] Cobrir os quatro cenários de laudo e os fluxos de edição/exclusão de peça com testes automatizados
- [x] Validar interface, persistência após recarga, check, testes, build e checkpoint publicado

# Rodada 15 — Estrutura técnica do chamado e Script.AI

- [x] Preservar a abertura de chamado apenas com Chamado, serial, modelo e queixas por texto ou OCR, fechando o modal após a criação sem abrir a ficha
- [x] Adicionar diagnóstico obrigatório e inspeção visual exclusiva obrigatória, preservando integralmente queixa e queixaOriginal
- [x] Criar a tabela administrativa de Imagem/BIOS com modelo, marca, tipo, versão, ativo e observação, com isolamento e gestão exclusiva do administrador
- [x] Resolver Imagem/BIOS automaticamente pelo modelo, informando ausência de cadastro sem inventar versão
- [x] Implementar a regra de garantia derivada da inspeção visual sem campo manual
- [x] Manter a seção única de Reparos/Peças e incorporá-la ao script sem duplicidade de registros ou de fluxo
- [x] Criar gerador determinístico com análise, validação dos campos obrigatórios, caixa alta e estruturas Smartphone/Tablet e Computador/Notebook
- [x] Incorporar as regras específicas do Script.AI fornecidas pelo usuário, incluindo NPI, lentidão, INFINIX HOT 11S e tratamento de seriais
- [x] Criar Configurações → Imagens / BIOS, busca e operações administrativas de cadastro, edição, ativação e exclusão
- [x] Cobrir migrações, regras de script, acesso administrativo, persistência e interface com testes, check e build

# Rodada 16 — Interface e base administrativa de Imagem/BIOS

- [x] Mover Opções disponíveis para o final da ficha, mantendo as ações funcionais e discretamente organizadas
- [x] Corrigir a capitalização de Peça e títulos relacionados sem alterar a lógica de reparos
- [x] Adicionar o papel GESTOR de forma segura, preservando OWNER, técnicos, convites e permissões existentes
- [x] Autorizar OWNER e GESTOR no backend e na interface para visualizar e administrar Imagens/BIOS
- [x] Manter Técnicos bloqueados da rota e das procedures de Imagens/BIOS mesmo por acesso direto
- [x] Aprimorar a tabela para atualização frequente, busca, edição, ativação/desativação e persistência após recarga
- [x] Validar a resolução automática da versão atualizada e o fallback de modelo não cadastrado
- [x] Cobrir papéis, CRUD, persistência, interface, TypeScript, testes e build antes do checkpoint

# Rodada 17 — Reparos e geração de script

- [x] Remover qualquer referência a “Registrador reparo” e padronizar a seção como Adicionar Peça e Peças utilizadas no reparo
- [x] Salvar Diagnóstico automaticamente após edição e Inspeção visual imediatamente após seleção, sem botão manual
- [x] Persistir no chamado a Imagem/BIOS automaticamente resolvida pelo modelo, sem interferir na base administrativa
- [x] Ajustar [REPARO:] para listar somente peças registradas com seriais existentes, sem expor código interno
- [x] Preservar reparo automático ou informado quando não houver peça registrada, sem inserir “REALIZADA A TROCA DE:” indevidamente
- [x] Cobrir recarga, persistência automática, múltiplas peças, seriais parciais, exclusão de código e nomenclatura com testes
- [x] Validar TypeScript, suíte completa, build e checkpoint publicado

# Rodada 18 — Reabertura e atualização automática

- [x] Adicionar Reabrir chamado para registros finalizados, retornando para Em andamento sem alterar a data de entrada
- [x] Registrar a reabertura no histórico e preservar produtividade, histórico e isolamento existentes
- [x] Fechar automaticamente a ficha após finalizar e retornar o usuário à lista operacional apropriada
- [x] Centralizar a invalidação/refetch das queries de Dashboard, Chamados, filas, prioridades, histórico e produtividade após cada transição
- [x] Garantir atualização automática em PP, Orçamento, Zurich, Finalizados e retornos para Em andamento, sem F5
- [x] Cobrir finalização, reabertura, cache, múltiplas telas e isolamento multiusuário com testes automatizados
- [x] Validar interface, TypeScript, suíte completa, build e checkpoint publicado

# Rodada 19 — Saída simplificada do Script.AI

- [x] Remover da interface a análise do chamado, cabeçalhos, separadores e explicações que antecedem o script final
- [x] Exibir apenas o conteúdo técnico final ao gerar e copiar o script
- [x] Alterar o início do bloco [REPARO:] para COMPONENTES SUBSTITUIDOS: quando houver peças
- [x] Preservar seriais reais, ausência de código interno, reparo automático sem peças e toda a estrutura restante do script
- [x] Cobrir conteúdo do script, interface simplificada, TypeScript, testes e build antes do checkpoint

# Rodada 20 — Script final e timeline operacional

- [x] Garantir que a função de saída do Script.AI retorne somente o script iniciado em [MODELO:] e sem análise, separador ou cabeçalho intermediário
- [x] Preservar no bloco de componentes somente os seriais preenchidos e nunca expor código interno ou placeholders
- [x] Manter auditoria interna, mas filtrar a timeline visível para abertura, destinações, retornos, reparo, finalização, recusa, troca e reabertura
- [x] Exibir o evento Reparo realizado de forma operacional sem detalhar edições de Peça, diagnóstico ou campos internos
- [x] Cobrir script, seriais vazios/parciais, PP, Orçamento, Zurich, reabertura e timeline limpa com testes
- [x] Validar TypeScript, suíte completa, build e checkpoint publicado

# Rodada 21 — Incorporação do Laudo Creator

- [x] Obter a documentação e a estrutura atual do Laudo Creator como referência funcional obrigatória
- [x] Preservar as funções existentes de formulário, histórico, busca, filtros, duplicação, exclusão, auditoria, logos, fotos, anotações e PDF A4 de 2 páginas
- [x] Integrar autenticação e permissões existentes do Laudo Creator sem criar fluxos novos
- [x] Pré-preencher de forma segura número, produto, serial, queixa, diagnóstico, inspeção e técnico a partir do chamado sem criar campos operacionais adicionais
- [x] Derivar marca e produto pelo modelo quando houver identificação confiável, preservando preenchimento manual para dados ausentes
- [x] Abrir o Laudo Creator em nova aba após SIM na decisão de Orçamento ou Zurich, mantendo NÃO e demais transições inalterados
- [x] Vincular internamente o laudo ao chamado apenas quando possível, sem criar nova interface de histórico
- [x] Validar formulário, fotos, PDF, auditoria, permissões e os quatro fluxos Orçamento/Zurich com e sem laudo
