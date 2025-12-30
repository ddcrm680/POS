"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type FileLightboxProps = {
  open: boolean;
  src: string;
  isPdf: boolean;
  onClose: () => void;
};

export function FileLightbox({
  open,
  src,
  isPdf,
  onClose,
}: FileLightboxProps) {
  return (
<Lightbox
  open={open}
  close={onClose}
  slides={[{ src }]}
  animation={{ swipe: 0 }}        // ✅ disable swipe
  carousel={{ finite: true }}     // ✅ no looping
  render={{
    buttonPrev: () => null,       // ✅ hide left arrow
    buttonNext: () => null,       // ✅ hide right arrow
    slide: ({ slide }) =>
      isPdf ? (
        <iframe
          src={slide.src}
          className="w-[90vw] h-[90vh] rounded-lg bg-white"
        />
      ) : (
        <img
          src={slide.src}
          className="max-w-full max-h-full object-contain"
        />
      ),
  }}
/>

  );
}
