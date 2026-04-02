import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import PayCycleLogo from "../../components/PayCycleLogo";
import {
    calculatePasswordStrength,
    MIN_PASSWORD_LEN,
} from "../../lib/passwordStrength";

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
      if (clerkError.message?.includes("breached")) {
        return "This password has been found in a data breach. Please choose a stronger, unique password.";
      } else if (
        clerkError.message?.includes("too weak") ||
        clerkError.message?.includes("weak password")
      ) {
        return "Password is too weak. Please use at least 8 characters with a mix of uppercase, lowercase, and numbers.";
      } else if (clerkError.message?.includes("password")) {
        return (
          clerkError.message || "Password does not meet security requirements."
        );
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

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [showWeakPasswordWarning, setShowWeakPasswordWarning] =
    React.useState(false);
  const [proceedWithWeakPassword, setProceedWithWeakPassword] =
    React.useState(false);

  const passwordStrength = calculatePasswordStrength(password);

  // Debug: Log sign-up status changes
  React.useEffect(() => {
    console.log("Sign-up status changed:", {
      status: signUp?.status,
      unverifiedFields: signUp?.unverifiedFields,
      missingFields: signUp?.missingFields,
      createdUserId: (signUp as any)?.createdUserId,
    });
  }, [signUp]);

  const handleSubmitWithWeakPassword = async () => {
    setErrorMessage("");

    try {
      console.log("Starting sign-up with email:", emailAddress);
      const { error } = await signUp.password({
        emailAddress,
        password,
      });

      if (error) {
        const errorMsg = extractClerkErrorMessage(error);
        setErrorMessage(errorMsg);
        console.error("Sign-up error:", JSON.stringify(error, null, 2));
        return;
      }

      console.log("Account creation successful, status:", signUp.status);
      console.log("Unverified fields:", signUp.unverifiedFields);

      // If password call succeeded, proceed to send email verification code
      console.log("Sending email verification code...");
      try {
        await signUp.verifications.sendEmailCode();
        console.log("Email code sent successfully");
      } catch (emailErr) {
        console.error(
          "Failed to send email code:",
          JSON.stringify(emailErr, null, 2),
        );
        setErrorMessage("Failed to send verification code. Please try again.");
        return;
      }
    } catch (err) {
      console.error("Sign-up error:", JSON.stringify(err, null, 2));
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

    await handleSubmitWithWeakPassword();
  };

  const handleVerify = async () => {
    setErrorMessage("");

    try {
      console.log("Verifying email code:", {
        signUpStatus: signUp.status,
        unverifiedFields: signUp.unverifiedFields,
      });

      const verifyResult = await signUp.verifications.verifyEmailCode({
        code,
      });

      console.log("Email verification returned:", {
        verification: verifyResult,
        signUpStatusAfter: signUp.status,
        unverifiedFieldsAfter: signUp.unverifiedFields,
      });

      // Check if verification actually succeeded
      if (!verifyResult || verifyResult.error) {
        console.error("Verification failed:", verifyResult?.error);
        setErrorMessage("Invalid verification code. Please try again.");
        return;
      }

      // Wait a moment for state to update, then check status
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("After delay, current signUp status:", {
        status: signUp.status,
        unverifiedFields: signUp.unverifiedFields,
      });

      // Only finalize if sign-up is actually complete
      if (signUp.status === "complete") {
        console.log("Sign-up complete, finalizing");
        try {
          await signUp.finalize();
          console.log("Sign-up finalized, redirecting to home");
          router.replace("/(tabs)" as Href);
        } catch (finalizeError) {
          console.error(
            "Finalize error:",
            JSON.stringify(finalizeError, null, 2),
          );
          setErrorMessage("Sign-up completion failed. Please try again.");
        }
      } else {
        console.error("Sign-up not complete. Status:", signUp.status);
        console.error("Unverified fields:", signUp.unverifiedFields);
        console.error("Missing fields:", signUp.missingFields);
        setErrorMessage(
          "Email verification processed, but sign-up is incomplete. Please check your information and try again.",
        );
      }
    } catch (error) {
      console.error("Verification error:", JSON.stringify(error, null, 2));
      setErrorMessage(
        "An error occurred during verification. Please try again.",
      );
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // Show verification screen if email needs to be verified
  if (signUp.unverifiedFields.includes("email_address")) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5 py-10"
          className="flex-1 bg-yellow-50"
        >
          <View className="gap-8">
            {/* Header Section */}
            <View className="gap-3 items-center">
              <PayCycleLogo size="medium" showText={false} />
              <Text className="text-2xl font-bold text-center text-slate-900">
                Verify Your Email
              </Text>
              <Text className="text-sm text-slate-600 text-center">
                We&apos;ve sent a verification code to{"\n"}
                <Text className="font-semibold">{emailAddress}</Text>
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
                    Verify Email
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="rounded-xl items-center py-3 px-6 active:opacity-70"
                onPress={() => signUp.verifications.sendEmailCode()}
              >
                <Text className="text-orange-500 font-semibold text-sm">
                  Resend code
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-5 py-10"
        className="flex-1 bg-yellow-50"
      >
        <View className="gap-8">
          {/* Header Section with Logo */}
          <View className="gap-4 items-center">
            <PayCycleLogo size="medium" />
            <View className="gap-2 items-center">
              <Text className="text-2xl font-bold text-center text-slate-900">
                Create an account
              </Text>
              <Text className="text-sm text-center text-slate-600">
                Join PayCycle to start managing your subscriptions
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

            {/* Password Field with Strength Indicator */}
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

              <Text className="text-xs text-slate-500">
                Minimum {MIN_PASSWORD_LEN} characters required
              </Text>
            </View>

            {/* Sign Up Button */}
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
                  Create Account
                </Text>
              )}
            </Pressable>

            {/* Sign In Link */}
            <View className="flex-row gap-1 justify-center items-center">
              <Text className="text-slate-700">Already have an account? </Text>
              <Link href="/sign-in">
                <Text className="text-orange-500 font-semibold">Sign in</Text>
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
                  await handleSubmitWithWeakPassword();
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
    </KeyboardAvoidingView>
  );
}
