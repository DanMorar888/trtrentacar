import Image from "next/image";

export function HeroBackdrop({
  src = "/images/cars/banner-1-trt-rent-a-car-cluj.webp",
  priority = true,
  overlayClassName = "bg-gradient-to-b from-slate-900/75 to-slate-900/85",
}: {
  src?: string;
  priority?: boolean;
  overlayClassName?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        quality={68}
        className="object-cover object-center"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
