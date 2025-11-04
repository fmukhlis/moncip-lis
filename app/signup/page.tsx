import Link from "next/link";
import LOGOS from "@/components/logos";

import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { roboto } from "@/lib/fonts";
import { Hospital } from "lucide-react";
import { type Metadata } from "next";
import { providerMap, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Moncip LIS account",
};

async function Signup(props: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
  const callbackUrl = (await props.searchParams).callbackUrl;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4">
      <Hospital size={64} className="mb-6" />
      <main className="bg-card w-full max-w-lg border border-input p-6 rounded-md shadow-sm shadow-input">
        <h1 className="text-2xl font-black text-center mb-2">
          Sign Up to Moncip LIS
        </h1>

        <p className="mb-4 text-center">
          Create a new <span className="font-semibold">Administrator</span>{" "}
          account
        </p>

        <div className="flex flex-col md:flex-row gap-2 justify-center items-center flex-nowrap mb-3">
          {Object.values(providerMap).map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                try {
                  await signIn(provider.id, {
                    redirectTo: callbackUrl ?? "",
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
                    <div className="w-[25px] h-[25px]">
                      {LOGOS[provider.name as "Google" | "GitHub"]}
                    </div>
                    <span className={`${roboto.className} ml-[10px]`}>
                      Sign in with {provider.name}
                    </span>
                  </div>
                </Button>
              </Field>
            </form>
          ))}
        </div>

        <Link
          href="/signin"
          className="flex gap-1 justify-center items-center text-center text-link hover:underline underline-offset-4"
        >
          &larr; Back to Sign In page
        </Link>
      </main>
    </div>
  );
}

export default Signup;
