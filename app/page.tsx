'use client';
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    redirect("/login");
  }, []);
  return null;
  console.log("KEY runtime:", process.env.KEY);
  return <div>Check console</div>;

}
