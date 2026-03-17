import { useState } from 'react'
import { useSubmitClaim } from '@/hooks/useSubmitClaim'

export function InjectedTestRunner() {
  const { mutateAsync } = useSubmitClaim()
  const [log, setLog] = useState<string>('')

  const runTest = async () => {
    try {
      setLog('Running test...')
      const res = await mutateAsync({
        policyNumber: 'POL-AUTO-1234',
        type: 'auto',
        incidentDate: '2024-03-12T10:00:00Z',
        incidentLocation: 'Test Location',
        description: 'This is a test description longer than 30 characters.',
        claimedAmount: 100,
        injuryInvolved: false
      })
      setLog('Success! ' + JSON.stringify(res))
    } catch (err: any) {
      setLog('Error: ' + err?.message + '\n' + JSON.stringify(err))
    }
  }

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-black text-white rounded-lg z-50 max-w-lg shadow-2xl">
      <button onClick={runTest} className="px-4 py-2 bg-blue-600 rounded">Run Claim Test</button>
      <pre className="mt-2 text-xs overflow-auto max-h-48">{log}</pre>
    </div>
  )
}
