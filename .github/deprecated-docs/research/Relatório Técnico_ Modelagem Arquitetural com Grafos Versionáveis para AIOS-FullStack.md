# Relatório Técnico: Modelagem Arquitetural com Grafos Versionáveis para AIOS-FullStack

**Autor:** Manus AI
**Data:** 23 de Outubro de 2025

## 1. Introdução

Este documento apresenta uma pesquisa técnica aprofundada sobre a modelagem de arquiteturas de software como grafos versionáveis, com o objetivo de apoiar o desenvolvimento do sistema AIOS-FullStack. A pesquisa abrange cinco áreas principais: taxonomias e ontologias formais, frameworks de análise de gaps, algoritmos de força para visualização, ferramentas de visualização de grafos e a utilização de Graph Databases (Graph DBs) com estratégias de versionamento.

O objetivo é fornecer uma base sólida para a implementação de um sistema que permita a representação, análise e evolução de arquiteturas de software complexas de forma dinâmica e visualmente intuitiva. Cada seção deste relatório detalha os achados da pesquisa e conclui com recomendações específicas para a aplicação no contexto do AIOS-FullStack.



## 2. Taxonomias, Nomenclaturas e Ontologias Formais

A modelagem de uma arquitetura de software como um grafo requer uma base semântica bem definida para garantir consistência, clareza e interoperabilidade. A pesquisa nesta área focou em padrões de ontologias formais, como a **Web Ontology Language (OWL)**, e em como eles podem ser aplicados para criar uma taxonomia robusta para as entidades e relações no AIOS-FullStack.

### 2.1. Padrões de Nomenclatura e Estrutura

A análise do **OWL 2 Primer** [1] e de ontologias para tarefas colaborativas [3] revelou padrões consistentes para a nomenclatura e estruturação de entidades arquiteturais. Recomenda-se a adoção de uma convenção de nomenclatura clara para diferenciar tipos de entidades e relações, conforme a tabela abaixo.

| Elemento | Convenção | Exemplo AIOS-FullStack |
|---|---|---|
| **Classes (Entidades)** | `PascalCase` | `UserService`, `DatabaseComponent`, `ApiEndpoint` |
| **Propriedades (Relações)** | `camelCase` com prefixo | `dependsOn`, `invokes`, `readsFrom`, `writesTo` |
| **Indivíduos (Instâncias)** | `PascalCase` ou `snake_case` | `ProductionUserService`, `user_db_instance` |

As estruturas fundamentais do OWL, como `SubClassOf`, `EquivalentClasses` e `DisjointClasses`, fornecem um mecanismo poderoso para definir hierarquias e restrições. Por exemplo, um `ApiEndpoint` pode ser definido como uma subclasse de `Component`, e as classes `Service` e `Database` podem ser declaradas como mutuamente exclusivas (`DisjointClasses`).

### 2.2. Relações Parte-Todo (Part-Whole)

Para representar a composição hierárquica de sistemas, como um módulo que contém vários submódulos ou um serviço composto por múltiplos componentes, o padrão de relações **parte-todo (part-whole)** [2] é essencial. A recomendação é implementar duas propriedades de objeto principais:

- **`hasPart`**: Uma propriedade transitiva que indica que uma entidade é composta por outra.
- **`hasPart_directly`**: Uma subpropriedade não transitiva de `hasPart`, usada para representar contenção direta e aplicar restrições de cardinalidade.

A utilização dessas propriedades permite consultas que podem diferenciar entre dependências diretas e indiretas (transitivas), o que é crucial para a análise de impacto e para a visualização hierárquica da arquitetura.

### 2.3. Ontologia de Tarefas e Operações

Inspirado pela ontologia para tarefas colaborativas [3], as interações entre os componentes do AIOS-FullStack podem ser modeladas como **tarefas ou operações**. Cada relação pode ser enriquecida com metadados que descrevem a natureza da interação (e.g., `read`, `write`, `validate`), os objetos de dados envolvidos (`involves`), e o agente executor (`executed-by`).

Isso permite uma análise mais profunda do fluxo de dados e das responsabilidades de cada componente, formando a base para a análise de coesão e acoplamento discutida na próxima seção.

## 3. Frameworks Arquiteturais e Análise de Gaps

A representação da arquitetura como um grafo possibilita a aplicação de análises automatizadas para identificar problemas estruturais, conhecidos como "gaps". A pesquisa focou em adaptar metodologias consagradas, como a **Análise de Gaps do TOGAF** [4], e em utilizar métricas de qualidade de software para enriquecer a análise.

### 3.1. Matriz de Análise de Gaps

O processo de Análise de Gaps do TOGAF pode ser adaptado para comparar duas versões de uma arquitetura (e.g., a versão atual vs. uma versão proposta). Ao mapear os componentes de uma versão para outra em uma matriz, é possível identificar sistematicamente os seguintes tipos de gaps:

- **Componentes Eliminados**: Itens presentes na arquitetura de origem, mas ausentes na de destino. Podem ser eliminações intencionais ou omissões acidentais.
- **Componentes Novos**: Itens introduzidos na arquitetura de destino. Requerem desenvolvimento ou aquisição.
- **Componentes Órfãos**: Uma forma de gap onde um componente existe, mas não possui relações estruturais significativas (e.g., `dependsOn`, `partOf`), indicando um possível problema de integração [6].

Essa análise pode ser automatizada através de consultas ao grafo, comparando os conjuntos de nós e arestas entre dois snapshots da arquitetura.

### 3.2. Métricas de Coesão e Acoplamento

As métricas de **coesão e acoplamento** [5] são fundamentais para avaliar a qualidade de um design modular. No contexto de um grafo arquitetural, elas podem ser interpretadas da seguinte forma:

- **Acoplamento (Coupling)**: Mede o grau de interdependência entre diferentes componentes. Relações como `invokes`, `readsFrom`, e `writesTo` são indicadores diretos de acoplamento. Um alto acoplamento entre módulos que não são funcionalmente relacionados pode indicar um design problemático.
- **Coesão (Cohesion)**: Mede o quão bem os elementos dentro de um mesmo componente (ou módulo) pertencem uns aos outros. Em um grafo, a coesão pode ser avaliada analisando a densidade das relações internas de um subgrafo que representa um módulo.

Essas métricas podem ser calculadas e atribuídas como pesos às entidades e relações, servindo como entrada para algoritmos de visualização e como indicadores de saúde arquitetural.

### 3.3. Diffing Semântico de Grafos

Para rastrear a evolução da arquitetura de forma significativa, uma simples comparação textual de arquivos de definição não é suficiente. Ferramentas como o **Graphtage** [7] demonstram a viabilidade de um "diffing semântico", que compara a estrutura do grafo em vez de seu texto. Ao exportar o grafo do AIOS-FullStack para um formato estruturado como JSON ou YAML, é possível:

- Identificar adições, remoções e modificações de entidades e relações.
- Gerar changelogs estruturados e compreensíveis.
- Comparar visualmente duas versões da arquitetura, destacando as mudanças estruturalmente o que mudou.

Esta abordagem é fundamental para o versionamento semântico e para a análise de impacto de mudanças arquiteturais.



## 4. Pesos Relacionais e Algoritmos de Força

A visualização de um grafo arquitetural deve traduzir a estrutura lógica em uma representação espacialmente intuitiva. Algoritmos de layout direcionados por força (force-directed) são ideais para este fim, pois simulam um sistema físico onde as relações de acoplamento e coesão se manifestam como forças de atração e repulsão.

### 4.1. Definição de Pesos Relacionais

Para que o layout reflita a semântica da arquitetura, as relações (arestas) devem ser ponderadas. O peso de uma relação pode ser uma função de múltiplas métricas, como:

- **Frequência de Uso**: Quantas vezes uma dependência é invocada.
- **Criticidade**: A importância da relação para o funcionamento do sistema (definida manualmente ou por heurística).
- **Intensidade de Dados**: O volume de dados transferidos através da relação.

Uma fórmula de peso combinado pode ser usada para agregar essas métricas. Por exemplo:

`peso = 0.5 * norm(frequência) + 0.3 * norm(criticidade) + 0.2 * norm(intensidade)`

É crucial que esses pesos sejam **normalizados** (e.g., usando min-max scaling para o intervalo [0, 1]) para garantir consistência entre diferentes tipos de métricas [10].

### 4.2. Algoritmos de Layout Direcionados por Força

A pesquisa comparou vários algoritmos de layout [11], com destaque para o **ForceAtlas2** [8], um algoritmo projetado para a visualização de redes complexas e scale-free, características comuns em arquiteturas de software.

> O ForceAtlas2 é um layout direcionado por força próximo a outros algoritmos usados para espacialização de redes. Não reivindicamos um avanço teórico, mas uma tentativa de integrar diferentes técnicas, como a simulação de Barnes Hut, força repulsiva dependente do grau e temperaturas adaptativas locais e globais.
> — Jacomy et al. [8]

As principais características que tornam o ForceAtlas2 adequado para o AIOS-FullStack são:

- **Repulsão Dependente do Grau**: Nós com muitas conexões (hubs) repelem outros nós com mais força, evitando a sobreposição visual e destacando componentes centrais.
- **Atração Ponderada**: A força de atração entre dois nós pode ser diretamente influenciada pelo peso da aresta, fazendo com que componentes fortemente acoplados fiquem visualmente mais próximos.
- **Gravidade**: Uma força que puxa todos os nós em direção ao centro, o que ajuda a compactar o grafo e a evitar que componentes desconectados (órfãos) se dispersem para o infinito.

### 4.3. Implementação e Configuração

Tanto a biblioteca **NetworkX** (Python) [9] quanto a **D3.js** (JavaScript) [10] oferecem implementações de layouts direcionados por força que suportam pesos.

- **NetworkX**: Ideal para a fase de análise e processamento em backend. Permite calcular o layout e exportá-lo.
- **D3.js**: Ideal para a visualização interativa no frontend, permitindo que os usuários manipulem o grafo, ajustem as forças e explorem as relações dinamicamente.

A configuração recomendada envolve usar o peso da aresta para modular a **força de atração** (arestas mais pesadas atraem mais) e a **distância de repouso** (arestas mais pesadas resultam em uma distância menor entre os nós).



## 5. Ferramentas de Visualização em Grafo

A escolha da ferramenta de visualização correta é crucial e depende do caso de uso específico: geração de documentação estática, análise interativa ou exploração de dados. A pesquisa [12, 13] analisou um espectro de ferramentas, desde bibliotecas de linha de comando até plataformas de exploração visual.

### 5.1. Pipeline de Visualização Recomendado

Para o AIOS-FullStack, recomenda-se um **pipeline de visualização em múltiplas etapas**, utilizando diferentes ferramentas em cada fase do processo, desde a análise até a apresentação.

1.  **Análise e Geração de Layout (Backend):** Utilizar a biblioteca **NetworkX** em Python para carregar o grafo arquitetural, realizar análises de gaps, calcular métricas de centralidade e, mais importante, computar a posição dos nós usando o algoritmo ForceAtlas2. O resultado (um grafo com coordenadas de layout) pode ser exportado para formatos intermediários como JSON, GraphML ou DOT.

2.  **Visualização Estática e Documentação (CLI):** Para a geração automatizada de diagramas arquiteturais para inclusão em documentação (e.g., em um pipeline de CI/CD), ferramentas de linha de comando como **Mermaid.js CLI** [14] ou **GraphViz** [15] são ideais. Elas consomem uma representação textual do grafo (sintaxe Mermaid ou linguagem DOT) e geram arquivos de imagem (SVG, PNG), que podem ser facilmente versionados e incorporados em arquivos Markdown.

3.  **Visualização Interativa (Frontend):** Para a interface web do AIOS-FullStack, a biblioteca **D3.js** [10] é a escolha mais poderosa e flexível. Embora tenha uma curva de aprendizado íngreme, ela oferece controle total sobre a renderização e a interatividade, permitindo a criação de uma experiência de usuário rica, onde é possível manipular as forças do layout, filtrar nós e explorar relações dinamicamente.

4.  **Exploração de Dados (GUI):** Se os dados do grafo forem persistidos em um Graph DB como o Neo4j, ferramentas como o **Neo4j Bloom** [16] oferecem uma interface de exploração visual sem a necessidade de código, ideal para análises ad-hoc e investigações de dependência por parte de arquitetos e desenvolvedores.

### 5.2. Tabela Comparativa de Ferramentas

A tabela a seguir resume as principais ferramentas analisadas e seus casos de uso recomendados para o AIOS-FullStack.

| Ferramenta | Vantagens | Limitações | Uso Recomendado no AIOS-FullStack |
|---|---|---|---|
| **Mermaid.js** | Sintaxe simples, CLI, fácil automação | Interatividade limitada, layout automático | Geração de diagramas estáticos para documentação. |
| **D3.js** | Altamente customizável, interativo, poderoso | Curva de aprendizado, complexidade | Interface web principal para exploração interativa. |
| **NetworkX** | Análise de grafos, múltiplos layouts, Python | Visualização básica, não interativo | Backend para análise, cálculo de layout e exportação. |
| **GraphViz** | CLI poderoso, linguagem DOT, estável | Estilo visual datado, não interativo | Alternativa ao Mermaid.js para geração de diagramas. |
| **Neo4j Bloom** | Exploração sem código, integração com Neo4j | Requer Neo4j, licença comercial | Exploração ad-hoc se os dados estiverem no Neo4j. |


## 6. Graph Databases e Estratégias de Versionamento

Para persistir e consultar o grafo arquitetural de forma eficiente, a utilização de um Graph Database (Graph DB) nativo é a abordagem mais adequada. A pesquisa comparou várias opções [17, 23], com foco em suas capacidades de consulta e, crucialmente, em suas estratégias para o versionamento de dados.

### 6.1. Comparação: Neo4j vs. TerminusDB

Dois bancos de dados se destacaram na análise: **Neo4j**, o líder de mercado em Graph DBs, e **TerminusDB**, um sistema mais recente com foco em colaboração e versionamento.

| Aspecto | Neo4j | TerminusDB |
|---|---|---|
| **Versionamento** | Manual, via padrões de modelagem [18] | Nativo, com semântica Git (branch, merge, rollback) [19] |
| **Query Language** | Cypher (declarativo, tipo SQL) | WOQL (JS/Python/JSON-LD) |
| **Schema** | Schema-optional | Schema-first (baseado em OWL) com validação |
| **Ecossistema** | Vasto, com muitas ferramentas e grande comunidade | Menor, mas em crescimento |
| **Licença** | Community (GPLv3) / Enterprise | Apache 2.0 |

O **Neo4j** oferece flexibilidade e um ecossistema maduro, mas exige que o versionamento seja implementado manualmente no nível do modelo de dados. A documentação oficial [18] descreve vários padrões para isso, como:

-   **Time-Based Versioning**: Cada nó e relação possui propriedades `validFrom` e `validTo`, permitindo "viajar no tempo" e consultar o estado do grafo em qualquer ponto da história.
-   **Entity Versioning**: Mantém uma entidade principal imutável e a conecta a diferentes nós de "estado" que representam suas versões.
-   **Linked List**: Conecta versões em uma sequência, útil para rastrear a ordem cronológica de mudanças.

Por outro lado, o **TerminusDB** foi projetado desde o início com o versionamento em mente. Ele trata o banco de dados como um repositório Git, onde cada mudança é um commit e é possível criar branches para experimentação, fazer merge de mudanças e reverter para estados anteriores. Essa abordagem simplifica drasticamente a implementação do versionamento, tornando-a uma característica nativa do banco de dados.

> TerminusDB is a graph database that stores data like Git. TerminusDB allows for the whole suite of revision control features: branch, merge, squash, rollback, blame, and time-travel.
> — Vivek [19]

### 6.2. Linguagens de Consulta

A escolha do banco de dados também implica na escolha da linguagem de consulta. A pesquisa comparou as linguagens mais populares [20, 21]:

-   **Cypher (Neo4j)**: É uma linguagem declarativa inspirada em SQL, com uma sintaxe ASCII-art para descrever padrões de grafo, o que a torna muito intuitiva para a maioria dos desenvolvedores.
-   **WOQL (TerminusDB)**: É uma linguagem de consulta de objetos web que pode ser construída usando builders em Python ou JavaScript, oferecendo uma abordagem mais programática.
-   **GraphQL**: Embora não seja uma linguagem de banco de dados de grafos, o GraphQL é uma linguagem de consulta para APIs. Ferramentas como o `pg_graphql` do Supabase [22] podem expor um banco de dados relacional como uma API de grafo, mas com limitações em travessias complexas.

### 6.3. Recomendação para AIOS-FullStack

Para o AIOS-FullStack, a escolha ideal depende do peso do requisito de versionamento:

-   **Se o versionamento colaborativo e a experimentação em branches forem críticos**: **TerminusDB** é a escolha superior, pois o versionamento é uma funcionalidade de primeira classe, eliminando a complexidade da implementação manual.

-   **Se um ecossistema maduro e uma linguagem de consulta mais simples forem prioritários**: **Neo4j** é a escolha mais segura. O versionamento pode ser implementado com sucesso utilizando o padrão **Time-Based Versioning**, que oferece a capacidade de realizar análises históricas e snapshots temporais da arquitetura. Esta abordagem, embora manual, é poderosa e bem documentada.

Dada a maturidade e o amplo suporte da comunidade, a recomendação inicial pende para o **Neo4j com uma implementação cuidadosa de Time-Based Versioning**. Isso proporciona um equilíbrio entre poder, flexibilidade e um ecossistema robusto.



## 7. Conclusão e Recomendações Consolidadas

A pesquisa realizada fornece um roteiro claro para a implementação da modelagem arquitetural como um grafo versionável no sistema AIOS-FullStack. As recomendações a seguir consolidam os achados de cada área de pesquisa em um plano de ação coeso.

1.  **Adotar uma Ontologia Formal (OWL):** Utilizar os princípios do OWL para definir uma taxonomia clara com nomenclatura padronizada (`PascalCase` para entidades, `camelCase` para relações) e relações estruturais como `SubClassOf` e `partOf`.

2.  **Implementar Análise de Gaps Automatizada:** Adaptar a metodologia de Análise de Gaps do TOGAF para comparar snapshots da arquitetura, identificando componentes novos, eliminados e órfãos através de consultas ao grafo.

3.  **Utilizar Pesos Relacionais e ForceAtlas2:** Ponderar as relações do grafo com base em métricas de acoplamento (frequência, criticidade) e utilizar o algoritmo ForceAtlas2 para gerar layouts visualmente significativos, onde a proximidade espacial reflete o acoplamento estrutural.

4.  **Empregar um Pipeline de Visualização:**
    -   **Backend (NetworkX):** Para análise e cálculo de layout.
    -   **Frontend (D3.js):** Para visualização interativa.
    -   **CLI (Mermaid.js/GraphViz):** Para geração de diagramas estáticos em documentação.

5.  **Persistir o Grafo em um Graph DB:** A recomendação principal é utilizar **Neo4j** como o banco de dados de grafos, implementando o versionamento através do padrão **Time-Based Versioning**. Esta abordagem oferece um excelente equilíbrio entre maturidade do ecossistema, poder de consulta com Cypher e a capacidade de realizar análises históricas detalhadas da arquitetura.

Ao seguir estas recomendações, o AIOS-FullStack poderá não apenas representar arquiteturas complexas como grafos dinâmicos e interativos, mas também fornecer insights valiosos sobre sua saúde, evolução e estrutura, transformando a maneira como as arquiteturas de software são compreendidas e gerenciadas.

## 8. Referências

[1] W3C. (2012). *OWL 2 Web Ontology Language Primer (Second Edition)*. [https://www.w3.org/TR/owl2-primer/](https://www.w3.org/TR/owl2-primer/)

[2] Rector, A., & Welty, C. (2005). *Simple part-whole relations in OWL Ontologies*. [https://www.w3.org/2001/sw/BestPractices/OEP/SimplePartWhole/simple-part-whole-relations-v1.3.html](https://www.w3.org/2001/sw/BestPractices/OEP/SimplePartWhole/simple-part-whole-relations-v1.3.html)

[3] Schmidt, D., Bordini, R. H., Meneguzzi, F., & Vieira, R. (2015). An Ontology for Collaborative Tasks in Multi-agent Systems. *CEUR Workshop Proceedings, 1442*, 37-52. [https://ceur-ws.org/Vol-1442/paper_4.pdf](https://ceur-ws.org/Vol-1442/paper_4.pdf)

[4] Visual Paradigm. (2025). *A Comprehensive Guide to Applying Gap Analysis in TOGAF ADM*. [https://togaf.visual-paradigm.com/2025/01/20/comprehensive-guide-to-applying-gap-analysis-in-togaf-adm/](https://togaf.visual-paradigm.com/2025/01/20/comprehensive-guide-to-applying-gap-analysis-in-togaf-adm/)

[5] GeeksforGeeks. (n.d.). *Software Engineering | Coupling and Cohesion*. [https://www.geeksforgeeks.org/software-engineering-coupling-and-cohesion/](https://www.geeksforgeeks.org/software-engineering-coupling-and-cohesion/)

[6] Bibi, M., Maqbool, O., & Kanwal, J. (2016). Supervised learning for orphan adoption problem in software architecture recovery. *Malaysian Journal of Computer Science, 29*(4), 283-296. [http://mjes.um.edu.my/index.php/MJCS/article/view/7018](http://mjes.um.edu.my/index.php/MJCS/article/view/7018)

[7] Trail of Bits. (2020). *graphtage: A semantic diff utility and library for tree-like files*. [https://blog.trailofbits.com/2020/08/28/graphtage/](https://blog.trailofbits.com/2020/08/28/graphtage/)

[8] Jacomy, M., Venturini, T., Heymann, S., & Bastian, M. (2014). ForceAtlas2, a Continuous Graph Layout Algorithm for Handy Network Visualization Designed for the Gephi Software. *PLOS ONE, 9*(6), e98679. [https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679)

[9] NetworkX Developers. (n.d.). *spring_layout*. NetworkX Documentation. [https://networkx.org/documentation/stable/reference/generated/networkx.drawing.layout.spring_layout.html](https://networkx.org/documentation/stable/reference/generated/networkx.drawing.layout.spring_layout.html)

[10] D3.js Team. (n.d.). *d3-force*. [https://d3js.org/d3-force](https://d3js.org/d3-force)

[11] Hua, J., et al. (2018). Graph Layout Performance Comparisons of Force-Directed Algorithms. *International Journal of Performability Engineering, 14*(1), 67-76. [https://www.ijpe-online.com/EN/10.23940/ijpe.18.01.p8.6776](https://www.ijpe-online.com/EN/10.23940/ijpe.18.01.p8.6776)

[12] Cambridge Intelligence. (2025). *Open source data visualization options: we compare 5 tools*. [https://cambridge-intelligence.com/open-source-data-visualization/](https://cambridge-intelligence.com/open-source-data-visualization/)

[13] Infranodus. (2025). *Best Network Visualization Tools in 2025*. [https://infranodus.com/docs/network-visualization-software](https://infranodus.com/docs/network-visualization-software)

[14] Mermaid.js. (n.d.). *mermaid CLI*. [https://mermaid.js.org/config/mermaidCLI.html](https://mermaid.js.org/config/mermaidCLI.html)

[15] Graphviz. (n.d.). *The DOT Language*. [https://graphviz.org/doc/info/lang.html](https://graphviz.org/doc/info/lang.html)

[16] Neo4j. (n.d.). *Neo4j Bloom*. [https://neo4j.com/product/bloom/](https://neo4j.com/product/bloom/)

[17] Fernandes, D., & Bernardino, J. (2018). *Graph Databases Comparison: AllegroGraph, ArangoDB, InfiniteGraph, Neo4J, and OrientDB*. DATA 2018. [https://www.scitepress.org/PublishedPapers/2018/69102/69102.pdf](https://www.scitepress.org/PublishedPapers/2018/69102/69102.pdf)

[18] Neo4j. (n.d.). *Data Modeling: Versioning*. [https://neo4j.com/docs/getting-started/data-modeling/versioning/](https://neo4j.com/docs/getting-started/data-modeling/versioning/)

[19] Vivek. (2020). *Graph Databases: TerminusDB vs Neo4j*. TerminusDB Community on Medium. [https://medium.com/terminusdb/graph-databases-terminusdb-vs-neo4j-8fd8f8290c9a](https://medium.com/terminusdb/graph-databases-terminusdb-vs-neo4j-8fd8f8290c9a)

[20] Hypermode. (2024). *A Guide to Graph Query Languages*. [https://hypermode.com/blog/graph-query-languages](https://hypermode.com/blog/graph-query-languages)

[21] Holzschuher, F., & Peinl, R. (2013). *Performance of graph query languages: comparison of cypher, gremlin and native access in neo4j*. EDBT/ICDT 2013. [https://dl.acm.org/doi/abs/10.1145/2457317.2457351](https://dl.acm.org/doi/abs/10.1145/2457317.2457351)

[22] Supabase. (n.d.). *GraphQL Docs*. [https://supabase.com/docs/guides/graphql](https://supabase.com/docs/guides/graphql)

[23] Monteiro, J., Sá, F., & Bernardino, J. (2023). *Experimental evaluation of graph databases: Janusgraph, nebula graph, neo4j, and tigergraph*. Applied Sciences, 13(9), 5770. [https://www.mdpi.com/2076-3417/13/9/5770](https://www.mdpi.com/2076-3417/13/9/5770)

