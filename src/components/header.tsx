import Link from "next/link";
import Logo from "@/assets/svg/logo";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b transition-all duration-300">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/home" className="flex items-center gap-1">
          <Logo />
          <p className="font-bold text-3xl text-(--primary)">TaskFlow</p>
        </Link>
        <Button className="rounded-lg" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}
