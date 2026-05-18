import { useState, useMemo, useEffect } from 'react'
import { ImagePlus, ArrowRight, Loader2 } from 'lucide-react'
import { RiCoupon2Fill } from 'react-icons/ri'
import { Input, Textarea, Subheading, Paragraph } from '@/components/ui'
import Button from '@/components/ui/Button'
import { Formik, useFormik } from 'formik'
import { bundleValidator } from '@/utils/validator/bundle.validator'
import { UploadBox } from '@/components/features/UploadBox'
import { storageService } from '@/services'
import { toast } from 'sonner'
import { useCreateBundle, useUpdateBundle } from '@/hooks/useBundle'

interface Props {
  sumOfCourses: number
  selectedCourses: any[]
  onPublish: () => void
  bundleId?: string
  bundle?: any
}

const Step2Pricing = ({ sumOfCourses, selectedCourses, onPublish, bundleId, bundle }: Props) => {
  const [enableCoupons, setEnableCoupons] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  console.log("selected courses", selectedCourses)

  // mutation
  const { mutateAsync: createBundle, isPending: createBundleLoading } = useCreateBundle()
  const { mutateAsync: updateBundle, isPending: updateBundleLoading } = useUpdateBundle()

  const initialValues = {
    title: '',
    description: '',
    discount: '0',
    coverImage: null,
  }

  useEffect(() => {
    if (bundle) {
      formik.setValues({
        title: bundle?.data?.title,
        description: bundle?.data?.description,
        discount: bundle?.data?.discount,
        coverImage: bundle?.data?.image_url,
      })
      setEnableCoupons(bundle?.data?.enableCoupons)

    }
  }, [bundle])


  const formik = useFormik({
    initialValues,
    validationSchema: bundleValidator,
    onSubmit: async (values) => {
      try {
        const payload = {
          title: values.title,
          description: values.description,
          discount: values.discount.toString(),
          coverImage: values.coverImage,
          courses: selectedCourses,
          enableCoupons: enableCoupons,
          finalPrice: bundleOffer,
          price: sumOfCourses,
          isDraft: isDraft,
        }

        if (bundleId) {

          // edit bundle

          try {
            console.log("payload edit", payload)
            const response = await updateBundle({ id: bundleId, payload })
            toast.success("Course bundle updated successfully")
            onPublish() // navigate to bundle list
          } catch (error: any) {
            toast.error(error.message)
          }

        } else {

          console.log("payload", payload)
          const response = await createBundle(payload)
          if (isDraft) {
            toast.success("Bundle saved as draft")
            onPublish() // navigate to bundle list
            return
          }
          toast.success("Course bundle published successfully")
          onPublish() // navigate to bundle list
        }

      } catch (error: any) {
        toast.error(error.message)
      }

    }
  })

  const discountPct = parseFloat(formik.values.discount) || 0
  const bundleOffer = useMemo(() => Math.max(0, sumOfCourses - (sumOfCourses * discountPct) / 100), [sumOfCourses, discountPct])
  const studentSavings = sumOfCourses - bundleOffer




  return (
    <div className="grid grid-cols-12 gap-6 h-full min-h-0">
      {/* ── Left ── */}
      <div className="col-span-8 flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <Input
            label="BUNDLE NAME"
            name="title"
            labelClassName="uppercase tracking-wider text-xs text-gray-500"
            placeholder="Taxation & Laws Combo"
            value={formik.values.title}
            onChange={e => formik.setFieldValue('title', e.target.value)}
            error={formik.touched.title && formik.errors.title ? formik.errors.title : undefined}

          />

          <Textarea
            label="BUNDLE DESCRIPTION"
            name="description"
            placeholder="Describe what students will learn from this bundle..."
            value={formik.values.description}
            onChange={e => formik.setFieldValue('description', e.target.value)}
            rows={4}
            error={formik.touched.description && formik.errors.description ? formik.errors.description : undefined}

          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SUM OF COURSE PRICE"
              labelClassName="uppercase tracking-wider text-xs text-gray-500"
              value={`₹${sumOfCourses.toLocaleString()}.00`}
              readOnly
              className="cursor-default"
            />
            <div className="relative">
              <Input
                label="DISCOUNT (%)"
                name="discount"
                labelClassName="uppercase tracking-wider text-xs text-gray-500"
                type="number"
                min={0}
                max={100}
                placeholder="10"
                value={formik.values.discount}
                onChange={e => formik.setFieldValue('discount', e.target.value)}
                className="pr-8"
                error={formik.touched.discount && formik.errors.discount ? formik.errors.discount : undefined}

              />
              <span className="absolute right-3 bottom-4 text-gray-400 font-bold text-sm pointer-events-none">%</span>
            </div>
          </div>

          {/* Enable Coupons toggle */}
          <div className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <RiCoupon2Fill size={22} className="text-[#000B60]" />
              <div>
                <Subheading className="text-[#000B60] font-bold !text-sm">Enable Coupons</Subheading>
                <Paragraph className="text-gray-400 !text-xs">Allow students to apply additional discount codes at checkout</Paragraph>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableCoupons(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${enableCoupons ? 'bg-[#000B60]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableCoupons ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Discount Calculator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Subheading className="text-[#000b60] font-bold">Discount Calculator</Subheading>
            <span className="text-[10px] font-bold text-[#00A98F] bg-[#E6FBF7] px-2.5 py-1 rounded-full uppercase tracking-wide">
              Smart Pricing Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F2F4F6] rounded-xl p-4">
              <Paragraph className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sum of Courses</Paragraph>
              <p className="text-sm font-bold text-[#191c1e]">₹{sumOfCourses.toLocaleString()}.00</p>
            </div>
            <div className="bg-[#F2F4F6] rounded-xl p-4">
              <Paragraph className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Bundle Price</Paragraph>
              <p className="text-sm font-bold text-[#191c1e]">₹{bundleOffer.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#E6FBF7] rounded-xl p-4">
              <Paragraph className="text-[10px] font-semibold text-[#00A98F] uppercase tracking-wide mb-1">Student Savings</Paragraph>
              <p className="text-sm font-bold text-[#00A98F]">₹{studentSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="col-span-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">
        {/* Cover Image */}
        {/* <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#000B60] hover:bg-[#f5f6ff] transition-colors min-h-[300px]"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#F2F4F6] flex items-center justify-center">
                <ImagePlus size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-[#191c1e]">Cover Image</p>
              <p className="text-xs text-gray-400 text-center">Click to upload or drag and drop</p>
              <p className="text-[10px] text-gray-300">High resolution JPEG or PNG (16:9)</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div> */}
        <UploadBox
          accept="image/jpeg,image/png,image/webp"
          preview={bundle?.data?.image_url || coverPreview}
          previewType="image"
          loading={coverUploading}
          icon={<ImagePlus size={20} />}
          title="Cover Image"
          hint="High resolution JPEG or PNG (16:9)"
          onFile={async (f) => {
            setCoverPreview(URL.createObjectURL(f))
            try {
              setCoverUploading(true)
              const url = await storageService.uploadCourseCover(f)
              formik.setFieldValue('coverImage', url)
              toast.success('Cover image uploaded')
            } catch (error) {
              console.log("file uploading error", error)
              toast.error('Failed to upload cover image')
              formik.setFieldValue('coverImage', null)
              setCoverPreview(null)
            } finally {
              setCoverUploading(false)
            }

          }}
          onClear={() => {
            setCoverImage(null)
            setCoverPreview(null)
            formik.setFieldValue('coverImage', null)
          }}

        />

        {/* Bundle Offer Price */}
        <div className='bg-gray-100 p-10 rounded-xl' >

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <Paragraph className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bundle Offer</Paragraph>
            <p className="text-3xl font-bold text-[#000B60]">
              ₹{bundleOffer.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>


        {
          bundleId ? (
            <Button variant="primary" disabled={updateBundleLoading} type='submit' fullWidth onClick={() => {
              setIsDraft(false)
              formik.handleSubmit()
            }}>
              Publish Bundle  {updateBundleLoading && <Loader2 className="animate-spin" />}
              <ArrowRight size={16} />
            </Button>)
            : (<Button variant="primary" disabled={createBundleLoading && !isDraft} type='submit' fullWidth onClick={() => {
              setIsDraft(false)
              formik.handleSubmit()
            }}>
              Publish Bundle {createBundleLoading && !isDraft && <Loader2 className="animate-spin" />}
              <ArrowRight size={16} />
            </Button>)
        }

        {
          bundleId ?
            bundle?.data?.is_draft ? (
              <Button
                variant="white"
                fullWidth
                type="submit"
                disabled={createBundleLoading && isDraft}
                onClick={() => { setIsDraft(true); formik.handleSubmit() }}>
                Save as draft {createBundleLoading && isDraft && <Loader2 className="animate-spin" />}
              </Button>
            ) :
              <></>
            :
            <Button
              variant="white"
              fullWidth
              type="submit"
              disabled={createBundleLoading && isDraft}
              onClick={() => { setIsDraft(true); formik.handleSubmit() }}>
              Save as draft {createBundleLoading && isDraft && <Loader2 className="animate-spin" />}
            </Button>
        }
      </div>


    </div>
  )
}

export default Step2Pricing
