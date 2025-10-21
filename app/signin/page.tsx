import Link from "next/link";
import LOGOS from "@/components/logos";
import LoginWithCredentialsForm from "@/components/authentication/signin-with-credentials-form";

import { Field } from "@/components/ui/field";
import { roboto } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { providerMap, signIn } from "@/auth";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign In to Moncip LIS",
};

async function Signin(props: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
  const callbackUrl = (await props.searchParams).callbackUrl;

  return (
    <div className="h-screen flex justify-center items-center">
      <main className="bg-card w-4/5 max-w-lg border border-input p-6 rounded-md shadow-sm shadow-input">
        <h1 className="text-2xl font-black text-center mb-2">
          Sign In to Moncip LIS
        </h1>

        <p className="mb-2 text-center">Login with credentials</p>

        <div className="w-[70%] mx-auto">
          <LoginWithCredentialsForm callbackUrl={callbackUrl} />
        </div>

        <Separator orientation="horizontal" className="mt-5 mb-3" />

        <p className="mb-3 text-center">
          ... or login as an{" "}
          <span className="font-semibold">Administrator</span>
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
                    redirectTo: callbackUrl ?? "/admin",
                  });
                } catch (error) {
                  throw error;
                }
              }}
            >
              <Field>
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
              </Field>
            </form>
          ))}
        </div>

        <Separator orientation="horizontal" className="mt-5 mb-3" />

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
