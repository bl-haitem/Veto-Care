<div align="center">

# 🐾 Veto Care

**La santé animale simplifiée**

Une plateforme vétérinaire complète connectant propriétaires d'animaux et vétérinaires à travers l'Algérie — avec réservation en temps réel, assistant IA et notifications email automatisées.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Table des Matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Structure du Projet](#structure-du-projet)
- [Architecture des Routes](#architecture-des-routes)
- [Base de Données](#base-de-données)
- [Sécurité & RLS](#sécurité--rls)
- [Notifications Email](#notifications-email)
- [Contrôle d'Accès par Rôle](#contrôle-daccès-par-rôle)

---

## Présentation

### Problématique

Les propriétaires d'animaux en Algérie font face à des obstacles majeurs pour accéder aux soins vétérinaires :

- Aucun annuaire centralisé pour trouver et vérifier les vétérinaires
- Absence de système de prise de rendez-vous en ligne
- Pas de dossiers médicaux numériques pour les animaux
- Communication limitée entre propriétaires et vétérinaires

De leur côté, les vétérinaires manquent d'outils numériques pour gérer leur activité, présenter leurs services et maintenir des dossiers patients.

### La Solution

**Veto Care** comble ce vide avec une plateforme web à double rôle offrant :

| Pour les Propriétaires (`maitre`) | Pour les Vétérinaires (`veterinaire`) |
|---|---|
| Recherche de vétérinaires par wilaya | Tableau de bord professionnel |
| Réservation et suivi des rendez-vous | Gestion des rendez-vous et dossiers patients |
| Gestion des profils d'animaux | Notifications en temps réel |
| Dossiers médicaux numériques | Développement de la patientèle |

La plateforme intègre également des **notifications email automatisées** via l'API 0utmail, un **chatbot IA (VetoBot)** pour les conseils vétérinaires, et un système d'**authentification à double rôle** avec validation admin pour les vétérinaires.

---

## Fonctionnalités

### Pour les Propriétaires

| Module | Fonctionnalités |
|---|---|
| **Authentification** | Inscription par email/mot de passe avec rôle `maitre`, connexion sécurisée via Supabase Auth, gestion du profil |
| **Gestion des Animaux** | Création et gestion de multiples profils (nom, espèce, race, date de naissance, genre), historique médical, upload de documents PDF |
| **Annuaire des Vétérinaires** | Recherche parmi les 58 wilayas algériennes, consultation des profils avec notes et avis, filtrage avancé |
| **Réservation** | Prise de rendez-vous, sélection de date et créneau horaire, ajout du motif et de l'animal concerné |
| **Suivi des Rendez-vous** | Visualisation des statuts (`en attente`, `confirmé`, `annulé`, `terminé`), annulation avec notification, évaluation post-consultation (1 à 5 étoiles), consultation des notes cliniques |
| **Notifications Email** | Confirmation de demande, confirmation du vétérinaire, refus, fin de consultation avec invitation à évaluer, avis d'annulation |
| **VetoBot** | Assistant IA pour conseils vétérinaires, aide à la navigation et redirection vers la réservation en cas d'urgence |

### Pour les Vétérinaires

| Module | Fonctionnalités |
|---|---|
| **Inscription & Vérification** | Enregistrement avec informations professionnelles (wilaya, adresse, bio, document), workflow d'approbation admin (`en attente` → `approuvé`) |
| **Tableau de Bord** | Vue d'ensemble des rendez-vous, statistiques clés (RDV du jour, demandes en attente, total patients), calendrier hebdomadaire, actions rapides d'acceptation/refus |
| **Gestion des Rendez-vous** | Consultation par statut, confirmation, refus, marquage comme terminé, annulation, ajout de notes cliniques |
| **Dossiers Patients** | Liste des patients, historique médical détaillé, historique des consultations, dossiers numériques |
| **Profil** | Mise à jour des informations professionnelles, gestion des détails du cabinet, consultation des notes et avis |
| **Notifications Email** | Alerte à la réception d'une nouvelle demande, notification d'annulation par le propriétaire |

---

## Stack Technique

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 6 | Build tool & serveur de développement |
| React Router | v7 | Routage côté client |
| Tailwind CSS | 3 | Styling utility-first |
| shadcn/ui | — | Bibliothèque de composants |
| Lucide React | — | Icônes |
| React Hook Form | — | Gestion des formulaires |
| Zod | — | Validation des schémas |

### Backend & Services

| Service | Rôle |
|---|---|
| Supabase | Auth, PostgreSQL, Storage, Realtime |
| 0utmail API | Emails transactionnels via Google OAuth |
| OpenRouter API | Inférence IA pour le chatbot VetoBot |

---

## Structure du Projet

```
veto-care/
├── public/
└── src/
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardLayout.jsx     # Layout principal (sidebar + header)
    │   │   └── NotificationBell.jsx    # Cloche de notifications
    │   ├── pets/
    │   │   └── PetForm.jsx             # Formulaire ajout/modification animal
    │   ├── rdv/
    │   │   └── RdvForm.jsx             # Formulaire de réservation
    │   ├── ui/
    │   │   ├── Chatbot.jsx             # Assistant IA VetoBot
    │   │   ├── StatusBadge.jsx         # Badges de statut des RDV
    │   │   └── ...                     # Composants shadcn/ui
    │   ├── vets/                       # Composants vétérinaires
    │   └── ProtectedRoute.jsx          # Protection de routes par rôle
    ├── context/
    │   └── auth-context.jsx            # Contexte d'authentification
    ├── lib/
    │   ├── supabase/
    │   │   └── client.js               # Configuration du client Supabase
    │   ├── emailService.js             # Service 0utmail + templates email
    │   ├── constants.js                # Wilayas, espèces, statuts, créneaux
    │   └── utils.js                    # Fonctions utilitaires
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   └── PendingPage.jsx
    │   ├── dashboard/
    │   │   ├── owner/                  # Pages tableau de bord propriétaire
    │   │   ├── vet/                    # Pages tableau de bord vétérinaire
    │   │   └── admin/                  # Pages panneau d'administration
    │   └── vets/
    │       ├── VetsPage.jsx            # Annuaire des vétérinaires
    │       └── VetBookingPage.jsx      # Réservation d'un vétérinaire
    ├── App.jsx                         # Configuration des routes
    ├── index.css                       # Directives Tailwind
    └── main.jsx                        # Point d'entrée
```

---

## Architecture des Routes

### Routes Publiques

| Route | Composant | Description |
|---|---|---|
| `/` | `LandingPage` | Page d'accueil |
| `/login` | `LoginPage` | Connexion |
| `/register` | `RegisterPage` | Inscription (propriétaire ou vétérinaire) |
| `/pending` | `PendingPage` | En attente de validation admin |

### Routes Propriétaire (`maitre`)

| Route | Composant | Description |
|---|---|---|
| `/vets` | `VetsPage` | Annuaire des vétérinaires |
| `/vets/:id` | `VetBookingPage` | Réserver un vétérinaire |
| `/dashboard/owner` | `OwnerDashboard` | Vue d'ensemble |
| `/dashboard/owner/appointments` | `OwnerAppointments` | Mes rendez-vous |
| `/dashboard/owner/pets` | `MyAnimals` | Mes animaux |
| `/dashboard/owner/pets/:id` | `AnimalDetails` | Détails animal & dossier médical |
| `/dashboard/owner/profile` | `OwnerProfile` | Paramètres du compte |

### Routes Vétérinaire (`veterinaire`)

| Route | Composant | Description |
|---|---|---|
| `/dashboard/vet` | `VetDashboard` | Vue d'ensemble |
| `/dashboard/vet/appointments` | `VetAppointments` | Gestion des rendez-vous |
| `/dashboard/vet/patients` | `PatientManagement` | Liste des patients |
| `/dashboard/vet/patients/:id` | `PatientDetails` | Historique patient |
| `/dashboard/vet/profile` | `VetProfile` | Paramètres du compte |

---

## Base de Données

La plateforme utilise une base de données **PostgreSQL** gérée via **Supabase**, organisée autour de 6 tables principales :

| Table | Description |
|---|---|
| `profiles` | Profils utilisateurs (propriétaires et vétérinaires) |
| `veterinaires` | Informations professionnelles des vétérinaires |
| `pets` | Profils des animaux |
| `rendez_vous` | Rendez-vous et leur cycle de vie |
| `pet_carnets` | Documents et dossiers médicaux |
| `notifications` | Notifications in-app |


<img width="1134" height="807" alt="image" src="https://github.com/user-attachments/assets/6270cae7-ac2f-43bf-9ee2-7a2a27ad8141" />



---

## Sécurité & RLS

Toutes les données sont protégées au niveau de la base de données grâce au **Row Level Security (RLS)** intégré à Supabase. Cette protection s'applique même en cas d'appel direct à l'API, indépendamment de l'interface utilisateur. Chaque opération est automatiquement filtrée par l'identité de l'utilisateur via `auth.uid()`.

### Politiques — Tables

| Table | Opération | Politique |
|---|---|---|
| `notifications` | SELECT | L'utilisateur voit uniquement ses propres notifications (`user_id = auth.uid()`) |
| `notifications` | UPDATE | L'utilisateur modifie uniquement ses propres notifications (`user_id = auth.uid()`) |
| `pet_carnets` | SELECT | Le propriétaire lit ses propres carnets ; le vétérinaire lit les carnets des animaux ayant un RDV avec lui |
| `pet_carnets` | INSERT | Le propriétaire insère pour ses animaux ; le vétérinaire insère uniquement pour les animaux ayant un RDV actif avec lui |
| `pet_carnets` | UPDATE | Le propriétaire modifie uniquement ses propres carnets |
| `pet_carnets` | DELETE | Le propriétaire supprime uniquement ses propres carnets |
| `pets` | SELECT | Le propriétaire lit ses propres animaux ; tous les utilisateurs authentifiés peuvent lire la table |
| `pets` | INSERT | Le propriétaire insère uniquement ses propres animaux (`owner_id = auth.uid()`) |
| `pets` | UPDATE | Le propriétaire modifie uniquement ses propres animaux |
| `pets` | DELETE | Le propriétaire supprime uniquement ses propres animaux |
| `profiles` | SELECT | L'utilisateur lit son propre profil ; tous les utilisateurs authentifiés peuvent lire les profils |
| `profiles` | INSERT | Insertion restreinte au profil dont l'`id` correspond à `auth.uid()` |
| `profiles` | UPDATE | L'utilisateur modifie uniquement son propre profil |
| `rendez_vous` | SELECT | Le propriétaire voit ses propres RDV (`maitre_id = auth.uid()`) ; le vétérinaire voit uniquement les RDV qui lui sont assignés |
| `rendez_vous` | INSERT | Le propriétaire insère uniquement ses propres RDV (`maitre_id = auth.uid()`) |
| `rendez_vous` | UPDATE | Le propriétaire modifie ses propres RDV ; le vétérinaire modifie le statut et les notes des RDV qui lui sont assignés |
| `veterinaires` | SELECT | Les utilisateurs voient uniquement les vétérinaires dont le statut est `approved`, ou leur propre fiche |
| `veterinaires` | INSERT | Le vétérinaire insère uniquement sa propre fiche (`user_id = auth.uid()`) |
| `veterinaires` | UPDATE | Le vétérinaire modifie uniquement sa propre fiche |

### Politiques — Storage

| Bucket | Opération | Politique |
|---|---|---|
| `pets` | SELECT | Le propriétaire lit les fichiers de ses animaux (chemin préfixé par `pet_id`) ; le vétérinaire lit les fichiers des animaux ayant un RDV actif avec lui |
| `pets` | INSERT | Le propriétaire upload les fichiers de ses animaux ; le vétérinaire upload uniquement pour les animaux ayant un RDV actif avec lui |
| `pets` | UPDATE | Le propriétaire modifie ses propres fichiers (chemin préfixé par `auth.uid()`) |
| `pets` | DELETE | Le propriétaire supprime ses propres fichiers |
| `carnets` | SELECT | Le vétérinaire lit uniquement son propre document de licence (chemin préfixé par `auth.uid()`) |
| `carnets` | INSERT | Le vétérinaire upload uniquement son propre document de licence |
| `carnets` | DELETE | Le vétérinaire supprime uniquement son propre document de licence |

---

## Notifications Email

Les emails sont envoyés via l'**API 0utmail** en utilisant des tokens Google OAuth.

| Template | Déclencheur | Destinataire | Objectif |
|---|---|---|---|
| `appointmentPendingOwner` | Réservation par le propriétaire | Propriétaire | Confirmation de l'envoi de la demande |
| `appointmentCreatedVet` | Réservation par le propriétaire | Vétérinaire | Alerte nouvelle demande |
| `appointmentConfirmed` | Confirmation par le vétérinaire | Propriétaire | Notification de confirmation |
| `appointmentDeclined` | Refus par le vétérinaire | Propriétaire | Notification de refus |
| `appointmentCancelledByOwner` | Annulation par le propriétaire | Vétérinaire | Avis d'annulation |
| `consultationCompleted` | Marquage comme terminé | Propriétaire | Notification de fin + invitation à évaluer |

---

## Contrôle d'Accès par Rôle

Les routes sont protégées par un composant `ProtectedRoute` qui lit le rôle de l'utilisateur depuis le `AuthContext` avant d'autoriser l'accès. Toute tentative d'accès à une route non autorisée déclenche une redirection automatique vers le tableau de bord correspondant.

| Rôle | Routes accessibles | Redirection si non autorisé |
|---|---|---|
| `maitre` | `/dashboard/owner/*` et `/vets/*` | `/dashboard/vet` |
| `veterinaire` | `/dashboard/vet/*` | `/dashboard/owner` |
| Non connecté | Routes publiques uniquement | `/login` |

---

<div align="center">

**© 2026 Veto Care — La santé animale simplifiée.**

</div>
