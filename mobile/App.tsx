import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { categoryLabels } from "../lib/data/taxonomy";
import { venues } from "../lib/data/venues";
import type { Venue } from "../lib/types";

type Tab = "discover" | "journal" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("discover");

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>Lille Liv</Text>
        <Text style={styles.city}>København</Text>
      </View>
      <View style={styles.content}>
        {tab === "discover" ? <DiscoverScreen /> : null}
        {tab === "journal" ? <JournalScreen /> : null}
        {tab === "profile" ? <ProfileScreen /> : null}
      </View>
      <View style={styles.tabs}>
        <TabButton active={tab === "discover"} label="Opdag" onPress={() => setTab("discover")} />
        <TabButton active={tab === "journal"} label="Journal" onPress={() => setTab("journal")} />
        <TabButton active={tab === "profile"} label="Profil" onPress={() => setTab("profile")} />
      </View>
    </SafeAreaView>
  );
}

function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return venues.filter((venue) => {
      const haystack = `${venue.name} ${venue.neighbourhood} ${venue.tags.join(" ")}`.toLowerCase();
      return !value || haystack.includes(value);
    });
  }, [query]);

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Opdag</Text>
      <Text style={styles.title}>Familievenlige steder</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Søg cafe, legeplads, Østerbro..."
        style={styles.input}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <VenueRow venue={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function VenueRow({ venue }: { venue: Venue }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: venue.photos[0] }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.badge}>{categoryLabels[venue.category]}</Text>
        <Text style={styles.cardTitle}>{venue.name}</Text>
        <Text style={styles.cardMeta}>{venue.neighbourhood}</Text>
        <Text style={styles.cardText} numberOfLines={2}>
          {venue.description}
        </Text>
      </View>
    </View>
  );
}

function JournalScreen() {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>Journal</Text>
      <Text style={styles.title}>Asta</Text>
      <Text style={styles.subtitle}>Milepæle og ture samlet privat.</Text>
      {["Første hele sætning", "Superkilen med løbecykel", "Fra børnehaven"].map((item) => (
        <View key={item} style={styles.timelineItem}>
          <Text style={styles.cardTitle}>{item}</Text>
          <Text style={styles.cardMeta}>April 2026</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function ProfileScreen() {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>Profil</Text>
      <Text style={styles.title}>Familie</Text>
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Aula</Text>
          <Text style={styles.cardText}>
            Sikker MitID-baseret forbindelse er markeret som næste integrationsarbejde.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#F5F0E8"
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8DAC7"
  },
  brand: {
    fontSize: 30,
    fontWeight: "700",
    color: "#26312D"
  },
  city: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#4A7C6F",
    textTransform: "uppercase"
  },
  content: {
    flex: 1
  },
  screen: {
    flex: 1,
    padding: 20
  },
  eyebrow: {
    color: "#C4623A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#26312D"
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(38,49,45,0.68)",
    lineHeight: 22
  },
  input: {
    marginTop: 16,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E8DAC7"
  },
  list: {
    paddingTop: 16,
    paddingBottom: 120,
    gap: 14
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DAC7"
  },
  cardImage: {
    height: 150,
    width: "100%"
  },
  cardBody: {
    padding: 14
  },
  badge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#D7E5E4",
    color: "#2F5149",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "700"
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#26312D"
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(38,49,45,0.58)"
  },
  cardText: {
    marginTop: 8,
    color: "rgba(38,49,45,0.70)",
    lineHeight: 21
  },
  timelineItem: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8DAC7"
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8DAC7",
    backgroundColor: "#FFFDF8"
  },
  tabButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  tabButtonActive: {
    backgroundColor: "#4A7C6F"
  },
  tabText: {
    color: "rgba(38,49,45,0.68)",
    fontWeight: "700"
  },
  tabTextActive: {
    color: "#FFFFFF"
  }
});
