import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LanguageContext } from './Components/LanguageContext';
import QuickWorkout from './Pages/QuickWorkout';

export default function App() {
  const [language, setLanguage] = React.useState('hebrew');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <SafeAreaView style={styles.container}>
        <QuickWorkout />
      </SafeAreaView>
    </LanguageContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});