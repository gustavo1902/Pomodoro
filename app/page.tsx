import PomodoroTimer from "@/components/pomodoro-timer"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <PomodoroTimer />
    </main>
  )
}

