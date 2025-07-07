#!/bin/bash

echo "🚀 Configurando banco de dados do Fisio Time..."

# Verificar se o Prisma está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/NPX não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Gerar o Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# Executar migrações
echo "🔄 Executando migrações..."
npx prisma migrate dev --name init

# Verificar se deu certo
echo "✅ Verificando setup..."
npx prisma db seed

echo "🎉 Banco de dados configurado com sucesso!"
echo "🌐 Acesse: http://localhost:3000/api/setup para verificar"
