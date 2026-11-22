import { useLayoutEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ShieldCheck, X } from 'lucide-react'

export function ShieldMark({ large = false }: { large?: boolean }) {
  return <span className={large ? 'shield-mark seal' : 'shield-mark'} aria-hidden="true"><ShieldCheck /></span>
}

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={'button ' + className} />
}

export function Modal({ title, onClose, children, wide = false, eyebrow, className = '' }: {
  title: string; onClose: () => void; children: ReactNode; wide?: boolean; eyebrow?: string; className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    if (!wide) dialog?.focus()
    return () => dialog?.close()
  }, [])
  return (
    <dialog ref={ref} tabIndex={-1} className={`modal standard-modal ${wide ? 'wide' : ''} ${className}`} aria-label={title}
      onCancel={event => { event.preventDefault(); onClose() }}>
      {!wide && <header className="modal-heading">
        <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>
        <button className="close" type="button" onClick={onClose} aria-label="Close"><X size={22} /></button>
      </header>}
      {children}
    </dialog>
  )
}
