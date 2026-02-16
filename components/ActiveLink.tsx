"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startGlobalLoading } from "@/utils/loadingEvent"; 
import { ReactNode } from "react";

interface ActiveLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function ActiveLink({ href, children, className }: ActiveLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault(); 
    startGlobalLoading(); 
    router.push(href); 
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}