import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Inter_400Regular } from '@expo-google-fonts/inter';

export function useAppFonts() {
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Inter_400Regular,
  });
  return fontsLoaded;
}

export const fonts = {
  heading: 'Montserrat_700Bold',
  body: 'Inter_400Regular'
};