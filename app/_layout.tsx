import React from "react";
import "@/globals.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
