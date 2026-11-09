"use client";

import Image from "next/image";

export default function AboutSection() {
    return (
        <section
            id="about"
            className="py-20 lg:py-28 bg-brand-base-200 bg-[#faf7f2] scroll-mt-16"
            aria-labelledby="about-heading"
        >
            <div className="container mx-auto px-6 fade-in">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 flex justify-center fade-in order-1">
                        <Image
                            src="/images/about.jpeg"
                            alt="Mara — Selva Studio slow fashion"
                            width={400}
                            height={500}
                            className="max-w-full w-auto h-auto object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    <div className="md:w-1/2 text-center md:text-left fade-in order-2">
                        <p
                            id="about-heading"
                            className="text-[0.8rem] tracking-[0.28em] uppercase text-gray-500 font-light mb-4"
                        >
                            A little about me
                        </p>
                        <h2 className="font-sans font-light text-2xl md:text-3xl text-brand-content leading-tight mb-4">
                            I make pieces that are meant to last and stay with you.
                        </h2>
                        <p className="font-sans font-light text-base md:text-lg text-gray-600 leading-relaxed">
                            I&apos;m Mara. Selva Studio started because I wanted to dress with purpose: pieces
                            made by hand from carefully chosen upcycled fabrics. Every garment
                            has a story before it reaches you, and I hope it keeps
                            writing it with you.
                            <br />
                            If you&apos;re looking for something that fits well and tells
                            a story, I&apos;m here.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
