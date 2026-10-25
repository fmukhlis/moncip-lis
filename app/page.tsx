import { MoveRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { HeaderLandingPage } from "@/app/_component/header-landing-page";
import SignoutAlertDialog from "@/app/(authenticated)/_component/signout-alert-dialog";
import LogOutButton from "@/app/_component/log-out-button";

export default async function Web() {
  const session = await auth();

  return (
    <section className="bg-background relative mx-auto h-screen max-w-6xl">
      <HeaderLandingPage />
      <div className="m-auto grid h-[calc(100%-56px)] max-w-(--breakpoint-xl) px-4 py-8 text-center lg:py-16">
        <div className="mx-auto place-self-center">
          <h1 className="mb-6 max-w-2xl text-4xl leading-none font-extrabold tracking-tight md:text-5xl xl:text-6xl dark:text-white">
            Moncip LIS
          </h1>
          <p className="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400">
            A modern Laboratory Information System for managing{" "}
            <span className="font-semibold">lab orders</span>
            {", "}
            <span className="font-semibold">specimens</span>
            {", "}
            <span className="font-semibold">test workflows</span> and{" "}
            <span className="font-semibold">results</span> with HIS integration
            support.
          </p>
          <SignoutAlertDialog />
          {session?.user ? (
            <div className="flex flex-col items-center">
              <Button
                type="submit"
                size={"lg"}
                variant={"outline"}
                className="mb-3 flex items-center gap-2 p-5 text-base"
                asChild
              >
                <Link href={"/sys-admin/dashboard"}>
                  Go to Dashboard <MoveRight className="size-5" />
                </Link>
              </Button>
              <LogOutButton />
            </div>
          ) : (
            <Button asChild className="mb-3 p-5 text-base">
              <Link href={"/signin"}>Get Started</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
