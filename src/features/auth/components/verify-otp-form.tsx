"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { verifyOtpAction } from "../auth-actions";
import { useActionState, useRef } from "react";

export function VerifyOTPForm({
  email,
  ...props
}: React.ComponentProps<typeof Card> & { email: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(verifyOtpAction, {});

  const handleComplete = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Card {...props} className="shadow-none border-none text-center">
      <CardHeader>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription className="">
          We have sent a verification code to <strong>{email}</strong>. Please
          check your inbox and input the code below to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="email" value={email} />
          {state.error && (
            <p className="text-destructive text-sm">{state.error.message}</p>
          )}
          <FieldGroup>
            <Field>
              <InputOTP
                id="otp"
                name="otp"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                onComplete={handleComplete}
                disabled={pending}
                required
              >
                <InputOTPGroup className="mx-auto gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <FieldDescription className="text-center">
                Didn&apos;t receive the code? <a href="#">Resend</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
