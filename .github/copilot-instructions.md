# Copilot Instructions — aios-core

## Project Overview
aios-core é um framework CLI de orquestração de IA (Synkra AIOX) para desenvolvimento full stack em Node.js/TypeScript.

## Stack
- **Node.js + TypeScript**
- Framework: CLI com workspaces (monorepo parcial via `packages/*`)
- Testing: verificar `package.json` (jest/vitest)

## Conventions
- TypeScript estrito (`strict: true`)
- Sem `any` implícito; preferir `unknown` quando incerto
- Erros tratados explicitamente em async (try/catch, sem promises non-awaited)
- Logging estruturado (não usar `console.log` cru)
- Variáveis sensíveis via env (`process.env`), nunca hardcoded
- Validação de input em boundaries (zod, joi, class-validator)

## Folder Structure (típica)
- `src/` — código
- `packages/` — sub-pacotes do workspace
- `bin/` — entry points CLI
- `test/` ou `__tests__/` — testes
- `dist/` — build output (não versionado)

## Development
- `pnpm install` ou `npm install`
- `pnpm dev` / `pnpm start:dev`
- `pnpm build`
- `pnpm test`
- `pnpm lint`

## Critical Files
- `package.json` — scripts e deps
- `tsconfig.json` — config TS
- `bin/aiox.js` — entry point principal
- `src/index.ts` ou `src/main.ts` — entry
