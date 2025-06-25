import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { cards, benefits } = await req.json()
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'Você é um assistente financeiro inteligente. Gere insights personalizados com base nos dados dos cartões e benefícios do usuário.'
      },
      {
        role: 'user',
        content: `Cartões: ${JSON.stringify(cards)}
Benefícios: ${JSON.stringify(benefits)}`
      }
    ]

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4',
      temperature: 0.7
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({ insights: response })
  } catch (error) {
    console.error('Erro na geração de insights', error)
    return NextResponse.json({ error: 'Erro ao gerar insights' }, { status: 500 })
  }
}
