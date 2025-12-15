# Sprint Change Proposal - Epic 5/6 Realignment

**Data:** 2025-10-10
**Autor:** Sarah (Product Owner)
**Status:** ✅ APROVADO E IMPLEMENTADO

---

## 📋 EXECUTIVE SUMMARY

Realinhamento do PRD para refletir realidade implementada e remover o LangGraph do roadmap. Epic 5 (Tools System) foi implementado com sucesso (não estava no PRD original) e será seguido por Epic 6 (Supabase Migration).

### Mudanças Principais

1. ✅ **PRD atualizado** removendo LangGraph (Epics/FRs 5-7)
2. ✅ **Epic 5 adicionado ao PRD** refletindo Tools System implementado
3. ✅ **Epic 6 renumerado** de "Epic 5 LangGraph" para "Epic 6 Supabase"
4. ✅ **Requisitos atualizados** com status de conclusão (FR1-5 completos)

---

## 🔍 O QUE ERA O SUPABASE NO PRD ORIGINAL

### Contexto Arquitetural

**Fase 1 (MVP) - LlamaIndex:**
```
Memory Layer:
├── LlamaIndex com SimpleVectorStore
├── Persistência: Arquivos locais (.aios/memory/*.json)
├── Uso: Prototipagem rápida
└── Limitação: Não é production-ready
```

**Fase 2 (Pós-MVP) - Supabase:**
```
Memory Layer Production:
├── PostgreSQL com pgvector extension
├── Persistência: Database durável em cloud
├── Segurança: RLS (Row Level Security)
├── Features: Backup automático, observabilidade
└── Performance: Similarity search otimizado
```

### Benefícios da Migração Supabase

#### 1. Persistência Durável
- **Problema Atual:** Arquivos locais podem ser perdidos/corrompidos
- **Solução:** PostgreSQL managed com backup automático
- **Impacto:** Zero perda de dados, alta disponibilidade

#### 2. Multi-Tenant com RLS
- **Problema Atual:** Sem isolamento de dados entre usuários/workspaces
- **Solução:** Row Level Security do Postgres
```sql
-- Exemplo RLS Policy
CREATE POLICY "users_own_memories"
ON memories
FOR ALL
USING (auth.uid() = user_id);
```
- **Impacto:** Segurança multi-tenant nativa

#### 3. Performance com pgvector
- **Problema Atual:** SimpleVectorStore não é otimizado para produção
- **Solução:** pgvector com índices HNSW
- **Impacto:** Similarity search 10-100x mais rápido

#### 4. Observabilidade
- **Problema Atual:** Difícil monitorar queries e performance
- **Solução:** Supabase dashboard + logs estruturados
- **Impacto:** Debug mais rápido, métricas em tempo real

#### 5. Checkpointing Durável
- **Problema Atual:** Agentes perdem estado se crasharem
- **Solução:** Postgres como checkpoint store
- **Impacto:** Recuperação automática de falhas

### Stack Técnico Supabase

```
Supabase Stack:
├── PostgreSQL 15+ (database)
├── pgvector extension (vector search)
├── PostgREST (auto-generated REST API)
├── GoTrue (authentication & JWT)
├── Realtime (WebSocket subscriptions)
└── Storage (file uploads, se necessário)
```

---

## 📊 ESTRUTURA ATUALIZADA DO PRD

### Requisitos Funcionais (Antes → Depois)

**ANTES:**
```
FR1: Rebranding
FR2: IDE Setup
FR3: Memory Layer (LlamaIndex)
FR4: Meta-Agent (MVP MARCO)
FR5: LangGraph Expert Agent        ← REMOVIDO
FR6: Human-in-the-Loop (ClickUp)   ← REMOVIDO
FR7: n8n → LangGraph converter     ← REMOVIDO
FR8: Supabase Migration
```

**DEPOIS:**
```
FR1: Rebranding ✅ Completo
FR2: IDE Setup ✅ Completo
FR3: Memory Layer (LlamaIndex) ✅ Completo
FR4: Meta-Agent (MVP MARCO) ✅ Completo
FR5: Tools System ✅ Completo (novo)
FR6: Supabase Migration 📋 Próximo
```

### Estrutura de Epics (Antes → Depois)

**ANTES:**
```
Epic 1: Rebranding
Epic 2: IDE Setup
Epic 3: Memory (LlamaIndex)
Epic 4: Meta-Agent (MVP) ← Marco MVP
Epic 5: LangGraph Expert          ← REMOVIDO
Epic 6: Supabase Migration
```

**DEPOIS:**
```
Epic 1: Rebranding ✅
Epic 2: IDE Setup ✅
Epic 3: Memory (LlamaIndex) ✅
Epic 4: Meta-Agent (MVP) ✅ ← Marco MVP
Epic 5: Tools System ✅ (Stories 5.1-5.2, 5.3 deferred)
Epic 6: Supabase Migration 📋 ← PRÓXIMO
```

---

## ✅ ARQUIVOS ATUALIZADOS

### 1. docs/prd/epics-and-stories-structure.md
**Mudanças:**
- ✅ Removido "Epic 5: LangGraph Expert"
- ✅ Adicionado "Epic 5: Tools System" com status completo
- ✅ Renomeado "Epic 6: Supabase" (era Epic 6 antes)
- ✅ Adicionado status indicators (✅ Completo, 📋 Planejado)

### 2. docs/prd/requirements.md
**Mudanças:**
- ✅ Removido FR5, FR6, FR7 (LangGraph features)
- ✅ Adicionado FR5 (Tools System) com status ✅ Completo
- ✅ Renumerado FR8 → FR6 (Supabase Migration)
- ✅ Atualizado NFRs removendo menções ao LangGraph
- ✅ NFRs agora focam em Supabase (RLS, performance, observabilidade)

### 3. docs/prd/technical-constraints-and-integration.md
**Mudanças:**
- ✅ Fase 2 atualizada: removido LangGraph, Deno, Hetzner
- ✅ Fase 2 agora foca em: Supabase migration, autodesenvolvimento
- ✅ Adicionado status FR5 (Tools) como completo

### 4. docs/prd/mvp-launch-plan.md
**Mudanças:**
- ✅ MVP marcado como COMPLETO (Epics 1-4)
- ✅ Pós-MVP atualizado com FR5 (Tools) completo
- ✅ FR6 (Supabase) como próximo item
- ✅ Removido planos de FR7, FR8 antigos

### 5. docs/epics/epic-4-overview.md
**Mudanças:**
- ✅ "Next Steps" atualizado mostrando Epic 5 completo
- ✅ Epic 6 (Supabase) como próximo
- ✅ Detalhes do que Epic 6 entregará

### 6. docs/epics/epic-5-tools-system.md
**Mudanças:**
- ✅ Seção "EPIC STATUS: COMPLETE" adicionada no topo
- ✅ Stories 5.1-5.2 marcadas como DONE
- ✅ Story 5.3 marcada como DEFERRED to v2
- ✅ Indicação de Epic 6 (Supabase) como próximo

---

## 📈 ROADMAP ATUALIZADO

### Completo (MVP + Pós-MVP Fase 1)
1. ✅ **Epic 1:** Rebranding (AIOS-Method → AIOS-FULLSTACK)
2. ✅ **Epic 2:** IDE Setup (Windsurf, Cursor, Claude Code)
3. ✅ **Epic 3:** Memory Layer com LlamaIndex (persistência local)
4. ✅ **Epic 4:** Meta-Agent (aios-developer) - **Marco MVP**
5. ✅ **Epic 5:** Tools System (Schema v2.0, 12 tools, validation)

### Próximo (Pós-MVP Fase 2)
6. 📋 **Epic 6:** Supabase Migration
   - Stories previstas (estimativa):
     - 6.1: Supabase Infrastructure Setup
     - 6.2: SupabaseVectorStore Implementation
     - 6.3: Migration Path & Data Sync
     - 6.4: RLS, Security & Performance

### Futuro (v2+)
- Story 5.3: Tool Expander (deferred)
- Outros enhancements baseados em feedback

---

## 🎯 EPIC 6 (SUPABASE) - PREVIEW

### Objetivo
Migrar a camada de memória de LlamaIndex (arquivos locais) para Supabase (PostgreSQL + pgvector) para produção.

### Scope Preliminar

#### Story 6.1: Supabase Infrastructure Setup
**AC:**
- [ ] Projeto Supabase criado e configurado
- [ ] pgvector extension instalada
- [ ] Schema de memória definido (tables: memories, embeddings, sessions)
- [ ] RLS policies básicas implementadas
- [ ] CI/CD para migrations (Supabase CLI)

#### Story 6.2: SupabaseVectorStore Implementation
**AC:**
- [ ] Classe `SupabaseVectorStore` implementada
- [ ] Interface compatível com LlamaIndex VectorStore
- [ ] CRUD operations (add, delete, query)
- [ ] Similarity search com pgvector
- [ ] Testes unitários e de integração

#### Story 6.3: Migration Path & Data Sync
**AC:**
- [ ] Script de migração LlamaIndex → Supabase
- [ ] Validation de integridade dos dados
- [ ] Rollback mechanism
- [ ] Gradual cutover strategy (feature flag)
- [ ] Backward compatibility durante transição

#### Story 6.4: RLS, Security & Performance
**AC:**
- [ ] RLS policies completas (multi-tenant)
- [ ] JWT authentication integrado
- [ ] Índices HNSW otimizados
- [ ] Load testing (P99 < 5s para similarity search)
- [ ] Observabilidade (logs, metrics, dashboard)

### Technical Requirements

**Database Schema (Preview):**
```sql
-- Memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  workspace_id UUID,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings table
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES memories ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX embeddings_vector_idx
ON embeddings
USING hnsw (embedding vector_cosine_ops);

-- RLS Policies
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own memories"
ON memories
FOR ALL
USING (auth.uid() = user_id);
```

**Performance Targets:**
- Similarity search: P99 < 5s
- Write operations: P99 < 500ms
- Read operations: P99 < 100ms
- Throughput: Suportar uso em produção sem degradação

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Você - PO)
- ✅ PRD atualizado e sincronizado
- ✅ Roadmap clarificado
- ✅ Epic 5 oficialmente completo
- 📝 Próximo: Revisar este documento e aprovar formalmente

### Curto Prazo (1-2 semanas)
- 📋 @sm: Criar Epic 6 (Supabase) com stories detalhadas
- 📋 @architect: Revisar schema de Supabase e migration path
- 📋 @dev: Começar Story 6.1 (Supabase Infrastructure Setup)

### Médio Prazo (1-2 meses)
- 📋 Implementar Stories 6.1-6.4
- 📋 Migração gradual de LlamaIndex → Supabase
- 📋 Validação em produção com usuários reais
- 📋 Performance testing e otimizações

---

## ✅ DECISÕES TOMADAS

1. **LangGraph REMOVIDO do roadmap**
   - Razão: Não é prioridade para o produto atual
   - Impacto: Simplifica roadmap, foca em value delivery

2. **Epic 5 (Tools System) ADICIONADO ao PRD**
   - Razão: Foi implementado com sucesso e entrega valor significativo
   - Impacto: PRD agora reflete realidade implementada

3. **Story 5.3 (Tool Expander) DEFERRED to v2**
   - Razão: Epic 5 já entrega valor sem ela (99.3% quality)
   - Impacto: Permite foco em Epic 6 (Supabase) que é mais crítico

4. **Epic 6 (Supabase) é PRÓXIMO**
   - Razão: Memory Layer precisa ser production-ready
   - Impacto: Move to arquitetura durável e escalável

---

## 📝 LESSONS LEARNED

### O que funcionou bem
- ✅ Tools System foi implementado com excelência (99% quality)
- ✅ Schema v2.0 resolve complexidade real de tools
- ✅ Autodesenvolvimento com aios-developer está funcional

### O que melhorar
- ⚠️ PRD divergiu da realidade (Tools não estava documentado)
- ⚠️ LangGraph foi planejado mas não é prioridade real
- ⚠️ Precisa melhor alinhamento PRD ↔ Implementation

### Ações para próximos epics
1. 📋 Manter PRD atualizado durante desenvolvimento (não só antes)
2. 📋 Re-validar prioridades a cada epic (não assumir roadmap fixo)
3. 📋 Documentar desvios do PRD em tempo real

---

## 🎯 SUCCESS METRICS

### Epic 5 (Tools System) - Alcançado
- ✅ 12 tools documentadas (target: 12+)
- ✅ 5 agentes refatorados (target: 5+)
- ✅ 99.3% test pass rate (target: 95%+)
- ✅ Quality score 99/100 (target: 85+)
- ✅ <50ms validation overhead (target: <50ms)

### Epic 6 (Supabase) - Targets
- 📋 100% data integrity durante migration
- 📋 P99 < 5s para similarity search
- 📋 RLS 100% funcional (zero data leaks)
- 📋 Zero downtime durante cutover
- 📋 Rollback testado e funcional

---

**Documento gerado em:** 2025-10-10
**Status:** ✅ Aprovado e implementado
**Próxima revisão:** Após Epic 6 planning completo
