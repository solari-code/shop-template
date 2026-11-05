"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";

const images = [
    "/images/home/slider/1.jpg",

    "/images/home/slider/3.jpeg",

    "/images/home/slider/5.jpeg",

    "/images/home/slider/6.jpeg",
    "/images/home/slider/7.jpg",
    "/images/home/slider/13.webp",
    "/images/home/slider/2.jpeg",
    "/images/home/slider/8.jpg",
    "/images/home/slider/9.jpeg",
    "/images/home/slider/4.jpeg",
    "/images/home/slider/10.jpeg",
    "/images/home/slider/11.jpg",
    "/images/home/slider/12.webp",

];


export default function HomeImageSlider() {
    const swiperRef = useRef(null);

    return (
        <section
            id="carousel"
            className="bg-brand-base-100 pt-16 md:pt-24 pb-20 md:pb-28 overflow-hidden"
            aria-label="Outfits — Selva Studio"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <p className="fade-in text-center text-[0.8rem] tracking-[0.28em] uppercase text-gray-400 font-light mb-3">
                    Handmade
                </p>
                <h2 className="fade-in text-center font-sans font-light text-2xl md:text-3xl text-brand-content mb-10 md:mb-14">
                    Pieces with intention
                </h2>
            </div>

            <div className="relative">
                <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 4500, disableOnInteraction: false }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    spaceBetween={12}
                    slidesPerView={1.2}
                    breakpoints={{
                        640: { spaceBetween: 16, slidesPerView: 2 },
                        1024: { spaceBetween: 20, slidesPerView: 3.5 },
                        1280: { slidesPerView: 4 },
                    }}
                    loop
                    className="!overflow-visible"
                    grabCursor
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={index} className="!h-auto">
                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-brand-base-200">
                                <Image
                                    src={img}
                                    fill
                                    alt={`Selva Studio outfit ${index + 1}`}
                                    className="object-cover object-center"
                                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 25vw"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Navigation buttons — md and up only, clicking calls Swiper directly */}
                <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="hidden md:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-brand-base-300 items-center justify-center text-brand-content transition-colors disabled:opacity-40"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => swiperRef.current?.slideNext()}
                    className="hidden md:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-brand-base-300 items-center justify-center text-brand-content transition-colors disabled:opacity-40"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>


            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-16 pb-2 text-center">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-3 font-sans font-light text-sm tracking-[0.2em] uppercase text-brand-content hover:gap-5 transition-all duration-300 group"
                >
                    View the collection
                    <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}