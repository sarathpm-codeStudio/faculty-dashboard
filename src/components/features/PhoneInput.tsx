// Reusable — used in: SignupPage (auth)
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CountryCode {
    code: string // dial code, e.g. "+91"
    iso: string // ISO country code, e.g. "IN"
    name: string // "India"
    flag: string // emoji flag
}

export const COUNTRY_CODES: CountryCode[] = [
    { code: '+91', iso: 'IN', name: 'India', flag: '🇮🇳' },
    { code: '+1', iso: 'US', name: 'United States', flag: '🇺🇸' },
    { code: '+44', iso: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+971', iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+966', iso: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+65', iso: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: '+61', iso: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: '+60', iso: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+974', iso: 'QA', name: 'Qatar', flag: '🇶🇦' },
    { code: '+968', iso: 'OM', name: 'Oman', flag: '🇴🇲' },
]

interface PhoneInputProps {
    label?: string
    /** selected dial code, e.g. "+91" */
    countryCode: string
    onCountryCodeChange: (code: string) => void
    /** local phone number, digits only */
    name?: string
    value: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    placeholder?: string
    error?: string
}

const PhoneInput = ({
    label,
    countryCode,
    onCountryCodeChange,
    name,
    value,
    onChange,
    onBlur,
    placeholder = 'Enter your number',
    error,
}: PhoneInputProps) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // keep digits only so the value combines cleanly into E.164
        const digits = e.target.value.replace(/\D/g, '')
        onChange?.({ ...e, target: { ...e.target, name: name ?? '', value: digits } })
    }

    return (
        <div className="flex flex-col gap-1.5" ref={containerRef}>
            {label && <label className="text-sm font-bold text-gray-700">{label}</label>}

            <div className="flex gap-2">
                {/* Country code selector */}
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        className={`h-full flex items-center gap-1.5 px-3 py-4 rounded-lg border bg-[#F2F4F6] text-base font-medium text-gray-900 outline-none transition-all
                            ${error ? 'border-red-400' : open ? 'border-[#000B60] ring-2 ring-[#BCC2FF]/40' : 'border-gray-100'}`}
                    >
                        <span>{countryCode}</span>
                        <ChevronDown
                            size={16}
                            className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {open && (
                        <ul
                            role="listbox"
                            className="absolute z-30 top-full mt-1.5 left-0 w-60 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto py-1"
                        >
                            {COUNTRY_CODES.map((country) => {
                                const isSelected = country.code === countryCode
                                return (
                                    <li key={country.iso} role="option" aria-selected={isSelected}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onCountryCodeChange(country.code)
                                                setOpen(false)
                                            }}
                                            className={`w-full flex items-center gap-2 text-left px-4 py-3 text-sm font-medium transition-colors ${
                                                isSelected ? 'bg-[#000B60] text-white' : 'text-gray-700 hover:bg-[#F2F4F6]'
                                            }`}
                                        >
                                            <span className="text-base">{country.flag}</span>
                                            <span className="flex-1 truncate">{country.name}</span>
                                            <span className={isSelected ? 'text-white/80' : 'text-gray-400'}>{country.code}</span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>

                {/* Phone number input */}
                <input
                    type="tel"
                    inputMode="numeric"
                    name={name}
                    value={value}
                    onChange={handleNumberChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={`flex-1 min-w-0 py-4 px-4 bg-[#F2F4F6] rounded-lg border text-base font-medium outline-none transition-all
                        ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-100 focus:border-gray-100 focus:ring-0'}`}
                />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

export default PhoneInput
