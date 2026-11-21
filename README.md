# Crônicas de Sangue & Glória

RPG tático medieval de navegador em React + TypeScript com criação de ficha d20, combate em grid **16×10** estilo VTT, habilidades de reação, encontros de chefe e trilha sonora procedural via Web Audio API.

## Principais Recursos

- **Criação de Personagem e Ficha d20**: seleção de raça, gênero, classe, distribuição de atributos (FOR, CON, DES, INT, CAR, SAB) e retratos exclusivos.
- **5 Classes Jogáveis**:
  - **Guerreiro**: combate corpo a corpo com *Golpe Duplo*, *Carrasco* (bônus extra contra alvos ≤ 50% HP) e reação *Contra-Ataque*.
  - **Cavaleiro**: linha de frente defensiva com *Investida Galante*, postura de proteção e reação defensiva.
  - **Mago**: conjuração à distância com *Seta Arcana* (com opção de aprimoramento), *Baforada de Fogo* em cone com dano em área e *Armadura Arcana*.
  - **Sacerdote**: suporte e sustentação com cura escalando com Sabedoria e utilidade tática.
  - **Ladino**: mobilidade e dano furtivo com *Arremesso de Adaga* (Sangramento), *Furtividade* (invisibilidade com teste de percepção inimiga), *Disparada* e *Letalidade* pelas costas.
- **Encontros Táticos**:
  - **Goblin Saqueador**: combate clássico com ataques pesados, empurrão e atordoamento.
  - **Chefe — Slime Mãe (2×2)**: 400 HP, 9m de deslocamento, visão através de invisibilidade, *Pancada Ácida* com Veneno, *Impacto Gosmento* com carregamento e indicador visual de perigo, *Salto Gosmento* (salto de até 6m + dano em área híbrido físico/mágico em raio de 6m) e 25% de chance por turno de invocar **Slimes Pequenas** (com suporte a múltiplos alvos no grid).
- **Arena VTT Completa**:
  - Zoom in / zoom out no grid tático
  - Orientação visual dos tokens e mecânica de ataque pelas costas
  - Ataques de Oportunidade, sistema de Reações em tempo de combate e Log de Combate detalhado
  - Efeitos visuais em Canvas e efeitos sonoros/música gerados proceduralmente

## Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## Como Rodar Localmente

Pré-requisito: **Node.js 20+** (recomendado Node 22).

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev

# Verificar tipagem TypeScript
npm run lint

# Gerar build de produção em dist/
npm run build

# Visualizar build de produção localmente
npm run preview
```

## Deploy no GitHub Pages

O repositório já inclui o workflow automático em `.github/workflows/deploy.yml` e a configuração `base: './'` no `vite.config.ts`.

1. Envie o código para a branch `main` (ou `master`) no GitHub.
2. No repositório do GitHub, acesse **Settings → Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. A cada push na branch principal, o GitHub Actions executará a verificação de tipos, gerará o bundle em `dist/` e publicará o jogo automaticamente.
