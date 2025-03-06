import React, { createContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

// Catégories prédéfinies
const defaultCategories = [
  { id: 1, name: 'Alimentation', color: '#4caf50', icon: 'restaurant' },
  { id: 2, name: 'Logement', color: '#2196f3', icon: 'home' },
  { id: 3, name: 'Transport', color: '#ff9800', icon: 'directions_car' },
  { id: 4, name: 'Loisirs', color: '#9c27b0', icon: 'sports_esports' },
  { id: 5, name: 'Santé', color: '#f44336', icon: 'local_hospital' },
  { id: 6, name: 'Shopping', color: '#e91e63', icon: 'shopping_bag' },
  { id: 7, name: 'Services', color: '#00bcd4', icon: 'miscellaneous_services' },
  { id: 8, name: 'Revenus', color: '#8bc34a', icon: 'payments' },
  { id: 9, name: 'Non catégorisé', color: '#9e9e9e', icon: 'help' }
];

// Création du contexte
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // État pour les transactions
  const [transactions, setTransactions] = useState([]);
  
  // État pour les catégories
  const [categories, setCategories] = useState(defaultCategories);
  
  // État pour les règles de catégorisation automatique
  const [categoryRules, setCategoryRules] = useState([]);

  // Chargement des données depuis le localStorage au démarrage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedCategories = localStorage.getItem('categories');
    const savedRules = localStorage.getItem('categoryRules');
    
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedRules) setCategoryRules(JSON.parse(savedRules));
  }, []);

  // Sauvegarde des données dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('categoryRules', JSON.stringify(categoryRules));
  }, [transactions, categories, categoryRules]);

  // Fonction pour importer des transactions depuis un CSV
  const importTransactionsFromCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors);
            return;
          }
          
          // Transformation des données CSV en format de transaction
          const importedTransactions = results.data.map((row, index) => {
            // Cette fonction devra être adaptée selon le format du CSV de la banque
            const transaction = {
              id: `import-${Date.now()}-${index}`,
              date: row.date || row.Date || new Date().toISOString().slice(0, 10),
              amount: parseFloat(row.amount || row.Amount || row.montant || row.Montant || 0),
              description: row.description || row.Description || row.libelle || row.Libelle || '',
              category: 9, // Par défaut "Non catégorisé"
              notes: ''
            };
            
            // Appliquer les règles de catégorisation automatique
            const matchingRule = categoryRules.find(rule => 
              transaction.description.toLowerCase().includes(rule.keyword.toLowerCase())
            );
            
            if (matchingRule) {
              transaction.category = matchingRule.categoryId;
            }
            
            return transaction;
          });
          
          // Ajouter les nouvelles transactions (ou remplacer selon la logique désirée)
          setTransactions(prevTransactions => [...prevTransactions, ...importedTransactions]);
          resolve(importedTransactions);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  // Fonction pour ajouter une transaction
  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  // Fonction pour mettre à jour une transaction
  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(
      transactions.map(transaction => 
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );
  };

  // Fonction pour supprimer une transaction
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  // Fonction pour ajouter une catégorie
  const addCategory = (category) => {
    setCategories([...categories, { ...category, id: categories.length + 1 }]);
  };

  // Fonction pour mettre à jour une catégorie
  const updateCategory = (id, updatedCategory) => {
    setCategories(
      categories.map(category => 
        category.id === id ? { ...category, ...updatedCategory } : category
      )
    );
  };

  // Fonction pour supprimer une catégorie
  const deleteCategory = (id) => {
    // Mettre à jour les transactions liées à cette catégorie
    setTransactions(
      transactions.map(transaction => 
        transaction.category === id ? { ...transaction, category: 9 } : transaction
      )
    );
    
    // Supprimer la catégorie
    setCategories(categories.filter(category => category.id !== id));
  };

  // Fonction pour ajouter une règle de catégorisation
  const addCategoryRule = (rule) => {
    setCategoryRules([...categoryRules, rule]);
  };

  // Fonction pour supprimer une règle de catégorisation
  const deleteCategoryRule = (id) => {
    setCategoryRules(categoryRules.filter(rule => rule.id !== id));
  };

  // Calculer le total des dépenses et revenus
  const calculateTotals = () => {
    const totals = {
      income: 0,
      expense: 0,
      byCategory: {}
    };

    transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        totals.income += transaction.amount;
      } else {
        totals.expense += Math.abs(transaction.amount);
      }

      // Total par catégorie
      const categoryId = transaction.category;
      if (!totals.byCategory[categoryId]) {
        totals.byCategory[categoryId] = 0;
      }
      totals.byCategory[categoryId] += transaction.amount;
    });

    return totals;
  };

  // Valeur du contexte
  const contextValue = {
    transactions,
    categories,
    categoryRules,
    importTransactionsFromCSV,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addCategoryRule,
    deleteCategoryRule,
    calculateTotals
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};