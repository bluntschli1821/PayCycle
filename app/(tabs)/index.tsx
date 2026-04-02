//import "@/globals.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView as MYSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(MYSafeAreaView);
export default function App() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-7xl font-sans-extrabold ">Home</Text>
      <Text className="text-7xl font-bold ">Welcome to Nativewind!</Text>
    </SafeAreaView>
  );
}
