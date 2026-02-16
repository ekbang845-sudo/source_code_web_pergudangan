"use client";
import Link from "next/link";
import { startGlobalLoading } from "@/utils/loadingEvent";

export default function LoadingLink({ href, children, className }: any) {
  return (
    <Link href={href} onClick={() => startGlobalLoading()} className={className}>
      {children}
    </Link>
  );
}