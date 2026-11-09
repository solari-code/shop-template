import Link from "next/link"
import Image from "next/image"

export default function Success() {
    return (
        <div className="max-w-md w-full text-center space-y-6">
            {/* <Image
                src="/images/logo/logo_black.png"
                width={120}
                height={40}
                alt="Selva Studio"
                className="h-[22px] w-auto object-contain mx-auto mb-8"
            /> */}

            <h1 className="font-light text-2xl tracking-wide">
                Thank you for your order!
            </h1>

            <p className="font-light text-sm text-brand-content/70 leading-relaxed">
                I&apos;ve received your order and I&apos;m preparing it with lots of care.
                <br />
                I&apos;ll send you an email with the details.
            </p>

            <hr className="border-brand-base-300" />

            <p className="font-light text-sm text-brand-content/50">
                Any questions?{" "}
                <Link href="/#contact" className="underline hover:text-brand-content  transition-colors">
                    Write to me
                </Link>
            </p>

            <Link
                href="/products"
                className="inline-block font-light text-xs uppercase tracking-widest border border-brand-content text-brand-content px-8 py-3 hover:bg-brand-content hover:text-white transition-colors duration-200"
            >
                Continue shopping
            </Link>
        </div>
    )
}