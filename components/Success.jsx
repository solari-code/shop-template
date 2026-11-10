import Link from "next/link"
import { textsConfig } from "@/config/texts.mjs"
import { shopText, contactHref } from "@/lib/config/shop.mjs"
import MultilineText from "./MultilineText"

export default function Success() {
    const { heading, text, questions } = textsConfig.orderSuccess

    return (
        <div className="max-w-md w-full text-center space-y-6">
            <h1 className="font-light text-2xl tracking-wide">
                {shopText(heading)}
            </h1>

            <p className="font-light text-sm leading-relaxed">
                <MultilineText text={shopText(text)} />
            </p>

            <hr className="border-brand-base-300" />

            <p className="font-light text-sm">
                {shopText(questions)}{" "}
                <Link href={contactHref} className="underline hover:text-brand-content  transition-colors">
                    {shopText(textsConfig.contactLink)}
                </Link>
            </p>

            <Link
                href="/products"
                className="inline-block font-light text-xs uppercase tracking-widest border border-brand-content text-brand-content px-8 py-3 hover:bg-brand-content hover:text-brand-content-inverse transition-colors duration-200"
            >
                Continue shopping
            </Link>
        </div>
    )
}
