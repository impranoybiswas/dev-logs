"use client";
import Link from "next/link";
import Image from "next/image";

export default function SiteTitle() {
  return (
    <Link
      className="pl-3 lg:pl-5 flex flex-1 items-center h-full gap-2"
      href={"/"}
    >
      <Image
        src="/logo.jpg"
        alt="Logo"
        width={100}
        height={100}
        className="mix-blend-lighten rounded-full size-8"
      />
      <div className=" text-base md:text-xl text-foreground hover:text-primary transition-colors duration-500 ease-in-out">
        <b>dev</b>
        -logs
      </div>
    </Link>
  );
}
