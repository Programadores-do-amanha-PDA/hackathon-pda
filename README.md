# Guia de Início Rápido

Este é um projeto [Next.js](https://nextjs.org) inicializado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Pré-requisitos

- Node.js (18.x ou superior)
- Next.js (15.3.3)
- React.js (19.0.0)
- Uso obrigatório de [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) em todos os commits

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/SEU_USUARIO/hackathon-base.git
   cd hackathon-base
   ```

2. Instale as dependências:

   ```bash
   yarn
   ```

## Execução

Inicie o servidor de desenvolvimento:

```bash
yarn dev
```

A aplicação estará acessível em [http://localhost:3000](http://localhost:3000).

## Credenciais de Acesso

Para configurar o backend com Supabase:

1. Crie um projeto em [Supabase](https://supabase.com/)
2. Obtenha as credenciais na seção "Settings" > "API"
3. Configure o arquivo `.env.local` na raiz do projeto:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=seu-url-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

4. Reinicie o servidor após as alterações

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
