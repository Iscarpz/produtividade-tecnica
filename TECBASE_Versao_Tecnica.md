# TECBASE — Descrição Técnica da Plataforma

> **TECBASE** é uma plataforma fullstack de gestão e operação técnica para assistência técnica de eletrônicos. Ela centraliza o ciclo do chamado, desde o recebimento até a finalização, incluindo triagem, bancada, peças, orçamento, Zurich, troca, laudos técnicos, anexos, produtividade e histórico operacional.

## 1. Objetivo e escopo operacional

O sistema foi desenvolvido para organizar a rotina de uma assistência técnica que precisa controlar simultaneamente volume de atendimentos, prazo, diagnóstico, reparo, evidências, documentos e produtividade. O TECBASE transforma o chamado em uma ficha operacional rastreável, eliminando a dependência de controles paralelos e reduzindo a necessidade de recarregar telas manualmente para acompanhar alterações recentes.

O escopo atual concentra-se na operação técnica de eletrônicos. A plataforma não se apresenta como ERP, sistema fiscal, ferramenta de estoque completo ou canal de atendimento ao cliente; quando uma dessas necessidades surgir, ela deve ser tratada como uma evolução independente, sem alterar as regras técnicas já estabilizadas.

| Dimensão | Papel do TECBASE |
|---|---|
| Operação | Controle de chamados, filas, transições e prazos de bancada |
| Diagnóstico | Registro técnico, inspeção visual, reparos, peças e script padronizado |
| Documentação | Laudo técnico com fotos, anotações, preview, download e cópia anexada ao chamado |
| Gestão | Indicadores, filtros temporais, produtividade e acompanhamento de equipe autorizado |
| Segurança | Autenticação, perfis, convites, isolamento de dados e restrições por papel |

## 2. Arquitetura e componentes técnicos

O TECBASE utiliza uma arquitetura web fullstack tipada de ponta a ponta. A interface é construída com **React 19**, **TypeScript** e **Tailwind CSS 4**. O backend usa **Node.js**, **Express** e **tRPC**, mantendo os contratos entre frontend e servidor fortemente tipados. A persistência é realizada com **Drizzle ORM** em banco **MySQL/TiDB**, enquanto arquivos operacionais são armazenados em storage compatível com S3. A autenticação é baseada no fluxo OAuth já integrado à plataforma.

| Camada | Tecnologia / responsabilidade |
|---|---|
| Interface | React 19, componentes reutilizáveis, Tailwind CSS e estados de loading, vazio e erro |
| Comunicação | tRPC com contratos tipados para consultas e mutações |
| Servidor | Express e regras de negócio de chamados, permissões, laudos, anexos e produtividade |
| Banco de dados | MySQL/TiDB via Drizzle ORM, com schema versionado por migrações |
| Arquivos | Storage S3 para fotos, logos, anexos e cópias de PDFs |
| Acesso | OAuth, contas convidadas, perfis e proteção de procedimentos |

O frontend trabalha com invalidação dirigida de consultas após mutações relevantes. Assim, quando um chamado é criado, movimentado, reparado, finalizado, excluído ou atualizado, as áreas dependentes — Dashboard, filas, busca, indicadores e ficha — são atualizadas pela própria aplicação, sem exigir `F5` como parte do fluxo normal.

## 3. Modelo de dados principal

O núcleo do sistema é a entidade **chamado**. Cada chamado pertence a um técnico responsável e reúne seu conteúdo operacional, suas datas de ciclo e seus relacionamentos. Eventos relevantes também são registrados para compor o histórico e os indicadores de produtividade.

| Entidade | Finalidade |
|---|---|
| `calls` | Chamado principal: OS, serial, modelo, queixa, status, diagnóstico, observações e datas operacionais |
| `history` | Linha do tempo de criação, movimentações, reparos, anexos e alterações relevantes |
| `repairs` | Componentes substituídos, código interno, serial retirado, serial instalado e observação do reparo |
| `productivityEvents` | Eventos de recebimento, PP, orçamento, Zurich e finalização usados em indicadores |
| `callAttachments` | Metadados de anexos e laudos vinculados, incluindo URL, tipo, tamanho e storage key |
| `laudos` | Dados estruturados de cada laudo técnico emitido ou salvo |
| `laudoAuditLogs` | Auditoria de ações relacionadas aos laudos |
| `laudoSettings` | Configuração institucional e logos utilizadas no cabeçalho do documento |
| `imageBiosCatalog` | Base de versões de imagem/BIOS por modelo, usada na geração do script técnico |
| `users` e `invitations` | Identidade, papéis, situação de acesso e convites da equipe |
| `callDeletionLogs` | Contagem persistente de exclusões sem restaurar o chamado excluído |

## 4. Ciclo de vida do chamado

O chamado inicia em **RECEBIDO**, preservando a data real de entrada no setor. Quando o técnico assume a bancada, ele passa para **EM ANDAMENTO** e registra uma data própria de início de trabalho. Essas duas datas são intencionalmente distintas: a primeira mede o tempo desde o recebimento e a segunda mede o tempo desde a entrada em operação técnica.

| Estado | Significado operacional | Ações principais disponíveis |
|---|---|---|
| RECEBIDO | Chamado chegou ao setor e ainda não foi assumido pela bancada | Iniciar andamento |
| EM ANDAMENTO | Equipamento em análise, reparo ou testes | PP, orçamento, Zurich, finalizar |
| AGUARDANDO PP | Processo depende de peça ou providência correlata | Peça recebida, troca |
| AGUARDANDO ORÇAMENTO | Aguardando decisão de orçamento comum | Aprovar, recusar ou retornar ao andamento |
| Zurich | Chamado encaminhado à tratativa Zurich | Aprovar, recusar ou retornar ao andamento |
| FINALIZADO | Ciclo técnico concluído | Reabrir chamado |
| TROCA | Registro encerrado por troca | Consulta histórica |
| RECUSADO | Registro encerrado por orçamento recusado | Consulta histórica |

O caso Zurich tem regra própria: o envio à Zurich, por si só, não torna o chamado prioritário. A prioridade é ativada somente depois da ação **Orçamento aprovado**. Após aprovação, o chamado retorna a **EM ANDAMENTO**, entra em reparo e pode ser finalizado normalmente após a execução técnica. Orçamento Zurich recusado segue para o estado de recusa e não entra no ranking de prioridade.

## 5. Recebimento, parser, OCR e controle de duplicidade

O TECBASE aceita abertura de chamado por texto copiado e por imagem submetida a OCR. O parser procura campos por rótulos, tolerando tabs, espaços múltiplos, quebras de linha, campos fora de ordem, acentos, caracteres especiais e formatos variados de serial. Ele extrai número do chamado, serial, modelo, garantia, causa e descrição; em seguida, aplica a normalização técnica de modelos com prioridade para **VAIO**, **INFINIX** e **POSITIVO** quando a fonte repete marcas.

A descrição original é preservada como referência. Antes da confirmação, a plataforma apresenta uma **Queixa organizada**, editável pelo técnico. A formalização busca sintetizar o problema central sem traduzir ou descaracterizar termos técnicos como BIOS, firmware, USB, HDMI e touchscreen.

| Validação de abertura | Comportamento |
|---|---|
| Número do chamado ausente | A confirmação permanece bloqueada até o preenchimento manual |
| Número do chamado já existente | A criação é bloqueada e mostra somente o status atual do registro existente |
| Serial com histórico | Exibe alerta compacto de reincidência, mas permite novo chamado legítimo |
| Dados obrigatórios incompletos | Impede a confirmação até a regularização dos campos essenciais |
| Queixa organizada | Pode ser revisada antes da persistência do chamado |

## 6. Ficha técnica, diagnóstico e reparos

A ficha reúne dados do equipamento, queixa, diagnóstico, inspeção visual, observações, reparos, anexos, histórico e ações de status. Diagnóstico e observações são campos distintos: o diagnóstico registra a conclusão técnica principal, enquanto observações servem para contexto complementar. Ambos mantêm estado local enquanto o técnico digita e persistem por salvamento ou saída do campo, evitando mutation por tecla e reduzindo risco de cursor instável ou sobrescrita do conteúdo.

Os reparos permitem registrar o componente, código interno, serial retirado, serial instalado e observação. O código da peça é mantido internamente para controle, mas não aparece no script técnico final quando não for necessário ao texto entregue.

O **Script Técnico** é produzido somente a partir dos dados persistidos e apresenta o conteúdo final padronizado, sem cabeçalhos intermediários de análise. Ele combina modelo, queixa, diagnóstico, inspeção, componentes substituídos, imagem/BIOS e garantia conforme as regras da operação.

## 7. Dashboard, filas e produtividade

O Dashboard funciona como centro de operação. Ele mostra indicadores do período selecionado, chamados recebidos, fila de produção, prioridades e atalhos de acompanhamento. Os filtros temporais incluem hoje, semana, mês, ano e intervalo personalizado; os cálculos respeitam o período selecionado e a distinção entre recebimento e início de andamento.

As filas separam os chamados por contexto operacional: recebidos, em andamento, PP, orçamento e Zurich. Chamados recebidos podem ser colocados em andamento diretamente pela visão geral. A aplicação atualiza a fila, os contadores e os indicadores após a ação correspondente.

| Indicador | Regra de referência |
|---|---|
| Recebidos | Chamados cujo evento de entrada pertence ao período |
| Finalizados | Chamados concluídos no período selecionado |
| PP / Orçamento / Zurich | Eventos e filas correspondentes ao contexto operacional |
| Excluídos | Contagem persistente por técnico e data, sem restaurar o chamado principal |
| Prioridades | Chamados que exigem atenção por prazo, contexto e regra Zurich aprovada |

## 8. Laudo Creator e documento técnico

O Laudo Creator é um módulo nativo de documentação. Ele pode ser aberto de forma independente ou a partir de um chamado, preenche campos conhecidos automaticamente e mantém a edição manual. Suporta marcas Positivo, Infinix, VAIO e COMPAQ, incluindo o tipo de produto **FEATUREPHONE**.

O documento usa dados institucionais e logos configuráveis em uma composição de cabeçalho padronizada. A emissão é feita como PDF nativo A4, com duas páginas: a primeira contém o laudo técnico e a segunda concentra o registro fotográfico. As fotos podem ser adicionadas, ordenadas por arrastar e soltar, anotadas e preparadas antes do preview e do download. A ordem escolhida é mantida no PDF.

| Função do Laudo Creator | Comportamento |
|---|---|
| Prefill | Recupera OS, serial, modelo, queixa e cliente associado quando disponível |
| Evidências | Exige de duas a quatro fotos para emissão completa, com anotação e ordenação manual |
| Preview | Exibe páginas 1 de 2 e 2 de 2 antes do download |
| Emissão | Gera PDF nativo, sem depender de `html2canvas` ou de estilos incompatíveis |
| Download | Dispara arquivo PDF real no navegador |
| Rastreabilidade | Mantém histórico de laudos e logs de auditoria |
| Vínculo operacional | Quando originado por orçamento ou Zurich, anexa automaticamente a mesma cópia do PDF ao chamado |

## 9. Anexos e evidências

Cada chamado pode receber anexos opcionais, incluindo imagens, PDFs, documentos de texto, arquivos compactados e planilhas nos tipos aceitos. Os arquivos passam por validação de formato e tamanho antes do envio ao storage. A ficha permite visualizar, baixar ou remover anexos. A exclusão remove o vínculo operacional e registra o evento no histórico; ela não restaura ou modifica o chamado.

O PDF emitido pelo Laudo Creator é tratado como um anexo especial de tipo **LAUDO TÉCNICO** quando associado a orçamento ou Zurich. Isso evita que o documento fique restrito ao download local do navegador e preserva uma cópia consultável no contexto do atendimento.

## 10. Perfis, acesso e isolamento de dados

O TECBASE usa autenticação e status de conta para controlar acesso. Contas pendentes, recusadas ou revogadas não acessam dados operacionais. Técnicos trabalham em seus próprios registros; gestores autorizados podem acessar visões consolidadas da equipe e administrar usuários dentro das regras disponíveis; o Owner mantém proteção própria contra alterações indevidas.

| Perfil | Alcance principal |
|---|---|
| Técnico | Operação dos próprios chamados, laudos, anexos e produtividade individual |
| Gestor | Visão de equipe, filtros por técnico e gestão permitida de usuários e convites |
| Owner / administrador | Controle superior da estrutura de acesso, protegido contra ações administrativas indevidas |

O backend aplica o identificador do usuário autenticado em consultas e mutações de dados operacionais. Procedimentos administrativos usam controles adicionais por papel. A plataforma também testa bloqueios para contas não autorizadas e tentativas de acesso indevido a operações de equipe.

## 11. Exclusão e auditoria

A exclusão de chamado é permanente para os dados operacionais. Antes da remoção, o sistema elimina relações de reparos, histórico, produtividade e metadados de anexos vinculados ao chamado. Em paralelo, preserva um registro mínimo de exclusão para que os indicadores possam contabilizar o evento por técnico e período, sem que o chamado volte às filas.

Os laudos possuem auditoria própria de ações relevantes. Eventos de movimentação, criação de reparo e alteração de anexos também alimentam a linha do tempo do chamado, formando rastreabilidade operacional.

## 12. Qualidade, validação e estado atual

Na auditoria final de estabilidade, o sistema passou por validação de tipagem, build de produção, checagem de integridade de relações, rotas, permissões, transições, parser, campos extensos, emissão de PDF e renderização visual em desktop e móvel. A suíte atual contém **154 testes automatizados aprovados**. Foram verificadas emissões de laudo com duas, três e quatro fotos, além de variações de texto, caracteres especiais, serial, duplicidade, transições Zurich e retorno de status.

> O TECBASE está estabilizado como uma plataforma operacional técnica: seu objetivo é dar previsibilidade ao atendimento, preservar evidências e tornar o ciclo de cada equipamento visível, mensurável e rastreável.

## 13. Limites funcionais explícitos

Para preservar expectativas corretas de uso, as capacidades abaixo não fazem parte do escopo atual: controle completo de estoque e compra de peças, faturamento fiscal, integração automática com sistemas externos de garantia, mensageria com cliente, atendimento público, cobrança e processamento de pagamentos. Esses itens podem ser avaliados futuramente como módulos próprios, sem descaracterizar os fluxos técnicos existentes.
