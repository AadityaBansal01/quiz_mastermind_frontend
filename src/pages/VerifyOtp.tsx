// frontend/src/pages/VerifyOtp.tsx
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authAPI } from "@/utils/api";
import { ArrowRight, RotateCcw } from "lucide-react";

// Mask email like a****z@gmail.com
const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};

// Mask mobile safely
const maskMobile = (mobile: string) => {
  if (!mobile || mobile.length < 4) return mobile;
  return mobile.slice(0, 2) + "*".repeat(mobile.length - 4) + mobile.slice(-2);
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const formData = state?.formData;
  const otpMethod = state?.otpMethod;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shake, setShake] = useState(false);
  const [errorOtp, setErrorOtp] = useState(false);

  // TIMER
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  if (!formData) {
    return <p className="text-center mt-10">Invalid Access</p>;
  }

  // Autofocus first box when page loads
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto move to next input
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 20);
    }
  };

  // Backspace → previous
  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste full OTP
  const handlePaste = (e: any) => {
    const text = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(text)) {
      setOtp(text.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // VERIFY OTP
  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      toast.error("Please enter full 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const payload =
        otpMethod === "mobile"
          ? { mobile: formData.mobile, otp: finalOtp }
          : { email: formData.email, otp: finalOtp };

      const response = await authAPI.verifyOtp(payload);

      if (response.data.success) {
        toast.success("OTP verified!");

        const registerRes = await authAPI.register({
          ...formData,
          class: parseInt(formData.class),
          role: "student",
        });

        if (registerRes.data?.success) {
          toast.success("Account created!");
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");

      setErrorOtp(true);
      setShake(true);

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      setTimeout(() => setShake(false), 400);
      setTimeout(() => setErrorOtp(false), 1500);
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      const payload = {
        email: formData.email,
        mobile: formData.mobile,
        method: otpMethod,
      };

      const res = await authAPI.sendOtp(payload);
      if (res.data.success) {
        toast.success("OTP resent");

        setTimer(30);
        setCanResend(false);
      }
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  // AUTO VERIFY WHEN 6 DIGITS ENTERED
  useEffect(() => {
    const finalOtp = otp.join("");
    if (finalOtp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/10 px-4">
      <div className="p-8 bg-card rounded-2xl shadow-lg max-w-md w-full border">
        <h2 className="text-3xl font-bold mb-3 text-center">Verify OTP</h2>

        <p className="text-muted-foreground text-center mb-6">
          OTP sent to{" "}
          <span className="font-semibold">
            {otpMethod === "mobile"
              ? `+91 ${maskMobile(formData.mobile)}`
              : maskEmail(formData.email)}
          </span>
        </p>

        <p className="text-center text-sm text-muted-foreground mb-4">
          Wrong number?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-primary underline"
          >
            Change mobile number
          </button>
        </p>

        {/* Hidden autofill input */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          onChange={(e) => {
            const code = e.target.value.trim();
            if (/^\d{6}$/.test(code)) {
              setOtp(code.split(""));
              inputRefs.current[5]?.focus();
            }
          }}
        />

        {/* OTP BOXES */}
        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el!)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => {
                const firstEmpty = otp.findIndex((d) => d === "");
                const target = firstEmpty === -1 ? 5 : firstEmpty;
                inputRefs.current[target]?.focus();
              }}
              className={`
                w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none
                transition-all duration-300
                ${errorOtp ? "border-red-500 bg-red-50" : "border"}
                ${shake ? "animate-shake" : ""}
              `}
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        <Button
          className="w-full h-12 text-lg rounded-xl"
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
          {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
        </Button>

        {/* RESEND */}
        <div className="text-center mt-5 text-sm">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="text-primary flex items-center gap-2 mx-auto"
            >
              <RotateCcw size={16} /> Resend OTP
            </button>
          ) : (
            <p className="text-muted-foreground">
              Resend OTP in <strong>{timer}s</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
