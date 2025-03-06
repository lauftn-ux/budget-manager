# Gestionnaire de Budget

Application web permettant de gérer son budget personnel en important des fichiers CSV de transactions bancaires.

![Vue d'ensemble de l'application](https://via.placeholder.com/800x450.png?text=Gestionnaire+de+Budget)

## 🌟 Fonctionnalités

- **Import de transactions** : Importez facilement vos relevés bancaires au format CSV
- **Catégorisation automatique** : Définissez des règles basées sur des mots-clés pour classer automatiquement vos transactions
- **Tableau de bord** : Visualisez vos dépenses et revenus avec des graphiques clairs
- **Suivi budgétaire** : Fixez des budgets par catégorie et suivez votre progression
- **Statistiques détaillées** : Analysez vos habitudes de dépenses par période et par catégorie
- **Stockage local** : Toutes vos données sont stockées localement dans votre navigateur pour plus de confidentialité

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/lauftn-ux/budget-manager.git

# Installer les dépendances
cd budget-manager
npm install

# Lancer l'application en développement
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

### Construire pour la production

```bash
npm run build
```

## 📊 Utilisation

1. **Importez vos transactions**
   - Exportez un fichier CSV depuis votre banque
   - Importez-le via la page d'accueil
   - Vous pouvez utiliser le fichier exemple fourni pour tester

2. **Catégorisez vos dépenses**
   - Les transactions sont automatiquement catégorisées selon les règles définies
   - Personnalisez les catégories existantes ou créez-en de nouvelles

3. **Définissez votre budget**
   - Créez des budgets mensuels, trimestriels ou annuels par catégorie
   - Suivez votre progression avec des indicateurs visuels

4. **Analysez vos finances**
   - Consultez des graphiques détaillés par catégorie
   - Identifiez les tendances de vos dépenses
   - Exportez vos données pour les conserver

## 🔧 Format CSV supporté

L'application accepte les formats CSV suivants :

```csv
Date,Description,Montant
2025-03-01,Salaire Mars 2025,2800.00
2025-03-02,LOYER MARS,-950.00
```

Les colonnes peuvent également être nommées :
- Date : `date`, `Date`
- Description : `description`, `Description`, `libelle`, `Libelle`
- Montant : `montant`, `Montant`, `amount`, `Amount`

## 🛠️ Technologies utilisées

- **React.js** - Framework frontend
- **Material UI** - Bibliothèque de composants UI
- **Chart.js & Recharts** - Visualisation de données
- **Papa Parse** - Analyse CSV
- **LocalStorage** - Stockage local des données

## 🔒 Confidentialité

Toutes les données sont stockées uniquement dans le navigateur de l'utilisateur via localStorage. Aucune donnée n'est transmise à un serveur externe.

## 📝 Fonctionnalités à venir

- [ ] Support pour les transactions récurrentes
- [ ] Importation depuis plusieurs banques
- [ ] Prévisions budgétaires basées sur l'historique
- [ ] Mode hors ligne complet
- [ ] Application mobile

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.