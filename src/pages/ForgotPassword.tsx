import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.sendOtp({
        email,
        method: "email",
        purpose: "reset-password",
      });

      if (res.data.success) {
        toast.success("OTP sent to your email");
        navigate("/reset-password", { state: { email } });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSendOtp}
        className="w-full max-w-md p-8 border rounded-xl shadow"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Forgot Password
        </h2>

        <Label>Email</Label>
        <div className="relative mb-6">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            className="pl-10 h-12"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button className="w-full h-12" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
