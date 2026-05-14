"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { QrCode, Copy, Download, Link, Check, Scissors, Globe } from "@phosphor-icons/react"
import QRCode from "react-qr-code"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

const UNIDADES = [
  { slug:"centro",        nome:"BarberPro Centro",       cor:"from-orange-500 to-rose-600"  },
  { slug:"pinheiros",     nome:"BarberPro Pinheiros",    cor:"from-blue-500 to-indigo-600"  },
  { slug:"vila-madalena", nome:"BarberPro Vila Madalena", cor:"from-violet-500 to-purple-700"},
]

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://barberpro.app"

export default function QRCodePage() {
  const [slug, setSlug] = useState(UNIDADES[0].slug)
  const [copiado, setCopiado] = useState(false)
  const { toast } = useToast()

  const unidade = UNIDADES.find(u=>u.slug===slug) ?? UNIDADES[0]
  const url = `${APP_URL}/agendar/${slug}`

  function copiar() {
    navigator.clipboard.writeText(url).then(()=>{
      setCopiado(true)
      toast({ type:"success", title:"Link copiado!", description:url })
      setTimeout(()=>setCopiado(false),2000)
    })
  }

  function baixarQR() {
    const svg = document.getElementById("qr-code")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData],{type:"image/svg+xml"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `qrcode-${slug}.svg`; a.click()
    URL.revokeObjectURL(url)
    toast({ type:"success", title:"QR Code baixado!" })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="QR Code" subtitle="Gere o link e QR Code para agendamentos online" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Seletor de unidade */}
          <div>
            <p className="text-sm font-semibold mb-3">Selecione a unidade</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {UNIDADES.map(u=>(
                <button key={u.slug} onClick={()=>setSlug(u.slug)}
                  className={`rounded-2xl border-2 p-3 text-sm font-medium text-left transition-all ${slug===u.slug?"border-[var(--primary)] bg-[var(--primary)]/5":"border-[var(--border)] hover:border-[var(--primary)]/50"}`}
                >
                  <div className={`h-6 w-full rounded-lg bg-gradient-to-r ${u.cor} mb-2`}/>
                  {u.nome}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <motion.div key={slug} initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}}
            className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Banner de cor da unidade */}
              <div className={`w-full rounded-2xl bg-gradient-to-r ${unidade.cor} p-4 text-white relative overflow-hidden`}>
                <div className="absolute inset-0" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='white' fill-opacity='0.07'/%3E%3C/svg%3E\")"}} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black">{unidade.nome}</p>
                    <p className="text-xs opacity-70 mt-0.5">Agendamento online disponível</p>
                  </div>
                  <div className="glass-icon flex h-10 w-10 items-center justify-center rounded-xl">
                    <Scissors weight="duotone" size={20} className="text-white"/>
                  </div>
                </div>
              </div>

              {/* QR Code central */}
              <div className="p-5 rounded-2xl bg-white shadow-xl border border-[var(--border)]">
                <QRCode
                  id="qr-code"
                  value={url}
                  size={200}
                  level="M"
                  fgColor="#09090b"
                  bgColor="#ffffff"
                />
              </div>

              {/* URL */}
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5 w-full max-w-sm">
                <Globe weight="duotone" size={15} className="text-[var(--primary)] shrink-0"/>
                <span className="text-sm text-[var(--muted-foreground)] flex-1 truncate">{url}</span>
              </div>

              {/* Ações */}
              <div className="flex gap-3 w-full max-w-sm">
                <Button variant="outline" onClick={copiar} className="flex-1 gap-2">
                  {copiado ? <><Check weight="bold" size={14}/>Copiado!</> : <><Copy weight="duotone" size={14}/>Copiar link</>}
                </Button>
                <Button onClick={baixarQR} className="flex-1 gap-2">
                  <Download weight="duotone" size={14}/>Baixar QR
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Instruções */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-semibold mb-3">Como usar</p>
            <div className="space-y-3">
              {[
                { n:"1", t:"Imprima o QR Code",     d:"Cole na recepção, no espelho ou na vitrine da barbearia" },
                { n:"2", t:"Compartilhe o link",     d:"Envie pelo WhatsApp, Instagram ou coloque na bio" },
                { n:"3", t:"Cliente acessa e agenda", d:"Wizard completo com seleção de serviço, barbeiro e horário" },
                { n:"4", t:"Pagamento opcional",      d:"Cliente pode pagar via PIX na hora ou na barbearia" },
              ].map(s=>(
                <div key={s.n} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-black text-white">{s.n}</div>
                  <div>
                    <p className="text-sm font-medium">{s.t}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
