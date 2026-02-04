# 📄 Système d'Upload de Documents PDF pour les Cours

## 🎯 Vue d'ensemble

L'admin peut maintenant charger **1 ou plusieurs documents PDF** depuis son front-end vers Firebase Storage. Les documents sont associés aux cours et accessibles aux étudiants.

---

## 🔄 Flux complet d'upload

### **Phase 1 : Sélection des fichiers (Front-end)**
```typescript
// L'admin sélectionne 1 ou plusieurs PDFs depuis son ordinateur
<input 
  type="file" 
  multiple 
  accept=".pdf" 
  onChange={handleFileSelect}
/>
```

### **Phase 2 : Envoi au backend**
```typescript
// Front-end crée un FormData avec les fichiers
const formData = new FormData();

// Ajouter plusieurs fichiers
selectedFiles.forEach(file => {
  formData.append('files', file);
});

// Envoyer au backend
const response = await fetch(
  'https://us-central1-myschool-f862b.cloudfunctions.net/api/upload/course-documents/${courseId}',
  {
    method: 'POST',
    body: formData
  }
);
```

### **Phase 3 : Réception par le backend**
```typescript
// Backend reçoit les fichiers via Multer
POST /api/upload/course-documents/:courseId
Content-Type: multipart/form-data

- Multer intercepte les fichiers
- Stocke temporairement en mémoire (Buffer)
- Valide le type MIME (application/pdf uniquement)
- Valide la taille (max 10MB par fichier)
- Limite : max 10 fichiers à la fois
```

### **Phase 4 : Upload vers Firebase Storage**
```typescript
// StorageService.uploadMultipleFiles()

Pour chaque fichier:
1. Génération d'un UUID unique (ex: "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
2. Création du chemin: courses/{courseId}/documents/{uuid}.pdf
3. Upload vers Firebase Storage bucket
4. Rendre le fichier public
5. Récupération de l'URL publique

Résultat:
{
  name: "Cours_Chimie_Chapitre1.pdf",
  url: "https://storage.googleapis.com/myschool-f862b.appspot.com/courses/D6JUMFrMoS5tODpvkpSG/documents/a1b2c3d4.pdf",
  size: 2048576, // 2MB en octets
  uploadedAt: "2026-02-04T14:30:00Z"
}
```

### **Phase 5 : Sauvegarde dans Firestore**
```typescript
// Mise à jour du cours avec les nouveaux documents

// Récupération des documents existants
existingDocuments = course.documents || []

// Ajout des nouveaux documents
updatedDocuments = [
  ...existingDocuments,
  {
    name: "Cours_Chimie_Chapitre1.pdf",
    url: "https://storage.googleapis.com/.../a1b2c3d4.pdf",
    size: 2048576,
    uploadedAt: Date("2026-02-04T14:30:00Z")
  },
  {
    name: "Exercices_Chimie.pdf",
    url: "https://storage.googleapis.com/.../b2c3d4e5.pdf",
    size: 1536000,
    uploadedAt: Date("2026-02-04T14:30:05Z")
  }
]

// Mise à jour Firestore
await courseService.update(courseId, {
  documents: updatedDocuments
})
```

### **Phase 6 : Réponse au front-end**
```json
{
  "success": true,
  "data": {
    "uploadedFiles": [
      {
        "name": "Cours_Chimie_Chapitre1.pdf",
        "url": "https://storage.googleapis.com/myschool-f862b.appspot.com/courses/D6JUMFrMoS5tODpvkpSG/documents/a1b2c3d4.pdf",
        "size": 2048576,
        "uploadedAt": "2026-02-04T14:30:00.000Z"
      },
      {
        "name": "Exercices_Chimie.pdf",
        "url": "https://storage.googleapis.com/myschool-f862b.appspot.com/courses/D6JUMFrMoS5tODpvkpSG/documents/b2c3d4e5.pdf",
        "size": 1536000,
        "uploadedAt": "2026-02-04T14:30:05.000Z"
      }
    ],
    "totalDocuments": 2
  },
  "message": "2 document(s) uploadé(s) avec succès"
}
```

### **Phase 7 : Affichage pour les étudiants**
```typescript
// Les étudiants peuvent télécharger les documents
GET /api/upload/course-documents/:courseId

Réponse:
{
  "success": true,
  "data": {
    "documents": [
      {
        "name": "Cours_Chimie_Chapitre1.pdf",
        "url": "https://storage.googleapis.com/.../a1b2c3d4.pdf",
        "size": 2048576,
        "uploadedAt": "2026-02-04T14:30:00.000Z"
      }
    ],
    "count": 1
  }
}

// Téléchargement direct
<a href="https://storage.googleapis.com/.../a1b2c3d4.pdf" download>
  Télécharger Cours_Chimie_Chapitre1.pdf
</a>
```

---

## 📊 API Endpoints

### 1. **Upload de documents**
```http
POST /api/upload/course-documents/:courseId
Content-Type: multipart/form-data

Body (FormData):
- files: File[] (max 10 fichiers, max 10MB chacun)

Réponse 200:
{
  "success": true,
  "data": {
    "uploadedFiles": [...],
    "totalDocuments": 5
  },
  "message": "2 document(s) uploadé(s) avec succès"
}

Erreur 400:
{
  "success": false,
  "message": "Seuls les fichiers PDF sont autorisés"
}

Erreur 413:
{
  "success": false,
  "message": "Le fichier dépasse la taille maximale de 10MB"
}
```

### 2. **Récupérer les documents d'un cours**
```http
GET /api/upload/course-documents/:courseId

Réponse 200:
{
  "success": true,
  "data": {
    "documents": [
      {
        "name": "Cours.pdf",
        "url": "https://storage.googleapis.com/...",
        "size": 2048576,
        "uploadedAt": "2026-02-04T14:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 3. **Supprimer un document**
```http
DELETE /api/upload/course-documents/:courseId
Content-Type: application/json

Body:
{
  "documentUrl": "https://storage.googleapis.com/.../a1b2c3d4.pdf"
}

Réponse 200:
{
  "success": true,
  "message": "Document supprimé avec succès"
}
```

---

## 🔒 Sécurité & Validations

### **Validations côté backend**

1. **Type de fichier**
   - ✅ Seulement `application/pdf` autorisé
   - ❌ Rejette `.doc`, `.docx`, `.exe`, images, etc.

2. **Taille des fichiers**
   - ✅ Max 10MB par fichier
   - ✅ Total cumulé max : 100MB (10 fichiers × 10MB)

3. **Nombre de fichiers**
   - ✅ Max 10 fichiers par requête
   - ✅ Illimité au total pour un cours (cumul possible)

4. **Validation du cours**
   - ✅ Vérification de l'existence du cours avant upload
   - ✅ Seuls les admins peuvent uploader (ajout middleware authentification recommandé)

### **Firebase Storage Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Documents de cours (publics en lecture)
    match /courses/{courseId}/documents/{document} {
      allow read: if true; // Tous les utilisateurs peuvent lire
      allow write: if request.auth != null 
                   && request.auth.token.role == 'admin'; // Seulement les admins
    }
  }
}
```

---

## 💾 Structure des données

### **Collection Firestore : `courses`**
```typescript
{
  id: "D6JUMFrMoS5tODpvkpSG",
  title: "Chimie - Niveau Secondaire",
  description: "Cours complet de chimie",
  niveauScolaire: "SECONDAIRE",
  classe: null,
  matiereId: "chimie_id",
  
  // 🆕 Documents PDF
  documents: [
    {
      name: "Cours_Chimie_Chapitre1.pdf",
      url: "https://storage.googleapis.com/myschool-f862b.appspot.com/courses/D6JUMFrMoS5tODpvkpSG/documents/a1b2c3d4.pdf",
      size: 2048576, // 2MB
      uploadedAt: Timestamp("2026-02-04T14:30:00Z")
    },
    {
      name: "Exercices_Chimie.pdf",
      url: "https://storage.googleapis.com/myschool-f862b.appspot.com/courses/D6JUMFrMoS5tODpvkpSG/documents/b2c3d4e5.pdf",
      size: 1536000, // 1.5MB
      uploadedAt: Timestamp("2026-02-04T14:30:05Z")
    }
  ],
  
  price: 19.99,
  createdAt: Timestamp("2025-11-28T10:00:00Z"),
  updatedAt: Timestamp("2026-02-04T14:30:05Z")
}
```

### **Firebase Storage : Structure des fichiers**
```
myschool-f862b.appspot.com/
└── courses/
    ├── D6JUMFrMoS5tODpvkpSG/
    │   └── documents/
    │       ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
    │       └── b2c3d4e5-f6a7-8901-bcde-f12345678901.pdf
    ├── XyZ123AbC456/
    │   └── documents/
    │       └── c3d4e5f6-a7b8-9012-cdef-123456789012.pdf
```

---

## 🧪 Tests avec Postman

### **Test 1 : Upload d'un PDF**
```bash
POST https://us-central1-myschool-f862b.cloudfunctions.net/api/upload/course-documents/D6JUMFrMoS5tODpvkpSG

Headers:
- Content-Type: multipart/form-data

Body (form-data):
- files: [Sélectionner Cours_Chimie.pdf depuis votre PC]
- files: [Sélectionner Exercices.pdf depuis votre PC]
```

### **Test 2 : Récupérer les documents**
```bash
GET https://us-central1-myschool-f862b.cloudfunctions.net/api/upload/course-documents/D6JUMFrMoS5tODpvkpSG
```

### **Test 3 : Supprimer un document**
```bash
DELETE https://us-central1-myschool-f862b.cloudfunctions.net/api/upload/course-documents/D6JUMFrMoS5tODpvkpSG

Headers:
- Content-Type: application/json

Body:
{
  "documentUrl": "https://storage.googleapis.com/myschool-f862b.appspot.com/courses/D6JUMFrMoS5tODpvkpSG/documents/a1b2c3d4.pdf"
}
```

---

## 🎨 Exemple d'intégration front-end (React/Angular)

### **Composant d'upload**
```typescript
// React/TypeScript
import React, { useState } from 'react';

interface UploadDocumentsProps {
  courseId: string;
}

const UploadDocuments: React.FC<UploadDocumentsProps> = ({ courseId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validation côté client
      const validFiles = files.filter(file => {
        if (file.type !== 'application/pdf') {
          alert(`${file.name} n'est pas un PDF`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} dépasse 10MB`);
          return false;
        }
        return true;
      });
      
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins un fichier');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(
        `https://us-central1-myschool-f862b.cloudfunctions.net/api/upload/course-documents/${courseId}`,
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`${result.data.uploadedFiles.length} document(s) uploadé(s)`);
        setSelectedFiles([]);
      } else {
        alert(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-documents">
      <h3>📄 Charger des documents PDF</h3>
      
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <p>Fichiers sélectionnés ({selectedFiles.length}):</p>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>
                {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={uploading || selectedFiles.length === 0}
      >
        {uploading ? 'Upload en cours...' : 'Uploader les documents'}
      </button>
    </div>
  );
};

export default UploadDocuments;
```

### **Composant d'affichage (pour étudiants)**
```typescript
// Liste des documents disponibles
const CourseDocuments: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`https://us-central1-myschool-f862b.cloudfunctions.net/api/upload/course-documents/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDocuments(data.data.documents);
        }
      });
  }, [courseId]);

  return (
    <div className="course-documents">
      <h3>📚 Documents du cours ({documents.length})</h3>
      <ul>
        {documents.map((doc, index) => (
          <li key={index}>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
              📄 {doc.name} ({(doc.size / 1024 / 1024).toFixed(2)} MB)
            </a>
            <span className="upload-date">
              Ajouté le {new Date(doc.uploadedAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## ✅ Checklist de déploiement

- [ ] Installer les dépendances : `npm install multer @types/multer uuid @types/uuid`
- [ ] Compiler TypeScript : `npm run build`
- [ ] Vérifier Firebase Storage configuré dans Firebase Console
- [ ] Vérifier les règles de sécurité Firebase Storage
- [ ] Tester l'upload localement avec émulateurs
- [ ] Déployer sur Firebase : `firebase deploy --only functions`
- [ ] Tester en production avec Postman
- [ ] Intégrer dans le front-end admin
- [ ] Ajouter middleware d'authentification admin
- [ ] Documenter dans Swagger UI

---

## 📞 Support

Pour toute question sur le système d'upload :
- Email : serignefallousow@gmail.com
- Documentation API : https://us-central1-myschool-f862b.cloudfunctions.net/api/api-docs

**Résumé** : ✅ L'admin peut uploader des PDFs depuis son PC → Backend valide et uploade vers Firebase Storage → URLs publiques sauvegardées dans Firestore → Étudiants peuvent télécharger les documents ! 🎉
