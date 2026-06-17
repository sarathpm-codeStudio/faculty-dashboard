// Plays a short two-tone chime for new notifications using the Web Audio API,
// so we don't need to ship an audio asset. Safe to call repeatedly; failures
// (e.g. autoplay blocked before any user interaction) are swallowed silently.
let audioCtx: AudioContext | null = null

const SOUND_PREF_KEY = 'notif-sound-enabled'

// Sound is on by default; only an explicit "false" turns it off.
export const isNotificationSoundEnabled = (): boolean =>
    localStorage.getItem(SOUND_PREF_KEY) !== 'false'

export const setNotificationSoundEnabled = (enabled: boolean) => {
    localStorage.setItem(SOUND_PREF_KEY, String(enabled))
}

const getCtx = (): AudioContext | null => {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return null
    if (!audioCtx) audioCtx = new Ctx()
    return audioCtx
}

// Browsers start an AudioContext in a "suspended" state and only allow resuming
// it from inside a real user gesture. We attach one-shot listeners so the very
// first click/keypress unlocks audio; after that the chime can play any time.
export const unlockNotificationSound = () => {
    const resume = () => {
        const ctx = getCtx()
        if (ctx && ctx.state === 'suspended') ctx.resume()
    }
    const events: (keyof DocumentEventMap)[] = ['click', 'keydown', 'touchstart']
    events.forEach(evt => document.addEventListener(evt, resume, { once: true }))
    return () => events.forEach(evt => document.removeEventListener(evt, resume))
}

export const playNotificationSound = () => {
    try {
        if (!isNotificationSoundEnabled()) return
        const ctx = getCtx()
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume()

        const now = ctx.currentTime
        // Two quick rising notes for a pleasant "ding-dong".
        const notes = [
            { freq: 880, start: 0, dur: 0.14 },
            { freq: 1320, start: 0.12, dur: 0.18 },
        ]

        notes.forEach(({ freq, start, dur }) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = freq
            osc.connect(gain)
            gain.connect(ctx.destination)

            const t0 = now + start
            gain.gain.setValueAtTime(0, t0)
            gain.gain.linearRampToValueAtTime(0.25, t0 + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

            osc.start(t0)
            osc.stop(t0 + dur)
        })
    } catch {
        // Audio is best-effort; ignore any failure.
    }
}
