


import { useState, useRef } from 'react'
import { CloudUpload, Plus, Trash2, Eye, Download, GraduationCap } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { Qualification } from './index'

interface Props {
    qualifications: Qualification[]
    onChange: (q: Qualification[]) => void
    onNext: () => void
    onBack: () => void
}

const qualificationTypes = [
    'Degree', 'Professional Course', 'PhD', 'Masters', 'Diploma', 'Certificate'
]

const emptyForm = (): Qualification => ({
    id: '',
    type: 'Degree',
    fieldOfStudy: '',
    graduationYear: '',
    teachingExperience: '',
    fileName: '',
    fileSize: '',
})

const QualificationStep = ({ qualifications, onChange, onNext, onBack }: Props) => {
    const [form, setForm] = useState<Qualification>(emptyForm())
    const [dragOver, setDragOver] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const set = (field: keyof Qualification) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm({ ...form, [field]: e.target.value })

    const handleFile = (file: File) => {
        setForm({
            ...form,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const handleAddQualification = () => {
        if (!form.fieldOfStudy || !form.graduationYear) return
        onChange([
            ...qualifications,
            { ...form, id: Date.now().toString() }
        ])
        setForm(emptyForm())
    }

    const handleRemove = (id: string) => {
        onChange(qualifications.filter((q) => q.id !== id))
    }

    const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300 bg-gray-50"

    return (
        <OnboardingLayout
            step={2}
            total={3}
            title="Academic Profile"
            subtitle="To tailor your platform experience, please provide your academic background and professional history."
            backLabel="Back to information"
            onBack={onBack}
        >

            {/* Add qualification form card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Add New Qualification</h3>
                <p className="text-xs text-gray-400 mb-4">Fill in the details for your next academic degree.</p>

                <div className="flex flex-col gap-4">

                    {/* Type + Field */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Qualification Type</label>
                            <select value={form.type} onChange={set('type')} className={inputClass}>
                                {qualificationTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Field of Study</label>
                            <input
                                value={form.fieldOfStudy}
                                onChange={set('fieldOfStudy')}
                                placeholder="e.g. Theoretical Physics"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Year + Experience */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Graduation Year</label>
                            <input
                                value={form.graduationYear}
                                onChange={set('graduationYear')}
                                placeholder="YYYY"
                                maxLength={4}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teaching Experience</label>
                            <input
                                value={form.teachingExperience}
                                onChange={set('teachingExperience')}
                                placeholder="e.g. 2 Years"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Upload zone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Upload Certificate</label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                ${dragOver
                                    ? 'border-indigo-400 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                }`}
                        >
                            <CloudUpload size={28} className="text-indigo-400" />
                            {form.fileName ? (
                                <p className="text-sm font-medium text-indigo-600">{form.fileName}</p>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400">PDF, JPG or PNG (max. 10MB)</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFile(file)
                            }}
                        />
                    </div>

                </div>

                {/* Add button */}
                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={handleAddQualification}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Qualification
                    </button>
                </div>
            </div>

            {/* Added qualifications list */}
            {qualifications.map((q) => (
                <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <GraduationCap size={16} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{q.fieldOfStudy}</p>
                                <p className="text-xs text-gray-400">Primary Qualification</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemove(q.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                            <Trash2 size={13} />
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {[
                            { label: 'Degree Type', value: q.type },
                            { label: 'Field of Study', value: q.fieldOfStudy },
                            { label: 'Graduation Year', value: q.graduationYear },
                            { label: 'Teaching Experience', value: q.teachingExperience },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* File preview */}
                    {q.fileName && (
                        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                                    <span className="text-red-600 text-[9px] font-bold">PDF</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700">{q.fileName}</p>
                                    <p className="text-xs text-gray-400">{q.fileSize}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Eye size={15} />
                                </button>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Download size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Continue button */}
            <div className="flex justify-end mt-2">
                <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-btn-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                    Continue
                    <span>→</span>
                </button>
            </div>

        </OnboardingLayout>
    )
}

export default QualificationStep