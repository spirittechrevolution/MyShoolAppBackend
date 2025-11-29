/**
 * Contrôleur pour la gestion des paiements
 */

import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentStatus } from '../models/payment.model';

const paymentService = new PaymentService();

export class PaymentController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.create(req.body);
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Paiement créé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.getById(req.params.id);
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getAll();
      res.status(200).json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getByUserId(req.params.userId);
      res.status(200).json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByEnrollmentId(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getByEnrollmentId(req.params.enrollmentId);
      res.status(200).json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status.toUpperCase() as PaymentStatus;
      const payments = await paymentService.getByStatus(status);
      res.status(200).json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.checkStatus(req.params.id);
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const payment = await paymentService.cancel(req.params.id);
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Paiement annulé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 Webhook Orange Money reçu:', req.body);
      
      const payment = await paymentService.handleWebhook(req.body);
      
      res.json({
        success: true,
        data: payment,
        message: 'Webhook traité avec succès'
      });
    } catch (error: any) {
      console.error('❌ Erreur traitement webhook:', error);
      
      // Toujours retourner 200 pour éviter les retry du webhook
      res.status(200).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await paymentService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Paiement supprimé avec succès'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
