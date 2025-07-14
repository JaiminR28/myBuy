import { useLocalSearchParams } from "expo-router";

const parseValue = (value: string | string[]): unknown => {
  if (Array.isArray(value)) {
    return value.map(parseValue);
  }

  if (value === "true") return true;
  if (value === "false") return false;

  try {
    return JSON.parse(value); // Parses JSON if applicable
  } catch {
    return value; // Returns original value if parsing fails
  }
};

const useParsedLocalParams = () => {
  const params = useLocalSearchParams();

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, parseValue(value)])
  );
};

export default useParsedLocalParams;
