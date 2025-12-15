# Instruções de Teste - AIOS-FULLSTACK v4.31.1 (macOS)

## 📋 Story 2.3: NPX Installation Context Detection

**Objetivo do Teste**: Validar que a detecção de diretório temporário NPX funciona corretamente no macOS e fornece mensagem de ajuda clara quando executado de forma incorreta.

**Versão**: 4.31.1
**Plataforma**: macOS (Todas as versões)
**Tempo Estimado**: 15-20 minutos por testador
**Testadores Necessários**: 2 usuários macOS independentes

---

## ⚠️ Pré-requisitos

Antes de começar, verifique:

- ✅ macOS (qualquer versão)
- ✅ Node.js v20+ instalado (`node --version`)
- ✅ NPM instalado (`npm --version`)
- ✅ Conexão com internet
- ✅ Terminal/iTerm/outro shell
- ✅ Permissões para criar diretórios de teste

---

## 🧪 Cenário de Teste 1: Execução Incorreta (NPX Temp Directory)

**Objetivo**: Verificar que o AIOS detecta execução do diretório home e mostra mensagem de erro clara.

### Passo 1.1: Executar do Diretório Home

```bash
# Ir para o diretório home
cd ~

# Tentar instalar via NPX
npx aios-fullstack install
```

### ✅ Resultado Esperado:

Você DEVE ver uma mensagem de erro formatada assim:

```
⚠️  NPX Temporary Directory Detected

NPX executes in a temporary directory, which prevents
AIOS from detecting your IDE correctly.

Solution:
  cd /path/to/your/project
  npx aios-fullstack install

See: https://aios-fullstack.dev/docs/npx-install
```

### 📝 Checklist de Validação:

- [ ] A mensagem de erro apareceu?
- [ ] O texto está claro e compreensível?
- [ ] O símbolo ⚠️ está visível?
- [ ] A "Solution" está destacada (cor diferente)?
- [ ] O link de documentação está presente?
- [ ] O programa saiu (não continuou com a instalação)?

### 🎯 Critérios de Aceitação:

**APROVADO**: Se a mensagem apareceu clara, formatada e o programa não continuou
**REPROVADO**: Se a instalação continuou OU a mensagem não apareceu OU está confusa

### 💬 Feedback:

**Por favor, responda**:
1. A mensagem foi clara e fácil de entender? (Sim/Não)
2. Você entendeu o que fazer para corrigir? (Sim/Não)
3. Sugestões de melhoria na mensagem? (Texto livre)

---

## 🧪 Cenário de Teste 2: Execução Correta (Diretório de Projeto)

**Objetivo**: Verificar que a instalação funciona normalmente quando executada do diretório correto.

### Passo 2.1: Criar Projeto de Teste

```bash
# Criar diretório de teste
mkdir -p ~/test-aios-v4.31.1
cd ~/test-aios-v4.31.1

# Inicializar projeto básico (opcional, mas recomendado)
npm init -y
```

### Passo 2.2: Executar Instalação Normal

```bash
# Agora do diretório do projeto
npx aios-fullstack install
```

### ✅ Resultado Esperado:

- ❌ A mensagem de erro do NPX **NÃO DEVE** aparecer
- ✅ O instalador interativo normal **DEVE** iniciar
- ✅ Deve perguntar sobre configurações do projeto
- ✅ Deve detectar ou perguntar sobre IDE

### 📝 Checklist de Validação:

- [ ] A mensagem de erro NPX NÃO apareceu?
- [ ] O instalador interativo iniciou normalmente?
- [ ] Foi possível prosseguir com a instalação?
- [ ] O AIOS não confundiu o diretório do projeto com temp?

### 🎯 Critérios de Aceitação:

**APROVADO**: Se a instalação prosseguiu normalmente sem erro de NPX
**REPROVADO**: Se a mensagem de erro apareceu OU a instalação falhou

### 💬 Feedback:

**Por favor, responda**:
1. A instalação funcionou normalmente? (Sim/Não)
2. Houve algum problema ou comportamento estranho? (Sim/Não - descreva)

---

## 🧪 Cenário de Teste 3: Execução de Diretório Arbitrário

**Objetivo**: Verificar detecção quando executado de outros diretórios (não home, não projeto).

### Passo 3.1: Executar de /tmp

```bash
# Ir para diretório temporário
cd /tmp

# Tentar instalar
npx aios-fullstack install
```

### ✅ Resultado Esperado:

A mensagem de erro NPX **PODE OU NÃO** aparecer dependendo do caminho. Anote o comportamento.

### 📝 Checklist de Observação:

- [ ] A mensagem de erro apareceu?
- [ ] Se apareceu: Foi clara e útil?
- [ ] Se NÃO apareceu: A instalação continuou normalmente ou falhou de outra forma?

### 💬 Feedback:

**Por favor, descreva o que aconteceu neste cenário.**

---

## 📊 Resumo dos Testes

### Template de Relatório

```markdown
## Relatório de Teste - AIOS v4.31.1 (macOS)

**Testador**: [Seu Nome]
**Data**: [Data do Teste]
**Versão macOS**: [ex: Ventura 13.4]
**Node.js**: [versão]
**Terminal**: [Terminal.app / iTerm / outro]

### Cenário 1 (Execução Incorreta):
- Status: ✅ APROVADO / ❌ REPROVADO
- Mensagem apareceu: Sim / Não
- Mensagem clara: Sim / Não
- Sugestões: [suas sugestões]

### Cenário 2 (Execução Correta):
- Status: ✅ APROVADO / ❌ REPROVADO
- Instalação funcionou: Sim / Não
- Problemas: [descrever se houver]

### Cenário 3 (Diretório Arbitrário):
- Comportamento observado: [descrever]

### Avaliação Geral:
- Qualidade da solução: ⭐⭐⭐⭐⭐ (1-5 estrelas)
- Recomendaria para produção: Sim / Não
- Comentários adicionais: [texto livre]
```

---

## 📤 Como Enviar Resultados

**Opção 1 - Issue no GitHub**:
1. Abra issue em: https://github.com/Pedrovaleriolopez/aios-fullstack/issues
2. Título: `[Test] Story 2.3 - macOS Testing Results - [Seu Nome]`
3. Cole o relatório preenchido

**Opção 2 - Email/Slack**:
- Envie o relatório preenchido para o coordenador do projeto

---

## ❓ Perguntas Frequentes

**Q: O que fazer se o NPX demorar muito para baixar?**
A: É normal na primeira execução. O NPX precisa baixar o pacote do npm.

**Q: Posso testar múltiplas vezes?**
A: Sim! Recomendamos testar 2-3 vezes cada cenário para garantir consistência.

**Q: E se eu encontrar um bug diferente?**
A: Por favor, reporte! Inclua prints e passos detalhados para reproduzir.

**Q: Preciso limpar algo depois dos testes?**
A: Sim, você pode remover o diretório de teste:
```bash
rm -rf ~/test-aios-v4.31.1
```

---

## 🎯 Critérios de Sucesso do Story

Para considerar o Story 2.3 completo, precisamos:

- ✅ **2 testadores macOS** validaram independentemente
- ✅ **Cenário 1** (erro) aprovado por ambos
- ✅ **Cenário 2** (normal) aprovado por ambos
- ✅ **Feedback** coletado e analisado
- ✅ **Ajustes** implementados se necessário

---

## 📞 Suporte

- **Documentação Completa**: `docs/npx-install.md`
- **GitHub Issues**: https://github.com/Pedrovaleriolopez/aios-fullstack/issues
- **Story Reference**: `docs/stories/2.3-npx-macos-help-improvement.yaml`

---

**Obrigado por ajudar a melhorar o AIOS-FULLSTACK! 🚀**

*Instruções de teste geradas para Story 2.3 - v4.31.1*
