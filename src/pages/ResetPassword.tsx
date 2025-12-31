import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/utils/api";

export default function ResetPassword() {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 if (!email) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="mb-4">Session expired. Please start again.</p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="text-primary underline"
        >
          Go to Forgot Password
        </button>
      </div>
    </div>
  );
}

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email,
        otp,
        newPassword: password,
      });

      if (res.data.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 border rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Reset Password
        </h2>

        <Label>OTP</Label>
        <Input
          className="mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />

        <Label>New Password</Label>
        <div className="relative mb-6">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <Input
            type="password"
            className="pl-10 h-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
          />
        </div>

        <Button className="w-full h-12" onClick={handleReset} disabled={loading}>
          Reset Password
        </Button>
      </div>
    </div>
  );
}
