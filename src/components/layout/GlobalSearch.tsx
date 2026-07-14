import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Clock, BookOpen, Loader2, UserCircle2 } from 'lucide-react'
import { Input } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { useGlobalSearch, MIN_SEARCH_LENGTH } from '@/hooks/search'
import type { SearchResult } from '@/services/searchService'

const GlobalSearch = () => {
    const navigate = useNavigate()

    const [term, setTerm] = useState('')
    const [open, setOpen] = useState(false)
    // Index into the flattened row list, for arrow-key navigation. -1 = nothing highlighted.
    const [activeIndex, setActiveIndex] = useState(-1)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const debouncedTerm = useDebounce(term, 300)
    const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches()

    const { data, isFetching, isError } = useGlobalSearch(debouncedTerm)

    const isSearching = term.trim().length >= MIN_SEARCH_LENGTH
    // `term` leads `debouncedTerm` by up to 300ms — treat that gap as loading too,
    // otherwise the dropdown briefly shows stale results as if they were final.
    const isLoading = isSearching && (isFetching || term.trim() !== debouncedTerm.trim())

    const courses = data?.courses ?? []
    const students = data?.students ?? []

    // One flat list of everything focusable, so arrow keys can walk courses →
    // students (or the recents list) without caring which section a row is in.
    // Empty while the skeleton is up: those rows aren't on screen, so arrow keys
    // must not be able to select them.
    const rows = useMemo(
        () => (isSearching && !isLoading ? [...courses, ...students] : []),
        [isSearching, isLoading, courses, students],
    )
    const navigableCount = isSearching ? rows.length : recents.length

    // Any change to what's listed invalidates the highlight position.
    useEffect(() => setActiveIndex(-1), [debouncedTerm, isSearching])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const goToResult = (result: SearchResult) => {
        addRecent(term)
        setOpen(false)
        setTerm('')
        inputRef.current?.blur()
        navigate(result.type === 'course' ? `/courses/${result.id}` : `/students/${result.id}`)
    }

    const runRecent = (recent: string) => {
        setTerm(recent)
        addRecent(recent)
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
            return
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (navigableCount === 0) return
            e.preventDefault()
            setOpen(true)
            const step = e.key === 'ArrowDown' ? 1 : -1
            // -1 means "nothing highlighted", so ArrowDown lands on the first row
            // and ArrowUp wraps to the last.
            setActiveIndex((prev) => {
                const next = prev + step
                if (next < 0) return navigableCount - 1
                if (next >= navigableCount) return 0
                return next
            })
            return
        }

        if (e.key === 'Enter') {
            if (isSearching && activeIndex >= 0 && rows[activeIndex]) {
                goToResult(rows[activeIndex])
            } else if (!isSearching && activeIndex >= 0 && recents[activeIndex]) {
                runRecent(recents[activeIndex])
            } else if (term.trim()) {
                // No row highlighted — just remember the term the faculty typed.
                addRecent(term)
            }
        }
    }

    const showDropdown = open && (isSearching || recents.length > 0)

    return (
        <div ref={containerRef} className="relative w-full max-w-[300px] lg:max-w-[700px] mr-4">
            <Input
                ref={inputRef}
                value={term}
                onChange={(e) => {
                    setTerm(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search by course and students..."
                leftIcon={<Search size={16} />}
                rightIcon={
                    isLoading ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                    ) : term ? (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => {
                                setTerm('')
                                inputRef.current?.focus()
                            }}
                            className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    ) : null
                }
                className="!py-2.5 lg:!py-4 !text-sm lg:!text-base"
                autoComplete="off"
            />

            {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden max-h-[420px] overflow-y-auto">

                    {/* Empty box → recent searches */}
                    {!isSearching && recents.length > 0 && (
                        <>
                            <SectionHeader
                                title="Recent searches"
                                action={
                                    <button
                                        type="button"
                                        onClick={clearRecents}
                                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                }
                            />
                            {recents.map((recent, index) => (
                                <div
                                    key={recent}
                                    className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${activeIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => runRecent(recent)}
                                >
                                    <Clock size={16} className="text-gray-400 shrink-0" />
                                    <span className="flex-1 text-sm text-gray-700 truncate">{recent}</span>
                                    <button
                                        type="button"
                                        aria-label={`Remove ${recent}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeRecent(recent)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                                    >
                                        <X size={14} className="text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Typing → live suggestions */}
                    {isSearching && (
                        <>
                            {isError && (
                                <p className="px-4 py-6 text-sm text-center text-red-500">
                                    Couldn't load results. Please try again.
                                </p>
                            )}

                            {/* The skeleton replaces the whole list on every load, not just
                                the first one — otherwise the previous term's results sit
                                there looking final while the new ones are still in flight. */}
                            {!isError && isLoading && <ResultsSkeleton />}

                            {!isError && !isLoading && rows.length === 0 && (
                                <p className="px-4 py-6 text-sm text-center text-gray-400">
                                    No courses or students match “{term.trim()}”
                                </p>
                            )}

                            {!isError && !isLoading && courses.length > 0 && (
                                <>
                                    <SectionHeader title="Courses" />
                                    {courses.map((course, i) => (
                                        <ResultRow
                                            key={course.id}
                                            result={course}
                                            active={activeIndex === i}
                                            onHover={() => setActiveIndex(i)}
                                            onSelect={() => goToResult(course)}
                                        />
                                    ))}
                                </>
                            )}

                            {!isError && !isLoading && students.length > 0 && (
                                <>
                                    <SectionHeader title="Students" />
                                    {students.map((student, i) => {
                                        // Students sit after every course in the flat row list.
                                        const index = courses.length + i
                                        return (
                                            <ResultRow
                                                key={student.id}
                                                result={student}
                                                active={activeIndex === index}
                                                onHover={() => setActiveIndex(index)}
                                                onSelect={() => goToResult(student)}
                                            />
                                        )
                                    })}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// Mirrors the real dropdown's shape — two labelled sections, square thumbnails for
// courses and round avatars for students — so the layout doesn't jump when the
// results land.
const SkeletonRow = ({ round }: { round?: boolean }) => (
    <div className="flex items-center gap-3 px-4 py-2.5">
        <div className={`w-9 h-9 shrink-0 bg-gray-100 ${round ? 'rounded-full' : 'rounded-lg'}`} />
        <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-2.5 bg-gray-50 rounded w-1/2" />
        </div>
    </div>
)

const SkeletonHeader = () => (
    <div className="px-4 pt-3 pb-1.5">
        <div className="h-2.5 bg-gray-100 rounded w-16" />
    </div>
)

const ResultsSkeleton = () => (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading results">
        <SkeletonHeader />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonHeader />
        <SkeletonRow round />
        <SkeletonRow round />
    </div>
)

const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{title}</p>
        {action}
    </div>
)

const ResultRow = ({
    result,
    active,
    onHover,
    onSelect,
}: {
    result: SearchResult
    active: boolean
    onHover: () => void
    onSelect: () => void
}) => (
    <div
        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${active ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
        onMouseEnter={onHover}
        // Keep the input focused so the blur/click-outside handlers don't close
        // the dropdown before the click lands.
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSelect}
    >
        <div className={`w-9 h-9 shrink-0 overflow-hidden flex items-center justify-center bg-gray-100 ${result.type === 'course' ? 'rounded-lg' : 'rounded-full'}`}>
            {result.image ? (
                <img src={result.image} alt="" className="w-full h-full object-cover" />
            ) : result.type === 'course' ? (
                <BookOpen size={16} className="text-gray-400" />
            ) : (
                <UserCircle2 size={18} className="text-gray-400" />
            )}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{result.title}</p>
            {result.subtitle && <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>}
        </div>
    </div>
)

export default GlobalSearch
