import Image from "next/image"

// overlayOpacity (0-100) is optional; by default the banner overlay of
// config/theme.mjs is used.
export default function PageBanner({ height = "300px", title, image, overlayOpacity, marginTop }) {
    const overlay = overlayOpacity != null ? `${overlayOpacity}%` : "var(--overlay-banner)";
    return (
        <div
            className="relative"
            style={{
                backgroundImage: `url(${image})`,
                minHeight: height,
                marginTop: marginTop || 0
            }}>
            <div className="">
                <Image
                    alt="hero background"
                    layout="fill"
                    objectFit="cover"
                    priority
                    src={image}
                />
            </div>
            <div className="hero-overlay absolute inset-0 z-10"
                style={{
                    backgroundColor: `color-mix(in oklab, var(--color-neutral) ${overlay}, transparent)`
                }}
            ></div>
            <div className="hero-content h-full flex justify-center items-center text-center absolute inset-0 z-10">
                {title && (<h1 className="font-light text-3xl md:text-4xl tracking-[0.2em] uppercase text-brand-on-image text-center">{title}</h1>)}
            </div>
        </div>
    )
}