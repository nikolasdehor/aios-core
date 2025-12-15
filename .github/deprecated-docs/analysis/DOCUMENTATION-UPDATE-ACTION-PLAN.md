# 📋 Plano de Ação: Atualização de Documentação AIOS

**Data**: 2025-10-22
**Baseado em**: DOCUMENTATION-GAPS-ANALYSIS.md
**Prioridade**: 🔴 ALTA - P0/P1

---

## 🎯 Objetivo

Sincronizar documentação com estado atual do código, garantindo que agentes Claude Code tenham visibilidade completa de recursos disponíveis.

---

## 📊 Fases de Execução

### FASE 1: Correções Críticas (P0) - 2h
**Objetivo**: Restaurar funcionalidade básica de descoberta de recursos

#### Task 1.1: Atualizar .claude/CLAUDE.md
**Tempo**: 45min
**Arquivo**: `.claude/CLAUDE.md`

**Mudanças**:

1. Substituir seção "AIOS Framework Structure" (linha ~44-60):

```markdown
## AIOS Framework Structure

```
aios-core/
├── agents/             # Agent persona definitions (YAML/Markdown)
├── agent-teams/        # Multi-agent team orchestration definitions
├── checklists/         # Validation and review checklists
├── data/               # Knowledge base and frameworks
│   ├── aios-kb.md                    # AIOS knowledge base
│   ├── elicitation-methods.md        # Elicitation techniques
│   ├── brainstorming-techniques.md   # Brainstorming methods
│   ├── test-levels-framework.md      # Testing framework
│   └── test-priorities-matrix.md     # Test prioritization
├── docs/               # Internal framework documentation
├── elicitation/        # Interactive elicitation engines (JS)
│   ├── agent-elicitation.js          # Agent creation wizard
│   ├── task-elicitation.js           # Task creation wizard
│   └── workflow-elicitation.js       # Workflow creation wizard
├── tasks/              # Executable task workflows
├── templates/          # Document and code templates
│   └── ide-rules/      # IDE-specific rule templates
├── tools/              # Tool integrations and definitions
│   ├── cli/            # CLI tool configs (GitHub, Railway, Supabase)
│   ├── local/          # Local tool configs (FFmpeg, etc.)
│   └── mcp/            # MCP server definitions (8 integrations)
│       ├── 21st-dev-magic.yaml       # UI component generation
│       ├── browser.yaml              # Browser automation
│       ├── clickup.yaml              # ClickUp integration
│       ├── context7.yaml             # Documentation search
│       ├── exa.yaml                  # Web research
│       ├── google-workspace.yaml     # Google Workspace APIs
│       ├── n8n.yaml                  # Workflow automation
│       └── supabase.yaml             # Supabase integration
├── utils/              # 70+ utility scripts for automation
│   ├── aios-validator.js             # Validate AIOS structures
│   ├── story-manager.js              # Story lifecycle management
│   ├── tool-resolver.js              # Resolve available tools
│   ├── clickup-helpers.js            # ClickUp utility functions
│   ├── component-generator.js        # Generate code components
│   ├── test-generator.js             # Generate test suites
│   ├── backup-manager.js             # Backup and restore
│   └── ... (60+ more utilities)
└── workflows/          # Multi-step workflow definitions

expansion-packs/
└── hybrid-ops/         # Pedro Valério methodology expansion pack
    ├── agents/         # PV-specialized agents
    │   ├── clickup-engineer-pv.md    # ClickUp expertise
    │   ├── process-architect-pv.md   # Process design
    │   ├── workflow-designer-pv.md   # Workflow creation
    │   └── ... (9 PV agents total)
    ├── tasks/          # Hybrid-ops specific tasks
    └── templates/      # PV-style templates

outputs/
└── minds/              # Cognitive profiles for specialized agents
    └── pedro_valerio/  # Pedro Valério cognitive extraction
        └── artifacts/  # 15+ deep analysis documents
            ├── 5H_EXTRAÇÃO_COGNITIVA_COMPLETA_PEDRO_VALÉRIO_LOPEZ.md
            ├── ANALISE_COGNITIVA.md
            ├── DNA_Narrativo_Camadas.md
            └── ... (cognitive depth for hybrid-ops agents)

docs/
├── stories/            # Development stories (numbered)
├── prd/                # Product requirement documents
├── architecture/       # System architecture documentation
│   ├── coding-standards.md           # Code standards
│   ├── tech-stack.md                 # Technology choices
│   ├── source-tree.md                # Project structure
│   ├── hybrid-ops-pv-mind-integration.md  # PV integration arch
│   └── decision-analysis-*.md        # Architecture decisions
├── qa/                 # Quality assurance artifacts
│   └── gates/          # Quality gate decisions
└── guides/             # User and developer guides
```
```

2. Adicionar nova seção após "AIOS Framework Structure":

```markdown
## Available Tools and Integrations

AIOS-FULLSTACK integrates with multiple tools through different mechanisms:

### MCP Servers (.aios-core/tools/mcp/)
Model Context Protocol servers provide rich integrations:
- **21st-dev-magic**: Generate UI components on-demand
- **clickup**: Full ClickUp project management integration
- **google-workspace**: Access to Drive, Docs, Sheets, Calendar, Gmail
- **exa**: Advanced web research and knowledge retrieval
- **n8n**: Workflow automation and integrations
- **supabase**: Database and backend services
- **context7**: Real-time documentation search
- **browser**: Browser automation for testing

### CLI Tools (.aios-core/tools/cli/)
Integrated command-line tools:
- **github-cli**: GitHub operations (PRs, Issues, Releases)
- **railway-cli**: Railway.app deployments
- **supabase-cli**: Supabase project management

### Local Tools (.aios-core/tools/local/)
Local system tools:
- **ffmpeg**: Video/audio processing

### Utility Scripts (.aios-core/utils/)
70+ JavaScript utilities for common operations:
- **story-manager.js**: Story lifecycle operations
- **tool-resolver.js**: Discover and validate available tools
- **clickup-helpers.js**: ClickUp API helpers
- **aios-validator.js**: Validate AIOS structures
- **component-generator.js**: Generate code scaffolding
- **test-generator.js**: Generate test suites
- And 60+ more utilities for workflows

To discover all available tools, agents can use `tool-resolver.js`.

## Expansion Packs

AIOS supports expansion packs that add domain-specific agents and workflows.

### Hybrid-Ops (Pedro Valério Methodology)
Located in `expansion-packs/hybrid-ops/`

Specialized agents based on Pedro Valério's methodology:
- **clickup-engineer-pv**: ClickUp project structure expert
- **process-architect-pv**: Business process design
- **workflow-designer-pv**: Workflow creation and optimization
- **executor-designer-pv**: Execution strategy design
- And 5 more PV-specialized agents

These agents leverage Pedro Valério's cognitive profile located in:
`outputs/minds/pedro_valerio/artifacts/`

This includes deep cognitive analysis, communication patterns, and methodology extracted through 5+ hours of interviews and analysis.

**When to use hybrid-ops agents**: Complex process design, ClickUp-heavy projects, Brazilian market context, systematic methodology requirements.
```

#### Task 1.2: Atualizar core-config.yaml
**Tempo**: 30min
**Arquivo**: `.aios-core/core-config.yaml`

**Adicionar no final do arquivo**:

```yaml
# Tool and resource locations
toolsLocation: .aios-core/tools
utilsLocation: .aios-core/utils
dataLocation: .aios-core/data
elicitationLocation: .aios-core/elicitation
expansionPacksLocation: expansion-packs
mindsLocation: outputs/minds

# Additional architecture documents to load for dev agent
devLoadAlwaysFiles:
  - docs/architecture/coding-standards.md
  - docs/architecture/tech-stack.md
  - docs/architecture/source-tree.md
  - docs/architecture/hybrid-ops-pv-mind-integration.md

# Pedro Valério cognitive context (for hybrid-ops agents)
pvMindContext:
  enabled: true
  location: outputs/minds/pedro_valerio
  priority_artifacts:
    - artifacts/5H_EXTRAÇÃO_COGNITIVA_COMPLETA_PEDRO_VALÉRIO_LOPEZ.md
    - artifacts/ANALISE_COGNITIVA.md
    - artifacts/DNA_Narrativo_Camadas.md
    - artifacts/Assinatura_Linguistica.md
  load_for_agents:
    - clickup-engineer-pv
    - process-architect-pv
    - workflow-designer-pv
    - executor-designer-pv
    - agent-creator-pv
    - documentation-writer-pv
    - validation-reviewer-pv
    - qa-validator-pv
    - process-mapper-pv
```

#### Task 1.3: Criar README para tools/
**Tempo**: 20min
**Arquivo**: `.aios-core/tools/README.md` (novo)

```markdown
# AIOS Tools Directory

This directory contains tool integration definitions for AIOS-FULLSTACK.

## Structure

```
tools/
├── cli/          # Command-line tool integrations
├── local/        # Local system tool integrations
└── mcp/          # Model Context Protocol server definitions
```

## CLI Tools (cli/)

Command-line interfaces integrated into AIOS:

- **github-cli.yaml**: GitHub CLI (gh) integration
- **railway-cli.yaml**: Railway.app deployment CLI
- **supabase-cli.yaml**: Supabase project management CLI

## Local Tools (local/)

Local system tools:

- **ffmpeg.yaml**: Video/audio processing via FFmpeg

## MCP Servers (mcp/)

Model Context Protocol servers provide rich AI-agent integrations:

### Development & Design
- **21st-dev-magic.yaml**: UI component generation and design patterns

### Project Management
- **clickup.yaml**: Complete ClickUp integration (tasks, spaces, lists, time tracking)

### Documentation & Research
- **context7.yaml**: Real-time documentation search across libraries
- **exa.yaml**: Advanced web research and knowledge retrieval

### Productivity & Automation
- **google-workspace.yaml**: Drive, Docs, Sheets, Calendar, Gmail integration
- **n8n.yaml**: Workflow automation and n8n integration

### Backend & Database
- **supabase.yaml**: Supabase backend services (Auth, Database, Storage)

### Testing & Automation
- **browser.yaml**: Browser automation for testing and scraping

## Usage

Agents can discover available tools using:

```javascript
const { resolveTools } = require('../utils/tool-resolver.js');
const availableTools = await resolveTools();
```

## Adding New Tools

1. Create YAML definition in appropriate subdirectory
2. Follow existing format for consistency
3. Update this README
4. Test tool resolution with `tool-resolver.js`
```

#### Task 1.4: Criar README para utils/
**Tempo**: 25min
**Arquivo**: `.aios-core/utils/README.md` (novo)

```markdown
# AIOS Utility Scripts

70+ utility scripts for common AIOS operations.

## Top 20 Most Used Utilities

### Story & Task Management
- **story-manager.js**: Story CRUD operations, status updates, validation
- **story-update-hook.js**: Automated story update hooks
- **status-mapper.js**: Map status between different systems

### Tool Management
- **tool-resolver.js**: Discover and validate available tools
- **tool-helper-executor.js**: Execute tool operations
- **tool-validation-helper.js**: Validate tool configurations

### Validation & Quality
- **aios-validator.js**: Validate AIOS structures (agents, tasks, workflows)
- **yaml-validator.js**: YAML syntax and schema validation
- **template-validator.js**: Template structure validation

### Code Generation
- **component-generator.js**: Generate code components and scaffolding
- **test-generator.js**: Generate test suites
- **migration-generator.js**: Generate database migrations

### Testing
- **test-template-system.js**: Test template management
- **test-quality-assessment.js**: Assess test quality
- **test-updater.js**: Update existing tests
- **sandbox-tester.js**: Isolated test execution

### Documentation
- **documentation-synchronizer.js**: Keep docs in sync with code
- **aios-doc-template.md**: Documentation template

### ClickUp Integration
- **clickup-helpers.js**: ClickUp API utility functions

### Git & Version Control
- **git-wrapper.js**: Git operations wrapper
- **branch-manager.js**: Branch management utilities
- **commit-message-generator.js**: Generate conventional commits

### Backup & Safety
- **backup-manager.js**: Backup and restore operations
- **rollback-handler.js**: Rollback failed operations
- **transaction-manager.js**: Transactional file operations

## Usage Examples

### Validate Story Structure
```javascript
const { validateStory } = require('./aios-validator.js');
const result = await validateStory('docs/stories/2.3-story.yaml');
```

### Resolve Available Tools
```javascript
const { resolveTools } = require('./tool-resolver.js');
const tools = await resolveTools();
console.log('Available MCP servers:', tools.mcp);
```

### Generate Test Suite
```javascript
const { generateTests } = require('./test-generator.js');
await generateTests({
  component: 'MyComponent',
  framework: 'jest'
});
```

## Full Utility List

Run `ls -la .aios-core/utils/` to see all 70+ utilities.

Categories:
- **Analysis**: dependency-analyzer, coverage-analyzer, framework-analyzer
- **Generation**: component-generator, test-generator, migration-generator
- **Validation**: aios-validator, yaml-validator, template-validator
- **Management**: story-manager, backup-manager, branch-manager
- **Testing**: test-generator, sandbox-tester, test-quality-assessment
- **Documentation**: documentation-synchronizer
- **Performance**: performance-analyzer, performance-optimizer
- **Refactoring**: refactoring-suggester, code-quality-improver
- **And many more...**
```

---

### FASE 2: Documentação Contextual (P1) - 3h
**Objetivo**: Adicionar contexto importante para hybrid-ops e minds

#### Task 2.1: Criar README para pedro_valerio mind
**Tempo**: 45min
**Arquivo**: `outputs/minds/pedro_valerio/README.md` (novo)

**Conteúdo**: Explicar estrutura, propósito, como os agentes hybrid-ops usam

#### Task 2.2: Criar/Atualizar README hybrid-ops
**Tempo**: 1h
**Arquivo**: `expansion-packs/hybrid-ops/README.md`

**Conteúdo**:
- Lista de agentes PV
- Quando usar vs agentes core
- Conexão com mind do Pedro Valério
- Exemplos de uso

#### Task 2.3: Documentar MCP integrations
**Tempo**: 1h15min
**Arquivo**: `.aios-core/tools/mcp/README.md` (novo)

**Conteúdo**: Guia detalhado de cada MCP, capabilities, exemplos

---

### FASE 3: Validação e Testes (P1) - 1h
**Objetivo**: Garantir que mudanças funcionam

#### Task 3.1: Testar tool-resolver
**Tempo**: 20min
**Ação**: Executar tool-resolver.js e verificar se encontra todas tools

#### Task 3.2: Validar core-config
**Tempo**: 15min
**Ação**: Testar que dev agent carrega arquivos corretos

#### Task 3.3: Testar discovery com agente
**Tempo**: 25min
**Ação**: Ativar agente dev e perguntar sobre ferramentas disponíveis

---

## 📋 Checklist de Execução

### Fase 1 (P0 - Fazer AGORA)
- [ ] Task 1.1: Atualizar .claude/CLAUDE.md estrutura
- [ ] Task 1.2: Atualizar core-config.yaml
- [ ] Task 1.3: Criar .aios-core/tools/README.md
- [ ] Task 1.4: Criar .aios-core/utils/README.md
- [ ] Commit & Push: "docs: critical documentation sync [Analysis Report]"

### Fase 2 (P1 - Esta Semana)
- [ ] Task 2.1: Criar outputs/minds/pedro_valerio/README.md
- [ ] Task 2.2: Criar/Atualizar expansion-packs/hybrid-ops/README.md
- [ ] Task 2.3: Criar .aios-core/tools/mcp/README.md
- [ ] Commit & Push: "docs: add contextual documentation [Analysis Report]"

### Fase 3 (P1 - Validação)
- [ ] Task 3.1: Testar tool-resolver
- [ ] Task 3.2: Validar core-config
- [ ] Task 3.3: Testar discovery com agente
- [ ] Criar relatório de validação

---

## 🎯 Métricas de Sucesso

**Após implementação, verificar**:

1. ✅ Agente dev consegue listar MCPs disponíveis quando perguntado
2. ✅ CLAUDE.md reflete estrutura atual do .aios-core
3. ✅ core-config.yaml carrega todos arquivos importantes
4. ✅ tool-resolver.js encontra todas 8 MCP integrations
5. ✅ Agentes hybrid-ops têm referência ao mind do PV
6. ✅ READMEs existem para tools/, utils/, minds/, hybrid-ops/

---

## 📦 Deliverables

### Arquivos Modificados:
1. `.claude/CLAUDE.md` (atualizado)
2. `.aios-core/core-config.yaml` (atualizado)

### Arquivos Criados:
3. `.aios-core/tools/README.md` (novo)
4. `.aios-core/utils/README.md` (novo)
5. `outputs/minds/pedro_valerio/README.md` (novo)
6. `expansion-packs/hybrid-ops/README.md` (novo ou atualizado)
7. `.aios-core/tools/mcp/README.md` (novo)

### Relatórios:
8. `docs/analysis/DOCUMENTATION-GAPS-ANALYSIS.md` (já criado)
9. `docs/analysis/DOCUMENTATION-UPDATE-ACTION-PLAN.md` (este arquivo)
10. `docs/analysis/DOCUMENTATION-UPDATE-VALIDATION-REPORT.md` (após Fase 3)

---

## 🚀 Próximos Passos

**Opção A**: Executar Fase 1 imediatamente (2h de trabalho focalizado)
**Opção B**: Criar Story formal no backlog para tracking completo
**Opção C**: Executar parcialmente (apenas CLAUDE.md e core-config) AGORA

**Recomendação**: **Opção A** - Executar Fase 1 AGORA, Fase 2-3 como Story

---

## 📞 Necessita Aprovação

- [ ] Usuário aprova mudanças em CLAUDE.md?
- [ ] Usuário aprova mudanças em core-config.yaml?
- [ ] Usuário quer criar Story ou fazer diretamente?

---

*Plano criado em 2025-10-22 baseado em DOCUMENTATION-GAPS-ANALYSIS.md*
