import { Alert, ScrollView, Text, View } from 'react-native';
import { Body, Button, Card, Divider, H1, Label, Screen } from '../../src/components/ui';
import { naira, wallet } from '../../src/mock/data';

export default function Wallet() {
  // TODO(contributor): wire deposit and withdrawal to Paystack
  // Both buttons are inert. steppal-core exposes /v1/wallet/deposit/intent and
  // /v1/wallet/withdraw behind a PaymentProvider interface — the mock provider
  // credits instantly, so this can be built and tested with no Paystack account.
  // difficulty: medium
  const notWired = () =>
    Alert.alert('Demo build', 'Payments are mocked in this build. Nothing moved.');

  return (
    <Screen>
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="pt-6">
          <H1>Wallet</H1>
        </View>

        <Card className="mt-6">
          <Label>Available</Label>
          <Text className="mt-2 font-displayBlack text-[40px] leading-[44px] text-ink">
            {naira(wallet.availableKobo)}
          </Text>
          <View className="mt-4 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-money" />
            <Body dim>{naira(wallet.heldKobo)} held in a running pot</Body>
          </View>
        </Card>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Button label="Add money" onPress={notWired} />
          </View>
          <View className="flex-1">
            <Button label="Cash out" tone="ghost" onPress={notWired} />
          </View>
        </View>

        <View className="mt-9">
          <Label>Activity</Label>
          <Card className="mt-3 p-0">
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
        </View>

        <Body dim className="mt-6">
          Stakes are held by the pot contract, not by StepPal. We can&apos;t move them.
        </Body>
      </ScrollView>
    </Screen>
  );
}
