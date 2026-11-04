import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function () {
  return (
    <Pressable onPress={() => router.back()}>
      <Text style={{ textAlign: "center" }}>Keluar</Text>
    </Pressable>
  );
}
