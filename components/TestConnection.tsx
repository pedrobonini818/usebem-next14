// components/TestConnection.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabaseQueries } from '../lib/supabase'

export default function TestConnection() {
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabaseQueries.getAllPrograms()
        if (error) throw error
        setInstitutions(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) return <div>🔄 Testando conexão...</div>
  if (error) return <div>❌ Erro: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">✅ Conexão Supabase OK!</h2>
      <p>Encontrados {institutions.length} programas:</p>
      <ul className="mt-2">
        {institutions.slice(0, 5).map((program) => (
          <li key={program.id} className="text-sm">
            • {program.name} ({program.institution.name})
          </li>
        ))}
      </ul>
    </div>
  )
}
