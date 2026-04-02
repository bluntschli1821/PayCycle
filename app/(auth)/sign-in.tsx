import { useAnalytics, useIdentifyUser } from "@/lib/analytics";
import {
  calculatePasswordStrength,
  MIN_PASSWORD_LEN,
} from "@/lib/passwordStrength";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import PayCycleLogo from "../../components/PayCycleLogo";

// Helper function to extract user-friendly error messages from Clerk
const extractClerkErrorMessage = (error: any): string => {
  try {
    if (
      error?.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      const clerkError = error.errors[0];

      // Handle specific error types
      if (clerkError.message?.includes("credentials")) {
        return "Invalid email or password. Please try again.";
      } else if (clerkError.message?.includes("password")) {
        return "Password does not meet security requirements. Please try a different password.";
      } else if (clerkError.message?.includes("breached")) {
        return "This password has been found in a data breach. Please choose a different password.";
      } else if (clerkError.code === "form_password_pwned") {
        return "This password has appeared in previous data breaches. Please choose a different password.";
      } else if (clerkError.message) {
        return clerkError.message;
      }
    }
    return error?.message || "An error occurred. Please try again.";
  } catch {
    return "An unexpected error occurred. Please try again.";
  }
};

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const trackEvent = useAnalytics();
  const identifyUser = useIdentifyUser();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [showWeakPasswordWarning, setShowWeakPasswordWarning] =
    React.useState(false);
  const [proceedWithWeakPassword, setProceedWithWeakPassword] =
    React.useState(false);

  const passwordStrength = calculatePasswordStrength(password);

  // Debug: Log sign-in status changes
  React.useEffect(() => {
    console.log("Sign-in status changed:", {
      status: signIn?.status,
      supportedFactorCount: signIn?.supportedSecondFactors?.length || 0,
    });
  }, [signIn]);

  const handleSubmitWithPassword = async () => {
    setErrorMessage("");

    try {
      console.log("Attempting sign-in with email:", emailAddress);
      const { error } = await signIn.password({
        emailAddress,
        password,
      });

      if (error) {
        const errorMsg = extractClerkErrorMessage(error);
        setErrorMessage(errorMsg);
        console.error("Sign-in error:", JSON.stringify(error, null, 2));

        // Track sign-in failure
        trackEvent("user_sign_in_failed", {
          email: emailAddress,
          error_message: errorMsg,
          error_code: (error as any)?.errors?.[0]?.code || "unknown",
        });

        return;
      }

      console.log("Sign-in result:", {
        status: signIn.status,
      });

      // Handle different sign-in statuses
      if (signIn.status === "complete") {
        console.log("Sign-in complete, finalizing");

        // Track successful login
        trackEvent("user_logged_in", {
          email: emailAddress,
          mfaUsed: false,
        });

        // Identify user for future tracking
        identifyUser(emailAddress, {
          email: emailAddress,
          last_login: new Date().toISOString(),
        });

        await signIn.finalize();
        router.replace("/(tabs)" as Href);
      } else if (signIn.status === "needs_second_factor") {
        console.log("MFA required");
        setIsVerifying(true);
      } else if (signIn.status === "needs_client_trust") {
        console.log("Client trust needed, sending email code");
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
          setIsVerifying(true);
        }
      } else {
        console.error("Unexpected sign-in status:", signIn.status);
        setErrorMessage(
          "Sign-in failed. Account may not have been created yet. Please create an account first.",
        );
      }
    } catch (error) {
      console.error("Sign-in error:", JSON.stringify(error, null, 2));
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    // Show weak password warning if password is weak but minimum length met
    if (
      passwordStrength.level === "weak" &&
      password.length >= MIN_PASSWORD_LEN &&
      !proceedWithWeakPassword
    ) {
      setShowWeakPasswordWarning(true);
      return;
    }

    await handleSubmitWithPassword();
  };

  const handleVerify = async () => {
    setErrorMessage("");

    try {
      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/(tabs)" as Href);
      } else {
        console.error("Sign-in attempt not complete:", signIn);
        setErrorMessage("Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", JSON.stringify(error, null, 2));
      setErrorMessage("Invalid verification code. Please try again.");
    }
  };

  if (isVerifying && signIn.status === "needs_client_trust") {
    return (
      <View className="flex-1 bg-yellow-50">
        <ScrollView contentContainerClassName="flex-grow justify-center px-5 py-10">
          <View className="gap-8">
            {/* Header Section */}
            <View className="gap-3 items-center">
              <PayCycleLogo size="medium" showText={false} />
              <Text className="text-2xl font-bold text-center text-slate-900">
                Verify Your Account
              </Text>
              <Text className="text-sm text-slate-600 text-center">
                We&apos;ve sent a verification code to your email
              </Text>
            </View>

            {/* Verification Card */}
            <View className="bg-white rounded-3xl p-6 gap-4">
              {/* Error Message Display */}
              {errorMessage ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <Text className="text-red-700 text-sm font-semibold">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <Text className="text-sm font-semibold text-slate-900">
                Enter Code
              </Text>
              <TextInput
                className="border border-yellow-200 rounded-xl p-4 text-base bg-yellow-50 font-mono"
                value={code}
                placeholder="000000"
                placeholderTextColor="#a0a0a0"
                onChangeText={(code) => {
                  setCode(code.replace(/[^0-9]/g, ""));
                  if (errorMessage) setErrorMessage("");
                }}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Pressable
                className={`rounded-xl items-center py-4 px-6 ${
                  !code || fetchStatus === "fetching"
                    ? "opacity-50"
                    : "opacity-100"
                } active:opacity-80`}
                style={{ backgroundColor: "#E07856" }}
                onPress={handleVerify}
                disabled={!code || fetchStatus === "fetching"}
              >
                {fetchStatus === "fetching" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Verify
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="rounded-xl items-center py-3 px-6 active:opacity-70"
                onPress={() => signIn.mfa.sendEmailCode()}
              >
                <Text className="text-orange-500 font-semibold text-sm">
                  Resend code
                </Text>
              </Pressable>

              <Pressable
                className="rounded-xl items-center py-3 px-6 active:opacity-70"
                onPress={() => {
                  setIsVerifying(false);
                  setCode("");
                }}
              >
                <Text className="text-slate-600 font-semibold text-sm">
                  Back to sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-yellow-50">
      <ScrollView contentContainerClassName="flex-grow justify-center px-5 py-10">
        <View className="gap-8">
          {/* Header Section with Logo */}
          <View className="gap-4 items-center">
            <PayCycleLogo size="medium" />
            <View className="gap-2 items-center">
              <Text className="text-2xl font-bold text-center text-slate-900">
                Welcome back
              </Text>
              <Text className="text-sm text-center text-slate-600">
                Sign in to continue managing your subscriptions
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6 gap-5">
            {/* Error Message Display */}
            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-700 text-sm font-semibold">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-slate-900">
                Email
              </Text>
              <TextInput
                className="border border-yellow-200 rounded-xl p-4 text-base bg-yellow-50"
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter your email"
                placeholderTextColor="#a0a0a0"
                onChangeText={(email) => {
                  setEmailAddress(email);
                  if (errorMessage) setErrorMessage("");
                }}
                keyboardType="email-address"
              />
            </View>

            {/* Password Field with Toggle */}
            <View className="gap-2">
              <Text className="text-base font-semibold text-slate-900">
                Password
              </Text>
              <View className="flex-row items-center border border-yellow-200 rounded-xl bg-yellow-50 px-4">
                <TextInput
                  className="flex-1 p-4 text-base"
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#a0a0a0"
                  secureTextEntry={!showPassword}
                  onChangeText={(pwd) => {
                    setPassword(pwd);
                    if (errorMessage) setErrorMessage("");
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </Pressable>
              </View>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View className="gap-2">
                  <View className="gap-1">
                    <View className="flex-row gap-1 h-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <View
                          key={i}
                          className="flex-1 rounded-full"
                          style={{
                            backgroundColor:
                              i < passwordStrength.score
                                ? passwordStrength.color
                                : "#e5e7eb",
                          }}
                        />
                      ))}
                    </View>
                  </View>
                  <Text
                    className="text-xs"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.message}
                  </Text>
                </View>
              )}

              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <View className="bg-slate-50 rounded-xl p-4 gap-2">
                  <Text className="text-xs font-semibold text-slate-900">
                    Password Requirements:
                  </Text>
                  {passwordStrength.requirements.map((req, idx) => (
                    <View key={idx} className="flex-row items-center gap-2">
                      <Ionicons
                        name={req.met ? "checkmark-circle" : "ellipse-outline"}
                        size={16}
                        color={req.met ? "#16a34a" : "#9ca3af"}
                      />
                      <Text
                        className={`text-xs ${
                          req.met ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {req.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Sign In Button */}
            <Pressable
              className={`rounded-xl items-center py-4 px-6 ${
                !emailAddress ||
                !passwordStrength.isValid ||
                fetchStatus === "fetching"
                  ? "opacity-50"
                  : "opacity-100"
              } active:opacity-80`}
              style={{ backgroundColor: "#E07856" }}
              onPress={handleSubmit}
              disabled={
                !emailAddress ||
                !passwordStrength.isValid ||
                fetchStatus === "fetching"
              }
            >
              {fetchStatus === "fetching" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Sign in
                </Text>
              )}
            </Pressable>

            {/* Sign Up Link */}
            <View className="flex-row gap-1 justify-center items-center">
              <Text className="text-slate-700">New to PayCycle? </Text>
              <Link href="/sign-up">
                <Text className="text-orange-500 font-semibold">
                  Create an account
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Weak Password Warning Modal */}
      <Modal
        visible={showWeakPasswordWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWeakPasswordWarning(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl p-6 gap-4 w-full">
            {/* Header */}
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text className="text-xl font-bold text-slate-900">
                  Weak Password
                </Text>
              </View>
              <Text className="text-sm text-slate-600">
                Your password doesn&apos;t meet all security requirements and
                may be vulnerable to attacks.
              </Text>
            </View>

            {/* Requirements Checklist */}
            <View className="bg-red-50 rounded-xl p-4 gap-2">
              <Text className="text-xs font-semibold text-red-900">
                Missing requirements:
              </Text>
              {passwordStrength.requirements
                .filter((req) => !req.met)
                .map((req, idx) => (
                  <View key={idx} className="flex-row items-start gap-2">
                    <View className="mt-0.5">
                      <Ionicons name="close-circle" size={14} color="#dc2626" />
                    </View>
                    <Text className="text-xs text-red-900 flex-1">
                      {req.label}
                    </Text>
                  </View>
                ))}
            </View>

            {/* Risk Warning */}
            <View className="bg-orange-50 rounded-xl p-3 gap-1">
              <Text className="text-xs font-semibold text-orange-900">
                ⚠️ Security Risk
              </Text>
              <Text className="text-xs text-orange-800">
                Weak passwords can be cracked easily. Consider using a stronger
                password that meets all requirements.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-2">
              <Pressable
                className="rounded-xl items-center py-3 px-6 active:opacity-80 border border-orange-500"
                onPress={() => {
                  setShowWeakPasswordWarning(false);
                  setPassword("");
                }}
              >
                <Text className="text-orange-600 font-semibold text-base">
                  Use Different Password
                </Text>
              </Pressable>

              <Pressable
                className="rounded-xl items-center py-3 px-6 active:opacity-80"
                style={{ backgroundColor: "#E07856" }}
                onPress={async () => {
                  setProceedWithWeakPassword(true);
                  setShowWeakPasswordWarning(false);
                  // Retry submission with weak password accepted
                  await handleSubmitWithPassword();
                }}
              >
                <Text className="text-white font-semibold text-base">
                  Use Anyway
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View nativeID="clerk-captcha" />
    </View>
  );
}
