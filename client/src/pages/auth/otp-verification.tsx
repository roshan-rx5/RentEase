import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface OtpVerificationProps {
  userId: string;
  email: string;
  purpose: 'login' | 'signup';
  onVerified: (user: any) => void;
}

export function OtpVerification({ userId, email, purpose, onVerified }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 4-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest('/api/auth/verify-otp', 'POST', {
        userId,
        otp,
        purpose
      });

      if (result.isVerified) {
        toast({
          title: "Verification Successful",
          description: result.message,
        });
        
        onVerified(result);
        
        // Redirect based on purpose
        if (purpose === 'login') {
          if (result.role === 'admin') {
            setLocation('/admin/dashboard');
          } else {
            setLocation('/customer/catalog');
          }
        } else {
          setLocation('/auth/login');
        }
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
      setOtp(""); // Clear OTP on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await apiRequest('/api/auth/resend-otp', 'POST', {
        userId,
        purpose
      });

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email",
      });
      
      setTimeLeft(300); // Reset timer
      setOtp(""); // Clear current OTP
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Account</CardTitle>
          <CardDescription>
            We've sent a 4-digit verification code to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                Enter verification code
              </label>
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={4}
                pattern="^[0-9]+$"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || otp.length !== 4}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Code expires in: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span>
            </p>
            
            <div className="text-sm">
              <span className="text-gray-600">Didn't receive the code? </span>
              <Button
                variant="link"
                onClick={handleResendOtp}
                disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
                className="p-0 h-auto font-medium"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </Button>
            </div>
            
            {timeLeft > 240 && (
              <p className="text-xs text-gray-500">
                You can resend the code in {formatTime(timeLeft - 240)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}