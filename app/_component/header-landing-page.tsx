import Link from "next/link";
import GithubIcon from "../../components/ui/github-icon";
import ThemeToggler from "../../components/ui/theme-toggler";
import { cn } from "@/lib/utils";
import { Button } from "../../components/ui/button";
import { ExternalLink, Hospital } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function HeaderLandingPage() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="w-full px-6">
        <div className="flex h-14 items-center">
          <Button size={"icon"} variant={"ghost"} className="size-10" asChild>
            <Link href={"/"}>
              <Hospital className="size-6" />
              <span className="sr-only">Moncip HIS-Simulator</span>
            </Link>
          </Button>
          <NavigationMenu className="mx-auto">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(navigationMenuTriggerStyle(), "flex-row gap-2")}
                >
                  <Link
                    href="https://github.com/fmukhlis/moncip-his-simulator"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="!size-4 text-foreground" />
                    <span className="sr-only whitespace-nowrap sm:not-sr-only">
                      Moncip HIS-Simulator
                    </span>
                    <ExternalLink className="hidden size-3 sm:block text-foreground" />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(navigationMenuTriggerStyle(), "flex-row gap-2")}
                >
                  <Link
                    href="https://github.com/fmukhlis/moncip-lis"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="!size-4 text-foreground" />
                    <span className="sr-only whitespace-nowrap sm:not-sr-only">
                      Moncip LIS
                    </span>
                    <ExternalLink className="hidden size-3 sm:block text-foreground" />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <ThemeToggler />
        </div>
      </div>
    </header>
  );
}
