import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
   <Stack
    >
      {/* Optionally configure static options outside the route.*/}
      <Stack.Screen name="index" options={{headerShown : false}} />
    </Stack>
  );
}
