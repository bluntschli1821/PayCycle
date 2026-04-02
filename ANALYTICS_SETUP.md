# PostHog Analytics Setup Guide

## ✅ Installation Complete

PostHog is now fully integrated into your Paycycle app with automatic event tracking and user identification.

### What Was Installed

1. **PostHog SDK Packages**
   - `posthog-react-native` - Main analytics SDK
   - `expo-file-system` - File storage for analytics
   - `expo-application` - App context
   - `expo-device` - Device information
   - `expo-localization` - Location/language data

2. **Root Layout Integration** (`app/_layout.tsx`)
   - PostHogProvider wraps the entire app inside ClerkProvider
   - Autocapture enabled for automatic event tracking
   - Safe configuration that disables if API key is missing

3. **Analytics Utilities** (`lib/analytics.ts`)
   - `useAnalytics()` - Track custom events
   - `useIdentifyUser()` - Identify users with properties
   - `useTrackScreen()` - Track screen views
   - `useRegisterProperties()` - Set super properties
   - `useResetAnalytics()` - Clear user data (logout)

4. **Event Tracking Integration**
   - **Sign Up**: Tracks `user_signed_up` event with email and password strength
   - **Sign In**: Tracks `user_logged_in` event with email and MFA status
   - **Logout**: Clears analytics data via `useResetAnalytics()`
   - **Auto-tracking**: Screen views and interactions tracked automatically

---

## 📋 Configuration Required

### Step 1: Get Your PostHog API Key

1. Go to [PostHog Dashboard](https://app.posthog.com)
2. Create a new project or select existing one
3. Navigate to Settings → Project Settings
4. Copy your **Project API Key** (format: `phc_XXXXXXXXXXXXX...`)

### Step 2: Update `.env`

Replace the placeholder in `.env`:

```diff
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

- EXPO_PUBLIC_POSTHOG_API_KEY=phc_YOUR_API_KEY_HERE
+ EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_actual_key_here

EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Step 3: Test Analytics

1. Run your app
2. Complete signup/login flow
3. Open PostHog dashboard
4. Check **Events** section to see tracked events

---

## 🎯 Automatic Event Tracking

### Autocapture Events (No Code Required)

PostHog automatically tracks:
- ✅ App lifecycle (opened, backgrounded, resumed)
- ✅ Screen navigation (auto-tracked via Expo Router)
- ✅ Button taps and touch interactions
- ✅ Screen view duration
- ✅ User properties (email from Clerk)

### Manual Event Examples

Already implemented:

```tsx
// In sign-up flow
trackEvent("user_signed_up", {
  email: emailAddress,
  passwordStrength: passwordStrength.level,
});

// In sign-in flow
trackEvent("user_logged_in", {
  email: emailAddress,
  mfaUsed: false,
});

// Identify user for all future events
identifyUser(emailAddress, {
  email: emailAddress,
  signup_date: new Date().toISOString(),
});
```

---

## 🛠️ Usage Examples

### Track Custom Events

```tsx
import { useAnalytics } from '@/lib/analytics';

export default function SubscriptionCard() {
  const trackEvent = useAnalytics();
  
  const handleSubscriptionClick = () => {
    trackEvent('subscription_viewed', {
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      price: subscription.price,
    });
  };
  
  return <Pressable onPress={handleSubscriptionClick} />;
}
```

### Identify User with Properties

```tsx
import { useIdentifyUser } from '@/lib/analytics';

const identifyUser = useIdentifyUser();

identifyUser('user@example.com', {
  firstName: 'John',
  lastName: 'Doe',
  plan: 'premium',
  signup_date: '2024-01-15',
});
```

### Track Screen Views

```tsx
import { useTrackScreen } from '@/lib/analytics';

useEffect(() => {
  const trackScreen = useTrackScreen();
  trackScreen('subscriptions_detail', {
    subscriptionId: id,
  });
}, [id]);
```

### Register Super Properties

```tsx
import { useRegisterProperties } from '@/lib/analytics';

const registerProperties = useRegisterProperties();

// These will be sent with EVERY event
registerProperties({
  app_version: '1.0.0',
  environment: 'production',
  region: 'us-east-1',
});
```

### Reset on Logout

```tsx
import { useResetAnalytics } from '@/lib/analytics';

const handleLogout = async () => {
  const resetAnalytics = useResetAnalytics();
  await signOut();
  resetAnalytics(); // Clear user data
  router.replace("/sign-in");
};
```

---

## 📊 What You'll See in PostHog

### Events Tab
- User signup events with email and password strength
- User login events with MFA status
- Screen view events (auto-tracked)
- Touch/tap events (auto-tracked)
- Custom events you track

### Users Tab
- Email addresses (identified from Clerk)
- Signup date
- Last login
- Custom properties
- User journey timeline

### Insights Tab
- Conversion funnels (signup → login)
- User retention analysis
- Feature usage patterns
- Cohort analysis

---

## 🔒 Privacy & Security

- PostHog is **disabled** if API key is not configured (safe for development)
- Only non-sensitive data is tracked (emails, events, timestamps)
- Password strength level tracked, never the actual password
- User IDs are email addresses (can be updated to Clerk user IDs)
- GDPR compliant with data retention settings

---

## 🚀 Next Steps

1. ✅ Add your PostHog API key to `.env`
2. ✅ Run the app and test signup/login flow
3. ✅ Verify events appear in PostHog dashboard
4. 📈 Monitor user behavior and conversion metrics
5. 🎯 Add custom events for business metrics (e.g., subscription created)
6. 🔧 Set up alerts for unusual patterns

---

## 📚 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [React Native SDK Guide](https://posthog.com/docs/libraries/react-native)
- [Event Tracking Best Practices](https://posthog.com/docs/product-analytics/event-tracking)
- [Clerk Documentation](https://clerk.com/docs)

---

## ❓ Troubleshooting

### Events Not Appearing

1. **Check API key**: Verify `EXPO_PUBLIC_POSTHOG_API_KEY` is set in `.env`
2. **Check network**: Ensure app has internet access
3. **Check logs**: Look for warning messages in console about PostHog configuration
4. **Reload app**: Full app reload may be needed after `.env` changes

### Too Many Events

- Autocapture may track more than needed
- Filter events in PostHog dashboard's Settings → Ingestion Filters
- Or adjust autocapture settings in `app/_layout.tsx`

### User Not Identified

- Call `identifyUser()` with email after login
- Already implemented in `sign-up.tsx` and `sign-in.tsx`
- Check PostHog dashboard for user properties

---

**Ready to track user behavior! 🎉**
