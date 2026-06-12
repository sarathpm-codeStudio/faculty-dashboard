import logo from '@/assets/icons/brand_icon.svg'

/**
 * Full-screen branded splash shown while the app is initializing
 * (first load / page reload). The brand mark gently pulses.
 */
const BrandSplash = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <img
                src={logo}
                alt="Loading"
                className="w-28 h-auto object-contain animate-brand-pulse"
            />
        </div>
    )
}

export default BrandSplash
