/**
 * Tests unitaires pour ReferralService
 */

import { ReferralService } from '../../services/referral.service';
import { ReferralModel } from '../../models/referral.model';
import { db } from '../../config/firebase.config';

// Mock Firebase
jest.mock('../../config/firebase.config', () => ({
  db: {
    collection: jest.fn()
  }
}));

describe('ReferralService', () => {
  let referralService: ReferralService;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockAdd: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockWhere: any;
  let mockOrderBy: any;
  let mockLimit: any;

  beforeEach(() => {
    referralService = new ReferralService();

    // Setup mock chain
    mockGet = jest.fn();
    mockAdd = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockWhere = jest.fn();
    mockOrderBy = jest.fn();
    mockLimit = jest.fn();

    // Make the chain methods return `this` to enable chaining
    mockWhere.mockReturnThis();
    mockOrderBy.mockReturnThis();
    mockLimit.mockReturnThis();

    mockDoc = jest.fn(() => ({
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
      set: jest.fn()
    }));

    mockCollection = jest.fn(() => ({
      add: mockAdd,
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet
    }));

    (db.collection as jest.Mock) = mockCollection;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReferralLink', () => {
    it('devrait générer un lien de parrainage avec code unique', async () => {
      const userId = 'USER123';
      const bonusAmount = 500;

      // Mock: Aucun referral actif existant
      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: true,
        docs: []
      });

      // Mock: Vérifier que le code n'existe pas déjà
      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: true,
        docs: []
      });

      // Mock: Add referral
      const mockReferralId = 'REF_DOC_123';
      mockAdd.mockResolvedValue({
        id: mockReferralId
      });

      const result = await referralService.generateReferralLink(userId, bonusAmount);

      expect(result.referrerId).toBe(userId);
      expect(result.bonusAmount).toBe(bonusAmount);
      expect(result.status).toBe('PENDING');
      expect(result.referralCode).toMatch(/^REF_/);
      expect(result.metadata?.deepLink).toContain('myschool://referral?code=');
      expect(result.metadata?.webLink).toContain('https://myschool-app.com/join?ref=');
      expect(result.clicks).toBe(0);
      expect(result.conversions).toBe(0);
    });

    it('devrait utiliser les valeurs par défaut si non spécifiées', async () => {
      const userId = 'USER123';

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({ empty: true, docs: [] });
      mockAdd.mockResolvedValue({ id: 'REF_DOC_123' });

      const result = await referralService.generateReferralLink(userId);

      expect(result.bonusAmount).toBe(500); // Default
      expect(result.bonusType).toBe('DISCOUNT'); // Default
    });

    it('devrait lever une erreur si l\'utilisateur a déjà un referral actif', async () => {
      const userId = 'USER123';

      // Mock: Un referral actif existe déjà
      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'EXISTING_REF',
          data: () => ({
            referrerId: userId,
            status: 'PENDING',
            referralCode: 'REF_USER_ABC123'
          })
        }]
      });

      await expect(
        referralService.generateReferralLink(userId)
      ).rejects.toThrow('Un lien de parrainage actif existe déjà');
    });
  });

  describe('getReferralByCode', () => {
    it('devrait récupérer un referral par code', async () => {
      const code = 'REF_USER_ABC123';
      const mockReferral = {
        id: 'REF_DOC_123',
        referrerId: 'USER123',
        referralCode: code,
        status: 'PENDING',
        bonusAmount: 500,
        clicks: 5,
        conversions: 0
      };

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: mockReferral.id,
          data: () => mockReferral
        }]
      });

      const result = await referralService.getReferralByCode(code);

      expect(result).toBeDefined();
      expect(result?.referralCode).toBe(code);
      expect(result?.id).toBe(mockReferral.id);
    });

    it('devrait retourner null si code non trouvé', async () => {
      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: true,
        docs: []
      });

      const result = await referralService.getReferralByCode('INVALID_CODE');

      expect(result).toBeNull();
    });

    it('devrait marquer comme EXPIRED si la date d\'expiration est passée', async () => {
      const code = 'REF_USER_ABC123';
      const expiredDate = new Date(Date.now() - 86400000); // Hier

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'REF_DOC_123',
          data: () => ({
            referralCode: code,
            status: 'PENDING',
            expiresAt: { toDate: () => expiredDate }
          })
        }]
      });

      mockDoc.mockReturnValue({
        update: mockUpdate
      });

      const result = await referralService.getReferralByCode(code);

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'EXPIRED' });
      expect(result?.status).toBe('EXPIRED');
    });
  });

  describe('trackClick', () => {
    it('devrait incrémenter le compteur de clics', async () => {
      const code = 'REF_USER_ABC123';
      const source = 'whatsapp';

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'REF_DOC_123',
          data: () => ({
            referralCode: code,
            status: 'PENDING',
            clicks: 5
          })
        }]
      });

      mockDoc.mockReturnValue({
        update: mockUpdate
      });

      mockUpdate.mockResolvedValue({});

      await referralService.trackClick(code, source);

      expect(mockUpdate).toHaveBeenCalledWith({
        clicks: expect.any(Number),
        'metadata.source': source
      });
    });

    it('devrait retourner null si code non trouvé', async () => {
      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: true,
        docs: []
      });

      const result = await referralService.trackClick('INVALID_CODE');

      expect(result).toBeNull();
    });
  });

  describe('validateAndComplete', () => {
    it('devrait valider et compléter un parrainage', async () => {
      const code = 'REF_USER_ABC123';
      const newUserId = 'NEW_USER_456';
      const referrerId = 'USER123';
      const bonusAmount = 500;

      // Mock: Trouver le referral
      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'REF_DOC_123',
          data: () => ({
            referrerId,
            referralCode: code,
            status: 'PENDING',
            bonusAmount,
            bonusType: 'DISCOUNT',
            clicks: 5,
            conversions: 0,
            expiresAt: { toDate: () => new Date(Date.now() + 86400000) }
          })
        }]
      });

      // Mock: Update referral
      mockDoc.mockReturnValue({
        update: mockUpdate,
        get: mockGet
      });

      // Mock: Updated referral data
      mockGet.mockResolvedValue({
        exists: true,
        id: 'REF_DOC_123',
        data: () => ({
          status: 'COMPLETED',
          conversions: 1
        })
      });

      const result = await referralService.validateAndComplete(code, newUserId);

      expect(result).toBeDefined();
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('devrait empêcher l\'auto-parrainage', async () => {
      const code = 'REF_USER_ABC123';
      const userId = 'USER123'; // Même utilisateur

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'REF_DOC_123',
          data: () => ({
            referrerId: userId,
            referralCode: code,
            status: 'PENDING'
          })
        }]
      });

      await expect(
        referralService.validateAndComplete(code, userId)
      ).rejects.toThrow('Vous ne pouvez pas utiliser votre propre code de parrainage');
    });

    it('devrait rejeter un code expiré', async () => {
      const code = 'REF_USER_ABC123';
      const newUserId = 'NEW_USER_456';
      const expiredDate = new Date(Date.now() - 86400000);

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'REF_DOC_123',
          data: () => ({
            referrerId: 'USER123',
            referralCode: code,
            status: 'PENDING',
            expiresAt: { toDate: () => expiredDate }
          })
        }]
      });

      await expect(
        referralService.validateAndComplete(code, newUserId)
      ).rejects.toThrow('Ce code de parrainage a expiré');
    });

    it('devrait rejeter un code déjà utilisé', async () => {
      const code = 'REF_USER_ABC123';
      const newUserId = 'NEW_USER_456';

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [{
          id: 'REF_DOC_123',
          data: () => ({
            referrerId: 'USER123',
            referralCode: code,
            status: 'COMPLETED'
          })
        }]
      });

      await expect(
        referralService.validateAndComplete(code, newUserId)
      ).rejects.toThrow('Ce code de parrainage ne peut pas être utilisé');
    });
  });

  describe('getUserReferralStats', () => {
    it('devrait calculer les statistiques correctement', async () => {
      const userId = 'USER123';

      mockWhere.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'REF1',
            data: () => ({
              status: 'PENDING',
              clicks: 10,
              conversions: 0,
              bonusAmount: 500
            })
          },
          {
            id: 'REF2',
            data: () => ({
              status: 'COMPLETED',
              clicks: 15,
              conversions: 1,
              bonusAmount: 500
            })
          },
          {
            id: 'REF3',
            data: () => ({
              status: 'EXPIRED',
              clicks: 5,
              conversions: 0,
              bonusAmount: 500
            })
          }
        ]
      });

      const stats = await referralService.getUserReferralStats(userId);

      expect(stats.totalReferrals).toBe(3);
      expect(stats.activeReferrals).toBe(1);
      expect(stats.completedReferrals).toBe(1);
      expect(stats.expiredReferrals).toBe(1);
      expect(stats.cancelledReferrals).toBe(0);
      expect(stats.totalClicks).toBe(30);
      expect(stats.totalConversions).toBe(1);
      expect(stats.totalEarnings).toBe(500);
      expect(stats.pendingBonus).toBe(500);
    });
  });

  describe('getUserReferrals', () => {
    it('devrait récupérer tous les referrals d\'un utilisateur', async () => {
      const userId = 'USER123';

      mockWhere.mockReturnThis();
      mockOrderBy.mockReturnThis();
      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'REF1',
            data: () => ({ referrerId: userId, status: 'PENDING' })
          },
          {
            id: 'REF2',
            data: () => ({ referrerId: userId, status: 'COMPLETED' })
          }
        ]
      });

      const referrals = await referralService.getUserReferrals(userId);

      expect(referrals).toHaveLength(2);
      expect(referrals[0].id).toBe('REF1');
      expect(referrals[1].id).toBe('REF2');
    });
  });

  describe('ReferralModel utility methods', () => {
    it('generateReferralCode devrait créer un code au bon format', () => {
      const userId = 'USER123';
      const code = ReferralModel.generateReferralCode(userId);

      expect(code).toMatch(/^REF_[A-Z0-9]{4}_[A-Z0-9]{6}$/);
    });

    it('generateDeepLink devrait créer un lien deep link', () => {
      const code = 'REF_USER_ABC123';
      const deepLink = ReferralModel.generateDeepLink(code);

      expect(deepLink).toBe('myschool://referral?code=REF_USER_ABC123');
    });

    it('generateWebLink devrait créer un lien web', () => {
      const code = 'REF_USER_ABC123';
      const webLink = ReferralModel.generateWebLink(code);

      expect(webLink).toBe('https://myschool-app.com/join?ref=REF_USER_ABC123');
    });

    it('generateShareText devrait créer un texte de partage', () => {
      const code = 'REF_USER_ABC123';
      const bonusAmount = 500;
      const shareText = ReferralModel.generateShareText(code, bonusAmount);

      expect(shareText).toContain('5.00 FCFA');
      expect(shareText).toContain(code);
    });

    it('isExpired devrait détecter un referral expiré', () => {
      const expiredDate = new Date(Date.now() - 86400000);
      const expiredReferral: any = {
        expiresAt: {
          _seconds: Math.floor(expiredDate.getTime() / 1000),
          toDate: () => expiredDate
        }
      };

      expect(ReferralModel.isExpired(expiredReferral)).toBe(true);
    });

    it('isExpired devrait retourner false pour un referral valide', () => {
      const validDate = new Date(Date.now() + 86400000);
      const validReferral: any = {
        expiresAt: {
          _seconds: Math.floor(validDate.getTime() / 1000),
          toDate: () => validDate
        }
      };

      expect(ReferralModel.isExpired(validReferral)).toBe(false);
    });

    it('canBeCompleted devrait valider un referral PENDING', () => {
      const validDate = new Date(Date.now() + 86400000);
      const referral: any = {
        status: 'PENDING',
        expiresAt: {
          _seconds: Math.floor(validDate.getTime() / 1000),
          toDate: () => validDate
        }
      };

      expect(ReferralModel.canBeCompleted(referral)).toBe(true);
    });

    it('canBeCompleted devrait rejeter un referral COMPLETED', () => {
      const validDate = new Date(Date.now() + 86400000);
      const referral: any = {
        status: 'COMPLETED',
        expiresAt: {
          _seconds: Math.floor(validDate.getTime() / 1000),
          toDate: () => validDate
        }
      };

      expect(ReferralModel.canBeCompleted(referral)).toBe(false);
    });

    it('calculateConversionRate devrait calculer le taux correctement', () => {
      const rate = ReferralModel.calculateConversionRate(100, 25);
      expect(rate).toBe(25);
    });

    it('calculateConversionRate devrait retourner 0 si 0 clics', () => {
      const rate = ReferralModel.calculateConversionRate(0, 0);
      expect(rate).toBe(0);
    });
  });

  describe('cancelReferral', () => {
    it('devrait annuler un referral', async () => {
      const referralId = 'REF_DOC_123';

      mockDoc.mockReturnValue({
        update: mockUpdate
      });

      await referralService.cancelReferral(referralId);

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'CANCELLED' });
    });
  });

  describe('delete', () => {
    it('devrait supprimer un referral', async () => {
      const referralId = 'REF_DOC_123';

      mockDoc.mockReturnValue({
        delete: mockDelete
      });

      await referralService.delete(referralId);

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
