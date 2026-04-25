---
description: 'Instruções de workspace para o Copilot: permitir apenas commits em pt-BR com Conventional Commits, resumo objetivo das alterações e manutenção do README quando necessário.'
applyTo: '**'
---

# Instruções do GitHub Copilot

## Commits

- É proibido gerar, sugerir, aceitar ou executar mensagens de commit em inglês ou em qualquer idioma diferente de português do Brasil.
- Sempre que o usuário pedir para criar, sugerir, revisar ou executar um commit, produza a mensagem somente em `pt-BR`.
- Se o conteúdo de origem estiver em inglês, traduza e normalize para português do Brasil antes de propor a mensagem final.
- Se houver qualquer ambiguidade sobre o idioma da mensagem, interrompa e corrija para `pt-BR` antes de seguir.
- Sempre que for solicitado, confirme a ação antes de criar commit; escreva a mensagem somente em português do Brasil.
- Use o padrão Conventional Commits com tipos populares como `fix`, `feat`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf` e `style`, sempre seguidos de descrição em português do Brasil.
- A estrutura preferencial é `tipo: descrição objetiva em português do Brasil`.
- A mensagem de commit deve resumir com clareza e objetividade o que foi alterado no código.
- Prefira mensagens curtas, diretas e orientadas ao resultado entregue.
- Quando apropriado, use um título curto e uma descrição complementar objetiva explicando o impacto da alteração no corpo do commit.
- Evite mensagens vagas como "ajustes", "mudanças" ou descrições genéricas sem contexto.
- O título e o corpo do commit, quando existirem, devem estar integralmente em português do Brasil.

Exemplos de boas mensagens:

- `fix: corrigir validação do formulário de login`
- `docs: atualizar guia de execução com Docker Compose`
- `chore: ajustar configuração do nginx para fallback da SPA`
- `refactor: simplificar carregamento da tela1 com tratamento de erro`

## Resumo das alterações

- Ao finalizar uma tarefa, apresente um resumo claro e objetivo do que foi feito nos códigos.
- Destaque os arquivos principais alterados e o efeito prático da mudança.
- Evite textos longos, repetitivos ou genéricos.

## Atualização do README

- Sempre que uma alteração impactar instalação, execução, build, deploy, configuração, variáveis de ambiente, Docker, scripts, fluxo de desenvolvimento ou uso da aplicação, atualize o `./README.md` no mesmo trabalho.
- Sempre atualize o `./README.md` quando isso for necessário para manter a documentação alinhada com o comportamento real do projeto.
- O `./README.md` deve priorizar orientações úteis para devs, com passo a passo direto e fácil de seguir.
- Sempre que possível, inclua seções com:
    - objetivo da funcionalidade ou do ajuste
    - pre-requisitos
    - comandos necessários
    - passo a passo de execução
    - exemplos de uso
    - observações importantes e problemas comuns
- Se uma mudança não exigir atualização do `./README.md`, informe isso explicitamente na resposta final.

## Estilo esperado para documentação

- Escreva em português do Brasil.
- Use linguagem técnica simples, clara e objetiva.
- Organize o conteúdo em seções curtas e escaneáveis.
- Prefira listas e exemplos práticos quando ajudarem o entendimento.
- Mantenha a documentação alinhada com a estrutura real do projeto e com os comandos realmente usados no repositório.
