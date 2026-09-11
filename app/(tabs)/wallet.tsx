import { Alert, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  Body,
  Button,
  Card,
  Divider,
  Label,
  Screen,
  SectionHeader,
} from '../../src/components/ui';
import { usePalette } from '../../src/theme';
import { naira, wallet } from '../../src/mock/data';

export default function Wallet() {
  const C = usePalette();

  // TODO(contributor): wire deposit and withdrawal to Paystack
  // Both buttons are inert. steppal-core exposes /v1/wallet/deposit/intent and
  // /v1/wallet/withdraw behind a PaymentProvider interface — the mock provider
  // credits instantly, so this can be built with no Paystack account.
  // difficulty: medium
  const notWired = () =>
    Alert.alert('Demo build', 'Payments are mocked in this build. Nothing moved.');

  return (
    <Screen>
      <AppHeader
        title="Wallet"
        actions={[{ icon: 'help-circle-outline', label: 'How the wallet works', onPress: notWired }]}
      />

      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Card>
          <Label>Available</Label>
          <Text className="mt-2 font-displayBlack text-[42px] leading-[46px] text-ink">
            {naira(wallet.availableKobo)}
          </Text>
          <View className="mt-4 flex-row items-center gap-2">
            <Ionicons name="lock-closed" size={14} color={C.money} />
            <Body dim>{naira(wallet.heldKobo)} held in a running pot</Body>
          </View>
        </Card>

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1">
            <Button label="Add money" icon="arrow-down" onPress={notWired} />
          </View>
          <View className="flex-1">
            <Button label="Cash out" icon="arrow-up" tone="ghost" onPress={notWired} />
          </View>
        </View>

        <SectionHeader title="Activity" />
        <Card className="p-0">
          {wallet.ledger.map((e, i) => (
            <View key={e.id}>
              {i > 0 ? <Divider /> : null}
              <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-1 pr-4">
                  <Text className="font-bodyMed text-[15px] text-ink">{e.label}</Text>
                  <Body dim className="mt-0.5">
                    {e.sub}
                  </Body>
                </View>
                <Text
                  className={`font-bodyBold text-[15px] ${
                    e.amountKobo > 0 ? 'text-accent' : 'text-money'
                  }`}
                >
                  {e.amountKobo > 0 ? '+' : ''}
                  {naira(e.amountKobo)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <View className="mt-6 flex-row items-start gap-2">
          <Ionicons name="shield-checkmark-outline" size={15} color={C.inkFaint} />
          <Body dim className="flex-1">
            Stakes are held by the pot contract, not by StepPal. We can&apos;t move them.
          </Body>
        </View>
      </ScrollView>
    </Screen>
  );
}
