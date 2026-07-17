import { useState, useMemo, useEffect } from 'react'
import { ImagePlus, ArrowRight, Loader2 } from 'lucide-react'
import { RiCoupon2Fill } from 'react-icons/ri'
import { Input, Select, Textarea, Subheading, Paragraph } from '@/components/ui'
import Button from '@/components/ui/Button'
import { Formik, useFormik } from 'formik'
import { bundleValidator } from '@/utils/validator/bundle.validator'
import { UploadBox } from '@/components/features/UploadBox'
import { ImageCropperModal } from '@/components/ui'
import { storageService } from '@/services'
import { toast } from 'sonner'
import { useCreateBundle, useUpdateBundle } from '@/hooks/useBundle'
import { useGstPercent } from '@/hooks/useCourse'
import {
  ASPECT_RATIO_16_9,
  dataUrlToFile,
  getImageDimensions,
  isAspectRatio16x9,
} from '@/utils/imageAspectRatio'

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
  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null)
  const [coverCropperOpen, setCoverCropperOpen] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  console.log("selected courses", selectedCourses)

  // mutation
  const { mutateAsync: createBundle, isPending: createBundleLoading } = useCreateBundle()
  const { mutateAsync: updateBundle, isPending: updateBundleLoading } = useUpdateBundle()

  const initialValues = {
    title: '',
    description: '',
    discount: '0',
    discountType: 'percentage',
    /** true → INCLUSIVE_GST: discount applies to the GST-inclusive price */
    discountOnInclusive: true, // platform default: INCLUSIVE_GST
    coverImage: null,
  }

  useEffect(() => {
    if (bundle) {
      formik.setValues({
        title: bundle?.title,
        description: bundle?.description,
        discount: bundle?.discount,
        discountType: bundle?.discount_type ?? 'percentage',
        discountOnInclusive: bundle?.discount_mode !== 'EXCLUSIVE_GST',
        coverImage: bundle?.image_url,
      })
      setEnableCoupons(bundle?.enable_coupons)

    }
  }, [bundle])


  const formik = useFormik({
    initialValues,
    validationSchema: bundleValidator,
    onSubmit: async (values) => {
      try {
        // Same GST model as course pricing (course-gst-pricing.md): the bundle
        // base is stored WITHOUT GST (exclude_price), price / final_price are
        // stored GST-INCLUSIVE (students see these).
        const payload = {
          title: values.title,
          description: values.description,
          discount: values.discount.toString(),
          discountType: values.discountType || 'percentage',
          discountMode: values.discountOnInclusive ? 'INCLUSIVE_GST' : 'EXCLUSIVE_GST',
          coverImage: values.coverImage,
          courses: selectedCourses,
          enableCoupons: enableCoupons,
          excludePrice: Number(baseExGst.toFixed(2)),
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
          } catch {
            // Error toast handled globally by the query client.
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
        // Error toast handled globally by the query client.
        console.error(error)
      }

    }
  })

  // GST-inclusive pricing, same model as the course screen
  // (course-gst-pricing.md §2). sumOfCourses is the sum of the selected
  // courses' final_price — already GST-INCLUSIVE — so the bundle's ex-GST
  // base is extracted from it, and the two discount models apply:
  //   EXCLUSIVE_GST — discount on the ex-GST base, GST added on what remains
  //   INCLUSIVE_GST — discount straight off the GST-inclusive sum
  const { data: gstPercent = 18 } = useGstPercent()
  const gstRate = gstPercent / 100

  const discount = parseFloat(formik.values.discount) || 0
  const discountType = formik.values.discountType
  const discountOnInclusive = formik.values.discountOnInclusive

  const baseExGst = (sumOfCourses * 100) / (100 + gstPercent) // bundle base WITHOUT GST

  const discountAmount = useMemo(() => {
    const appliedTo = discountOnInclusive ? sumOfCourses : baseExGst
    if (discountType === 'percentage') return (appliedTo * discount) / 100
    return discount
  }, [sumOfCourses, baseExGst, discount, discountType, discountOnInclusive])

  const bundleOffer = discountOnInclusive
    ? Math.max(0, sumOfCourses - Math.round(discountAmount))
    : Math.round(Math.max(0, baseExGst - discountAmount) * (1 + gstRate))

  // GST actually inside what the student pays (extraction works for both models)
  const gstAmount = (bundleOffer * gstPercent) / (100 + gstPercent)

  const studentSavings = sumOfCourses - bundleOffer

  const handleCoverFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a JPEG, PNG, or WebP image')
      return
    }

    try {
      const { width, height } = await getImageDimensions(file)
      if (!isAspectRatio16x9(width, height)) {
        toast.info('Image is not 16:9. Crop it to fit the frame below.')
      }
    } catch {
      toast.error('Could not read image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setRawCoverImage(reader.result as string)
      setCoverCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCoverCropSave = async (cropped: string) => {
    setCoverCropperOpen(false)
    setRawCoverImage(null)
    setCoverPreview(cropped)

    const file = dataUrlToFile(cropped, `bundle-cover-${Date.now()}.jpg`)
    setCoverImage(file)
    try {
      setCoverUploading(true)
      const url = await storageService.uploadCourseCover(file)
      formik.setFieldValue('coverImage', url)
      toast.success('Cover image uploaded')
    } catch (error) {
      console.log('file uploading error', error)
      toast.error('Failed to upload cover image')
      formik.setFieldValue('coverImage', null)
      setCoverPreview(null)
    } finally {
      setCoverUploading(false)
    }
  }

  const handleCoverCropCancel = () => {
    setCoverCropperOpen(false)
    setRawCoverImage(null)
  }

  const handleCoverClear = () => {
    setCoverImage(null)
    setCoverPreview(null)
    formik.setFieldValue('coverImage', null)
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-full min-h-0">
      {/* ── Left ── */}
      <div className="col-span-7 lg:col-span-8 flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">
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

          <div>
            <Input
              label="SUM OF COURSE PRICE (INCL. GST)"
              labelClassName="uppercase tracking-wider text-xs text-gray-500"
              value={`₹${sumOfCourses.toLocaleString()}.00`}
              readOnly
              className="cursor-default"
            />
            {sumOfCourses > 0 && (
              <Paragraph className="text-xs text-gray-400 mt-1.5">
                ₹{baseExGst.toLocaleString('en-IN', { maximumFractionDigits: 2 })} base + {gstPercent}% GST
              </Paragraph>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="DISCOUNT TYPE"
              placeholder="Select discount type"
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'flat', label: 'Flat Amount' },
              ]}
              name="discountType"
              value={formik.values.discountType}
              onChange={e => formik.setFieldValue('discountType', e.target.value)}
              error={formik.touched.discountType && formik.errors.discountType ? formik.errors.discountType : undefined}
            />
            <Input
              label="DISCOUNT"
              name="discount"
              labelClassName="uppercase tracking-wider text-xs text-gray-500"
              type="number"
              min={0}
              max={discountType === 'percentage' ? 100 : undefined}
              placeholder="0"
              value={formik.values.discount}
              onChange={e => formik.setFieldValue('discount', e.target.value)}
              error={formik.touched.discount && formik.errors.discount ? formik.errors.discount : undefined}
            />
          </div>

          {/* Discount model: EXCLUSIVE_GST (off) vs INCLUSIVE_GST (on) */}
          <div className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-4 py-3 gap-4">
            <div className="min-w-0">
              <Paragraph className="text-xs font-semibold text-gray-700">
                Apply discount on GST-inclusive price
              </Paragraph>
              <Paragraph className="!text-[11px] text-gray-400 mt-0.5">
                {discountOnInclusive
                  ? `Discount comes off ₹${sumOfCourses.toLocaleString('en-IN')} (sum incl. GST). GST is inside the final price.`
                  : `Discount comes off ₹${baseExGst.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (base price). GST is added on the rest.`}
              </Paragraph>
            </div>
            <button
              type="button"
              onClick={() => formik.setFieldValue('discountOnInclusive', !discountOnInclusive)}
              className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${discountOnInclusive ? 'bg-[#2c1452]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${discountOnInclusive ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Enable Coupons toggle */}
          <div className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <RiCoupon2Fill size={22} className="text-[#2c1452]" />
              <div>
                <Subheading className="text-[#2c1452] font-bold !text-sm">Enable Coupons</Subheading>
                <Paragraph className="text-gray-400 !text-xs">Allow students to apply additional discount codes at checkout</Paragraph>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableCoupons(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${enableCoupons ? 'bg-[#2c1452]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableCoupons ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Discount Calculator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Subheading className="text-[#2c1452] font-bold">Discount Calculator</Subheading>
            <span className="text-[10px] font-bold text-[#00A98F] bg-[#E6FBF7] px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap shrink-0">
              Smart Pricing Active
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-[#F2F4F6] rounded-xl p-3 lg:p-4 flex items-center justify-between gap-2 lg:block">
              <Paragraph className="!text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0 lg:mb-1 leading-tight">Sum of Courses (incl. GST)</Paragraph>
              <p className="text-sm font-bold text-[#191c1e] whitespace-nowrap">₹{sumOfCourses.toLocaleString()}.00</p>
            </div>
            <div className="bg-[#F2F4F6] rounded-xl p-3 lg:p-4 flex items-center justify-between gap-2 lg:block">
              <Paragraph className="!text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0 lg:mb-1 leading-tight">Bundle Price</Paragraph>
              <p className="text-sm font-bold text-[#191c1e] whitespace-nowrap">₹{bundleOffer.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#E6FBF7] rounded-xl p-3 lg:p-4 flex items-center justify-between gap-2 lg:block">
              <Paragraph className="!text-[10px] font-semibold text-[#00A98F] uppercase tracking-wide mb-0 lg:mb-1 leading-tight">Student Savings</Paragraph>
              <p className="text-sm font-bold text-[#00A98F] whitespace-nowrap">₹{studentSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Price breakdown — same shape as the course pricing screen */}
          <div className="flex flex-col gap-3 px-1 mt-5">
            <div className="flex justify-between text-sm">
              <Paragraph className="text-xs font-semibold text-gray-600">Base Price (excl. GST)</Paragraph>
              <span className="font-semibold text-gray-700">₹{baseExGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <Paragraph className="text-xs font-semibold text-gray-600">
                Discount{discountOnInclusive ? ' (on GST-incl. price)' : ''}
              </Paragraph>
              <span className="font-semibold text-gray-700">
                {discountType === 'percentage' ? `${discount}%` : `₹${discount}`}
                {discount > 0 && discountType === 'percentage' && ` (₹${discountAmount.toFixed(2)})`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <Paragraph className="text-xs font-semibold text-gray-600">GST ({gstPercent}%)</Paragraph>
              <span className="font-semibold text-gray-700">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
              <Paragraph className="text-xs font-semibold text-gray-600">Students Price</Paragraph>
              <span className="font-bold text-[#2c1452]">₹{bundleOffer.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="col-span-5 lg:col-span-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">
        {/* Cover Image */}
        {/* <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#2c1452] hover:bg-[#f5f6ff] transition-colors min-h-[300px]"
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
          preview={coverPreview || bundle?.image_url}
          previewType="image"
          aspectRatio={ASPECT_RATIO_16_9}
          loading={coverUploading}
          icon={<ImagePlus size={20} />}
          title="Cover Image"
          hint="High resolution JPEG or PNG (16:9)"
          onFile={handleCoverFile}
          onClear={handleCoverClear}
        />

        {/* Bundle Offer Price */}
        <div className='bg-gray-100 p-4 lg:p-10 rounded-xl' >

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-5">
            <Paragraph className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bundle Offer</Paragraph>
            <p className="text-2xl lg:text-3xl font-bold text-[#2c1452] break-words">
              ₹{bundleOffer.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <Paragraph className="!text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              Includes ₹{gstAmount.toFixed(2)} GST ({gstPercent}%)
              {discount > 0 && (
                <> after a {discountType === 'percentage' ? `${discount}%` : `₹${discount}`} discount on the {discountOnInclusive
                  ? 'sum of courses (incl. GST)'
                  : `₹${baseExGst.toFixed(2)} base price`}</>
              )}.
            </Paragraph>
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

      <ImageCropperModal
        open={coverCropperOpen}
        image={rawCoverImage}
        onClose={handleCoverCropCancel}
        onSave={handleCoverCropSave}
        title="Crop cover image (16:9)"
        aspect={ASPECT_RATIO_16_9}
        cropShape="rect"
        outputType="image/jpeg"
        saveLabel="Use cover image"
        hint="Position and zoom your image. The frame is fixed to 16:9 — same as the bundle card preview."
      />
    </div>
  )
}

export default Step2Pricing
