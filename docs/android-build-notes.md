# Android Build Notes

Stand: 2026-04-09

## Kontext

Die App nutzt `react-native-tcp-socket` und laeuft deshalb nicht in `Expo Go` und nicht im Web-Bundle. Fuer echte Connector-Tests ist eine native Android- oder iOS-Development-Build noetig.

## Was bisher konkret schiefging

### 1. Web-/Expo-Go-Pfad war unbrauchbar

- Im Web kam beim Verbinden ein Fehler aus `react-native-tcp-socket`, weil dort kein natives Socket-Backend existiert.
- In `Expo Go` ist das Modul ebenfalls nicht verlässlich nutzbar, weil es nativen Code braucht.

Folge:
- Connector nur in nativer Dev-Build testen.

### 2. `react-native-tcp-socket` ist kein Expo Config Plugin

Der Eintrag in `app.json` als Expo-Plugin war falsch. Das Paket hat kein `app.plugin.js` und keinen gueltigen Config-Plugin-Export.

Konsequenz:
- `react-native-tcp-socket` darf nicht in `expo.plugins` eingetragen werden.
- Native Einbindung laeuft hier ueber normales RN-Autolinking.

### 3. Generierter Android-Code war nicht kompatibel mit dem installierten Dependency-Stand

Es gab zwei getrennte Probleme:

- `android/app/build.gradle`
  - Hermes wurde ueber `hermes-compiler/package.json` aufgeloest.
  - In diesem Projekt liegt der Hermes-Compiler aber unter `react-native/sdks/hermesc/...`.

- `android/app/src/main/java/dev/bri/launchapp/MainApplication.kt`
  - Der generierte Code benutzte `ExpoReactHostFactory.getDefaultReactHost(...)`.
  - Diese API existiert im aktuell installierten Expo-Stand nicht.
  - Zusaetzlich fehlte die Implementierung von `reactNativeHost`, die `ReactApplication` hier verlangt.

Konsequenz:
- Ohne diese Android-Anpassungen laeuft der Build wieder in die frueheren Fehler.

### 4. Java/JDK war falsch

Gradle lief mit:

```text
graalvm-ce-25.0.0
```

Dadurch schlugen `jlink`-Aufrufe fehl, sichtbar bei:

- `react-native-tcp-socket`
- `react-native-reanimated`
- `@shopify/react-native-skia`

Konsequenz:
- Fuer diesen Android-Build JDK 17 verwenden, nicht GraalVM 25.

### 5. SDK-Pfad war zeitweise inkonsistent

Es gab Hinweise auf zwei konkurrierende SDK-Pfade:

- korrekt: `/Users/brigittebohm/Library/Android/sdk`
- falsch/alt: `/opt/android-sdk`

Konsequenz:
- Shell und Gradle muessen konsistent auf das User-SDK zeigen.

## Bisher noetige lokale Anpassungen

### `app.json`

- `react-native-tcp-socket` wieder aus `expo.plugins` entfernt

### `android/app/build.gradle`

- Hermes-Pfad auf das tatsaechlich vorhandene Binary unter `react-native/sdks/hermesc/...` umgestellt

### `android/app/src/main/java/dev/bri/launchapp/MainApplication.kt`

- auf `reactNativeHost` + `ReactNativeHostWrapper` + `ExpoReactHostFactory.createFromReactNativeHost(...)` umgestellt

## Wichtige Einordnung

Ja, ein Teil davon ist generierter Native-Code. Trotzdem sind die Anpassungen aktuell funktional noetig, weil:

- der Build sonst wieder in die vorherigen Fehler laeuft
- die Probleme nicht nur von der Shell, sondern auch vom generierten Android-Template kommen

Die eigentliche offene Produktfrage ist deshalb nicht, ob diese Aenderungen "schoen" sind, sondern wie sie dauerhaft abgesichert werden sollen.

## Dauerhafte Optionen

### Option A: `android/` bewusst committen und pflegen

Sinnvoll, wenn das Projekt ohnehin native Abhaengigkeiten wie `react-native-tcp-socket` nutzt.

Vorteil:
- der funktionierende Native-Stand bleibt stabil reproduzierbar

Nachteil:
- Expo-Prebuild-Updates muessen bewusst gemerged werden

### Option B: Reproduzierbare Native-Patches etablieren

Moeglich z.B. ueber:

- dokumentierte Post-Prebuild-Schritte
- ein eigenes Config-Plugin
- oder pragmatisch `patch-package`

Vorteil:
- Aenderungen sind reproduzierbar

Nachteil:
- mehr Pflegeaufwand als einfaches Committen des `android/`-Ordners

## Empfohlene Build-Umgebung

In `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

Danach:

```bash
source ~/.zshrc
java -version
echo $JAVA_HOME
echo $ANDROID_HOME
```

Vor einem neuen Build:

```bash
cd android
./gradlew --stop
cd ..
npx expo run:android
```

## Aktueller Status

Stand der Analyse:

- Die frueheren `MainApplication.kt`-Fehler wurden adressiert.
- Der fruehere Hermes-Pfadfehler wurde adressiert.
- Der zuletzt sichtbare Blocker war weiterhin eine inkonsistente Java-/SDK-Umgebung im laufenden Build-Prozess.

Das heisst:
- die Android-Code-Fixes bleiben aktuell relevant
- zusaetzlich muss die lokale Java-/Android-Toolchain sauber auf JDK 17 + das richtige SDK zeigen
