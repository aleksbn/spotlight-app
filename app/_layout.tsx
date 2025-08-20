import InitialLayout from "@/components/InitialLayout";
import { COLORS } from "@/constants/theme";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
