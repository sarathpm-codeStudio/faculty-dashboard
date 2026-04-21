import { useState, useRef } from 'react'
import { CloudUpload, Plus, Trash2, Eye, FileText, Download, GraduationCap } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { Input, Select, Button, Subheading, Paragraph, DateInput } from '@/components/ui'
import { Qualification } from './index'
import { IoMdArrowForward } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";


interface Props {
    qualifications: Qualification[]
    onChange: (q: Qualification[]) => void
    onNext: () => void
    onBack: () => void
    animClass?: string
}

const qualificationTypes = [
    { value: 'Degree', label: 'Degree' },
    { value: 'Professional Course', label: 'Professional Course' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Masters', label: 'Masters' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Certificate', label: 'Certificate' },
]

const emptyForm = (): Omit<Qualification, 'id'> => ({
    type: 'Degree',
    fieldOfStudy: '',
    graduationYear: '',
    teachingExperience: '',
    fileName: '',
    fileSize: '',
})

const QualificationStep = ({ qualifications, onChange, onNext, onBack, animClass = '' }: Props) => {
    const [form, setForm] = useState(emptyForm())
    const [dragOver, setDragOver] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const set = (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm({ ...form, [field]: e.target.value })

    const handleFile = (file: File) => {
        setForm({
            ...form,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        })
    }

    const handleAdd = () => {
        if (!form.fieldOfStudy || !form.graduationYear) return
        onChange([...qualifications, { ...form, id: Date.now().toString() }])
        setForm(emptyForm())
    }

    const handleRemove = (id: string) =>
        onChange(qualifications.filter((q) => q.id !== id))

    return (
        <OnboardingLayout
            step={2}
            total={3}
            title="Academic Profile"
            subtitle="To tailor your platform experience, please provide your academic background and professional history."

            backLabel="Back to information"
            onBack={onBack}
            animClass={animClass}
        >
            <div className="w-full max-w-4xl flex flex-col gap-4">

                {/* Add Qualification card */}
                <div className="bg-white rounded-xl border-2 border-dotted border-gray-200 p-5">
                    <Subheading className='text-[#000B60] font-bold'> Add New Qualification</Subheading>
                    <Paragraph className='mb-4 text-gray-500' > Fill in the details for your next academic degree. </Paragraph>


                    <div className="flex flex-col gap-4">

                        {/* Type + Field */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Qualification Type"
                                value={form.type}
                                onChange={set('type')}
                                options={qualificationTypes}
                            />
                            <Input
                                label="Field of Study"
                                value={form.fieldOfStudy}
                                onChange={set('fieldOfStudy')}
                                placeholder="e.g. Theoretical Physics"
                            />
                        </div>

                        {/* Year + Experience */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DateInput
                                label="Graduation Date"
                                value={form.graduationYear}
                                onChange={(val: string) => setForm({ ...form, graduationYear: val })}
                            />
                            <Input
                                label="Teaching Experience"
                                value={form.teachingExperience}
                                onChange={set('teachingExperience')}
                                placeholder="e.g. 2 Years"
                            />
                        </div>

                        {/* Upload zone */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-gray-700">Upload Certificate</span>
                            <div
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                                    ${dragOver ? 'border-[#000B60] bg-blue-50' : 'border-gray-200 hover:border-[#000B60]'}`}
                            >
                                <CloudUpload size={26} className="text-[#000B60]" />
                                {form.fileName ? (
                                    <p className="text-sm font-medium text-[#000B60]">{form.fileName}</p>
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
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                            />
                        </div>

                    </div>

                    {/* Add button */}
                    <div className="flex justify-end mt-10">
                        <Button type="button" variant="secondary" onClick={handleAdd}>
                            <IoAddCircleOutline size={25} />
                            Add Qualification
                        </Button>
                    </div>
                </div>

                {/* Added qualifications */}
                {qualifications.map((q) => (
                    <div key={q.id} className="rounded-xl bg-white p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#DFE0FF] rounded-lg flex items-center justify-center">
                                    <GraduationCap size={15} className="text-[#000B60]" />
                                </div>
                                <div>
                                    <Subheading > {q.fieldOfStudy} </Subheading>
                                    <Paragraph className='text-gray-500' > {q.type} </Paragraph>

                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(q.id)}
                                className="flex items-center gap-1 text-[14px] text-[#BA1A1A] hover:text-red-700"
                            >
                                <Trash2 size={12} />
                                <span className="font-bold cursor-pointer">
                                    Remove
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                            {[
                                { label: 'Degree Type', value: q.type },
                                { label: 'Field of Study', value: q.fieldOfStudy },
                                { label: 'Graduation Year', value: q.graduationYear },
                                { label: 'Teaching Experience', value: q.teachingExperience },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-gray-700">{label}</span>
                                    <div className="w-full px-4 py-4 bg-[#F2F4F6] rounded-lg border border-gray-100 text-base font-medium text-gray-700">
                                        {value || <span className="text-gray-400">—</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {q.fileName && (
                            <div className="flex items-center justify-between px-3 py-2.5 bg-[#F2F4F6] border border-gray-100 rounded-lg mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-red-50 rounded flex items-center justify-center border border-red-100">
                                        <span className="text-red-500 text-[9px] font-bold"><FileText size={20} /></span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">{q.fileName}</p>
                                        <p className="text-xs text-gray-400">Verified • {q.fileSize}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="text-[#000B60] font-bold "><Eye size={20} /></button>
                                    <button className="text-[#000B60] font-bold "><Download size={20} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Continue — inside the section */}
                <div className="flex justify-end">
                    <Button type="button" onClick={onNext}>Continue <IoMdArrowForward /></Button>
                </div>

            </div>
        </OnboardingLayout>
    )
}

export default QualificationStep
