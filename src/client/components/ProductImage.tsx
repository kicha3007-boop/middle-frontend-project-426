import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

// Товар без изображения (или с битой ссылкой) показывается с заглушкой, а не с пустым местом.
export const ProductImage = ({ src, alt, className = "" }: Props) => {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className={`product-image product-image-placeholder ${className}`} title={alt}>
        <span>Нет фото</span>
      </div>
    );
  }

  return (
    <img
      className={`product-image ${className}`}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
};
