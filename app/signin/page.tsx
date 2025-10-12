import Link from "next/link";
import LOGOS from "@/components/logos";

import type { Metadata } from "next";

import { roboto } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { providerMap, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Login to Moncip LIS",
};

function Signin(props: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
  return (
    <div className="h-screen flex justify-center items-center">
      <main className="bg-card w-4/5 md:w-[500px] border border-input p-6 rounded-md shadow-sm shadow-input">
        <h1 className="text-2xl font-black text-center mb-3">
          Sign In to Moncip LIS
        </h1>

        <p className="mb-3 text-center">
          Login as an <span className="font-semibold">Administrator</span>
        </p>

        <div className="flex flex-col md:flex-row gap-2 justify-center items-center flex-nowrap mb-3">
          {Object.values(providerMap).map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                const callbackUrl = (await props.searchParams).callbackUrl;
                try {
                  await signIn(provider.id, {
                    redirectTo: callbackUrl ?? "",
                  });
                } catch (error) {
                  throw error;
                }
              }}
            >
              <Button
                variant={"google-spec"}
                size={"google-spec"}
                type="submit"
              >
                <div className="flex items-center">
                  <div className="w-[25px] h-[25px] mr-[10px]">
                    {LOGOS[provider.name as "Google" | "GitHub"]}
                  </div>
                  <span className={`${roboto.className}`}>
                    Sign in with {provider.name}
                  </span>
                </div>
              </Button>
            </form>
          ))}
        </div>

        <p className="flex flex-col md:flex-row md:gap-1 justify-center items-center text-center">
          {`Don't have an account yet?`}
          <Link
            href="/signup"
            className="text-link hover:underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>
      </main>
    </div>
  );
}

export default Signin;
