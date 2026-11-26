import { useState } from 'react'
import { Button } from './ui'

export function NumericKeypad({ digits, onSubmitCode }: { digits: number; onSubmitCode: (code: string) => string }) {
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')

  function change(next: string) {
    setCode(next.replace(/\D/g, '').slice(0, digits))
    setFeedback('')
  }

  return <form className="house-keypad" onSubmit={event => {
    event.preventDefault()
    if (code.length === digits) setFeedback(onSubmitCode(code))
  }}>
    <label>Enter {digits}-digit code
      <input type="text" value={code} onChange={event => change(event.target.value)} inputMode="numeric" autoComplete="off" />
    </label>
    <div className="house-keypad-grid" aria-label="Numeric keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit =>
        <Button className="secondary" key={digit} onClick={() => change(code + digit)}>{digit}</Button>)}
      <Button className="secondary" onClick={() => change('')}>Clear</Button>
      <Button className="secondary" onClick={() => change(code + '0')}>0</Button>
      <Button className="secondary" onClick={() => change(code.slice(0, -1))}>Delete</Button>
    </div>
    <Button type="submit" className="primary" disabled={code.length !== digits}>Check Code</Button>
    {feedback && <p role="status">{feedback}</p>}
  </form>
}
