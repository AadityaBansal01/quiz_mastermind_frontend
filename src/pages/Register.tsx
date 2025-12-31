// frontend/src/pages/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Hash,
  ArrowRight,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/utils/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    class: "" as "" | "11" | "12",
    rollNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);


  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // We do NOT call register() here. We only send OTP and move to Verify page.
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.class ||
      !formData.rollNumber
    ) {
      setError("Please fill all required fields.");
      return;
    }

  if (formData.password !== formData.confirmPassword) {
  setError("Passwords do not match.");
  return;
}

    setIsLoading(true);

    try {
      const payload = {
  email: formData.email,
  method: "email",
};

      const res = await authAPI.sendOtp(payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "OTP sent");
        // Navigate to verify page and pass the data
        navigate("/verify-otp", { state: { formData, otpMethod: "email" } });
      } else {
        setError(res?.data?.message || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error("Send OTP error", err);
      setError(
        err?.response?.data?.message || "Failed to send OTP. Check server logs."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="text-center text-primary-foreground relative z-10 max-w-lg">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 animate-float">
            <GraduationCap className="w-14 h-14" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            Start Your Journey
          </h2>
          <p className="text-xl text-white/80">
            Join students mastering mathematics with our quiz platform.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">MathQuiz</span>
          </Link>

          <h1 className="font-display text-3xl font-bold mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-6">
            Sign up to start practicing and improving
          </p>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-12 h-12 rounded-xl"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-12 h-12 rounded-xl"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
  <Label htmlFor="mobile">Mobile Number (optional)</Label>

  <div className="relative">
    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

   <Input
  id="mobile"
  type="tel"
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={10}
  value={formData.mobile}
  onChange={(e) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, mobile: val });
  }}
  className="pl-12 h-12 rounded-xl"
  placeholder="9876543210"
/>

  </div>

  <p className="text-xs text-muted-foreground mt-1">
  Mobile number is optional and used only for profile reference.
</p>
</div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select
                  value={formData.class}
                  onValueChange={(v: "11" | "12") =>
                    setFormData({ ...formData, class: v })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Roll Number</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNumber: e.target.value })
                    }
                    className="pl-12 h-12 rounded-xl"
                    placeholder="001"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-12 pr-12 h-12 rounded-xl"
                  placeholder="Choose a strong password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

          

<div>
  <Label>Confirm Password</Label>
  <div className="relative">
    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
    <Input
      type={showPassword ? "text" : "password"}
      value={formData.confirmPassword}
      onChange={(e) =>
        setFormData({ ...formData, confirmPassword: e.target.value })
      }
      className="pl-12 pr-12 h-12 rounded-xl"
      placeholder="Re-enter password"
      required
    />
  </div>
</div>

  {/* OTP method */}
            <p className="text-sm text-muted-foreground mt-2">
              OTP will be sent once to verify your email address.
            </p>


            <Button
              type="submit"
              className="w-full btn-gradient h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                "Sending OTP..."
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
