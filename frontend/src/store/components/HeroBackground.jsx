import { useEffect, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const HeroBackground = ({ images, interval }) => {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [reducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reducedMotion || images.length < 2) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setAnimate(true);
      setIndex((i) => (i >= images.length ? 1 : i + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval, reducedMotion]);

  const handleTransitionEnd = () => {
    if (index === images.length) {
      setAnimate(false);
      setIndex(0);
    }
  };

  const goTo = (i) => {
    setAnimate(true);
    setIndex(i);
  };

  const active = index % images.length;
  const slides = [...images, images[0]];

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className={`flex h-full will-change-transform motion-reduce:transition-none ${animate ? "transition-transform duration-700 ease-in-out" : "transition-none"}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              className="block size-full flex-[0_0_100%] object-cover"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-black/82 via-black/82 via-35% to-black/25" />
      </div>
      <div
        className="relative z-[2] order-1 flex justify-center gap-1 pb-2.5 sm:pb-3.5 laptop-short:pb-2.5"
        role="tablist"
        aria-label="Hero slides"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show slide ${i + 1}`}
            className="group grid h-6 w-7 cursor-pointer place-items-center"
            onClick={() => goTo(i)}
          >
            <span
              className={`h-2 rounded-full transition-all duration-200 ${
                i === active ? "w-[22px] bg-primary" : "w-2 bg-white/55 group-hover:bg-white/90"
              }`}
            />
          </button>
        ))}
      </div>
    </>
  );
};

export default HeroBackground;
