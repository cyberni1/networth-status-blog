import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Vibration,
  ScrollView,
} from 'react-native';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ButtonConfig {
  id: string;
  label: string;
  soundUri: string | null;
  color: string;
  emoji: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const NUM_COLS = 3;
const BUTTON_SIZE = Math.floor((width - 48) / NUM_COLS);

const COLORS = [
  '#E74C3C', '#C0392B', '#E67E22', '#D35400',
  '#F1C40F', '#F39C12', '#27AE60', '#2ECC71',
  '#16A085', '#3498DB', '#8E44AD', '#E91E63',
  '#1ABC9C', '#2980B9', '#9B59B6', '#C2185B',
];

const EMOJIS = [
  '🔊', '🎵', '😂', '💥', '🚀', '🎤',
  '👏', '🔔', '⚡', '🔥', '💯', '🎉',
  '😎', '🤣', '💀', '🎸', '🥁', '🎺',
  '👋', '🤙', '💪', '🎮', '📣', '🌊',
];

const STORAGE_KEY = '@soundboard_v1';
const SOUNDS_DIR = FileSystem.documentDirectory + 'sounds/';
const NUM_BUTTONS = 12;

const createDefaults = (): ButtonConfig[] =>
  Array.from({ length: NUM_BUTTONS }, (_, i) => ({
    id: `btn_${i}`,
    label: `Sound ${i + 1}`,
    soundUri: null,
    color: COLORS[i % COLORS.length],
    emoji: '🔊',
  }));

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [buttons, setButtons] = useState<ButtonConfig[]>(createDefaults());
  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setupAudio();
    ensureSoundsDir();
    loadButtons();
  }, []);

  // ── Audio Setup (critical for TikTok Live + WhatsApp)  ──────────────────
  // MixWithOthers: App kann Audio abspielen während TikTok/WhatsApp Mikrofon nutzt
  // staysActiveInBackground: Sound spielt auch wenn App im Hintergrund ist
  // playsInSilentModeIOS: Sound spielt auch bei eingeschaltetem Stummschalten
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        shouldDuckAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.error('Audio setup error:', e);
    }
  };

  const ensureSoundsDir = async () => {
    const info = await FileSystem.getInfoAsync(SOUNDS_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(SOUNDS_DIR, { intermediates: true });
    }
  };

  const loadButtons = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setButtons(JSON.parse(stored));
    } catch (e) {
      console.error('Load error:', e);
    }
  };

  const saveButtons = async (updated: ButtonConfig[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  // ── Playback ─────────────────────────────────────────────────────────────

  const stopCurrent = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setPlayingId(null);
  };

  const playSound = async (button: ButtonConfig) => {
    if (!button.soundUri) {
      Alert.alert('Kein Sound', 'Halte den Button lang gedrückt um einen Sound hinzuzufügen.', [
        { text: 'OK' },
      ]);
      return;
    }

    // Toggle: nochmal tippen stoppt den Sound
    if (playingId === button.id) {
      await stopCurrent();
      return;
    }

    await stopCurrent();

    try {
      Vibration.vibrate(40);
      const { sound } = await Audio.Sound.createAsync(
        { uri: button.soundUri },
        { shouldPlay: true, volume: 1.0 }
      );
      soundRef.current = sound;
      setPlayingId(button.id);

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          setPlayingId(null);
        }
      });
    } catch (e) {
      console.error('Play error:', e);
      Alert.alert('Fehler', 'Sound konnte nicht abgespielt werden.');
      setPlayingId(null);
    }
  };

  // ── Edit Modal ───────────────────────────────────────────────────────────

  const openEdit = (button: ButtonConfig) => {
    Vibration.vibrate([0, 40, 60, 40]);
    setEditingButton({ ...button });
    setEditLabel(button.label);
    setEditColor(button.color);
    setEditEmoji(button.emoji);
  };

  const pickSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      const destPath = SOUNDS_DIR + editingButton!.id + '_' + Date.now();

      // Alten Sound löschen wenn vorhanden
      if (editingButton?.soundUri) {
        await FileSystem.deleteAsync(editingButton.soundUri, { idempotent: true }).catch(() => {});
      }

      await FileSystem.copyAsync({ from: file.uri, to: destPath });
      setEditingButton(prev => (prev ? { ...prev, soundUri: destPath } : null));
    } catch (e) {
      console.error('Pick error:', e);
      Alert.alert('Fehler', 'Datei konnte nicht ausgewählt werden.');
    }
  };

  const removeSound = () => {
    Alert.alert('Sound entfernen', 'Den Sound wirklich entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen',
        style: 'destructive',
        onPress: async () => {
          if (editingButton?.soundUri) {
            await FileSystem.deleteAsync(editingButton.soundUri, { idempotent: true }).catch(() => {});
          }
          setEditingButton(prev => (prev ? { ...prev, soundUri: null } : null));
        },
      },
    ]);
  };

  const saveEdit = async () => {
    if (!editingButton) return;
    const updated: ButtonConfig = {
      ...editingButton,
      label: editLabel.trim() || `Sound`,
      color: editColor,
      emoji: editEmoji,
    };
    const newButtons = buttons.map(b => (b.id === updated.id ? updated : b));
    setButtons(newButtons);
    await saveButtons(newButtons);
    setEditingButton(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const renderButton = ({ item }: { item: ButtonConfig }) => {
    const isPlaying = playingId === item.id;
    const hasSound = !!item.soundUri;

    return (
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: item.color },
          !hasSound && styles.buttonEmpty,
          isPlaying && styles.buttonPlaying,
        ]}
        onPress={() => playSound(item)}
        onLongPress={() => openEdit(item)}
        delayLongPress={400}
        activeOpacity={0.75}
      >
        <Text style={styles.buttonEmoji}>{item.emoji}</Text>
        <Text style={styles.buttonLabel} numberOfLines={2}>
          {item.label}
        </Text>
        {isPlaying && <View style={styles.playingIndicator} />}
        {!hasSound && <Text style={styles.plusSign}>+</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎛️ Soundboard</Text>
        <Text style={styles.headerSub}>Tippen = abspielen  •  Gedrückt halten = bearbeiten</Text>
      </View>

      {/* Stop-Button (nur sichtbar wenn Sound läuft) */}
      {playingId && (
        <TouchableOpacity style={styles.stopBar} onPress={stopCurrent} activeOpacity={0.8}>
          <Text style={styles.stopBarText}>⏹  Sound stoppen</Text>
        </TouchableOpacity>
      )}

      {/* Button-Grid */}
      <FlatList
        data={buttons}
        renderItem={renderButton}
        keyExtractor={item => item.id}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
      />

      {/* Info-Hinweis */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          💡 TikTok Live starten → zu dieser App wechseln → Button drücken
        </Text>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={!!editingButton}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingButton(null)}
      >
        <SafeAreaView style={styles.modal}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingButton(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.modalCancel}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Button bearbeiten</Text>
            <TouchableOpacity onPress={saveEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.modalSave}>Speichern</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* Vorschau */}
            <View style={styles.previewRow}>
              <View style={[styles.previewButton, { backgroundColor: editColor }]}>
                <Text style={styles.buttonEmoji}>{editEmoji}</Text>
                <Text style={styles.buttonLabel} numberOfLines={2}>{editLabel || 'Sound'}</Text>
              </View>
            </View>

            {/* Name */}
            <Text style={styles.sectionLabel}>NAME</Text>
            <TextInput
              style={styles.textInput}
              value={editLabel}
              onChangeText={setEditLabel}
              placeholder="Button-Name"
              placeholderTextColor="#555577"
              maxLength={20}
              returnKeyType="done"
            />

            {/* Sound */}
            <Text style={styles.sectionLabel}>SOUND</Text>
            <TouchableOpacity style={styles.soundPickerBtn} onPress={pickSound} activeOpacity={0.7}>
              <Text style={styles.soundPickerText}>
                {editingButton?.soundUri ? '✅  Sound ausgewählt – antippen zum Ändern' : '📁  Sound auswählen (MP3, WAV, M4A …)'}
              </Text>
            </TouchableOpacity>
            {editingButton?.soundUri && (
              <TouchableOpacity style={styles.removeSoundBtn} onPress={removeSound}>
                <Text style={styles.removeSoundText}>🗑  Sound entfernen</Text>
              </TouchableOpacity>
            )}

            {/* Emoji */}
            <Text style={styles.sectionLabel}>ICON</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiCell, editEmoji === e && styles.emojiCellSelected]}
                  onPress={() => setEditEmoji(e)}
                >
                  <Text style={styles.emojiCellText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Farbe */}
            <Text style={styles.sectionLabel}>FARBE</Text>
            <View style={styles.colorGrid}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCell,
                    { backgroundColor: c },
                    editColor === c && styles.colorCellSelected,
                  ]}
                  onPress={() => setEditColor(c)}
                />
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },

  // Header
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D4E',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#666688',
    marginTop: 3,
  },

  // Stop bar
  stopBar: {
    marginHorizontal: 12,
    marginTop: 10,
    paddingVertical: 11,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    alignItems: 'center',
  },
  stopBarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // Grid
  grid: {
    padding: 8,
    paddingTop: 12,
  },

  // Button
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    margin: 6,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonEmpty: {
    opacity: 0.45,
    borderWidth: 2,
    borderColor: '#FFFFFF30',
    borderStyle: 'dashed',
  },
  buttonPlaying: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 0.94 }],
  },
  buttonEmoji: {
    fontSize: 28,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: '#00000050',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playingIndicator: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  plusSign: {
    position: 'absolute',
    top: 5,
    right: 10,
    fontSize: 20,
    color: '#FFFFFF50',
    fontWeight: '300',
  },

  // Info bar
  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D2D4E',
  },
  infoText: {
    fontSize: 11,
    color: '#555577',
    textAlign: 'center',
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D4E',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCancel: {
    color: '#888899',
    fontSize: 16,
  },
  modalSave: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Preview
  previewRow: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  previewButton: {
    width: 100,
    height: 100,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  // Sections
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555577',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 20,
  },

  // Text input
  textInput: {
    backgroundColor: '#2D2D4E',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },

  // Sound picker
  soundPickerBtn: {
    backgroundColor: '#2D2D4E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  soundPickerText: {
    color: '#CCCCDD',
    fontSize: 15,
  },
  removeSoundBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  removeSoundText: {
    color: '#E74C3C',
    fontSize: 14,
  },

  // Emoji grid
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiCell: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 3,
    backgroundColor: '#2D2D4E',
  },
  emojiCellSelected: {
    backgroundColor: '#3498DB',
  },
  emojiCellText: {
    fontSize: 26,
  },

  // Color grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 5,
  },
  colorCellSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
});
