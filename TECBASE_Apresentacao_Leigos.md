# TECBASE — Apresentação em Linguagem Simples

## O que é o TECBASE?

O **TECBASE** é uma ferramenta de organização para assistência técnica de eletrônicos. Ela foi criada para acompanhar, em um único lugar, tudo o que acontece com um equipamento desde o momento em que chega ao setor até o momento em que o serviço é concluído.

Em vez de depender de anotações soltas, conversas, planilhas separadas ou memória do técnico, o sistema reúne as informações do atendimento em uma ficha organizada. Assim, fica mais fácil saber o que entrou, o que está em reparo, o que aguarda peça, o que depende de orçamento e o que já foi finalizado.

> Em resumo: o TECBASE ajuda a assistência técnica a trabalhar com mais controle, menos esquecimento e mais rastreabilidade.

## Que problema ele resolve?

Em uma operação técnica, muitos chamados podem estar acontecendo ao mesmo tempo. Um equipamento pode estar aguardando peça, outro pode depender de aprovação de orçamento, outro pode estar na bancada e outro já pode estar pronto para entrega. Sem organização, é fácil perder prazo, esquecer uma informação importante ou não saber quem fez determinada ação.

O TECBASE foi pensado para dar resposta rápida a perguntas como estas:

| Pergunta do dia a dia | Como o sistema ajuda |
|---|---|
| Quais equipamentos chegaram hoje? | Mostra os chamados recebidos diretamente na visão geral |
| O que está na bancada agora? | Organiza a fila de chamados em andamento |
| O que está aguardando peça? | Separa os chamados encaminhados para PP |
| Quais orçamentos precisam de atenção? | Mantém filas próprias para orçamento comum e Zurich |
| Há algum chamado atrasando? | Mostra prioridades e tempo desde o recebimento ou início do trabalho |
| O que foi feito nesse aparelho? | Mantém histórico, diagnóstico, peças, observações, fotos e laudos |

## Como funciona o fluxo de um chamado?

Quando um equipamento chega ao setor, o técnico cria ou confirma um chamado. O sistema guarda o número da ordem de serviço, o serial, o modelo, a queixa e a data de entrada. Depois disso, o chamado pode seguir pelos passos normais do atendimento.

1. **Recebido:** o equipamento chegou ao setor, mas ainda não entrou na bancada.
2. **Em andamento:** o técnico iniciou a análise, o reparo ou os testes.
3. **Aguardando PP:** o atendimento depende de peça ou providência relacionada.
4. **Aguardando orçamento:** é necessário aguardar aprovação ou recusa do orçamento.
5. **Zurich:** o chamado foi encaminhado ao fluxo específico da Zurich.
6. **Finalizado:** o trabalho técnico foi concluído.
7. **Troca ou recusado:** o atendimento é encerrado por troca de equipamento ou recusa de orçamento.

O sistema diferencia duas datas importantes. A primeira é a data em que o equipamento foi recebido pelo setor. A segunda é a data em que ele entrou de fato na bancada. Isso permite acompanhar tanto o tempo total de espera quanto o tempo real de trabalho técnico.

## O que o técnico consegue registrar?

A ficha do chamado foi pensada para concentrar tudo o que importa durante o serviço. O técnico pode registrar o diagnóstico, a inspeção visual, observações complementares, peças utilizadas e seriais de componentes retirados ou instalados.

As **observações** servem para contexto adicional e não substituem o diagnóstico. Por exemplo, o diagnóstico pode dizer qual defeito foi encontrado, enquanto as observações podem registrar uma informação repassada pelo cliente, uma condição especial do equipamento ou um ponto para acompanhamento futuro.

Quando uma peça é usada, o sistema permite indicar qual componente foi substituído e, quando necessário, registrar os números de série envolvidos. Isso cria um histórico técnico claro sobre o serviço realizado.

## Como o sistema ajuda na abertura de chamados?

Muitas vezes o técnico recebe informações copiadas de outro sistema. O TECBASE consegue ler esse texto e separar automaticamente número do chamado, serial, modelo, garantia, causa e descrição do defeito. Mesmo quando o texto vem com espaços estranhos, tabs, quebras de linha ou campos fora de ordem, a ferramenta busca organizar as informações.

Antes de confirmar a abertura, a queixa é apresentada de forma organizada e pode ser revisada manualmente. O sistema também alerta quando o mesmo serial já apareceu anteriormente e bloqueia a criação de uma nova ficha se o número da ordem de serviço já estiver cadastrado.

Isso reduz duas situações comuns: abrir a mesma OS duas vezes por engano e deixar passar um equipamento que já possui histórico técnico.

## Como funciona a prioridade Zurich?

O TECBASE trata o fluxo Zurich com uma regra importante. Apenas enviar um chamado para Zurich não faz com que ele se torne prioritário. A prioridade aparece somente depois que o orçamento é aprovado.

Após a aprovação, o chamado volta para reparo, entra na fila de andamento e pode ser finalizado normalmente depois do serviço. Se o orçamento for recusado, ele não entra na lista de prioridade.

Essa regra evita que chamados ainda sem aprovação ocupem espaço indevido no ranking de atenção.

## O que aparece no Dashboard?

O Dashboard é a tela principal do TECBASE. Ele apresenta um resumo rápido da operação, com quantidades de chamados recebidos, finalizados, enviados para PP, orçamento, Zurich e excluídos.

Também mostra a fila de trabalho e as prioridades. O usuário pode filtrar as informações por hoje, semana, mês, ano ou período personalizado. Quando um chamado é movimentado, as listas e indicadores são atualizados dentro da própria ferramenta, sem depender de atualização manual da página.

| Área do Dashboard | Utilidade |
|---|---|
| Indicadores | Mostram o volume produzido no período escolhido |
| Chamados recebidos | Mostram o que chegou e ainda precisa entrar na bancada |
| Minha fila | Mostra o que o técnico está trabalhando ou precisa acompanhar |
| Prioridades | Destaca situações que exigem atenção operacional |
| Filtros de período | Permitem comparar a produção em diferentes intervalos de tempo |

## O que é o Laudo Creator?

O **Laudo Creator** é o módulo usado para criar laudos técnicos profissionais. Ele aproveita informações já registradas no chamado, como número da OS, serial, modelo, queixa e nome do cliente, mas permite que o técnico edite tudo quando necessário.

O laudo pode incluir informações do produto, avaliação técnica, conclusão, fotos e marcações sobre as imagens. As fotos podem ser reorganizadas com arrastar e soltar, para que a ordem do documento fique da forma desejada.

Antes de baixar, o usuário pode ver uma prévia do laudo. O documento final é gerado em PDF, com cabeçalho institucional, logos das marcas e páginas separadas para o conteúdo técnico e para as evidências fotográficas.

| Recurso do laudo | Benefício |
|---|---|
| Preenchimento automático | Reduz retrabalho ao aproveitar dados do chamado |
| Edição manual | Permite adaptar o documento ao caso real |
| Fotos e anotações | Cria evidências claras do estado ou defeito do equipamento |
| Preview | Permite conferir o documento antes do download |
| PDF final | Gera um arquivo pronto para envio ou arquivamento |
| Histórico | Mantém o laudo associado ao atendimento |

Quando o laudo é criado a partir de um processo de orçamento ou Zurich, o TECBASE não apenas permite baixar o PDF no computador: ele também guarda uma cópia como anexo do chamado. Assim, o documento continua disponível para consulta futura dentro do próprio atendimento.

## Como funcionam os anexos?

Além das fotos do laudo, o chamado pode receber anexos gerais. Isso permite guardar documentos, imagens, PDFs, planilhas ou outros arquivos relevantes para o atendimento.

Na própria ficha é possível visualizar, baixar ou remover os anexos. Isso ajuda a manter todo o material ligado ao equipamento no mesmo lugar, sem depender de pastas externas ou mensagens antigas.

## Quem pode acessar o sistema?

O TECBASE possui controle de acesso por perfil. Técnicos trabalham em seus próprios chamados. Gestores autorizados podem acompanhar informações da equipe e administrar usuários dentro das permissões permitidas. O Owner possui proteção especial para evitar alterações indevidas na estrutura principal de acesso.

Contas que ainda não foram autorizadas, foram recusadas ou foram revogadas não conseguem acessar os dados operacionais. Isso ajuda a preservar a organização e a segurança das informações da assistência técnica.

## Por que isso é importante para a operação?

O principal valor do TECBASE não é apenas “guardar chamados”. Ele cria uma rotina de trabalho mais previsível. Cada equipamento tem uma situação clara, cada mudança gera histórico e cada documento pode ficar ligado ao atendimento correto.

Com isso, a equipe ganha mais segurança para responder o que aconteceu, o que falta fazer e qual é a próxima ação necessária. A gestão ganha visão de volume, prazos e produtividade. E o cliente recebe um atendimento mais consistente, porque o histórico técnico não depende apenas da memória de quem atendeu.

## Situação atual do sistema

O TECBASE passou por uma auditoria final de estabilidade. Foram verificados os fluxos principais de chamados, status, permissões, filtros, parser, campos de texto, laudos, fotos, PDFs, anexos, navegação e responsividade. A validação automatizada mais recente aprovou **154 testes**.

> O TECBASE é uma base profissional para a operação técnica: uma ferramenta feita para acompanhar equipamentos, registrar decisões, documentar reparos e tornar o trabalho diário mais organizado.
