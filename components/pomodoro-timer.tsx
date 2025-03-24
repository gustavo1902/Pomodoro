"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings2, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"

export default function PomodoroTimer() {
  const [workTime, setWorkTime] = useState(25)
  const [breakTime, setBreakTime] = useState(5) 
  const [timeLeft, setTimeLeft] = useState(workTime * 60) 
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)

    try {
      
      audioRef.current = new Audio('/notification.mp3')
      audioRef.current.addEventListener('error', () => {
        audioRef.current = new Audio('/notification.wav')
        audioRef.current?.load()
      })
      audioRef.current.load()
    } catch (error) {
      console.error("Erro ao inicializar áudio:", error)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    
    setTimeLeft(isBreak ? breakTime * 60 : workTime * 60)
  }, [workTime, breakTime, isBreak])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            
            if (audioRef.current) {
              audioRef.current.play()
                .catch((e) => {
                  console.error("Erro ao tocar áudio:", e)
                  // Tenta recarregar o áudio
                  audioRef.current?.load()
                })
            }

            setIsBreak(!isBreak)

            if (timerRef.current) {
              clearInterval(timerRef.current)
            }

            return !isBreak ? breakTime * 60 : workTime * 60
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, isBreak, workTime, breakTime])

  const toggleTimer = () => {
    console.log("Timer toggled, current state:", !isRunning)
    setIsRunning((prevState) => !prevState)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(workTime * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-xl shadow-xl p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Técnica Pomodoro</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{isBreak ? "Hora de descansar" : "Hora de focar"}</p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-slate-200 dark:text-slate-800 stroke-current"
              strokeWidth="4"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
            ></circle>
            <circle
              className={`${isBreak ? "text-emerald-500" : "text-rose-500"} stroke-current`}
              strokeWidth="4"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * timeLeft) / (isBreak ? breakTime * 60 : workTime * 60)}
              transform="rotate(-90 50 50)"
            ></circle>
          </svg>
          <div className="absolute text-4xl font-bold text-slate-900 dark:text-white">{formatTime(timeLeft)}</div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" size="icon" onClick={toggleTimer} className="h-12 w-12 rounded-full">
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          <span className="sr-only">{isRunning ? "Pausar" : "Iniciar"}</span>
        </Button>
        <Button variant="outline" size="icon" onClick={resetTimer} className="h-12 w-12 rounded-full">
          <RotateCcw className="h-5 w-5" />
          <span className="sr-only">Reiniciar</span>
        </Button>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
              <Settings2 className="h-5 w-5" />
              <span className="sr-only">Configurações</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configurações</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="work-time">Tempo de trabalho</Label>
                <Select value={workTime.toString()} onValueChange={(value) => setWorkTime(Number.parseInt(value))}>
                  <SelectTrigger id="work-time">
                    <SelectValue placeholder="Selecione o tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="break-time">Tempo de descanso</Label>
                <Select value={breakTime.toString()} onValueChange={(value) => setBreakTime(Number.parseInt(value))}>
                  <SelectTrigger id="break-time">
                    <SelectValue placeholder="Selecione o tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="theme">Tema</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Claro
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Escuro
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-12 w-12 rounded-full"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" /> 
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>{isBreak ? `Descanso: ${breakTime} minutos` : `Trabalho: ${workTime} minutos`}</p>
      </div>
    </div>
  )
}

