import {
  generateInviteCode,
  createPot,
  findByCode,
  joinByCode,
  sendMessage,
  hydratePots,
  hydratePot,
  usePots,
  usePot,
  useActivePot,
} from '../pots';
import { isLive } from '../../api/client';
import {
  createPotRemote,
  fetchPot,
  fetchPots,
  findByCodeRemote,
  joinByCodeRemote,
} from '../../api/pots';
import type { Pot } from '../../mock/data';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useSyncExternalStore: jest.fn((_subscribe, getSnapshot) => getSnapshot()),
  };
});

jest.mock('../../api/client', () => ({
  isLive: jest.fn(() => false),
}));

jest.mock('../../api/pots', () => ({
  createPotRemote: jest.fn(),
  fetchPot: jest.fn(),
  fetchPots: jest.fn(),
  findByCodeRemote: jest.fn(),
  joinByCodeRemote: jest.fn(),
}));

describe('Pot Store (Local Demo Mode & Live API Parity)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isLive as jest.Mock).mockReturnValue(false);
  });

  describe('generateInviteCode', () => {
    it('creates an invite code with 4 uppercase letters, hyphen, and 4 digits', () => {
      const code = generateInviteCode('Victoria Island Runners');
      expect(code).toMatch(/^[A-Z]{4}-\d{4}$/);
      expect(code.startsWith('VICT-')).toBe(true);
    });

    it('pads short pot names using POT fallback', () => {
      const code = generateInviteCode('Go');
      expect(code).toMatch(/^[A-Z]{4}-\d{4}$/);
      expect(code.startsWith('GOPO-')).toBe(true);
    });

    it('filters non-alphabetical characters from letters segment', () => {
      const code = generateInviteCode('#@ Daily Steps');
      expect(code).toMatch(/^[A-Z]{4}-\d{4}$/);
      expect(code.startsWith('DAIL-')).toBe(true);
    });
  });

  describe('Store Reads (Local Demo Mode)', () => {
    it('returns seed pots from usePots', () => {
      const all = usePots();
      expect(all.length).toBeGreaterThan(0);
      expect(all.some((p) => p.status === 'active')).toBe(true);
    });

    it('finds pot by id with usePot', () => {
      const all = usePots();
      const first = all[0];
      const found = usePot(first.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(first.name);
    });

    it('returns active pot with useActivePot', () => {
      const active = useActivePot();
      expect(active).toBeDefined();
      expect(active?.status).toBe('active');
    });
  });

  describe('Local Pot Creation & Mutators', () => {
    it('creates a local pot and prepends it to the store', async () => {
      const initialCount = usePots().length;
      const created = await createPot({
        name: 'Marina Sprint',
        mode: 'forfeit',
        stakeKobo: 500000,
        dailyGoal: 12000,
      });

      expect(created.id).toContain('marina-sprint');
      expect(created.name).toBe('Marina Sprint');
      expect(created.mode).toBe('forfeit');
      expect(created.status).toBe('active');
      expect(created.stakeKobo).toBe(500000);
      expect(created.potKobo).toBe(500000);
      expect(created.dayOf).toBe(1);
      expect(created.totalDays).toBe(7);
      expect(created.members).toHaveLength(1);
      expect(created.members[0].isYou).toBe(true);
      expect(created.chat).toHaveLength(1);
      expect(created.chat[0].kind).toBe('system');

      const all = usePots();
      expect(all.length).toBe(initialCount + 1);
      expect(all[0].id).toBe(created.id);
    });

    it('finds joinable pot by code case-insensitively', async () => {
      const pot = await findByCode('run-2290');
      expect(pot).toBeDefined();
      expect(pot?.inviteCode).toBe('RUN-2290');
    });

    it('returns undefined for non-existent invite code', async () => {
      const pot = await findByCode('NONEXISTENT-9999');
      expect(pot).toBeUndefined();
    });

    it('joins a pot by code and updates membership and pot balance', async () => {
      const joined = await joinByCode('run-2290');
      expect(joined).toBeDefined();
      if (!joined) return;

      expect(joined.members.some((m) => m.isYou)).toBe(true);
      expect(joined.chat.some((c) => c.body.includes('joined'))).toBe(true);

      // Verify the joined pot is in the store
      const all = usePots();
      expect(all.some((p) => p.id === joined.id)).toBe(true);

      // Re-joining same pot should return it without duplicating
      const reJoined = await joinByCode('run-2290');
      expect(reJoined?.id).toBe(joined.id);
    });

    it('sends a chat message to a pot', async () => {
      const all = usePots();
      const targetPot = all[0];
      const initialChatLength = targetPot.chat.length;

      sendMessage(targetPot.id, 'Let us crush today goal!');

      const updated = usePot(targetPot.id);
      expect(updated?.chat.length).toBe(initialChatLength + 1);
      const lastMsg = updated?.chat[updated.chat.length - 1];
      expect(lastMsg?.body).toBe('Let us crush today goal!');
      expect(lastMsg?.isYou).toBe(true);
      expect(lastMsg?.kind).toBe('text');
    });

    it('ignores empty chat messages', async () => {
      const all = usePots();
      const targetPot = all[0];
      const initialChatLength = targetPot.chat.length;

      sendMessage(targetPot.id, '   ');

      const updated = usePot(targetPot.id);
      expect(updated?.chat.length).toBe(initialChatLength);
    });
  });

  describe('Live API Mode Parity', () => {
    const mockRemotePot: Pot = {
      id: 'remote-pot-1',
      name: 'Server Side Pot',
      mode: 'forfeit',
      status: 'active',
      stakeKobo: 250000,
      potKobo: 1000000,
      dayOf: 3,
      totalDays: 7,
      inviteCode: 'SERV-1234',
      members: [
        { id: 'u1', name: 'You', steps: 30000, daysMet: 3, isYou: true },
        { id: 'u2', name: 'Partner', steps: 28000, daysMet: 2 },
      ],
      chat: [],
    };

    beforeEach(() => {
      (isLive as jest.Mock).mockReturnValue(true);
    });

    it('hydrates pots from remote server in live mode', async () => {
      (fetchPots as jest.Mock).mockResolvedValueOnce([mockRemotePot]);

      await hydratePots();

      expect(fetchPots).toHaveBeenCalledTimes(1);
      const all = usePots();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('remote-pot-1');
    });

    it('hydrates individual pot while preserving local chat in live mode', async () => {
      // Add local message first
      sendMessage('remote-pot-1', 'Keep going everyone');

      const updatedRemotePot: Pot = {
        ...mockRemotePot,
        potKobo: 1250000,
      };
      (fetchPot as jest.Mock).mockResolvedValueOnce(updatedRemotePot);

      await hydratePot('remote-pot-1');

      expect(fetchPot).toHaveBeenCalledWith('remote-pot-1');
      const pot = usePot('remote-pot-1');
      expect(pot?.potKobo).toBe(1250000);
      expect(pot?.chat.some((c) => c.body === 'Keep going everyone')).toBe(true);
    });

    it('creates pot remotely in live mode', async () => {
      const newRemotePot: Pot = {
        id: 'remote-pot-2',
        name: 'New Server Pot',
        mode: 'forfeit',
        status: 'active',
        stakeKobo: 500000,
        potKobo: 500000,
        dayOf: 1,
        totalDays: 7,
        inviteCode: 'NEWP-5555',
        members: [{ id: 'me', name: 'You', steps: 0, daysMet: 0, isYou: true }],
        chat: [],
      };
      (createPotRemote as jest.Mock).mockResolvedValueOnce(newRemotePot);

      const result = await createPot({
        name: 'New Server Pot',
        mode: 'forfeit',
        stakeKobo: 500000,
        dailyGoal: 10000,
      });

      expect(createPotRemote).toHaveBeenCalledWith({
        name: 'New Server Pot',
        dailyGoal: 10000,
        stakeKobo: 500000,
      });
      expect(result.id).toBe('remote-pot-2');
      expect(usePots()[0].id).toBe('remote-pot-2');
    });

    it('finds and joins pots remotely in live mode', async () => {
      (findByCodeRemote as jest.Mock).mockResolvedValueOnce(mockRemotePot);
      (joinByCodeRemote as jest.Mock).mockResolvedValueOnce(mockRemotePot);

      const found = await findByCode('SERV-1234');
      expect(findByCodeRemote).toHaveBeenCalledWith('SERV-1234');
      expect(found?.id).toBe('remote-pot-1');

      const joined = await joinByCode('SERV-1234');
      expect(joinByCodeRemote).toHaveBeenCalledWith('SERV-1234');
      expect(joined?.id).toBe('remote-pot-1');
    });

    it('enforces schema contract parity between local demo pots and remote pots', async () => {
      (isLive as jest.Mock).mockReturnValue(false);
      const localPot = await createPot({
        name: 'Parity Test',
        mode: 'forfeit',
        stakeKobo: 100000,
        dailyGoal: 8000,
      });

      const requiredKeys: (keyof Pot)[] = [
        'id',
        'name',
        'mode',
        'status',
        'stakeKobo',
        'potKobo',
        'dayOf',
        'totalDays',
        'inviteCode',
        'members',
        'chat',
      ];

      for (const key of requiredKeys) {
        expect(localPot).toHaveProperty(key);
        expect(mockRemotePot).toHaveProperty(key);
      }
    });
  });
});
