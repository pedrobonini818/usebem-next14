// app/api/ai-insights/route.ts
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tipos para os dados do usuário
interface UserData {
  cards: Array<{
    name: string;
    points: number;
    cashback: number;
    category: string;
    expiringBenefits?: Array<{
      name: string;
      expiryDate: string;
      value: string;
    }>;
  }>;
  totalPoints: number;
  totalCashback: number;
  monthlySpending: number;
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const userData: UserData = await req.json();

    // Prompt personalizado para análise dos benefícios
    const prompt = `
Você é um especialista em cartões de crédito e programas de benefícios no Brasil. 
Analise os dados do usuário e forneça insights valiosos em português brasileiro.

Dados do usuário:
- Pontos totais: ${userData.totalPoints}
- Cashback total: R$ ${userData.totalCashback}
- Gasto mensal: R$ ${userData.monthlySpending}

Cartões:
${userData.cards.map(card => `
- ${card.name}: ${card.points} pontos, R$ ${card.cashback} cashback
`).join('')}

Categorias de gasto:
${userData.categories.map(cat => `
- ${cat.name}: R$ ${cat.amount} (${cat.percentage}%)
`).join('')}

Transações recentes:
${userData.recentTransactions.slice(0, 5).map(transaction => `
- ${transaction.description}: R$ ${transaction.amount} em ${transaction.date}
`).join('')}

Por favor, forneça:
1. Uma oportunidade de economia específica e acionável
2. Um alerta sobre benefício expirando (se houver)
3. Uma recomendação inteligente baseada no perfil de gastos
4. Uma dica de otimização dos benefícios

Mantenha as respostas concisas e práticas. Use valores reais quando possível.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo mais econômico
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em otimização de benefícios de cartões de crédito e programas de fidelidade no Brasil. Suas respostas devem ser práticas, específicas e orientadas a economia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Processar a resposta da IA para estruturar os insights
    const insights = parseAIResponse(aiResponse || '');

    return NextResponse.json({
      success: true,
      insights: insights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro na integração OpenAI:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao gerar insights da IA',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Função para processar e estruturar a resposta da IA
function parseAIResponse(response: string) {
  const lines = response.split('\n').filter(line => line.trim());
  
  return {
    opportunities: extractSection(lines, '1.'),
    alerts: extractSection(lines, '2.'),
    recommendations: extractSection(lines, '3.'),
    tips: extractSection(lines, '4.'),
    raw: response
  };
}

function extractSection(lines: string[], marker: string): string {
  const startIndex = lines.findIndex(line => line.includes(marker));
  if (startIndex === -1) return '';
  
  let content = lines[startIndex].replace(marker, '').trim();
  
  // Pegar linhas subsequentes até encontrar outro marcador ou fim
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\./.test(line.trim())) break; // Para no próximo número
    content += ' ' + line.trim();
  }
  
  return content;
}