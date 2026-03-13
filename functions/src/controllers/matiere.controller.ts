import { Request, Response } from 'express';
import { matiereService } from '../services/matiere.service';

export class MatiereController {
  /**
   * Récupérer toutes les matières actives
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const matieres = await matiereService.getAll();
      
      res.json({
        success: true,
        data: matieres,
        count: matieres.length
      });
    } catch (error: any) {
      console.error('Erreur récupération matières:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des matières'
      });
    }
  }

  /**
   * Récupérer une matière par ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const matiere = await matiereService.getById(id);

      if (!matiere) {
        res.status(404).json({
          success: false,
          message: 'Matière non trouvée'
        });
        return;
      }

      res.json({
        success: true,
        data: matiere
      });
    } catch (error: any) {
      console.error('Erreur récupération matière:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la matière'
      });
    }
  }

  /**
   * Récupérer les matières par niveau scolaire
   */
  async getByNiveau(req: Request, res: Response): Promise<void> {
    try {
      const { niveau } = req.params;
      
      if (!['ELEMENTAIRE', 'MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'].includes(niveau)) {
        res.status(400).json({
          success: false,
          message: 'Niveau scolaire invalide'
        });
        return;
      }

      const matieres = await matiereService.getByNiveau(niveau as any);
      
      res.json({
        success: true,
        data: matieres,
        count: matieres.length
      });
    } catch (error: any) {
      console.error('Erreur récupération matières par niveau:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des matières'
      });
    }
  }

  /**
   * Récupérer les matières par classe précise
   */
  async getByClasse(req: Request, res: Response): Promise<void> {
    try {
      const { classe } = req.params;
      const matieres = await matiereService.getByClasse(decodeURIComponent(classe));
      
      res.json({
        success: true,
        data: matieres,
        count: matieres.length,
        message: `${matieres.length} matière(s) disponible(s) pour ${classe}`
      });
    } catch (error: any) {
      console.error('Erreur récupération matières par classe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des matières'
      });
    }
  }

  /**
   * Créer une nouvelle matière (Admin)
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nom, niveauScolaire, classe, description, icone, ordre } = req.body;

      // Validation
      if (!nom || !niveauScolaire) {
        res.status(400).json({
          success: false,
          message: 'Les champs nom et niveauScolaire sont requis'
        });
        return;
      }

      // Trim les espaces inutiles (correction backoffice)
      const matiere = await matiereService.create({
        nom: nom.trim(),
        niveauScolaire: niveauScolaire.trim(),
        classe: classe ? classe.trim() : classe,
        description: description ? description.trim() : description,
        icone,
        ordre,
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: matiere,
        message: 'Matière créée avec succès'
      });
    } catch (error: any) {
      console.error('Erreur création matière:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création de la matière'
      });
    }
  }

  /**
   * Mettre à jour une matière (Admin)
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nom, niveauScolaire, classe, description, icone, ordre, isActive } = req.body;

      const matiere = await matiereService.getById(id);
      if (!matiere) {
        res.status(404).json({
          success: false,
          message: 'Matière non trouvée'
        });
        return;
      }

      // Trim les espaces inutiles (correction backoffice)
      await matiereService.update(id, {
        nom: nom ? nom.trim() : nom,
        niveauScolaire: niveauScolaire ? niveauScolaire.trim() : niveauScolaire,
        classe: classe ? classe.trim() : classe,
        description: description ? description.trim() : description,
        icone,
        ordre,
        isActive
      });

      const updatedMatiere = await matiereService.getById(id);

      res.json({
        success: true,
        data: updatedMatiere,
        message: 'Matière mise à jour avec succès'
      });
    } catch (error: any) {
      console.error('Erreur mise à jour matière:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la matière'
      });
    }
  }

  /**
   * Supprimer une matière - soft delete (Admin)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const matiere = await matiereService.getById(id);
      if (!matiere) {
        res.status(404).json({
          success: false,
          message: 'Matière non trouvée'
        });
        return;
      }

      await matiereService.delete(id);

      res.json({
        success: true,
        message: 'Matière supprimée avec succès'
      });
    } catch (error: any) {
      console.error('Erreur suppression matière:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la matière'
      });
    }
  }
}
