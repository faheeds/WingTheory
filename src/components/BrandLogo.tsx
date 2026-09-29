import Image from "next/image";

export function BrandLogo() {
  return (
    <>
      <Image className="brand-mark" src="/brand/wing-theory-mark.svg" width={72} height={72} alt="" aria-hidden="true" />
      <span className="brand-name">WING THEORY<span className="brand-dot">.</span></span>
    </>
  );
}
